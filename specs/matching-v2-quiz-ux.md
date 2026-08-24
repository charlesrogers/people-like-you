# D-QD5 — Quiz UX & Interaction Spec

**Why this exists:** the first build shipped the copy correctly and Charles's verdict was *"pretty bad! not fun at all… it all also looks incredibly plain jane."* That is a spec failure, not a build failure — the farm-out cashed "fun" out as a click-through checklist and said nothing about what the thing should look or feel like (`tasks/lessons.md`, 2026-08-23). **This file is the missing half.** Nothing here is optional; a build that ships §2's copy without §3–§8 fails the acceptance criterion.

**Companions:** `specs/matching-v2-questionnaire-battery-v1.md` (rc8 — the copy, frozen) · house design language in `~/.claude/CLAUDE.md` (tokens, type scale, radii).

---

## 1. The feeling to hit

Somewhere between a Buzzfeed quiz and a well-made app. Tapping through it should feel like **flicking cards off a deck** — each answer lands with a bit of weight and the next one is already there. It is 22 taps and it should feel like fewer.

Three failure modes to design against, all of which the first build hit:
- **A form.** Radio buttons in a vertical list with a Next button is a form. Nobody has ever enjoyed a form.
- **Silence.** No feedback on tap, no motion between screens — the screen just changes and you wonder whether it registered.
- **Grey.** One neutral surface, one type size, no colour, no emoji, nothing to look at.

---

## 2. Screen anatomy

One item per screen. Nothing else on screen — no header, no logo, no nav, no footer. Removed in rc8: the five block-card interstitials.

```
┌─────────────────────────────┐
│  ● ● ● ● ○ ○ ○ …      ← back│   progress · 44px tap target
│                             │
│  It's 1am. You're still     │   stem — text-[24px]/1.25 font-semibold
│  up because:                │   max 2 lines at 390px
│                             │
│  ┌───────────────────────┐  │
│  │ 📺  the show kept     │  │   option card
│  │     autoplaying       │  │   min-height 64px, rounded-xl
│  └───────────────────────┘  │   border, bg-card, shadow-sm
│  ┌───────────────────────┐  │
│  │ 🕐  I lost track of   │  │   gap-3 between cards
│  │     time              │  │
│  └───────────────────────┘  │
│           …                 │
│                             │
│        skip this one        │   only on Q1, Q21 · text-[13px] muted
└─────────────────────────────┘
```

Vertically centred as a group; with 6 options (Q1, Q14) the stack top-aligns under the stem and the whole screen still fits at 390×844 with no scroll. **Nothing in this flow ever scrolls.** If a 6-option screen doesn't fit, options shrink to `min-height 56px` before anything else changes.

---

## 3. Option cards

Not radio buttons. Not a list. Full-width tappable cards.

| property | value |
|---|---|
| shape | `rounded-xl border bg-card shadow-sm shadow-black/[0.04]` |
| size | full width, `min-height 64px`, `px-4 py-3` |
| layout | emoji in a fixed `28px` column, then label — labels left-align with each other regardless of emoji width |
| emoji | `text-[22px]`, vertically centred, never inside the text flow |
| label | `text-[15px] font-medium leading-snug`, wraps to 2 lines max |
| gap | `gap-3` |
| press | `active:scale-[0.98] active:shadow-none` — instant, no transition on the press |
| selected | border → `border-primary`, bg → `bg-primary/8`, emoji scales to `1.15` over 120ms |

Emoji are **content, not decoration** — they're in the battery spec per option and ship exactly as written. Two items carry none by design (Q21, Q22 politics); those screens render labels in the same cards, left-aligned in the label column with no emoji gutter.

---

## 4. Motion — the whole difference between fun and plain

Every timing below is a starting value, but *something* must be specified for each. Silence is what made the first build feel dead.

**Entrance.** Stem fades + rises 8px over 220ms. Option cards stagger in **40ms apart**, each fade + rise 12px over 200ms, `ease-out`. A 4-option screen is fully present in ~380ms.

**Tap → advance.** This sequence is the core interaction; it should feel like one gesture, not three steps.
1. `0ms` — press state fires instantly (scale 0.98). No delay, no transition.
2. `0ms` — selected styling paints; emoji pops to 1.15.
3. `90ms` — the other options fade to 40% opacity.
4. `180ms` — whole screen slides left 24px and fades out over 160ms.
5. `340ms` — next screen enters per **Entrance**.

Total ~500ms from tap to the next stem being readable. It should feel like the card was *taken*, not like a page loaded.

**Back.** Reverse direction — screen slides in from the left. The previously chosen option renders already-selected, so returning shows you what you picked. **Back never auto-advances** (this was defect #1 in the first build: block cards re-advanced on backward entry and trapped the user).

**Progress.** Segmented dots, one per item, `4px` tall, `flex-1`, `gap-1`. Filled dots use `bg-primary`; the current dot is `bg-primary` at full height (`6px`); unfilled `bg-muted`. The dot fills as the screen exits, not as it enters — the reward lands with the tap.

**Reduced motion.** `@media (prefers-reduced-motion: reduce)` — all translation and stagger removed, crossfades only at 100ms. The flow must remain fully usable and the advance timing unchanged.

---

## 5. Colour

House tokens throughout (`--primary`, `--card`, `--muted-foreground` etc., both themes). No new palette.

One addition, because a single neutral surface for 22 screens is the "grey" failure mode: **each of the five blocks carries a background tint** — `oklch` from the chart tokens at very low chroma, roughly `--chart-N` at 3% opacity over `--background`. The tint crossfades over 400ms when the block changes, which is now the only signal the blocks exist at all since the interstitials are gone. It should be barely perceptible per screen and obvious across the flow.

Identity → chart-1 · Wired → chart-5 · Actual life → chart-2 · How you talk → chart-3 · Facts → back to plain `--background`, signalling the home stretch.

---

## 6. Intro and close

**Intro screen.** The two lines from battery §2c, centred, with a single primary button ("Start"). The honesty line sits in `text-muted-foreground text-[13px]` under the intro. No progress bar yet.

**Close screen.** The close line, then the flow moves to the voice step on its own after a beat (~1.2s) or on tap. This is the one place a small celebratory moment is warranted — the progress bar completing, all dots filling left-to-right over 500ms. Nothing more; no confetti, no score, no badge. **D7 forbids showing the reader anything about themselves here.**

---

## 7. Skip

Only on Q1 and Q21. `text-[13px] text-muted-foreground`, centred below the options, `44px` tap target. Copy: "skip this one". No confirmation, no penalty state, no "are you sure". A skipped item's progress dot fills the same as any other — a skip is an answer, not a gap.

---

## 8. The recorder (voice step, and now the nerd-out)

Three requirements that are interviewing rules rather than UI preferences (`specs/matching-v2-story-elicitation.md` §2, M5):

1. **No countdown timer.** A visible number counting down creates time pressure, and time pressure is what makes people summarise instead of narrate. Show elapsed time, small and muted, or nothing.
2. **No silence auto-stop.** People pause mid-story to remember. A pause of several seconds must be survivable; recording ends only when the user ends it or the cap is reached.
3. **Never tell someone they answered wrong.** An off-prompt answer is not a failure and the UI must never imply it is.

Help text under every prompt now reads: **"The small stuff is the good stuff — the more specific, the better."** — permission to be trivial, which recovers more concrete detail than reassurance about length.

---

## 9. Acceptance — how "fun" gets checked from here

Not a click-through. The build is done when:

- [ ] A 20-second screen recording of ten consecutive items, watched at normal speed, shows motion on **every** transition
- [ ] Every option renders its emoji from the battery spec; Q21/Q22 render correctly with none
- [ ] Back from item 5 → item 4 shows item 4's **previously chosen option already selected**
- [ ] The block tint changes are visible when the recording is scrubbed end-to-end, and invisible screen-to-screen
- [ ] `prefers-reduced-motion: reduce` removes all translation and the flow is still fully usable
- [ ] Nothing scrolls at 390×844, including both 6-option screens
- [ ] Charles has watched the recording and said it looks fun

That last line is the real criterion. The other six exist so a build session can tell whether it is close before spending his attention.
