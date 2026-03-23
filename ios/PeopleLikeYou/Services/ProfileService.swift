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
    let softPreferences: SoftPreferences?

    struct Basics: Codable {
        let email: String
        let first_name: String
        let last_name: String?
        let gender: String
        let birth_year: Int?
        let state: String?
        let community: String
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
}
