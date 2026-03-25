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
                ZStack {
                    Color(red: 227/255, green: 255/255, blue: 68/255)
                        .ignoresSafeArea()
                    HStack(spacing: 0) {
                        Text("P").font(.system(size: 32, weight: .heavy)).foregroundStyle(Color(red: 26/255, green: 26/255, blue: 26/255))
                        Text("L").font(.system(size: 32, weight: .heavy)).italic().foregroundStyle(Color(red: 26/255, green: 26/255, blue: 26/255).opacity(0.5))
                        Text("Y").font(.system(size: 32, weight: .heavy)).foregroundStyle(Color(red: 26/255, green: 26/255, blue: 26/255))
                    }
                }

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
