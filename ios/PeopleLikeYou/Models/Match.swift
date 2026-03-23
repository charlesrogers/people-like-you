import Foundation

struct DailyIntro: Codable, Identifiable {
    let id: String
    let matchId: String
    let matchedUserId: String
    let name: String
    let narrative: String
    let photoUrl: String?
    let status: IntroStatus
    let introType: IntroType
    let scheduledAt: String
    let expiresAt: String
    let voiceMessageRequired: Bool

    enum CodingKeys: String, CodingKey {
        case id, name, narrative, status
        case matchId = "matchId"
        case matchedUserId = "matchedUserId"
        case photoUrl = "photoUrl"
        case introType = "introType"
        case scheduledAt = "scheduledAt"
        case expiresAt = "expiresAt"
        case voiceMessageRequired = "voiceMessageRequired"
    }
}

enum IntroStatus: String, Codable {
    case pending, liked, passed, expired
}

enum IntroType: String, Codable {
    case daily, bonus
}

struct MatchesResponse: Codable {
    var currentIntro: DailyIntro?
    var bonusIntro: DailyIntro?
    let nextDeliveryAt: String?
    let cadenceState: CadenceState?
    let history: [IntroHistoryItem]?
}

struct CadenceState: Codable {
    let isPaused: Bool
    let isHidden: Bool
    let consecutiveInactiveDays: Int
}

struct IntroHistoryItem: Codable, Identifiable {
    let id: String
    let name: String
    let narrativePreview: String
    let status: String
    let actedAt: String?
}

struct FeedbackRequest: Codable {
    let introId: String
    let matchId: String
    let userId: String
    let action: String
    let reason: String?
    let details: String?
    let photoRevealedBeforeDecision: Bool
    let matchedUserId: String?
}

struct FeedbackResponse: Codable {
    let ok: Bool
    let bonusIntro: DailyIntro?
    let mutualMatch: MutualMatchRef?
    let passStreakAction: String?
}

struct MutualMatchRef: Codable {
    let id: String
    let matchedUserId: String
}
