import Foundation

struct PromptDef: Identifiable {
    let id: String
    let text: String
    let helpText: String
    let exampleAnswer: String
    let tier: PromptTier
    let category: String
}

enum PromptTier: String, CaseIterable {
    case selfExpansion = "self_expansion"
    case iSharing = "i_sharing"
    case admiration = "admiration"
    case comfort = "comfort"
    case fun = "fun"

    var label: String {
        switch self {
        case .selfExpansion: return "Self-Expansion"
        case .iSharing: return "I-Sharing"
        case .admiration: return "Admiration"
        case .comfort: return "Comfort"
        case .fun: return "Fun"
        }
    }
}

// MARK: - 55 Questions across 5 Tiers

let questionBank: [PromptDef] = [
    // ─── Tier 1: Self-Expansion (12) ───
    PromptDef(id: "rabbit_hole", text: "What's a rabbit hole you've gone down recently that you can't stop thinking about?", helpText: "A podcast, Wikipedia deep dive, hobby obsession — anything you've been weirdly into lately.", exampleAnswer: "I spent three hours last week reading about how they make sourdough starters that are like 200 years old. There are bakeries in San Francisco using starters from the 1800s. I now have one named Gerald.", tier: .selfExpansion, category: "depth"),
    PromptDef(id: "taught_yourself", text: "What's something you taught yourself that you're proud of?", helpText: "Could be a skill, a recipe, fixing something — anything you figured out on your own.", exampleAnswer: "I taught myself to do basic car maintenance from YouTube. Changed my own brakes last month and saved like $400. My hands were shaking the whole time but it worked.", tier: .selfExpansion, category: "ambition"),
    PromptDef(id: "show_someone_your_city", text: "If someone visited your city for one day and you were in charge, where are you taking them?", helpText: "Your favorite spots — the ones you actually go to, not the tourist traps.", exampleAnswer: "First we're getting breakfast tacos at this hole-in-the-wall that only has 6 tables. Then we're hiking the Y, and I'm ending the night at this rooftop that has the best sunset view in the valley.", tier: .selfExpansion, category: "warmth"),
    PromptDef(id: "changed_your_mind", text: "What's something you used to believe that you've completely changed your mind about?", helpText: "An opinion, a life plan, something about yourself — a real shift, not a small one.", exampleAnswer: "I used to think you had to have your whole career figured out by 25. Then I watched my dad switch careers at 50 and become happier than I'd ever seen him. Now I think the plan is overrated.", tier: .selfExpansion, category: "depth"),
    PromptDef(id: "different_life", text: "If you woke up tomorrow in a completely different career, what would you want it to be?", helpText: "Dream job, guilty pleasure career, the thing you'd do if money didn't matter.", exampleAnswer: "I'd want to be a national park ranger. Just living in a cabin, leading hikes, telling people about the geology. I think about it more than I should.", tier: .selfExpansion, category: "depth"),
    PromptDef(id: "obsession", text: "What's something you're a little obsessed with that most people find boring?", helpText: "The thing your friends' eyes glaze over about. The deep cut.", exampleAnswer: "Fonts. I have opinions about kerning. I notice bad typography on restaurant menus and it genuinely bothers me. My friends think I'm insane.", tier: .selfExpansion, category: "depth"),
    PromptDef(id: "side_quest", text: "What's a random side quest you've been on recently?", helpText: "Something unplanned that just happened — a detour, a spontaneous decision, a weird adventure.", exampleAnswer: "I was driving home and saw a sign for a free pottery class starting in 10 minutes. I walked in knowing nothing and made the ugliest bowl you've ever seen. I'm going back next week.", tier: .selfExpansion, category: "warmth"),
    PromptDef(id: "best_purchase", text: "What's the best thing you've bought for under $50?", helpText: "Something that made your life better, made you laugh, or you use constantly.", exampleAnswer: "A $12 headlamp. I use it for camping, walking the dog at night, working under the sink. It's the most useful thing I own and I feel ridiculous wearing it.", tier: .selfExpansion, category: "humor"),
    PromptDef(id: "unpopular_take", text: "Give us your most unpopular opinion.", helpText: "Food, movies, life philosophy — something where you're genuinely in the minority.", exampleAnswer: "Breakfast for dinner is better than breakfast for breakfast. There, I said it. Pancakes at 8pm hit different.", tier: .selfExpansion, category: "humor"),
    PromptDef(id: "bucket_list_done", text: "What's something you've actually checked off your bucket list?", helpText: "Big or small — a trip, a goal, a fear you conquered.", exampleAnswer: "I went skydiving last summer. I was terrified the entire plane ride up, cried a little, and then jumped anyway. Best 60 seconds of my life.", tier: .selfExpansion, category: "ambition"),
    PromptDef(id: "world_expert", text: "What topic could you give a 20-minute talk on with zero preparation?", helpText: "The thing you know cold. Your domain of accidental expertise.", exampleAnswer: "The history of pizza in America. I know way too much about this. Did you know the first pizzeria in the US opened in 1905 in New York? I can trace the whole evolution.", tier: .selfExpansion, category: "depth"),
    PromptDef(id: "weekend_project", text: "What's a project you've been working on in your spare time?", helpText: "Building something, learning something, creating something — anything you're actively doing.", exampleAnswer: "I'm refinishing a dresser I found on the side of the road. It's solid oak under three layers of paint. I've been sanding it for two weeks and it's starting to look incredible.", tier: .selfExpansion, category: "ambition"),

    // ─── Tier 2: I-Sharing (12) ───
    PromptDef(id: "gives_you_chills", text: "What's something that gives you actual chills? Music, a moment, a place?", helpText: "That full-body reaction when something hits you just right.", exampleAnswer: "When a whole crowd sings along at a concert and the artist stops singing and just lets the crowd carry it. Gets me every single time.", tier: .iSharing, category: "vulnerability"),
    PromptDef(id: "laugh_hardest", text: "Tell us about the last time you laughed so hard you couldn't breathe.", helpText: "The full story — who was there, what happened, why was it so funny?", exampleAnswer: "My roommate tried to make a TikTok of himself doing a backflip into a pool. He slipped on the wet concrete, grabbed the fence, the fence broke, and he fell in sideways. He was fine but I couldn't stop laughing for 20 minutes.", tier: .iSharing, category: "humor"),
    PromptDef(id: "notice_first", text: "When you walk into a room, what do you notice first?", helpText: "Not people — the vibe, the details, the energy. What catches your attention?", exampleAnswer: "The lighting. I always notice if a place has good lighting. Warm, dim lighting makes me instantly comfortable. Fluorescent lights make me want to leave immediately.", tier: .iSharing, category: "depth"),
    PromptDef(id: "perfect_evening", text: "Describe your perfect low-key evening.", helpText: "Not a special occasion — just a regular Tuesday that goes exactly right.", exampleAnswer: "I make pasta from scratch, put on a record — probably Fleetwood Mac — and eat on my patio with a candle. Maybe call my sister. Read for an hour. Asleep by 10. That's perfection.", tier: .iSharing, category: "warmth"),
    PromptDef(id: "guilty_pleasure", text: "What's a guilty pleasure you're not even a little ashamed of?", helpText: "The thing you enjoy that's not cool but you don't care.", exampleAnswer: "Reality dating shows. I watch every season of The Bachelor. I have a group chat about it. I will not apologize.", tier: .iSharing, category: "humor"),
    PromptDef(id: "weird_habit", text: "What's a weird habit you have that you've never been able to explain?", helpText: "Something you do that's just... you.", exampleAnswer: "I eat cereal with a fork. I've done it since I was a kid. I just don't like the milk-to-cereal ratio with a spoon. People are horrified.", tier: .iSharing, category: "humor"),
    PromptDef(id: "song_on_repeat", text: "What song have you had on repeat lately and why?", helpText: "The one you keep going back to. What is it about it?", exampleAnswer: "'Vienna' by Billy Joel. I heard it in a movie and it hit me at exactly the right time in my life. The line 'slow down, you crazy child' — I needed that.", tier: .iSharing, category: "vulnerability"),
    PromptDef(id: "movie_scene", text: "What's a movie or TV scene that lives rent-free in your head?", helpText: "The one you think about randomly. What about it stuck with you?", exampleAnswer: "The ending of Good Will Hunting where Robin Williams keeps saying 'it's not your fault.' I watched it alone in college and just completely fell apart. Changed how I think about vulnerability.", tier: .iSharing, category: "vulnerability"),
    PromptDef(id: "pet_peeve", text: "What's a pet peeve that tells people a lot about you?", helpText: "The small thing that bothers you way more than it should.", exampleAnswer: "When people don't push in their chairs. I know it's unhinged but it drives me crazy. I think it says I care about the details nobody else notices.", tier: .iSharing, category: "humor"),
    PromptDef(id: "comfort_food", text: "What's your comfort food and what memory is attached to it?", helpText: "The food you go to when you need to feel better. Where does it take you?", exampleAnswer: "My grandma's chicken soup. She made it every Sunday and the whole house smelled like it. Now whenever I make it — even from a different recipe — I feel like I'm 8 years old at her kitchen table.", tier: .iSharing, category: "warmth"),
    PromptDef(id: "ick_or_green_flag", text: "What's a surprisingly specific green flag in a person?", helpText: "Not the obvious stuff. The tiny thing that makes you think 'oh, I like this person.'", exampleAnswer: "When someone is nice to the waiter without making a show of it. Not performatively friendly — just naturally kind. That tells me everything.", tier: .iSharing, category: "depth"),
    PromptDef(id: "dealbreaker_funny", text: "What's a hilariously specific dealbreaker you have?", helpText: "The thing that's maybe not rational but you can't get past.", exampleAnswer: "If someone says they don't like dogs, I just can't. I don't even have a dog right now but I need to know you're capable of loving one.", tier: .iSharing, category: "humor"),

    // ─── Tier 3: Admiration (12) ───
    PromptDef(id: "bet_on_yourself", text: "Tell us about a time you bet on yourself and it worked out.", helpText: "A risk you took — career, relationship, move — where you trusted your gut.", exampleAnswer: "I quit my stable marketing job to go back to school for nursing. Everyone thought I was having a quarter-life crisis. Two years later I'm in the ER and I've never felt more alive at work.", tier: .admiration, category: "ambition"),
    PromptDef(id: "hardest_thing", text: "What's the hardest thing you've done that you're glad you did?", helpText: "Something that was genuinely difficult but you'd do it again.", exampleAnswer: "Moved across the country by myself at 23 knowing nobody. The first three months were brutal. But it forced me to become the kind of person who can walk into a room alone and make friends.", tier: .admiration, category: "vulnerability"),
    PromptDef(id: "helped_someone", text: "Tell us about a time you helped someone and it stuck with you.", helpText: "A moment where you made a real difference for someone.", exampleAnswer: "My neighbor's car broke down in the middle of winter and she had her kids in the back. I drove them to school, got her car towed, and drove her to work. She wrote me a thank you card that I still have on my fridge.", tier: .admiration, category: "warmth"),
    PromptDef(id: "figured_it_out", text: "What's something you figured out that nobody showed you how to do?", helpText: "A problem you solved through pure trial and error.", exampleAnswer: "I taught myself to code by building a budget tracker because every app I tried was garbage. It took me three months and it's ugly but it works exactly how I want it to.", tier: .admiration, category: "ambition"),
    PromptDef(id: "proud_of_someone", text: "Who are you most proud of and why?", helpText: "A person in your life who did something that makes you light up talking about it.", exampleAnswer: "My little sister. She has dyslexia and everyone told her college would be too hard. She just graduated summa cum laude. I ugly-cried at her graduation.", tier: .admiration, category: "warmth"),
    PromptDef(id: "against_the_grain", text: "When's a time you went against what everyone expected of you?", helpText: "A decision where you chose your own path instead of the easy one.", exampleAnswer: "My whole family is in finance. I became a high school teacher. Thanksgiving conversations about my salary are fun. But I've never once dreaded a Monday.", tier: .admiration, category: "ambition"),
    PromptDef(id: "building_right_now", text: "What are you actively building or working toward right now?", helpText: "A goal, a project, a skill — something you're in the middle of.", exampleAnswer: "Training for my first triathlon. I could barely swim six months ago. I'm still the slowest person in the pool but I show up every morning at 5:30.", tier: .admiration, category: "ambition"),
    PromptDef(id: "failure_lesson", text: "What's a failure that taught you something you couldn't have learned any other way?", helpText: "Not a humble brag — a real one. What did it change about you?", exampleAnswer: "I started a business that completely failed. Lost $15k. But it taught me that I'm way more resilient than I thought, and that I'd rather try and fail than wonder what if.", tier: .admiration, category: "vulnerability"),
    PromptDef(id: "mentor_moment", text: "Who's someone who changed the way you see the world?", helpText: "A person who shifted your perspective — teacher, parent, friend, stranger.", exampleAnswer: "My college professor who said 'the quality of your questions matters more than the quality of your answers.' I think about that literally every week.", tier: .admiration, category: "depth"),
    PromptDef(id: "secret_talent", text: "What's a talent you have that would surprise people who just met you?", helpText: "Something that doesn't fit the first impression you give off.", exampleAnswer: "I do calligraphy. Big bearded guy doing delicate hand lettering. I've done wedding invitations for like 10 friends now.", tier: .admiration, category: "humor"),
    PromptDef(id: "values_test", text: "When's a time your values were tested and you held firm?", helpText: "A moment where doing the right thing was the hard thing.", exampleAnswer: "Found a wallet with $600 cash in a parking lot. Nobody was around. I tracked down the owner using the ID and drove it to their house. They couldn't believe it.", tier: .admiration, category: "warmth"),
    PromptDef(id: "getting_better_at", text: "What's something you're actively trying to get better at?", helpText: "A skill, a habit, an aspect of yourself you're working on.", exampleAnswer: "Listening. I used to be the person who was just waiting for their turn to talk. I've been consciously trying to actually hear what people are saying before I respond. It's harder than it sounds.", tier: .admiration, category: "vulnerability"),

    // ─── Tier 4: Comfort & Attachment (9) ───
    PromptDef(id: "recharge", text: "How do you recharge after a really long week?", helpText: "What does genuine rest look like for you?", exampleAnswer: "Saturday morning, no alarm, coffee on the porch, zero plans. I need at least one day where I don't have to be anywhere. That's how I come back to life.", tier: .comfort, category: "warmth"),
    PromptDef(id: "close_people", text: "How would your closest friend describe you when you're at your best?", helpText: "Not how you'd describe yourself — how they'd describe you.", exampleAnswer: "She'd probably say I'm the friend who shows up. Like actually shows up — not just texts 'let me know if you need anything' but drives over with food.", tier: .comfort, category: "warmth"),
    PromptDef(id: "love_language_real", text: "What's the way you show someone you care about them? Give us a specific example.", helpText: "Not the love language quiz answer — the actual thing you do.", exampleAnswer: "I remember small things people mention and then follow up. If you tell me you have a job interview Thursday, I'm texting you Thursday morning.", tier: .comfort, category: "warmth"),
    PromptDef(id: "disagree_well", text: "How do you handle it when you disagree with someone you care about?", helpText: "Be honest — do you shut down, talk it out, need space?", exampleAnswer: "I need about 20 minutes to cool down before I can talk about it. If you try to hash it out immediately I'll say something dumb. But after I process, I'm really good at seeing the other side.", tier: .comfort, category: "vulnerability"),
    PromptDef(id: "safe_place", text: "Describe a place that feels like home to you.", helpText: "Could be an actual place or a feeling. Where do you feel most at ease?", exampleAnswer: "My parents' back porch in the fall. The leaves are changing, my mom's making something that smells amazing inside, and my dad is telling a story he's told 50 times.", tier: .comfort, category: "warmth"),
    PromptDef(id: "hard_day", text: "What do you need from someone when you're having a hard day?", helpText: "Not what you think you should say — what you actually need.", exampleAnswer: "Honestly? I just need someone to sit with me and not try to fix it. Just be there. Maybe bring takeout.", tier: .comfort, category: "vulnerability"),
    PromptDef(id: "morning_person", text: "Walk us through your morning routine — the real one, not the aspirational one.", helpText: "What actually happens between waking up and leaving the house?", exampleAnswer: "Hit snooze twice, scroll my phone for 10 minutes feeling guilty about it, make coffee, stand in the kitchen staring at nothing for 5 minutes, then somehow get ready in 15 minutes.", tier: .comfort, category: "humor"),
    PromptDef(id: "grateful_for", text: "What's something small that you're grateful for today?", helpText: "Not the big stuff — something tiny and specific from today or this week.", exampleAnswer: "My coworker left a sticky note on my desk that said 'you killed that presentation' and it made my whole day.", tier: .comfort, category: "warmth"),
    PromptDef(id: "relationship_lesson", text: "What's the most important thing you've learned about relationships?", helpText: "A real lesson from experience, not a quote from Instagram.", exampleAnswer: "That being right is way less important than being kind. I used to win every argument with my ex. We're not together anymore. Turns out winning doesn't feel like winning.", tier: .comfort, category: "vulnerability"),

    // ─── Fun / Wildcard (10) ───
    PromptDef(id: "conspiracy", text: "What's a conspiracy theory or hot take you're willing to die on?", helpText: "Doesn't have to be serious. The weirder the better.", exampleAnswer: "Mattress Firm is a money laundering operation. There's no way that many mattress stores stay in business legitimately. I will not be taking questions.", tier: .fun, category: "humor"),
    PromptDef(id: "worst_date", text: "What's your best worst-date story?", helpText: "The one that's funny now but was painful in the moment.", exampleAnswer: "He took me to a restaurant where his ex was the waitress. She cried. He cried. I ate my pasta in silence and then Ubered home. Three stars.", tier: .fun, category: "humor"),
    PromptDef(id: "irrational_fear", text: "What's an irrational fear you have?", helpText: "Something that doesn't make logical sense but gets you every time.", exampleAnswer: "Escalators. I know they're safe. But every time I step on one my brain goes 'what if your shoelace gets caught.' Every. Time.", tier: .fun, category: "humor"),
    PromptDef(id: "time_machine", text: "If you could go back and give your 18-year-old self one piece of advice, what would it be?", helpText: "What do you know now that would have changed everything then?", exampleAnswer: "Stop trying to be cool. The people who matter like you because you're weird, not in spite of it.", tier: .fun, category: "vulnerability"),
    PromptDef(id: "celebrity_dinner", text: "You get dinner with one person, living or dead. Who and why?", helpText: "Not who sounds impressive — who you actually want to talk to.", exampleAnswer: "Anthony Bourdain. I want to eat street food with him and hear him talk about the world. He saw beauty in places most people overlook.", tier: .fun, category: "depth"),
    PromptDef(id: "superpower", text: "If you could have one mundane superpower, what would it be?", helpText: "Not flying or invisibility. Something weirdly practical.", exampleAnswer: "The ability to fall asleep instantly. Do you know how much of my life I've wasted lying in bed thinking about something dumb I said in 2019?", tier: .fun, category: "humor"),
    PromptDef(id: "apocalypse_skill", text: "In a zombie apocalypse, what's the one skill you bring to the group?", helpText: "What's your survival value?", exampleAnswer: "I'm an excellent cook who can make something out of nothing. While everyone else is eating canned beans, I'm making a stew. Morale officer.", tier: .fun, category: "humor"),
    PromptDef(id: "most_me_photo", text: "If you had to pick one photo on your phone that captures who you really are, what would it be?", helpText: "Not your best photo — the most YOU photo. Describe it.", exampleAnswer: "It's me at a campsite, covered in dirt, holding up a fish I caught with a huge grin. My hair is a disaster. I look completely ridiculous and completely happy.", tier: .fun, category: "warmth"),
    PromptDef(id: "three_things", text: "You can only bring three things to a desert island. What are they?", helpText: "Be practical, be funny, be honest — whatever you want.", exampleAnswer: "A good knife, a solar charger, and my Kindle loaded with every book I've been meaning to read.", tier: .fun, category: "humor"),
    PromptDef(id: "dating_confession", text: "What's something you're a little nervous about when it comes to dating?", helpText: "Something real. Vulnerability is attractive.", exampleAnswer: "I'm terrible at small talk. I either go too deep too fast or I freeze and talk about the weather for 10 minutes. There's no middle ground.", tier: .fun, category: "vulnerability"),
]

// MARK: - Selection logic (matches web app)

func getOnboardingPrompts(count: Int = 6) -> [PromptDef] {
    let weights: [(PromptTier, Int)] = [
        (.selfExpansion, 2),
        (.iSharing, 1),
        (.admiration, 1),
        (.comfort, 1),
        (.fun, 1),
    ]

    var pool = questionBank
    var selected: [PromptDef] = []

    // Build tier order with weights, then shuffle
    var tierOrder = weights.flatMap { tier, weight in
        Array(repeating: tier, count: weight)
    }
    tierOrder.shuffle()

    for tier in tierOrder {
        guard selected.count < count else { break }
        let selectedIds = Set(selected.map(\.id))
        let candidates = pool.filter { $0.tier == tier && !selectedIds.contains($0.id) }
        guard let pick = candidates.randomElement() else { continue }
        selected.append(pick)
        pool.removeAll { $0.id == pick.id }
    }

    // Fill remaining randomly
    while selected.count < count, !pool.isEmpty {
        let pick = pool.randomElement()!
        selected.append(pick)
        pool.removeAll { $0.id == pick.id }
    }

    return selected
}
