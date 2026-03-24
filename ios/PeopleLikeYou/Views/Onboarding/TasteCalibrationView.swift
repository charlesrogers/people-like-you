import SwiftUI

struct TasteCalibrationView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var narratives: [SeedNarrative] = []
    @State private var currentIndex = 0
    @State private var selectedAttrs: Set<String> = []
    @State private var showFeedback = false
    @State private var feedbackText = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("What catches your eye?")
                    .font(.title2.bold())

                Text("Read each intro and tell us if you'd want to meet this person.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if currentIndex < narratives.count {
                    Text("\(currentIndex + 1) of \(narratives.count)")
                        .font(.caption)
                        .foregroundStyle(.tertiary)

                    // Narrative card
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Someone we think you might like")
                            .font(.caption)
                            .textCase(.uppercase)
                            .tracking(0.5)
                            .foregroundStyle(.tertiary)

                        Text(narratives[currentIndex].narrative)
                            .font(.body)
                            .lineSpacing(4)

                        // Attribute tags
                        VStack(alignment: .leading, spacing: 8) {
                            Text("What caught your attention?")
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            FlowLayout(spacing: 8) {
                                ForEach(attributeTags, id: \.0) { value, label in
                                    Button {
                                        if selectedAttrs.contains(value) {
                                            selectedAttrs.remove(value)
                                        } else {
                                            selectedAttrs.insert(value)
                                        }
                                    } label: {
                                        Text(label)
                                            .font(.caption)
                                            .fontWeight(.medium)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 6)
                                            .background(selectedAttrs.contains(value) ? Color.primary : Color.clear)
                                            .foregroundStyle(selectedAttrs.contains(value) ? Color(.systemBackground) : .primary)
                                            .clipShape(Capsule())
                                            .overlay(Capsule().stroke(Color.primary.opacity(0.2)))
                                    }
                                }
                            }
                        }
                        .padding(.top, 8)
                    }
                    .padding(20)
                    .background(.background)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.04), radius: 4)

                    // Feedback textarea (shown after "Not for me")
                    if showFeedback {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Anything that turned you off? (optional)")
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            TextField("", text: $feedbackText, axis: .vertical)
                                .textFieldStyle(.roundedBorder)
                                .lineLimit(2...4)

                            Button {
                                submitVote(liked: false)
                            } label: {
                                Text(feedbackText.isEmpty ? "Skip & continue" : "Submit & continue")
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(.primary)
                                    .foregroundStyle(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                            }
                        }
                        .padding(16)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }

                    // Vote buttons (hide when feedback is showing)
                    if !showFeedback {
                        HStack(spacing: 12) {
                            Button {
                                submitVote(liked: true)
                            } label: {
                                Text("I'd want to meet them")
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(.primary)
                                    .foregroundStyle(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                            }

                            Button {
                                withAnimation { showFeedback = true }
                            } label: {
                                Text("Not for me")
                                    .font(.subheadline.weight(.semibold))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primary.opacity(0.15)))
                            }
                        }
                        .padding(.top, 8)
                    }
                } else if !narratives.isEmpty {
                    VStack(spacing: 8) {
                        Text("Got it.")
                            .font(.title2.bold())
                        Text("We're using your taste to find better matches.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 40)

                    Button {
                        onComplete()
                    } label: {
                        Text("Continue")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.primary)
                            .foregroundStyle(Color(.systemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .padding(.top, 16)
                }
            }
            .padding(24)
        }
        .onAppear {
            let seeking: String = (appState.user?.gender ?? .man) == .man ? "Woman" : "Man"
            narratives = getSeedNarrativesForGender(seeking, count: 6)
        }
    }

    private func submitVote(liked: Bool) {
        guard currentIndex < narratives.count, let userId = appState.userId else { return }
        let narrative = narratives[currentIndex]

        Task {
            try? await ProfileService.shared.submitTasteCalibration(
                userId: userId,
                narrativeId: narrative.id,
                vote: liked,
                attributesSelected: liked ? Array(selectedAttrs) : [],
                narrativeStyle: narrative.style,
                feedbackText: liked ? nil : (feedbackText.isEmpty ? nil : feedbackText)
            )
        }

        selectedAttrs = []
        feedbackText = ""
        showFeedback = false
        withAnimation(.easeInOut(duration: 0.3)) {
            currentIndex += 1
        }
    }
}
