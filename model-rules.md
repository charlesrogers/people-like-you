# Model Rules — People Like You

Hard rules that govern the matching system. These are not preferences or weights — they are inviolable constraints.

---

## Rule 1: Photo-stage rejection is permanent

If a user sees someone's photo (after 🔥ing an intro) and passes, that person is **never shown to them again**. Period.

- The narrative landed. The physical attraction didn't. Re-pitching won't fix this.
- This is different from narrative-stage non-selection, where the person goes to the re-pitch pool.
- Permanent rejection is mutual: if User A rejects User B at the photo stage, User B is also removed from User A's pool. (We don't show someone to a person who already rejected them — that's cruel.)

**Why:** Re-showing someone after a photo rejection erodes trust. The user needs to believe that when they pass, that person is gone. This is the one irreversible action in the system.

## Rule 2: Narrative-stage non-selection is NOT rejection

When a user sees 3 intro cards and picks one (or none), the unpicked cards are **not rejected**. They go to the re-pitch pool for up to 4 more attempts with different narrative angles.

- A person can be shown up to 5 total times (1 original + 4 re-pitches)
- Each re-pitch must use a different narrative tier
- Re-pitches have a 3-7 day cooldown
- After 5 failed attempts across all tiers, the person is retired permanently (treated as a compatibility miss, not just a narrative miss)

## Rule 3: Distance handling

### How distance works as a filter

Users set a distance preference: `same_metro`, `few_hours`, or `anywhere`.

**Filter logic:**
- `same_metro` + `same_metro` → match (both in same area)
- `same_metro` + `few_hours` → match only if actually within a few hours
- `same_metro` + `anywhere` → match (the "anywhere" person is flexible)
- `few_hours` + `few_hours` → match
- `few_hours` + `anywhere` → match
- `anywhere` + `anywhere` → match

**Key principle:** Distance filtering is BIDIRECTIONAL. Both people must be willing to cover the distance. If User A says "same metro only" and User B is 500 miles away and says "anywhere," we still show them — because User B is willing to relocate.

### Distance prioritization within a match pool

When multiple candidates pass all filters, **closer candidates get a slight boost** but distance is NOT the primary ranking factor. The introduction quality (intro potential score) is what matters.

```
distance_boost:
  same_metro: +0.1 to intro_potential score
  few_hours: +0.05
  anywhere: +0 (no penalty, just no boost)
```

This means a fascinating person 1000 miles away can still beat a boring person next door — but all else being equal, proximity wins.

## Rule 4: Empty pool handling

### What happens when there's no one left?

Scenarios and responses:

**Scenario A: Thin pool (< 3 eligible candidates)**
The system cannot compose a Daily Three. Responses:
1. Show what we have (1-2 cards instead of 3) with a note: "We're finding more people for you. Answer more questions to improve your matches in the meantime."
2. If the user's filters are very restrictive, gently suggest: "Widening your age range by 2 years would add X more people to your pool."
3. Never show zero cards with no explanation. Always tell them why and what they can do.

**Scenario B: Exhausted pool (all candidates used up)**
Every eligible person has been either:
- Photo-rejected (permanent)
- Retired after 5 narrative attempts
- Mutual matched (in progress)

Response — the "queue jump" mechanic:
1. "You're caught up! You've seen everyone who matches your criteria."
2. **Primary CTA:** "Want to jump to the front of the queue? Invite friends and you'll be the first to see them when they join." → [Share invite link]
3. **Secondary:** "While you wait, improve your profile — richer profiles get better intros when new people arrive."
4. **Tertiary:** "Want to widen your criteria? [Adjust filters]"
5. Never show a countdown timer to nothing.

**Queue priority rule:** Users who have invited others get priority when new members join. If 3 new women sign up and 10 men are waiting, the men who invited friends see them first. This creates a direct incentive loop: invite → get matches faster.

**Scenario C: No one in your area**
User selected `same_metro` but there are 0 people in their metro.

1. "You're early to [area]! The best way to get matches here is to bring the people you already know."
2. **Primary CTA:** "Share PLY with friends in your area" → [Invite link with metro context]
3. **Secondary:** "Want to see people within a few hours? Some of the best connections start long-distance."
4. Never show a countdown timer to nothing.

**Scenario D: No one of the right religion/observance**
User selected `essential` + `LDS` + `practicing` + `must_match` but there are 0 practicing LDS members.

1. "You're the first practicing LDS member here. The more people from your community, the better your matches."
2. **Primary CTA:** "Share PLY with people from your ward / congregation" → [Invite link with community context]
3. **Secondary:** "There are X [cultural/background] LDS members. Would you like to see them too?"

## Rule 8: Invite priority queue

Users who invite others get matching priority:
- When new members join, users who referred someone see them first
- Each successful invite (friend completes onboarding) = priority bump
- This is the primary mechanic for empty-pool scenarios
- Invite links are personalized: `people-like-you.com/join/[username]` or a short code
- Track: who invited, who joined, who completed onboarding

## Rule 5: Elo gating is soft, not hard

Elo range starts at ±150 but widens automatically:
- If < 5 candidates at ±150, widen to ±300
- If < 3 candidates at ±300, show everyone regardless of Elo
- Never let Elo leave someone with zero matches. Elo is a ranking signal, not a gate.

## Rule 6: Re-pitch cooldown is real time, not login time

If a user doesn't open the app for 2 weeks, their re-pitch cooldowns still expire. When they come back, they get a fresh batch (including any re-pitches that completed their cooldown while the user was away).

## Rule 7: Never show the same intro text twice

Even if a person is re-pitched, the narrative must be regenerated with a different strategy. The user should never read the same sentences about the same person.

---

## Adding new rules

When a new hard constraint is identified:
1. Add it here with a number, the rule, and the **why**
2. Reference the rule number in code comments where it's enforced
3. Rules are immutable once users depend on them (especially Rule 1)
