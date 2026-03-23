import Foundation

struct CalibrationCandidate: Codable, Identifiable {
    let id: String
    let firstName: String
    let eloScore: Int
    let photoUrl: String?

    enum CodingKeys: String, CodingKey {
        case id
        case firstName = "first_name"
        case eloScore = "elo_score"
        case photoUrl = "photoUrl"
    }
}

struct CalibrateRequest: Codable {
    let userId: String
    let newElo: Int
    let interactions: Int?
}

final class MatchService {
    static let shared = MatchService()
    private let api = APIClient.shared

    // MARK: - Calibration

    func getCalibrationCandidates(gender: String, excludeUserId: String) async throws -> [CalibrationCandidate] {
        struct Response: Codable { let candidates: [CalibrationCandidate] }
        let response: Response = try await api.get("/calibrate/candidates", query: [
            "gender": gender,
            "excludeUserId": excludeUserId,
        ])
        return response.candidates
    }

    func submitCalibration(userId: String, newElo: Int) async throws {
        struct Response: Codable { let ok: Bool }
        let _: Response = try await api.post("/calibrate", body: CalibrateRequest(
            userId: userId, newElo: newElo, interactions: nil
        ))
    }

    // MARK: - Daily intros

    func getMatches() async throws -> MatchesResponse {
        return try await api.get("/matches")
    }

    func submitFeedback(_ request: FeedbackRequest) async throws -> FeedbackResponse {
        return try await api.post("/feedback", body: request)
    }
}
