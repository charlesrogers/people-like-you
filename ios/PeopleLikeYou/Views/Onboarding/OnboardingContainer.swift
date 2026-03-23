import SwiftUI

struct OnboardingContainer: View {
    @EnvironmentObject var appState: AppState
    @State var currentStep: OnboardingStep

    init(initialStep: OnboardingStep = .basics) {
        _currentStep = State(initialValue: initialStep)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Progress bar
                ProgressView(value: Double(currentStep.rawValue + 1), total: 4)
                    .tint(.primary)
                    .padding(.horizontal)
                    .padding(.top, 8)

                // Step label
                Text(stepLabel)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.top, 4)

                // Step content
                Group {
                    switch currentStep {
                    case .basics:
                        BasicsView { currentStep = .voice }
                    case .voice:
                        VoiceRecordingView { currentStep = .preferences }
                    case .preferences:
                        PreferencesView { currentStep = .photos }
                    case .photos:
                        PhotoUploadView { appState.didCompleteOnboarding() }
                    }
                }
                .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
                .animation(.easeInOut(duration: 0.3), value: currentStep)
            }
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var stepLabel: String {
        switch currentStep {
        case .basics: return "Step 1 — About you"
        case .voice: return "Step 2 — Tell your stories"
        case .preferences: return "Step 3 — What you want"
        case .photos: return "Step 4 — Show yourself"
        }
    }
}
