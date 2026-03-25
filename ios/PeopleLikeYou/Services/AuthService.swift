import Foundation
import Security

struct AuthTokens {
    let accessToken: String
    let refreshToken: String
}

struct AuthResponse: Codable {
    let id: String?
    let isNew: Bool?
    let accessToken: String?
    let refreshToken: String?
    let expiresAt: Int?
    let error: String?

    enum CodingKeys: String, CodingKey {
        case id, error
        case isNew = "is_new"
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresAt = "expires_at"
    }
}

struct OTPResponse: Codable {
    let ok: Bool?
    let phone: String?
    let error: String?
}

final class AuthService {
    static let shared = AuthService()
    private let api = APIClient.shared

    // MARK: - Phone Auth (primary)

    func requestOTP(phone: String) async throws -> OTPResponse {
        struct Body: Codable { let phone: String }
        return try await api.postUnauthenticated("/auth/phone-signup", body: Body(phone: phone))
    }

    func verifyOTP(phone: String, code: String) async throws -> AuthResponse {
        struct Body: Codable { let phone: String; let token: String }
        return try await api.postUnauthenticated("/auth/verify-otp", body: Body(phone: phone, token: code))
    }

    // MARK: - Email Auth (fallback)

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
        struct Body: Codable { let refresh_token: String }
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
