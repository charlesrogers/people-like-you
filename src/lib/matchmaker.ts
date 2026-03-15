import Anthropic from "@anthropic-ai/sdk";
import { Profile } from "./profiles";

const anthropic = new Anthropic();

export async function analyzeProfile(
  answers: Record<string, string | string[]>
): Promise<Profile["vectors"]> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a matchmaker analyzing someone's dating profile responses to extract meaningful matching vectors. Analyze these responses and return a JSON object.

Responses:
- Unconventional path: ${answers.unconventional_path || "not provided"}
- Fascination: ${answers.fascination || "not provided"}
- Humor: ${answers.humor || "not provided"}
- Admired quality: ${answers.admired_quality || "not provided"}
- Growth edge: ${answers.growth_edge || "not provided"}
- Friend's pitch: ${answers.friend_pitch || "not provided"}
- TED talk topic: ${answers.prompt_ted_talk || "not provided"}
- Controversial opinion: ${answers.prompt_controversial || "not provided"}
- Secret talent: ${answers.prompt_secret_talent || "not provided"}
- Interests: ${Array.isArray(answers.interests) ? answers.interests.join(", ") : "not provided"}

Return ONLY a JSON object with these fields:
{
  "selfExpansion": ["2-4 words each: the worlds/domains this person could introduce someone to"],
  "admirationSignals": ["2-4 words each: what makes this person genuinely remarkable, based on evidence in their answers"],
  "humorSignature": "one sentence describing their humor style",
  "growthTrajectory": "one sentence about where they're headed",
  "iSharingMarkers": ["2-4 words each: the types of moments/reactions that would make this person feel 'clicked' with someone"]
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      selfExpansion: [],
      admirationSignals: [],
      humorSignature: "",
      growthTrajectory: "",
      iSharingMarkers: [],
    };
  }
  return JSON.parse(jsonMatch[0]);
}

export async function generateMatchNarrative(
  profileA: Profile,
  profileB: Profile
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a warm, insightful matchmaker writing a pitch for why two people should meet. Your goal is to spark genuine curiosity, not evaluation. Frame it as an invitation to be interested, not a sales pitch.

Person A (${profileA.firstName}):
- Their worlds: ${profileA.vectors.selfExpansion.join(", ")}
- What's remarkable: ${profileA.vectors.admirationSignals.join(", ")}
- Humor: ${profileA.vectors.humorSignature}
- Growing toward: ${profileA.vectors.growthTrajectory}
- Click moments: ${profileA.vectors.iSharingMarkers.join(", ")}
- Interests: ${profileA.interests.join(", ")}
- Values most in a partner: ${profileA.topCharacteristics.join(", ")}
- Prompts: TED talk on "${profileA.answers.prompt_ted_talk || ""}"; Controversial opinion: "${profileA.answers.prompt_controversial || ""}"

Person B (${profileB.firstName}):
- Their worlds: ${profileB.vectors.selfExpansion.join(", ")}
- What's remarkable: ${profileB.vectors.admirationSignals.join(", ")}
- Humor: ${profileB.vectors.humorSignature}
- Growing toward: ${profileB.vectors.growthTrajectory}
- Click moments: ${profileB.vectors.iSharingMarkers.join(", ")}
- Interests: ${profileB.interests.join(", ")}
- Prompts: TED talk on "${profileB.answers.prompt_ted_talk || ""}"; Controversial opinion: "${profileB.answers.prompt_controversial || ""}"

Write a 3-4 sentence narrative pitch TO Person A about why they should be curious about Person B. Focus on:
1. How Person B could expand Person A's world (self-expansion)
2. What Person A would likely find admirable about Person B
3. Where they might "click" — shared reaction patterns or complementary energies

Do NOT mention physical appearance. Do NOT use generic phrases like "you both love adventure." Be specific to their actual responses. Write in second person ("you"). Keep it warm but not cheesy.`,
      },
    ],
  });

  return message.content[0].type === "text"
    ? message.content[0].text
    : "Something special is brewing here.";
}
