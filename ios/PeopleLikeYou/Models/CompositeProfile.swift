import Foundation

struct CompositeProfile: Codable {
    let userId: String
    let bigFiveProxy: [String: Double]?
    let humorStyle: String?
    let communicationWarmth: Double?
    let communicationDirectness: Double?
    let energyEnthusiasm: Double?
    let storytellingAbility: Double?
    let passionIndicators: [String]
    let kindnessMarkers: [String]
    let vulnerabilityAuthenticity: Double?
    let interestTags: [String]
    let values: [String]
    let goals: [String]
    let excitementType: String?
    let notableQuotes: [String]
    let memoCount: Int
    let lastUpdated: String

    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case bigFiveProxy = "big_five_proxy"
        case humorStyle = "humor_style"
        case communicationWarmth = "communication_warmth"
        case communicationDirectness = "communication_directness"
        case energyEnthusiasm = "energy_enthusiasm"
        case storytellingAbility = "storytelling_ability"
        case passionIndicators = "passion_indicators"
        case kindnessMarkers = "kindness_markers"
        case vulnerabilityAuthenticity = "vulnerability_authenticity"
        case interestTags = "interest_tags"
        case values, goals
        case excitementType = "excitement_type"
        case notableQuotes = "notable_quotes"
        case memoCount = "memo_count"
        case lastUpdated = "last_updated"
    }
}

struct ExtractionStatus: Codable {
    let total: Int
    let transcribed: Int
    let extracted: Int
    let compositeReady: Bool
    let excitementType: String?
    let memoCount: Int
}
