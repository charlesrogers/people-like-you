import SwiftUI

struct ProfileRevealView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var composite: [String: Any]?
    @State private var isLoading = true
    @State private var feedback: [String: Bool] = [:]
    @State private var pollTimer: Timer?

    private let excitementLabels: [String: (emoji: String, label: String, description: String)] = [
        "explorer": ("🧭", "Explorer", "You light up around novelty, adventure, and the unexpected."),
        "nester": ("🏡", "Nester", "You respond to warmth, stability, and shared values."),
        "intellectual": ("🔬", "Intellectual", "You're drawn to depth, curiosity, and unique perspectives."),
        "spark": ("⚡", "Spark", "You connect through humor, energy, and magnetic personality."),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if isLoading {
                    VStack(spacing: 16) {
                        ProgressView()
                        Text("Almost ready... building your profile")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 60)
                } else if let composite = composite {
                    Text("Here's what we see in you")
                        .font(.title2.bold())

                    Text("Based on your stories, here's how we'll introduce you to people. Does this feel right?")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // Excitement type
                    if let typeStr = composite["excitement_type"] as? String,
                       let typeInfo = excitementLabels[typeStr] {
                        RevealCard(
                            title: "Your type",
                            feedbackKey: "excitement_type",
                            feedback: $feedback
                        ) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(typeInfo.emoji) \(typeInfo.label)")
                                    .font(.title3.weight(.semibold))
                                Text(typeInfo.description)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }

                    // Passions
                    if let passions = composite["passion_indicators"] as? [String], !passions.isEmpty {
                        RevealCard(title: "What lights you up", feedbackKey: "passions", feedback: $feedback) {
                            FlowLayout(spacing: 6) {
                                ForEach(passions.prefix(8), id: \.self) { p in
                                    Text(p)
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 4)
                                        .background(Color(.secondarySystemBackground))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }

                    // Values
                    if let values = composite["values"] as? [String], !values.isEmpty {
                        RevealCard(title: "Your values", feedbackKey: "values", feedback: $feedback) {
                            FlowLayout(spacing: 6) {
                                ForEach(values.prefix(6), id: \.self) { v in
                                    Text(v)
                                        .font(.caption)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 4)
                                        .background(Color(.secondarySystemBackground))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }

                    // Notable quotes
                    if let quotes = composite["notable_quotes"] as? [String], !quotes.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("In your own words")
                                .font(.caption)
                                .textCase(.uppercase)
                                .tracking(0.5)
                                .foregroundStyle(.tertiary)

                            ForEach(quotes.prefix(2), id: \.self) { q in
                                Text(""\(q)"")
                                    .font(.subheadline)
                                    .italic()
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primary.opacity(0.1)))
                    }

                    // Continue button
                    Button {
                        saveFeedback()
                        onComplete()
                    } label: {
                        Text("I'm ready — show me my matches")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.primary)
                            .foregroundStyle(Color(.systemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .padding(.top, 8)
                }
            }
            .padding(24)
        }
        .onAppear { startPolling() }
        .onDisappear { pollTimer?.invalidate() }
    }

    private func startPolling() {
        guard let userId = appState.userId else { return }

        pollTimer = Timer.scheduledTimer(withTimeInterval: 3, repeats: true) { _ in
            Task { @MainActor in
                do {
                    let status = try await APIClient.shared.get("/api/extraction-status?userId=\(userId)")
                    if let ready = status["compositeReady"] as? Bool, ready {
                        pollTimer?.invalidate()
                        let compData = try await APIClient.shared.get("/api/composite?userId=\(userId)")
                        if let comp = compData["composite"] as? [String: Any] {
                            withAnimation { composite = comp; isLoading = false }
                        }
                    }
                } catch { }
            }
        }
        pollTimer?.fire()
    }

    private func saveFeedback() {
        guard let userId = appState.userId, !feedback.isEmpty else { return }
        Task {
            try? await APIClient.shared.post("/api/profile-feedback", body: [
                "userId": userId,
                "feedback": feedback,
            ] as [String: Any])
        }
    }
}

struct RevealCard<Content: View>: View {
    let title: String
    let feedbackKey: String
    @Binding var feedback: [String: Bool]
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.caption)
                    .textCase(.uppercase)
                    .tracking(0.5)
                    .foregroundStyle(.tertiary)
                Spacer()
                Button {
                    feedback[feedbackKey] = !(feedback[feedbackKey] ?? true)
                } label: {
                    Text(feedback[feedbackKey] == false ? "Not quite" : "Feels right")
                        .font(.caption2.weight(.medium))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(feedback[feedbackKey] == false ? Color.orange.opacity(0.15) : Color.green.opacity(0.1))
                        .foregroundStyle(feedback[feedbackKey] == false ? .orange : .green)
                        .clipShape(Capsule())
                }
            }
            content()
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primary.opacity(0.1)))
    }
}
