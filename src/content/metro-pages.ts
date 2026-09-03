/**
 * Hand-written content for the wave-1 metro pages (specs/location-seo-strategy.md).
 *
 * Rules that shaped this file:
 *  - Every page's §2–§5 must be genuinely distinct — if the only unique content is the
 *    numbers table, the page is a doorway page and gets 60–90% ranking loss.
 *  - "Congregations", never "singles wards" — the Religion Census doesn't break out YSA
 *    units (see the spec).
 *  - No sex-ratio numbers on any page (the spec's ⚠ trap: the Census ratio measures the
 *    wrong population and contradicts the LDS-specific research).
 *  - The word "Mormon" appears only inside one FAQ entry per page — it still carries
 *    query volume, but it's against the Church's style guidance, so never in titles/H1s.
 */

export type MetroContent = {
  slug: string
  h1: string
  hook: string
  metaTitle: string
  metaDescription: string
  intro: string[]
  meaning: string[]
  meet: string[]
  seasonal: string[]
  honest: string[]
  faq: { q: string; a: string }[]
}

const sharedFaq = (place: string) => [
  {
    q: 'Is People Like You an LDS dating app?',
    a: `Yes. People Like You is a matchmaker for Latter-day Saint singles who date with marriage in mind — one real introduction a day, chosen on the things that actually matter: faith and observance, life stage, and the stuff that never fits in a profile.`,
  },
  {
    q: 'Is this a Mormon dating site?',
    a: `Yes — if that's the word you searched, this is what you were looking for: a matchmaker for members of The Church of Jesus Christ of Latter-day Saints. We just say Latter-day Saint.`,
  },
  {
    q: `I'm not in a YSA ward — does this work for me?`,
    a: `Especially for you. In ${place}, plenty of singles sit quietly in family wards where nobody thinks to set them up anymore. A matchmaker doesn't need you to show up at activities to find you — that's the point.`,
  },
  {
    q: 'What does it cost?',
    a: `Joining the waitlist is free. Pricing for the product itself isn't set yet, and nothing is ever charged without telling you first.`,
  },
]

export const METRO_CONTENT: Record<string, MetroContent> = {
  'provo-orem': {
    slug: 'provo-orem',
    hook: `Everyone here is a member. That was never the hard part. One real introduction a day, chosen for you, with the reason you two would work — that's the part Provo has always been missing.`,
    h1: 'LDS singles in Provo–Orem',
    metaTitle: 'LDS Singles in Provo & Orem, Utah — The Real Numbers',
    metaDescription:
      'Provo–Orem is the most Latter-day Saint metro in America — 82.6% of the population, 1,356 congregations. What that actually means for dating here, honestly.',
    intro: [
      `Provo–Orem is the most Latter-day Saint place on earth that isn't a temple. 82.6% of the metro belongs to the Church — the highest share of any U.S. metro, by a wide margin. If you're single here, finding members of the Church has never been the challenge. It's everything that comes after.`,
    ],
    meaning: [
      `Everywhere else in the country, LDS singles say the same thing: "there's nobody here." Provo has the opposite disease. Between BYU, UVU, and the wards stacked three-deep on every hillside, the pool is enormous — tens of thousands of never-married twenty-somethings inside one valley. Scarcity is not your challenge.`,
      `Your challenge is velocity and noise. The Provo dating market is possibly the most efficient marriage market in America: everyone is dating, everyone knows someone you've dated, and the cycle from first date to defined relationship runs on a semester clock. In a market this liquid, being a genuinely good match isn't enough — you have to actually get noticed before the semester ends, and a swipe profile is a terrible way to be noticed.`,
    ],
    meet: [
      `The honest answer: through proximity, over and over. Wards and FHE groups, BYU and UVU classes, institute, the same four apartment complexes everyone cycles through, line dancing at the Quarry, hikes up Rock Canyon, and an endless circuit of ward activities. Provo doesn't lack meeting places — it lacks filters. You meet two hundred people a semester and go on second dates with three of them.`,
      `Set-ups still carry enormous weight here. Roommates, mission companions, and married friends who "know someone" are the real matchmaking infrastructure of Utah Valley — which tells you something: even in the densest market in the world, people trust a brokered introduction over a cold one.`,
    ],
    seasonal: [
      `Provo runs on the academic calendar the way farm towns run on harvest. Late August and early January bring the big reshuffles — new wards, new complexes, new people. April graduation clears a wave out. Summer splits the town: sales teams scatter to Texas and the Carolinas, some students go home, and the valley runs at half density until fall.`,
      `The two post-mission waves — mid-summer and right before Christmas — are real, and everyone knows it. A market this seasonal punishes bad timing: meet someone in March and you have six weeks before the board resets.`,
    ],
    honest: [
      `Here's the thing nobody in Provo says out loud: the abundance is the trap. When there's always another activity, another ward, another semester of new people, there's always a reason not to choose. Provo singles don't struggle to meet — they struggle to stop meeting. Add the fact that you've been on one date with half your ward's roommates, and dating starts to feel like a job fair where everyone's résumé is identical: served a mission, loves the outdoors, family is everything.`,
      `What actually works here is differentiation — being seen as a specific person rather than another face at munch-and-mingle. That's the whole reason People Like You starts every introduction with the reason you two specifically would work.`,
    ],
    faq: [
      {
        q: 'Does People Like You work for BYU and UVU students?',
        a: `Yes — if you're an adult who dates with marriage in mind, you're exactly who it's for. In Provo that includes a lot of students. You'll need to be 18+.`,
      },
      ...sharedFaq('Utah Valley'),
    ],
  },

  'salt-lake-city': {
    slug: 'salt-lake-city',
    hook: `The biggest LDS community on earth, and you can still go months without meeting anyone right. One real introduction a day, with the reason you two would work.`,
    h1: 'LDS singles in Salt Lake City',
    metaTitle: 'LDS Singles in Salt Lake City — The Real Numbers',
    metaDescription:
      'Salt Lake City has more Latter-day Saints than any metro in America — 653,868 across 1,476 congregations. What dating here is actually like, honestly.',
    intro: [
      `Salt Lake City is the capital of the Church in every sense, and it has the largest Latter-day Saint population of any metro in the country — more than 650,000 members. But dating here is nothing like dating forty minutes south in Provo, and everyone who has done both knows it.`,
    ],
    meaning: [
      `Half the metro is LDS, which sounds like Provo — but the single half of that half is a different crowd. SLC is where Utah's singles land after college: working professionals in Sugar House and the Avenues, grad students, people who moved up for a job at Silicon Slopes, people on their second act after a mission or a degree or a relationship that didn't work out. The market is older, more settled, and much less synchronized than the valley to the south.`,
      `That desynchronization is the real difference. In Provo everyone is single at the same time in the same place. In Salt Lake the singles are spread across a huge valley, mixed into a city that's also half not-LDS, working jobs with no semester rhythm. The density is world-class on paper; in practice you can go months without organically meeting someone who fits.`,
    ],
    meet: [
      `The institutional channels still function — wards for young adults, mid-singles activities for the 31+ crowd, institute downtown, temple-square adjacent firesides. And SLC has what Provo doesn't: an actual city. People meet at climbing gyms and ski resorts, at tech-company happy hours (with soda), on trail runs in Millcreek, at the farmers market. The challenge is that none of those venues sort by intention — the person you clicked with at the gym may not share anything else that matters to you.`,
      `Ask around and you'll hear the same pattern: past about 27, almost everyone in SLC who married met through a specific introduction — a friend, a sibling, a former roommate who "knew someone up in Bountiful." The city runs on brokered introductions; it just does them informally and slowly.`,
    ],
    seasonal: [
      `Salt Lake's calendar is gentler than Provo's but real: January brings ward reshuffles and resolution energy, summer is peak activity season (hikes, lake days, festival circuit), and the holidays send everyone home to their families and their ward friends' pointed questions. Ski season is its own social economy — half the mid-singles scene migrates up the canyons every Saturday from December to April.`,
    ],
    honest: [
      `The honest challenge in Salt Lake: it lives in Provo's shadow, and the scar tissue shows. A lot of SLC singles spent their early twenties in the valley's high-velocity market and came out tired — burned out on activities that feel like repeats, wary of a scene where everyone still knows everyone. The result is a big, capable, slightly guarded pool of people who would genuinely rather meet one right person than another room full of maybes.`,
      `If that's you, you're the exact person a matchmaker model was built for: one vetted introduction a day, with the reasoning attached, and no ward-activity small talk required to get there.`,
    ],
    faq: [
      {
        q: `I'm over 30. Is Salt Lake's scene still workable?`,
        a: `Yes — SLC has one of the country's largest mid-singles populations, and it's the age band worst served by the activity circuit and best served by direct introductions. That's a big part of why People Like You is launching here.`,
      },
      ...sharedFaq('the Salt Lake Valley'),
    ],
  },

  phoenix: {
    slug: 'phoenix',
    hook: `300,000 members, seventy miles apart. The right person is out there — probably two freeways away. One real introduction a day, with the reason they're worth the drive.`,
    h1: 'LDS singles in Phoenix & Mesa',
    metaTitle: 'LDS Singles in Phoenix, Mesa & Gilbert — The Real Numbers',
    metaDescription:
      'The Phoenix metro has 301,196 Latter-day Saints across 617 congregations — more than triple Rexburg. Why dating in the East Valley is harder than the numbers say.',
    intro: [
      `Here's a number that surprises people: the Phoenix metro has over 300,000 Latter-day Saints — more than Boise, more than triple Rexburg, the fourth-largest LDS population of any metro in America. Mesa and Gilbert aren't an outpost of the Church; they're one of its capitals. So why does dating here feel so hard?`,
    ],
    meaning: [
      `Because Phoenix is huge, and the community is dense in pockets and invisible in between. The historic core around the Mesa temple, the newer stakes blanketing Gilbert and Queen Creek, the pockets in Chandler and Ahwatukee — each is a real community. But the metro is seventy miles across, and a single adult in Peoria and a single adult in Queen Creek may as well live in different states. Your ward is not your dating pool here; your ward is eighty families and four singles.`,
      `The upside: at 6.2% of the population, the community is big enough that the person you're looking for very likely exists within driving distance. The catch is that "driving distance" in Phoenix means forty minutes on the 60, and nobody's doing that on the strength of a swipe.`,
    ],
    meet: [
      `The East Valley does the institutional stuff at real scale — young single adult wards and stakes, institute at ASU and the Gilbert institute building, multi-stake activities, temple trips to Mesa and Gilbert. Arizona also has something Utah doesn't: a strong culture of massive regional YSA events, because everyone understands that no single ward has critical mass.`,
      `Outside the Church infrastructure, it's pickup sports and lake days in the eight months of good weather, hiking Camelback and the Superstitions in the winter, and a lot of group chats organizing last-minute plans. The scene is genuinely friendly — Arizona LDS culture is more relaxed than Utah's — but it's spread thin, and consistency is the hard part.`,
    ],
    seasonal: [
      `Phoenix runs backwards from the rest of the country: winter is the social high season and summer is the desert everyone survives indoors. October through April is packed — activities, hikes, conference watch parties, everything. June through September, plans compress to pools, mountain escapes to Flagstaff, and air conditioning. ASU's calendar adds a modest fall/January pulse, and snowbird season quietly swells the older wards, not the singles.`,
    ],
    honest: [
      `The honest challenge in Phoenix: it's a commuter market wearing a small town's reputation. People assume Mesa works like Provo — that the community will just produce someone. It won't. The density that makes Utah's scene self-serve doesn't survive being spread across seventy miles of freeway, so singles here do the math and quietly give up on everything outside a fifteen-minute radius. The person who'd be right for you probably exists in this metro; the odds you organically collide with them at an activity are terrible.`,
      `That's precisely the market where a matchmaker beats a feed: finding-across-distance is exactly what an introduction service solves and a swipe app doesn't.`,
    ],
    faq: [
      {
        q: 'Does People Like You cover the whole valley — Gilbert, Queen Creek, the West Valley?',
        a: `Yes. Matching works across the metro with distance as one factor among many, not a hard wall — because in Phoenix the right person is often two freeways away, and we'd rather tell you why they're worth the drive.`,
      },
      ...sharedFaq('the East Valley'),
    ],
  },

  boise: {
    slug: 'boise',
    hook: `You already know the forty faces at every activity. One real introduction a day from beyond that circle, with the reason you two would work.`,
    h1: 'LDS singles in Boise',
    metaTitle: 'LDS Singles in Boise & the Treasure Valley — The Real Numbers',
    metaDescription:
      'The Boise metro has 115,016 Latter-day Saints — 15% of the population, 265 congregations. What the Treasure Valley dating scene actually looks like.',
    intro: [
      `Boise is the biggest LDS population center that isn't in Utah or Arizona — 115,000 members, 15% of the Treasure Valley. It's big enough to have a real singles scene and small enough that the scene knows itself. Both halves of that sentence matter.`,
    ],
    meaning: [
      `Fifteen percent is a sweet spot with a sting. The community is everywhere — Meridian and Eagle are full of young LDS families, the stakes are healthy, the institute is active — so being a member here is comfortable in a way coastal members envy. But "everyone's a member" cuts differently for singles: Treasure Valley culture marries young, and the social infrastructure quietly assumes you did too. The pool at 24 is decent; the pool at 29 feels like a rumor.`,
      `It isn't, though. The metro's never-married 20–34 population is nearly ninety thousand people, and the LDS share of the valley means thousands of them are members. They're just distributed across a hundred family wards, two universities, and a lot of jobs — not gathered anywhere you can see them.`,
    ],
    meet: [
      `The YSA infrastructure centers on the Boise institute and the singles wards clustered near BSU, with multi-stake activities pulling from Nampa and Caldwell out west. The outdoor scene does heavy lifting — the foothills trails, the Greenbelt, Bogus Basin in winter, the Payette in summer; half the second dates in this valley happen on a trail.`,
      `Past the YSA years, it thins to mid-singles activities that everyone describes the same way ("the same forty people"), set-ups by married friends, and driving to Utah for weekends — a genuine, common strategy that tells you exactly how underserved this market is.`,
    ],
    seasonal: [
      `Boise's rhythm is mild: a September surge when BSU comes back, January reshuffles, and a summer that's the opposite of Utah's exodus — everyone's here, out on the water and the trails, and activity attendance peaks. The quiet season is the dead of winter, when the valley socializes in living rooms and everyone's planning spring.`,
    ],
    honest: [
      `The honest challenge in Boise: it's a marriage-minded culture with a thin singles market past the mid-twenties, and everyone in it knows everyone. Three months into the scene, you've met the people you're going to meet, and the valley's polite smallness means dating someone's ex-roommate's ex is less an anecdote than a certainty. What Boise singles need isn't another activity — it's reach: introductions from outside the forty faces they already know, chosen for actual compatibility rather than adjacency.`,
    ],
    faq: [
      {
        q: 'Does this cover Meridian, Nampa, and Eagle too?',
        a: `Yes — People Like You works at the metro level, and in the Treasure Valley that means Boise through Caldwell. The community is spread across the whole valley; the matching follows it.`,
      },
      ...sharedFaq('the Treasure Valley'),
    ],
  },

  'washington-dc': {
    slug: 'washington-dc',
    hook: `The most impressive LDS singles scene in the country — and everyone's on a two-year clock. One real introduction a day, with the reason attached, before the next posting.`,
    h1: 'LDS singles in Washington, DC',
    metaTitle: 'LDS Singles in Washington, DC — The Real Numbers',
    metaDescription:
      'The DC metro has 72,147 Latter-day Saints across 134 congregations — one of the largest East Coast communities, and its most transient. An honest look at dating here.',
    intro: [
      `Washington has one of the largest Latter-day Saint communities east of the Mississippi — 72,000 members, a temple on the Beltway that lights up the skyline, and a young-adult scene famous enough inside the Church that people plan their careers around joining it. It is also the most transient LDS market in America, and that shapes everything.`,
    ],
    meaning: [
      `DC's LDS singles scene is unlike anywhere else because of who moves here: Hill staffers, JDs, consultants, foreign-service officers, med students, officers on rotation. The pool is unusually large for the East Coast, unusually accomplished, and unusually intentional — people came here on purpose, with plans. At 1.1% of the metro you won't bump into members at the grocery store, but the community gathers hard, and the young-adult wards in Northern Virginia and the District are among the biggest and most storied in the Church.`,
      `The flip side: everyone is on a clock. Tours end, clerkships end, programs end. The scene is a river, not a lake — impressive people flowing through on two-to-four-year cycles.`,
    ],
    meet: [
      `Ward activities and linger-longers at real scale, institute near the universities, temple trips, monument runs at dawn, group houses in Arlington and Capitol Hill whose Sunday dinners function as unofficial matchmaking institutions. DC does organized-singles better than almost anywhere — the machinery genuinely works.`,
      `And yet ask DC members how couples actually form and you'll hear about the group-house dinner where someone was seated next to someone on purpose. In a market where everyone's schedule is brutal and everyone's tenure is short, deliberate introductions dominate — because nobody has two years to let proximity do its slow work.`,
    ],
    seasonal: [
      `The city's rhythm is the government's: a huge late-summer arrival wave (new hires, new clerks, new students), a January infusion with each new Congress and program cohort, and a steady outflow every spring. August recess and the holidays empty the group houses. Every arrival wave reshuffles the wards — which means the market genuinely resets twice a year, whether you were mid-something or not.`,
    ],
    honest: [
      `The honest challenge in DC: ambition crowds out follow-through. The scene is full of people who'd be extraordinary partners and who treat dating like the eighth priority after work, church calling, marathon training, and a security clearance. Combine that with constant turnover and you get the DC pattern everyone recognizes — six months of promising almosts that end with someone's posting to Geneva. The people are exceptional; the system wastes them.`,
      `A matchmaker flips that math: when the introduction comes pre-reasoned and both people opted into marriage-minded dating, the six months actually go somewhere.`,
    ],
    faq: [
      {
        q: 'Does this cover Northern Virginia and Maryland?',
        a: `Yes — the whole metro: the District, Arlington, Alexandria, Fairfax, Montgomery County, and out the corridors. That's where the community actually lives.`,
      },
      ...sharedFaq('the DC area'),
    ],
  },

  'new-york': {
    slug: 'new-york',
    hook: `62,000 members hidden inside twenty million people. We find the handful who fit you and introduce you — one a day, with the reason you two would work.`,
    h1: 'LDS singles in New York City',
    metaTitle: 'LDS Singles in New York City — The Real Numbers',
    metaDescription:
      'The New York metro has 62,194 Latter-day Saints across 107 congregations — 0.3% of the population. Dating inside the smallest big community in the Church, honestly.',
    intro: [
      `There are 62,000 Latter-day Saints in the New York metro — more than in Rexburg, spread across a region of twenty million. That's the whole NYC experience in one statistic: the community is real, substantial, and nearly invisible, 0.3% of the biggest city in the country. Being LDS and single here means belonging to a small town that happens to be hidden inside New York.`,
    ],
    meaning: [
      `At 0.3%, nothing about meeting members happens by accident. The person next to you on the L train is not in your ward. The city's LDS singles gather instead — into the young single adult wards that meet above the Manhattan temple across from Lincoln Center, into Brooklyn's congregations, into the wards scattered from Westchester to Jersey City. Inside those rooms the community is intense and tight; outside them it doesn't exist.`,
      `The pool itself is distinctive: transplants who came for finance, publishing, medicine, art, grad school — people who chose the hardest city on purpose. It's a small pool of very deliberate people, which is both its charm and its challenge.`,
    ],
    meet: [
      `Ward activities, institute in the temple building, Sunday linger-longers that run long because nobody wants to go back to a studio apartment in Queens. Beyond the official calendar: group brunches, Central Park picnics, rooftop things in the summer, friends-of-friends dinner parties that are the city's real introduction engine. NYC members are unusually good at community because they have to be.`,
      `But geography taxes everything. "We're both in the city" can mean ninety minutes door to door, and a scene this small can't afford friction that big — which is how promising people quietly never happen.`,
    ],
    seasonal: [
      `The city's LDS rhythm follows its industries: a big late-summer wave of arrivals (analysts, residents, students), a January trickle, and a slow leak of departures each spring as leases end and people concede to Boston, DC, or a house near family. Summer scatters everyone to the Hamptons-adjacent versions of their own budgets; autumn is the season everything actually happens.`,
    ],
    honest: [
      `The honest challenge in New York: the pool is small, the city is enormous, and the clock is loud. A lot of LDS singles give the city a window — through school, through the first job — and the window has an end date. Meanwhile the scene is compact enough that within a year you know everyone your age in your borough, and the swipe apps are worse than useless at 0.3% density. NYC members don't need more ways to browse; they need the handful of genuinely compatible people in this metro found and brought to them before the window closes.`,
      `That is, literally, the product.`,
    ],
    faq: [
      {
        q: 'Does this cover Brooklyn, Queens, Jersey — or just Manhattan?',
        a: `The whole metro — five boroughs, North Jersey, Westchester, Long Island. At this density the community only works metro-wide, so the matching does too.`,
      },
      ...sharedFaq('the New York area'),
    ],
  },

  rexburg: {
    slug: 'rexburg',
    hook: `The market resets every fourteen weeks. One real introduction a day, chosen for actual compatibility — before the semester board reshuffles again.`,
    h1: 'LDS singles in Rexburg',
    metaTitle: 'LDS Singles in Rexburg, Idaho — The Real Numbers',
    metaDescription:
      'Rexburg is 53% Latter-day Saint with 97 congregations in a town of thousands of students. The strangest dating market in the Church, described honestly.',
    intro: [
      `Rexburg is the second-most Latter-day Saint metro in America by share — 53% of the population, and that undercounts the reality, because the population is BYU–Idaho. It is a town-sized campus with the strangest dating market in the Church: hyper-dense, hyper-young, and rebuilt from scratch three times a year.`,
    ],
    meaning: [
      `On paper Rexburg looks like Provo's little sibling. In practice the track system changes everything: BYU–Idaho admits students on rotating Fall/Winter/Spring tracks, so the person you met in October may be assigned off-campus in January — not graduated, just gone until spring. The pool doesn't ebb like a normal college town's; it hard-resets, and everyone's planning horizon shrinks to match.`,
      `Inside any given semester, though, the density is unmatched: nearly everyone is a member, nearly everyone is 18–26, nearly everyone is here at least half-hoping to leave married. There's no ambiguity about intent in Rexburg, which is refreshing — and its own kind of pressure.`,
    ],
    meet: [
      `Wards and FHE, devotionals, the apartment-complex social ecosystems (each with its own reputation everyone pretends not to know), country swing at the MC, sledding and hot-chocolate winters, Teton day trips when the weather allows. Rexburg's meeting infrastructure is total — a closed system where you'll encounter your entire eligible cohort within weeks.`,
      `Which is why introductions still matter here: the constraint isn't exposure, it's signal. When you've technically "met" four hundred people this semester, someone pointing at one of them and saying "this one, and here's why" is worth more than another activity ever could be.`,
    ],
    seasonal: [
      `Three semesters, three resets: April, July, and December each end a track and shuffle the town. Summers run smaller and looser; winters are long, dark, and social in the huddled way of a town at 4,800 feet. And every semester break, Rexburg does its famous vanishing act — the town's population visibly halves in a week. Timing isn't part of dating here; it is dating here.`,
    ],
    honest: [
      `The honest challenge in Rexburg: fourteen-week relationships in a fourteen-week town. The track system means the market resets faster than most relationships can mature, so couples either sprint or dissolve — and everyone feels the sprint. Meanwhile if you're a local, a young professional, or anyone past about 26, the town's total orientation toward student life makes you nearly invisible. Rexburg is simultaneously the easiest place in the world to meet LDS singles and one of the hardest places to get past a third date with one.`,
    ],
    faq: [
      {
        q: `I'm not a BYU–Idaho student. Is there anything here for me?`,
        a: `You're exactly why this page exists. Non-students are the most underserved singles in Rexburg — the scene assumes a campus schedule you don't have. A matchmaker doesn't care about your enrollment status, only your compatibility.`,
      },
      ...sharedFaq('the Upper Valley'),
    ],
  },

  philadelphia: {
    slug: 'philadelphia',
    hook: `A few hundred singles across the whole metro, and you've met them all. One real introduction a day, chosen on compatibility — not just co-attendance.`,
    h1: 'LDS singles in Philadelphia',
    metaTitle: 'LDS Singles in Philadelphia — The Real Numbers',
    metaDescription:
      'The Philadelphia metro has 18,600 Latter-day Saints across 37 congregations — a small, tight community anchored by a downtown temple. Dating here, honestly.',
    intro: [
      `Philadelphia's Latter-day Saint community is small — 18,600 members in a metro of six million, 0.3% — with a temple on the Benjamin Franklin Parkway since 2016 and congregations running from Center City out through the Main Line, Bucks County, and South Jersey. Small doesn't mean stuck: Philadelphia sits ninety minutes from two of the biggest LDS singles scenes on the East Coast, and that changes the math completely.`,
    ],
    meaning: [
      `Do the honest math and Philadelphia's active young-single pool is a few hundred people across the whole metro — Center City through the Main Line, up to Bucks County, across the bridge into South Jersey. That's not a market you browse; it's a community you join. Every activity has the same faces within a season, everyone's dating history is common knowledge, and a bad breakup ripples through three wards.`,
      `But small has a strength the big markets lack: nobody here is anonymous, which means nobody can be casually careless. Philly's scene is warmer and more serious than the coastal-city stereotype — people show up, people mean it.`,
    ],
    meet: [
      `The young single adult scene concentrates around the city wards and the temple's orbit — institute classes, temple nights that double as the social event of the week, activities that pull from Penn, Drexel, and Temple's student pockets plus the young-professional crowd in Fishtown and Center City. Regional YSA events matter enormously here, because the honest catchment for Philadelphia's singles includes Wilmington, the Lehigh Valley, and South Jersey.`,
      `Beyond that, the market quietly leaks toward the corridors: Philly singles road-trip to DC and New York activities, and everyone knows a couple that formed across the I-95 gap. The community already behaves like the region is one market; nothing official does.`,
    ],
    seasonal: [
      `A modest September wave when the universities return, a January blip, and a summer that scatters to the Jersey Shore. The bigger rhythm is the young-professional churn: Philadelphia keeps its natives and its med students but loses a steady trickle of members to DC and New York — the price of sitting between the two biggest East Coast scenes.`,
    ],
    honest: [
      `The honest challenge in Philadelphia: the visible pool is small, and everyone in it has already met. Six months in the scene and you can name every face at every activity; the standard advice — "get out there more" — is useless when you've already been everywhere the community gathers. But the visible pool isn't the whole pool. Plenty of Philadelphia singles sit in family wards from Valley Forge to Cherry Hill, outside the YSA circuit entirely, invisible to it — and no activity calendar will ever surface them.`,
      `And then there's the corridor. New York and Washington — two of the largest LDS singles scenes in the country — are each about ninety minutes away. Close enough to actually date. People Like You matches across that whole stretch when the fit is right: Philadelphia doesn't have to be a small market once the introductions can reach Trenton, Manhattan, and Arlington.`,
    ],
    faq: [
      {
        q: 'Will I only be matched inside Philadelphia?',
        a: `No — we introduce you to people close enough to actually date, and for Philadelphia that unlocks New York and Washington, DC when the fit is right. Both are about ninety minutes away, and both have far bigger pools. South Jersey and Delaware are of course included too.`,
      },
      ...sharedFaq('the Philadelphia area'),
    ],
  },
}
