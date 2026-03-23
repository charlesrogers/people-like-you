import Foundation
import Security

struct AuthTokens {
    let accessToken: String
    let refreshToken: String
}

struct AuthResponse: Codable {
    let id: String?
    let accessToken: String?
    let refreshToken: String?
    let expiresAt: Int?
    let error: String?

    enum CodingKeys: String, CodingKey {
        case id, error
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

final class AuthService {
    static let shared = AuthService()
    private let api = APIClient.shared

    // MARK: - Auth API calls

    func signUp(email: String, password: String, firstName: String, gender: String) async throws -> AuthResponse {
        struct Body: Codable {
            let email: String
            let password: String
            let first_name: String
            let gender: String
        }
        return try await api.postUnauthenticated("/auth/signup", body: Body(
            email: email, password: password, first_name: firstName, gender: gender
        ))
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        struct Body: Codable {
            let email: String
            let password: String
        }
        return try await api.postUnauthenticated("/auth/login", body: Body(
            email: email, password: password
        ))
    }

    func refresh(refreshToken: String) async throws -> AuthResponse {
        struct Body: Codable {
            let refresh_token: String
        }
        return try await api.postUnauthenticated("/auth/refresh", body: Body(
            refresh_token: refreshToken
        ))
    }

    // MARK: - Keychain storage

    func saveTokens(accessToken: String, refreshToken: String) {
        save(key: "ply_access_token", value: accessToken)
        save(key: "ply_refresh_token", value: refreshToken)
    }

    func loadTokens() -> AuthTokens? {
        guard let access = load(key: "ply_access_token"),
              let refresh = load(key: "ply_refresh_token") else {
            return nil
        }
        return AuthTokens(accessToken: access, refreshToken: refresh)
    }

    func clearTokens() {
        delete(key: "ply_access_token")
        delete(key: "ply_refresh_token")
    }

    // MARK: - Keychain helpers

    private func save(key: String, value: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
        var add = query
        add[kSecValueData as String] = data
        SecItemAdd(add as CFDictionary, nil)
    }

    private func load(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
