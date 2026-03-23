import Foundation

struct MutualMatch: Codable, Identifiable {
    let id: String
    let matchId: String
    let userAId: String
    let userBId: String
    let status: String
    let currentRound: Int
    let createdAt: String
    let expiredAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status
        case matchId = "match_id"
        case userAId = "user_a_id"
        case userBId = "user_b_id"
        case currentRound = "current_round"
        case createdAt = "created_at"
        case expiredAt = "expired_at"
    }
}

struct DisclosureExchange: Codable, Identifiable {
    let id: String
    let mutualMatchId: String
    let roundNumber: Int
    let promptText: String
    let userAResponse: String?
    let userARespondedAt: String?
    let userBResponse: String?
    let userBRespondedAt: String?
    let expiresAt: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case mutualMatchId = "mutual_match_id"
        case roundNumber = "round_number"
        case promptText = "prompt_text"
        case userAResponse = "user_a_response"
        case userARespondedAt = "user_a_responded_at"
        case userBResponse = "user_b_response"
        case userBRespondedAt = "user_b_responded_at"
        case expiresAt = "expires_at"
        case createdAt = "created_at"
    }
}

struct DisclosureResponse: Codable {
    let ok: Bool
    let exchange: DisclosureExchange
    let bothResponded: Bool
    let nextRound: DisclosureExchange?
    let exchangeComplete: Bool
    let readyForDate: Bool
}
