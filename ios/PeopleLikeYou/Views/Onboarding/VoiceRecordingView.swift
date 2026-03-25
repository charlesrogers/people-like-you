import SwiftUI

struct VoiceRecordingView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @StateObject private var recorder = AudioRecorder()
    @State private var prompts: [PromptDef] = []
    @State private var currentPromptIndex = 0
    @State private var completedCount = 0
    @State private var uploading = false

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 20) {
                    if prompts.isEmpty {
                        ProgressView()
                            .padding(.top, 100)
                    } else {
                        let prompt = prompts[currentPromptIndex]

                        // Question
                        Text(prompt.text)
                            .font(.title3.weight(.medium))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                            .padding(.top, 24)

                        // Help text
                        Text(prompt.helpText)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)

                        // Example — always visible, punchy one-liner
                        Text("e.g. \u{201C}\(prompt.exampleAnswer)\u{201D}")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                            .italic()
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)

                        // Coaching tips
                        if completedCount == 0 {
                            VStack(spacing: 4) {
                                Text("Just talk naturally. Any length is fine.")
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(.top, 4)
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

                // Audio signal indicator
                if recorder.isRecording && !recorder.hasDetectedSignal && recorder.duration > 1 {
                    Text("Waiting for audio \u{2014} speak into your mic")
                        .font(.caption)
                        .foregroundStyle(.orange)
                        .transition(.opacity)
                }

                // Record / Stop button
                Button {
                    if recorder.isRecording {
                        recorder.stopRecording()
                        // Check for silent recording
                        if recorder.isSilent {
                            // Don't auto-submit — show warning
                        } else if let data = recorder.audioData {
                            Task { await uploadAndAdvance(data: data) }
                        }
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
                            } else if uploading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Circle()
                                    .fill(.white)
                                    .frame(width: 28, height: 28)
                            }
                        }
                        .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
                }
                .disabled(uploading)

                // Status text
                if uploading {
                    Text("Got it!")
                        .font(.caption)
                        .foregroundStyle(.green)
                } else if recorder.isRecording {
                    // Cancel button during recording
                    Button("Start over") {
                        recorder.stopRecording()
                        recorder.audioData = nil
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                } else {
                    Text(recorder.audioData != nil ? "Tap to record another" : "Tap to record")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                // Silent recording warning
                if recorder.isSilent && !uploading {
                    VStack(spacing: 8) {
                        Text("We didn\u{2019}t hear anything \u{2014} try again?")
                            .font(.caption)
                            .foregroundStyle(.orange)
                        HStack(spacing: 12) {
                            Button("Re-record") {
                                recorder.audioData = nil
                                recorder.isSilent = false
                            }
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.orange)

                            Button("Submit anyway") {
                                if let data = recorder.audioData {
                                    recorder.isSilent = false
                                    Task { await uploadAndAdvance(data: data) }
                                }
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        }
                    }
                    .padding(12)
                    .background(Color.orange.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }

                // Skip this prompt
                if recorder.audioData == nil && !recorder.isRecording && !uploading && !prompts.isEmpty {
                    Button("Try a different question") {
                        skipPrompt()
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                }

                // Progress dots
                HStack(spacing: 6) {
                    ForEach(0..<(prompts.count), id: \.self) { i in
                        Circle()
                            .fill(i < completedCount ? Color.green : (i == currentPromptIndex ? Color.primary : Color(.systemGray4)))
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
            }
            // Don't auto-complete — let user choose to continue or record more
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
