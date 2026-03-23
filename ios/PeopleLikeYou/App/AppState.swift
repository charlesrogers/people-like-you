import SwiftUI

enum Screen {
    case loading
    case auth
    case onboarding(step: OnboardingStep)
    case calibration
    case dashboard
}

enum OnboardingStep: Int, CaseIterable {
    case basics = 0
    case voice = 1
    case preferences = 2
    case photos = 3
}

@MainActor
final class AppState: ObservableObject {
    @Published var screen: Screen = .loading
    @Published var userId: String?
    @Published var user: User?

    private let auth = AuthService.shared
    private let api = APIClient.shared

    func checkSession() async {
        // Try to restore saved session
        guard let tokens = auth.loadTokens() else {
            screen = .auth
            return
        }

        api.setAccessToken(tokens.accessToken)

        // Fetch profile to determine where user is in flow
        do {
            let profile = try await ProfileService.shared.getProfile()
            self.user = profile
            self.userId = profile.id
            navigateToStage(profile.onboardingStage)
        } catch {
            // Token expired — try refresh
            do {
                let newTokens = try await auth.refresh(refreshToken: tokens.refreshToken)
                api.setAccessToken(newTokens.accessToken)
                let profile = try await ProfileService.shared.getProfile()
                self.user = profile
                self.userId = profile.id
                navigateToStage(profile.onboardingStage)
            } catch {
                auth.clearTokens()
                screen = .auth
            }
        }
    }

    func didSignIn(userId: String, accessToken: String, refreshToken: String) {
        self.userId = userId
        api.setAccessToken(accessToken)
        auth.saveTokens(accessToken: accessToken, refreshToken: refreshToken)

        Task {
            do {
                let profile = try await ProfileService.shared.getProfile()
                self.user = profile
                navigateToStage(profile.onboardingStage)
            } catch {
                screen = .onboarding(step: .basics)
            }
        }
    }

    func didCompleteOnboarding() {
        screen = .calibration
    }

    func didCompleteCalibration() {
        screen = .dashboard
    }

    func signOut() {
        auth.clearTokens()
        api.setAccessToken(nil)
        userId = nil
        user = nil
        screen = .auth
    }

    private func navigateToStage(_ stage: String) {
        switch stage {
        case "basics":
            screen = .onboarding(step: .basics)
        case "voice":
            screen = .onboarding(step: .voice)
        case "preferences":
            screen = .onboarding(step: .preferences)
        case "photos":
            screen = .onboarding(step: .photos)
        case "calibrate":
            screen = .calibration
        default:
            screen = .dashboard
        }
    }
}
