import SwiftUI

struct VoiceRecordingView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @StateObject private var recorder = AudioRecorder()
    @State private var prompts: [PromptDef] = []
    @State private var currentPromptIndex = 0
    @State private var completedCount = 0
    @State private var uploading = false
    @State private var showExample = false

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 20) {
                    if prompts.isEmpty {
                        ProgressView()
                            .padding(.top, 100)
                    } else {
                        let prompt = prompts[currentPromptIndex]

                        // Tier badge
                        Text(prompt.tier.label)
                            .font(.caption2.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(tierColor(prompt.tier).opacity(0.15))
                            .foregroundStyle(tierColor(prompt.tier))
                            .clipShape(Capsule())
                            .padding(.top, 24)

                        // Question
                        Text(prompt.text)
                            .font(.title3.weight(.medium))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)

                        // Help text
                        Text(prompt.helpText)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)

                        // Example toggle
                        Button {
                            withAnimation { showExample.toggle() }
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: showExample ? "eye.slash" : "eye")
                                Text(showExample ? "Hide example" : "See an example")
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        }

                        if showExample {
                            Text("\"\(prompt.exampleAnswer)\"")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .italic()
                                .padding(.horizontal, 24)
                                .transition(.opacity)
                        }
                    }
                }
            }

            Spacer()

            // Recording controls
            VStack(spacing: 16) {
                if recorder.isRecording {
                    Text(formatDuration(recorder.duration))
                        .font(.system(.title, design: .monospaced))
                        .foregroundStyle(.red)
                }

                // Record button
                Button {
                    if recorder.isRecording {
                        recorder.stopRecording()
                    } else {
                        showExample = false
                        recorder.startRecording()
                    }
                } label: {
                    Circle()
                        .fill(recorder.isRecording ? .red : Color.primary)
                        .frame(width: 72, height: 72)
                        .overlay {
                            if recorder.isRecording {
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(.white)
                                    .frame(width: 24, height: 24)
                            } else {
                                Circle()
                                    .fill(.white)
                                    .frame(width: 28, height: 28)
                            }
                        }
                        .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
                }

                // Post-recording actions
                if let data = recorder.audioData, !recorder.isRecording {
                    HStack(spacing: 16) {
                        Button("Re-record") {
                            recorder.audioData = nil
                        }
                        .foregroundStyle(.secondary)

                        Button {
                            Task { await uploadAndAdvance(data: data) }
                        } label: {
                            if uploading {
                                ProgressView()
                            } else {
                                Text(currentPromptIndex < prompts.count - 1 ? "Next" : "Done")
                                    .fontWeight(.semibold)
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.primary)
                        .disabled(uploading)
                    }
                }

                // Skip this prompt
                if recorder.audioData == nil && !recorder.isRecording && !prompts.isEmpty {
                    Button("Skip — give me a different one") {
                        skipPrompt()
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }

                // Progress dots + continue
                HStack(spacing: 6) {
                    ForEach(0..<(prompts.count), id: \.self) { i in
                        Circle()
                            .fill(i < completedCount ? Color.primary : (i == currentPromptIndex ? Color.secondary : Color(.systemGray4)))
                            .frame(width: 8, height: 8)
                    }
                }

                if completedCount >= 2 {
                    Button("Continue with \(completedCount) recordings") {
                        AnalyticsService.shared.onboardingSectionProgressed(section: "voice", recordings: completedCount)
                        onComplete()
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
            }
            .padding(.bottom, 24)
        }
        .padding(.horizontal)
        .onAppear {
            prompts = getOnboardingPrompts(count: 6)
            AnalyticsService.shared.onboardingStarted()
        }
    }

    private func skipPrompt() {
        let usedIds = prompts.map(\.id)
        let remaining = questionBank.filter { !usedIds.contains($0.id) }
        if let replacement = remaining.randomElement() {
            prompts[currentPromptIndex] = replacement
        }
        showExample = false
    }

    private func uploadAndAdvance(data: Data) async {
        guard let userId = appState.userId else { return }
        uploading = true
        do {
            _ = try await VoiceService.shared.uploadMemo(
                audioData: data,
                userId: userId,
                promptId: prompts[currentPromptIndex].id,
                dayNumber: 0,
                durationSeconds: Int(recorder.duration)
            )
            completedCount += 1
            recorder.audioData = nil
            showExample = false

            if currentPromptIndex < prompts.count - 1 {
                currentPromptIndex += 1
            } else {
                AnalyticsService.shared.onboardingSectionProgressed(section: "voice", recordings: completedCount)
                onComplete()
            }
        } catch {
            print("Upload failed: \(error)")
        }
        uploading = false
    }

    private func formatDuration(_ t: TimeInterval) -> String {
        let m = Int(t) / 60
        let s = Int(t) % 60
        return String(format: "%d:%02d", m, s)
    }

    private func tierColor(_ tier: PromptTier) -> Color {
        switch tier {
        case .selfExpansion: return .blue
        case .iSharing: return .purple
        case .admiration: return .orange
        case .comfort: return .green
        case .fun: return .pink
        }
    }
}
