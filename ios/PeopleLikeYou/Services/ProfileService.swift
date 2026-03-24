import Foundation

struct ProfileResponse: Codable {
    let profile: User
}

struct CreateProfileResponse: Codable {
    let id: String
    let existing: Bool?
}

struct CreateProfileRequest: Codable {
    let basics: Basics
    let hardPreferences: HardPreferences?
    let softPreferences: String? // Always null now — soft prefs removed

    struct Basics: Codable {
        let email: String
        let first_name: String
        let last_name: String?
        let gender: String
        let birth_year: Int?
        let zipcode: String?
        let community: String
        let religion: String?
        let observance_level: String?
    }
}

final class ProfileService {
    static let shared = ProfileService()
    private let api = APIClient.shared

    func getProfile() async throws -> User {
        let response: ProfileResponse = try await api.get("/profile")
        return response.profile
    }

    func createProfile(request: CreateProfileRequest) async throws -> CreateProfileResponse {
        return try await api.post("/profile", body: request)
    }

    func getExtractionStatus() async throws -> ExtractionStatus {
        return try await api.get("/extraction-status")
    }

    func getComposite() async throws -> CompositeProfile {
        struct Wrapper: Codable { let composite: CompositeProfile }
        let response: Wrapper = try await api.get("/composite")
        return response.composite
    }

    func processMemos(userId: String) async throws {
        struct Request: Codable { let userId: String }
        struct Response: Codable { let processed: Int; let total: Int }
        let _: Response = try await api.post("/process-memos", body: Request(userId: userId))
    }

    func submitTasteCalibration(userId: String, narrativeId: String, vote: Bool, attributesSelected: [String], narrativeStyle: String, feedbackText: String? = nil) async throws {
        struct Request: Codable {
            let userId: String
            let narrativeId: String
            let vote: Bool
            let attributesSelected: [String]
            let narrativeStyle: String
            let feedbackText: String?
        }
        struct Response: Codable { let ok: Bool }
        let _: Response = try await api.post("/taste-calibration", body: Request(
            userId: userId, narrativeId: narrativeId, vote: vote,
            attributesSelected: attributesSelected, narrativeStyle: narrativeStyle,
            feedbackText: feedbackText
        ))
    }

    func submitProfileFeedback(userId: String, feedback: [String: Bool], struckItems: [String]) async throws {
        struct Request: Codable { let userId: String; let feedback: [String: Bool]; let struckItems: [String] }
        struct Response: Codable { let ok: Bool }
        let _: Response = try await api.post("/profile-feedback", body: Request(userId: userId, feedback: feedback, struckItems: struckItems))
    }
}
