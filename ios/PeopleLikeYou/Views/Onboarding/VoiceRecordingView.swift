import SwiftUI

struct VoiceRecordingView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @StateObject private var recorder = AudioRecorder()
    @State private var currentPromptIndex = 0
    @State private var completedCount = 0
    @State private var uploading = false

    private let prompts = [
        (id: "proud_moment", text: "Tell us about a time you did something hard and it paid off."),
        (id: "surprises_people", text: "What's something about you that people don't expect?"),
        (id: "secret_skill", text: "What's something you're weirdly good at?"),
        (id: "most_yourself", text: "Describe a moment when you felt completely in your element."),
        (id: "teach_someone", text: "If you could teach someone you care about one thing, what would it be?"),
        (id: "talk_for_hours", text: "What's a topic you nerd out about that most people don't?"),
    ]

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Prompt card
            VStack(spacing: 16) {
                Text("Prompt \(currentPromptIndex + 1) of \(prompts.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(prompts[currentPromptIndex].text)
                    .font(.title3.weight(.medium))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()

            // Duration
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
            }

            // Upload / Next
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

            // Progress dots
            HStack(spacing: 6) {
                ForEach(0..<prompts.count, id: \.self) { i in
                    Circle()
                        .fill(i < completedCount ? Color.primary : (i == currentPromptIndex ? Color.secondary : Color(.systemGray4)))
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.bottom)

            // Skip option after 2 recordings
            if completedCount >= 2 {
                Button("Continue with \(completedCount) recordings") {
                    AnalyticsService.shared.onboardingSectionProgressed(section: "voice", recordings: completedCount)
                    onComplete()
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .padding(.bottom)
            }
        }
        .padding()
        .onAppear {
            AnalyticsService.shared.onboardingStarted()
        }
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
}
