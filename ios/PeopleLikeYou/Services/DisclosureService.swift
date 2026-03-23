import Foundation

struct DisclosureState: Codable {
    let mutualMatch: MutualMatch
    let exchanges: [DisclosureExchange]
    let currentRound: DisclosureExchange?
}

final class DisclosureService {
    static let shared = DisclosureService()
    private let api = APIClient.shared

    func getDisclosure(mutualMatchId: String) async throws -> DisclosureState {
        return try await api.get("/disclosure", query: ["mutualMatchId": mutualMatchId])
    }

    func submitResponse(mutualMatchId: String, userId: String, response: String, voicePath: String? = nil) async throws -> DisclosureResponse {
        struct Body: Codable {
            let mutualMatchId: String
            let userId: String
            let response: String
            let voicePath: String?
        }
        return try await api.post("/disclosure", body: Body(
            mutualMatchId: mutualMatchId, userId: userId, response: response, voicePath: voicePath
        ))
    }
}
