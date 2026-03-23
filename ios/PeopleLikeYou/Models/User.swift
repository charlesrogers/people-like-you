import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let firstName: String
    let lastName: String?
    let gender: Gender
    let seeking: Seeking
    let birthYear: Int?
    let state: String?
    let height: String?
    let education: String?
    let onboardingStage: String
    let eloScore: Int
    let eloInteractions: Int
    let community: String
    let isSeed: Bool
    let profileStatus: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, email, gender, seeking, state, height, education, community
        case firstName = "first_name"
        case lastName = "last_name"
        case birthYear = "birth_year"
        case onboardingStage = "onboarding_stage"
        case eloScore = "elo_score"
        case eloInteractions = "elo_interactions"
        case isSeed = "is_seed"
        case profileStatus = "profile_status"
        case createdAt = "created_at"
    }
}

enum Gender: String, Codable {
    case man = "Man"
    case woman = "Woman"
}

enum Seeking: String, Codable {
    case men = "Men"
    case women = "Women"
}

struct HardPreferences: Codable {
    var ageRangeMin: Int?
    var ageRangeMax: Int?
    var distanceRadius: String?
    var faithImportance: String?
    var kids: String?
    var maritalHistory: String?
    var smoking: String?
    var communityFields: [String: String]?

    enum CodingKeys: String, CodingKey {
        case ageRangeMin = "age_range_min"
        case ageRangeMax = "age_range_max"
        case distanceRadius = "distance_radius"
        case faithImportance = "faith_importance"
        case kids
        case maritalHistory = "marital_history"
        case smoking
        case communityFields = "community_fields"
    }
}

struct SoftPreferences: Codable {
    var humorStyle: [String]
    var energyLevel: String?
    var communicationStyle: String?
    var lifeStagePriority: String?
    var dateActivityPrefs: [String]

    enum CodingKeys: String, CodingKey {
        case humorStyle = "humor_style"
        case energyLevel = "energy_level"
        case communicationStyle = "communication_style"
        case lifeStagePriority = "life_stage_priority"
        case dateActivityPrefs = "date_activity_prefs"
    }
}
