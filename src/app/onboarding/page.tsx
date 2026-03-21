"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

// ---------- Types ----------
interface BaseQuestion {
  id: string;
  question: string;
  required?: boolean;
  placeholder?: string;
}

interface TextQuestion extends BaseQuestion {
  type: "text" | "email" | "textarea";
}

interface NumberQuestion extends BaseQuestion {
  type: "number";
}

interface SelectQuestion extends BaseQuestion {
  type: "select";
  options: string[];
}

interface DropdownQuestion extends BaseQuestion {
  type: "dropdown";
  options: string[];
}

interface MultiSelectQuestion extends BaseQuestion {
  type: "multi-select";
  options: string[];
  maxSelections?: number;
}

interface LikertQuestion extends BaseQuestion {
  type: "likert";
  statements: { id: string; label: string }[];
  scale: string[];
}

interface ThisOrThatQuestion extends BaseQuestion {
  type: "this-or-that";
  pairs: { id: string; optionA: string; optionB: string }[];
}

interface SliderQuestion extends BaseQuestion {
  type: "slider";
  items: { id: string; label: string; leftLabel: string; rightLabel: string }[];
}

interface ScenarioQuestion extends BaseQuestion {
  type: "scenario";
  scenario: string;
  options: { id: string; label: string }[];
}

type Question =
  | TextQuestion
  | NumberQuestion
  | SelectQuestion
  | DropdownQuestion
  | MultiSelectQuestion
  | LikertQuestion
  | ThisOrThatQuestion
  | SliderQuestion
  | ScenarioQuestion;

interface Section {
  title: string;
  subtitle?: string;
  questions: Question[];
}

// ---------- Data ----------
const SECTIONS: Section[] = [
  {
    title: "Quick bio",
    subtitle: "Let's start with the basics.",
    questions: [
      { id: "referral", type: "text", question: "Who told you about People Like You?", placeholder: "Name or how you found us" },
      { id: "first_name", type: "text", question: "What's your first name?", required: true, placeholder: "First name" },
      { id: "last_name", type: "text", question: "What's your last name?", required: true, placeholder: "Last name" },
      { id: "email", type: "email", question: "What's your email?", required: true, placeholder: "you@example.com" },
      {
        id: "gender",
        type: "select",
        question: "I am a...",
        required: true,
        options: ["Man", "Woman"],
      },
      {
        id: "birth_year",
        type: "dropdown",
        question: "What year were you born?",
        required: true,
        options: Array.from({ length: 50 }, (_, i) => String(2008 - i)),
      },
    ],
  },
  {
    title: "This or that",
    subtitle: "No wrong answers. Go with your gut.",
    questions: [
      {
        id: "vibe_check",
        type: "this-or-that",
        question: "Pick the one that's more you",
        required: true,
        pairs: [
          { id: "plan_vs_spontaneous", optionA: "Plan everything", optionB: "Wing it" },
          { id: "stay_in_vs_go_out", optionA: "Stay in with a book", optionB: "Out with friends" },
          { id: "head_vs_heart", optionA: "Head over heart", optionB: "Heart over head" },
          { id: "deep_vs_wide", optionA: "Few deep friendships", optionB: "Huge social circle" },
          { id: "early_vs_late", optionA: "Up at 6am", optionB: "Up at midnight" },
          { id: "compete_vs_collaborate", optionA: "Love to compete", optionB: "Love to collaborate" },
          { id: "tradition_vs_new", optionA: "Comfort of tradition", optionB: "Thrill of something new" },
          { id: "talk_it_out_vs_space", optionA: "Talk it out right away", optionB: "Need space to process" },
        ],
      },
    ],
  },
  {
    title: "Where do you land?",
    subtitle: "Drag to wherever feels right. Most people are somewhere in the middle.",
    questions: [
      {
        id: "spectrum",
        type: "slider",
        question: "Where do you fall on these spectrums?",
        required: true,
        items: [
          { id: "serious_playful", label: "Vibe", leftLabel: "Serious", rightLabel: "Playful" },
          { id: "independent_together", label: "Togetherness", leftLabel: "Fiercely independent", rightLabel: "Joined at the hip" },
          { id: "risk_safe", label: "Risk", leftLabel: "Play it safe", rightLabel: "Leap first" },
          { id: "logic_emotion", label: "Decisions", leftLabel: "Pure logic", rightLabel: "All feeling" },
          { id: "private_open", label: "Openness", leftLabel: "Very private", rightLabel: "Open book" },
          { id: "homebody_explorer", label: "Energy", leftLabel: "Homebody", rightLabel: "Explorer" },
          { id: "optimist_realist", label: "Outlook", leftLabel: "Realist", rightLabel: "Optimist" },
          { id: "patient_urgent", label: "Pace", leftLabel: "Endlessly patient", rightLabel: "Always urgent" },
        ],
      },
    ],
  },
  {
    title: "Your interests",
    subtitle: "Select everything you're into. We use these to find unexpected overlaps.",
    questions: [
      {
        id: "interests",
        type: "multi-select",
        question: "What are you passionate about?",
        required: true,
        options: [
          "Intellectual discussions", "Outdoor sports", "Nature", "Social issues",
          "Reading", "TV/Movies", "Craft projects", "Art",
          "Museums", "Cooking", "Singing", "Musical instruments",
          "Dancing", "Travel", "Working out", "Camping", "Theatre",
          "Photography", "Gaming", "Volunteering", "Writing", "Podcasts",
          "Startups", "Faith/Spirituality", "Animals", "Fashion",
        ],
      },
    ],
  },
  {
    title: "Saturday night",
    subtitle: "These scenarios help us understand your energy.",
    questions: [
      {
        id: "scenario_saturday",
        type: "scenario",
        question: "It's Saturday night. Your ideal plan:",
        scenario: "No obligations, no expectations. What are you doing?",
        options: [
          { id: "dinner_party", label: "Hosting a dinner party" },
          { id: "live_music", label: "Live music or a show" },
          { id: "deep_convo", label: "Long conversation over drinks" },
          { id: "outdoor_adventure", label: "Something outdoors and active" },
          { id: "couch_movie", label: "Couch + movie + snacks" },
          { id: "trying_new", label: "Trying something I've never done" },
          { id: "game_night", label: "Game night with friends" },
          { id: "solo_recharge", label: "Solo recharge time" },
        ],
      },
      {
        id: "scenario_conflict",
        type: "scenario",
        question: "You and your partner disagree about something important. You:",
        scenario: "What's your conflict style?",
        options: [
          { id: "talk_now", label: "Want to talk it through right now" },
          { id: "sleep_on_it", label: "Sleep on it, revisit tomorrow" },
          { id: "write_it", label: "Write out your thoughts first" },
          { id: "find_compromise", label: "Jump straight to compromise" },
          { id: "ask_why", label: "Ask a lot of questions to understand their side" },
          { id: "humor", label: "Try to lighten it with humor" },
        ],
      },
      {
        id: "scenario_impress",
        type: "scenario",
        question: "The quickest way to impress you:",
        scenario: "What makes you think 'okay, this person is something special'?",
        options: [
          { id: "deep_knowledge", label: "They know something deeply" },
          { id: "make_laugh", label: "They make me genuinely laugh" },
          { id: "kind_stranger", label: "They're kind to a stranger" },
          { id: "ambitious_vision", label: "They have an ambitious vision for their life" },
          { id: "great_listener", label: "They really listen" },
          { id: "surprise_me", label: "They surprise me" },
          { id: "calm_pressure", label: "They're calm under pressure" },
          { id: "own_weird", label: "They fully own their weirdness" },
        ],
      },
    ],
  },
  {
    title: "What matters in a partner",
    subtitle: "Pick the 5 that matter most. We know it's hard to narrow down.",
    questions: [
      {
        id: "top_characteristics",
        type: "multi-select",
        question: "The 5 qualities you care about most in a partner",
        required: true,
        maxSelections: 5,
        options: [
          "Honest", "Funny", "Emotionally mature", "Ambitious", "Empathetic",
          "Confident", "Patient", "Creative", "Spontaneous", "Calm",
          "Responsible", "Open-minded", "Logical", "Optimistic", "Forgiving",
          "Extroverted", "Flexible", "Intuitive",
        ],
      },
    ],
  },
  {
    title: "Non-negotiables",
    subtitle: "Be honest. These are just filters — they won't be shared.",
    questions: [
      {
        id: "children",
        type: "select",
        question: "Do you want kids?",
        required: true,
        options: ["Yes, definitely", "Probably", "Open to it", "Probably not", "No"],
      },
      {
        id: "religion_importance",
        type: "select",
        question: "How important is shared faith/religion?",
        required: true,
        options: ["Essential", "Important", "Nice to have", "Doesn't matter"],
      },
      {
        id: "location_flexibility",
        type: "select",
        question: "Would you date someone in another state?",
        required: true,
        options: ["Yes, anywhere", "Within a few hours drive", "Same metro area only"],
      },
    ],
  },
  {
    title: "Show us your personality",
    subtitle: "Answer at least 2. These get shared with matches to spark real conversation.",
    questions: [
      { id: "prompt_ted_talk", type: "textarea", question: "I could give a TED talk on...", placeholder: "Your area of secret expertise" },
      { id: "prompt_wrong_about_me", type: "textarea", question: "Something most people get wrong about me...", placeholder: "The misconception" },
      { id: "prompt_controversial", type: "textarea", question: "My most controversial opinion...", placeholder: "The hill you'll die on" },
      { id: "prompt_biography_title", type: "textarea", question: "The title of my biography would be...", placeholder: "Make it a page-turner" },
      { id: "prompt_never_again", type: "textarea", question: "One thing I'll never do again...", placeholder: "Lesson learned the hard way" },
      { id: "prompt_worst_date", type: "textarea", question: "Worst first date story...", placeholder: "We've all been there" },
      { id: "prompt_secret_talent", type: "textarea", question: "My secret talent...", placeholder: "The thing people don't expect" },
      { id: "prompt_life_hack", type: "textarea", question: "My best life hack...", placeholder: "The one you actually swear by" },
    ],
  },
  {
    title: "Help us see your genius",
    subtitle: "Our matchmaker uses these to write a personal pitch for why someone should meet you.",
    questions: [
      { id: "unconventional_path", type: "textarea", question: "Tell me about a time you bet on yourself when others doubted you.", placeholder: "There are no wrong answers...", required: true },
      { id: "fascination", type: "textarea", question: "What could you talk about for hours that most people don't care about?", placeholder: "The thing that lights you up..." },
      { id: "humor", type: "textarea", question: "Describe the last time you laughed so hard you couldn't breathe.", placeholder: "Paint us a picture..." },
      { id: "admired_quality", type: "textarea", question: "What makes you think 'wow, this person is remarkable' about someone?", placeholder: "What earns your genuine admiration..." },
      { id: "growth_edge", type: "textarea", question: "What are you actively getting better at right now?", placeholder: "Where you're growing..." },
      { id: "friend_pitch", type: "textarea", question: "If your best friend were setting you up, what would they say?", placeholder: "Channel your best friend's voice..." },
    ],
  },
  {
    title: "A few more details",
    subtitle: "Almost done. Rounding out your profile.",
    questions: [
      {
        id: "exercise",
        type: "select",
        question: "How often do you exercise?",
        required: true,
        options: ["Rarely", "1-2x/week", "3-4x/week", "5-6x/week", "Daily"],
      },
      {
        id: "education",
        type: "select",
        question: "Education",
        required: true,
        options: ["High school", "Some college", "Associate degree", "Bachelor's", "Master's / JD", "Doctorate", "Vocational / trade", "Other"],
      },
      {
        id: "height",
        type: "dropdown",
        question: "How tall are you?",
        required: true,
        options: [
          "Under 5'0\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
          "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"",
          "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\"", "6'6\"+",
        ],
      },
      {
        id: "state",
        type: "dropdown",
        question: "What state do you live in?",
        required: true,
        options: [
          "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
          "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
          "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
          "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
          "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
          "New Hampshire", "New Jersey", "New Mexico", "New York",
          "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
          "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
          "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
          "West Virginia", "Wisconsin", "Wyoming", "Outside US",
        ],
      },
      { id: "social_link", type: "text", question: "Link to a social media profile with a photo of you", required: true, placeholder: "instagram.com/you, linkedin.com/in/you, etc." },
    ],
  },
];

// ---------- Component ----------
export default function Onboarding() {
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { posthog.capture('onboarding_started') }, [])

  const section = SECTIONS[sectionIndex];
  const isLast = sectionIndex === SECTIONS.length - 1;
  const progress = ((sectionIndex + 1) / SECTIONS.length) * 100;

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleNext() {
    if (isLast) {
      setLoading(true);
      try {
        // Auto-set seeking based on gender
        const finalAnswers = {
          ...answers,
          seeking: answers.gender === "Man" ? "Women" : "Men",
        };
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalAnswers),
        });
        const data = await res.json();
        if (data.id) {
          posthog.capture('onboarding_completed')
          localStorage.setItem("ply_profile_id", data.id);
          router.push("/calibrate");
        }
      } catch {
        setLoading(false);
      }
      return;
    }
    posthog.capture('onboarding_section_progressed', { section_index: sectionIndex })
    setSectionIndex(sectionIndex + 1);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    if (sectionIndex > 0) {
      setSectionIndex(sectionIndex - 1);
      window.scrollTo(0, 0);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-100">
        <div
          className="h-full bg-stone-900 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-24 pt-16">
        <button
          onClick={handleBack}
          className={`mb-6 text-sm text-stone-400 transition hover:text-stone-600 ${
            sectionIndex === 0 ? "invisible" : ""
          }`}
        >
          Back
        </button>

        <h1 className="text-2xl font-bold text-stone-900">{section.title}</h1>
        {section.subtitle && (
          <p className="mt-2 text-stone-500">{section.subtitle}</p>
        )}

        <div className="mt-8 space-y-8">
          {section.questions.map((q) => (
            <QuestionRenderer
              key={q.id}
              question={q}
              answers={answers}
              setAnswer={setAnswer}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className="mt-10 w-full rounded-lg bg-stone-900 px-6 py-3.5 text-lg font-medium text-white transition hover:bg-stone-800 disabled:opacity-30"
        >
          {loading
            ? "Creating your profile..."
            : isLast
            ? "Complete Profile"
            : "Continue"}
        </button>

        <p className="mt-3 text-center text-sm text-stone-400">
          {sectionIndex + 1} of {SECTIONS.length}
        </p>
      </div>
    </div>
  );
}

// ---------- Question Renderer ----------
function QuestionRenderer({
  question: q,
  answers,
  setAnswer,
}: {
  question: Question;
  answers: Record<string, string | string[]>;
  setAnswer: (id: string, value: string | string[]) => void;
}) {
  if (q.type === "text" || q.type === "email") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        <input
          type={q.type}
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.placeholder}
          className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
        />
      </div>
    );
  }

  if (q.type === "number") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        <input
          type="number"
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.placeholder}
          className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
        />
      </div>
    );
  }

  if (q.type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        <textarea
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={q.placeholder}
          rows={3}
          className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2.5 text-stone-900 placeholder:text-stone-300 focus:border-stone-400 focus:outline-none"
        />
      </div>
    );
  }

  if (q.type === "select") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswer(q.id, opt)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                answers[q.id] === opt
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (q.type === "dropdown") {
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        <select
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-stone-900 focus:border-stone-400 focus:outline-none"
        >
          <option value="">Select...</option>
          {q.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (q.type === "multi-select") {
    const selected = (answers[q.id] as string[]) || [];
    const max = q.maxSelections;
    return (
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {q.question}
          {q.required && <span className="text-red-400"> *</span>}
        </label>
        {max && (
          <p className="mt-1 text-xs text-stone-400">
            {selected.length}/{max} selected
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {q.options.map((opt) => {
            const isSelected = selected.includes(opt);
            const atMax = max ? selected.length >= max : false;
            return (
              <button
                key={opt}
                onClick={() => {
                  if (isSelected) {
                    setAnswer(q.id, selected.filter((s) => s !== opt));
                  } else if (!atMax) {
                    setAnswer(q.id, [...selected, opt]);
                  }
                }}
                disabled={!isSelected && atMax}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isSelected
                    ? "border-stone-900 bg-stone-900 text-white"
                    : atMax
                    ? "border-stone-100 text-stone-300"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- THIS OR THAT ----------
  if (q.type === "this-or-that") {
    return (
      <div className="space-y-3">
        {q.pairs.map((pair) => {
          const key = `${q.id}_${pair.id}`;
          const picked = answers[key] as string;
          return (
            <div key={pair.id} className="flex gap-2">
              <button
                onClick={() => setAnswer(key, "A")}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                  picked === "A"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {pair.optionA}
              </button>
              <button
                onClick={() => setAnswer(key, "B")}
                className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                  picked === "B"
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {pair.optionB}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- SLIDER ----------
  if (q.type === "slider") {
    return (
      <div className="space-y-6">
        {q.items.map((item) => {
          const key = `${q.id}_${item.id}`;
          const value = parseInt((answers[key] as string) || "50");
          return (
            <div key={item.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">
                  {item.leftLabel}
                </span>
                <span className="text-xs font-medium text-stone-700">
                  {item.label}
                </span>
                <span className="text-xs font-medium text-stone-400">
                  {item.rightLabel}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setAnswer(key, e.target.value)}
                className="w-full cursor-pointer accent-stone-900"
              />
            </div>
          );
        })}
      </div>
    );
  }

  // ---------- SCENARIO ----------
  if (q.type === "scenario") {
    const picked = answers[q.id] as string;
    return (
      <div>
        <p className="text-sm font-medium text-stone-700">{q.question}</p>
        {q.scenario && (
          <p className="mt-1 text-xs text-stone-400 italic">{q.scenario}</p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {q.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAnswer(q.id, opt.id)}
              className={`rounded-xl border-2 px-3 py-3 text-left text-sm transition ${
                picked === opt.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ---------- LIKERT (still available for any remaining use) ----------
  if (q.type === "likert") {
    return (
      <div>
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 text-left text-sm font-medium text-stone-700" />
                {q.scale.map((s) => (
                  <th key={s} className="pb-3 text-center text-xs font-medium text-stone-400" style={{ width: `${60 / q.scale.length}%` }}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.statements.map((stmt, i) => {
                const key = `${q.id}_${stmt.id}`;
                return (
                  <tr key={stmt.id} className={i % 2 === 0 ? "bg-stone-50/50" : ""}>
                    <td className="py-3 pr-4 text-sm text-stone-700">{stmt.label}</td>
                    {q.scale.map((s, si) => (
                      <td key={s} className="py-3 text-center">
                        <button
                          onClick={() => setAnswer(key, String(si + 1))}
                          className={`mx-auto h-5 w-5 rounded-full border-2 transition ${answers[key] === String(si + 1) ? "border-stone-900 bg-stone-900" : "border-stone-300 hover:border-stone-400"}`}
                          aria-label={`${stmt.label}: ${s}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="space-y-6 sm:hidden">
          {q.statements.map((stmt) => {
            const key = `${q.id}_${stmt.id}`;
            return (
              <div key={stmt.id}>
                <p className="text-sm font-medium text-stone-700">{stmt.label}</p>
                <div className="mt-2 flex justify-between gap-1">
                  {q.scale.map((s, si) => (
                    <button key={s} onClick={() => setAnswer(key, String(si + 1))} className={`flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 text-center transition ${answers[key] === String(si + 1) ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-500"}`}>
                      <span className="text-[10px] leading-tight">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
