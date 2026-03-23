import SwiftUI

@main
struct PeopleLikeYouApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
        }
    }
}

struct RootView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            switch appState.screen {
            case .loading:
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(.systemBackground))

            case .auth:
                AuthView()

            case .onboarding(let step):
                OnboardingContainer(initialStep: step)

            case .calibration:
                CalibrationView()

            case .dashboard:
                DashboardView()
            }
        }
        .task {
            await appState.checkSession()
        }
    }
}
