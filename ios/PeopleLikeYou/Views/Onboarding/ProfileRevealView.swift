import SwiftUI

struct ProfileRevealView: View {
    let onComplete: () -> Void
    var onMoreQuestions: (() -> Void)?
    @EnvironmentObject var appState: AppState

    @State private var composite: CompositeProfile?
    @State private var isLoading = true
    @State private var struckItems: Set<String> = []
    @State private var pollTimer: Timer?
    @State private var showMoreQuestions = false
    @State private var answeredPromptIds: [String] = []

    private let dimensionMeta: [(id: String, emoji: String, label: String)] = [
        ("explorer", "\u{1F9ED}", "Explorer"),
        ("connector", "\u{1F49C}", "Connector"),
        ("builder", "\u{2B50}", "Builder"),
        ("nurturer", "\u{1F3E0}", "Nurturer"),
        ("wildcard", "\u{26A1}", "Wildcard"),
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
                } else if let composite {
                    Text("Here\u{2019}s what we learned about you")
                        .font(.title2.bold())

                    Text("Tap anything that doesn\u{2019}t fit.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    // Dimension bars (5 dimensions)
                    VStack(spacing: 12) {
                        ForEach(dimensionMeta, id: \.id) { dim in
                            let score = dimensionScore(composite: composite, dimension: dim.id)
                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("\(dim.emoji) \(dim.label)")
                                        .font(.subheadline.weight(.semibold))
                                    Spacer()
                                    Text("\(score)%")
                                        .font(.subheadline.weight(.bold))
                                        .monospacedDigit()
                                }
                                GeometryReader { geo in
                                    ZStack(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 4)
                                            .fill(Color(.systemGray5))
                                            .frame(height: 10)
                                        RoundedRectangle(cornerRadius: 4)
                                            .fill(plyDark)
                                            .frame(width: geo.size.width * CGFloat(score) / 100, height: 10)
                                    }
                                }
                                .frame(height: 10)
                            }
                            .padding(14)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(plyDark.opacity(0.1)))
                        }
                    }

                    // Passions — strikeable
                    if !composite.passionIndicators.isEmpty {
                        StrikeableSection(title: "What lights you up", items: Array(composite.passionIndicators.prefix(8)), struckItems: $struckItems)
                    }

                    // Values — strikeable
                    if !composite.values.isEmpty {
                        StrikeableSection(title: "Your values", items: Array(composite.values.prefix(8)), struckItems: $struckItems)
                    }

                    // Interest tags — strikeable
                    if !composite.interestTags.isEmpty {
                        StrikeableSection(title: "Your interests", items: Array(composite.interestTags.prefix(10)), struckItems: $struckItems)
                    }

                    // Notable quotes
                    if !composite.notableQuotes.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("In your own words")
                                .font(.caption)
                                .textCase(.uppercase)
                                .tracking(0.5)
                                .foregroundStyle(.tertiary)

                            ForEach(Array(composite.notableQuotes.prefix(3)), id: \.self) { q in
                                Text("\u{201C}\(q)\u{201D}")
                                    .font(.subheadline)
                                    .italic()
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(plyDark.opacity(0.1)))
                    }

                    // Struck items summary
                    if !struckItems.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: "exclamationmark.triangle")
                                    .foregroundStyle(.orange)
                                Text("\(struckItems.count) items marked as not fitting \u{2014} we\u{2019}ll adjust.")
                                    .font(.caption)
                                    .foregroundStyle(.orange)
                            }
                            Button {
                                showMoreQuestions = true
                            } label: {
                                Text("Show me more questions")
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(plyDark)
                                    .foregroundStyle(Color(.systemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                        }
                        .padding(12)
                        .background(Color.orange.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }

                    // "Have another side?" nudge (if nothing struck + data is rich)
                    if struckItems.isEmpty && composite.memoCount >= 2 {
                        let weakest = weakestDimension(composite: composite)
                        let meta = dimensionMeta.first(where: { $0.id == weakest })
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Have another side of you?")
                                .font(.subheadline.weight(.medium))
                            Text("Want to show us your \(meta?.emoji ?? "") \(meta?.label ?? "") side?")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            HStack(spacing: 12) {
                                Button {
                                    showMoreQuestions = true
                                } label: {
                                    Text("Show me questions")
                                        .font(.caption.weight(.medium))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(plyDark.opacity(0.15)))
                                }
                                Button("I\u{2019}m good") {}
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .padding(14)
                        .background(Color(.secondarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    // More questions inline
                    if showMoreQuestions {
                        let weakest = weakestDimension(composite: composite)
                        let targeted = getTargetedPrompts(targetTier: weakest, excludeIds: answeredPromptIds)
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Pick a few to answer:")
                                .font(.subheadline.weight(.medium))
                            ForEach(targeted.targeted + targeted.others, id: \.id) { prompt in
                                Button {
                                    showMoreQuestions = false
                                    onMoreQuestions?()
                                } label: {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(prompt.text)
                                            .font(.subheadline)
                                            .multilineTextAlignment(.leading)
                                        Text(prompt.helpText)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                            .multilineTextAlignment(.leading)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(12)
                                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(plyDark.opacity(0.1)))
                                }
                                .foregroundStyle(plyDark)
                            }
                        }
                    }

                    // Continue
                    Button {
                        saveFeedback()
                        onComplete()
                    } label: {
                        Text("I\u{2019}m ready \u{2014} show me my matches")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(plyDark)
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

    // Compute dimension score from composite profile
    private func dimensionScore(composite: CompositeProfile, dimension: String) -> Int {
        let big5 = composite.bigFiveProxy ?? [:]
        let openness: Double = big5["openness"] ?? 0.5
        let extraversion: Double = big5["extraversion"] ?? 0.5
        let conscientiousness: Double = big5["conscientiousness"] ?? 0.5
        let agreeableness: Double = big5["agreeableness"] ?? 0.5
        let energy: Double = composite.energyEnthusiasm ?? 0.5
        let warmth: Double = composite.communicationWarmth ?? 0.5
        let vuln: Double = composite.vulnerabilityAuthenticity ?? 0.5
        let story: Double = composite.storytellingAbility ?? 0.5

        switch dimension {
        case "explorer":
            let raw = openness * 0.6 + energy * 0.4
            return Int(raw * 100)
        case "connector":
            let raw = extraversion * 0.5 + warmth * 0.5
            return Int(raw * 100)
        case "builder":
            let competence = composite.passionIndicators.isEmpty ? 0.5 : min(Double(composite.passionIndicators.count) / 6.0, 1.0)
            let raw = conscientiousness * 0.5 + competence * 0.5
            return Int(raw * 100)
        case "nurturer":
            let raw = agreeableness * 0.6 + vuln * 0.4
            return Int(raw * 100)
        case "wildcard":
            let humor: Double = composite.humorStyle != nil ? 0.7 : 0.3
            let raw = story * 0.5 + humor * 0.5
            return Int(raw * 100)
        default:
            return 50
        }
    }

    private func weakestDimension(composite: CompositeProfile) -> String {
        let scores = dimensionMeta.map { (id: $0.id, score: dimensionScore(composite: composite, dimension: $0.id)) }
        return scores.min(by: { $0.score < $1.score })?.id ?? "explorer"
    }

    private func startPolling() {
        pollTimer = Timer.scheduledTimer(withTimeInterval: 3, repeats: true) { _ in
            Task { @MainActor in
                do {
                    let status = try await ProfileService.shared.getExtractionStatus()
                    if status.compositeReady {
                        pollTimer?.invalidate()
                        let comp = try await ProfileService.shared.getComposite()
                        withAnimation { composite = comp; isLoading = false }
                    }
                } catch { }
            }
        }
        pollTimer?.fire()
    }

    private func saveFeedback() {
        guard let userId = appState.userId else { return }
        Task {
            try? await ProfileService.shared.submitProfileFeedback(
                userId: userId,
                feedback: [:],
                struckItems: Array(struckItems)
            )
        }
    }
}

struct StrikeableSection: View {
    let title: String
    let items: [String]
    @Binding var struckItems: Set<String>

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .textCase(.uppercase)
                .tracking(0.5)
                .foregroundStyle(.tertiary)

            FlowLayout(spacing: 6) {
                ForEach(items, id: \.self) { item in
                    Button {
                        if struckItems.contains(item) {
                            struckItems.remove(item)
                        } else {
                            struckItems.insert(item)
                        }
                    } label: {
                        Text(item)
                            .font(.caption)
                            .strikethrough(struckItems.contains(item))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(struckItems.contains(item) ? Color.red.opacity(0.08) : Color(.secondarySystemBackground))
                            .foregroundStyle(struckItems.contains(item) ? .red.opacity(0.6) : .primary)
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }
}
