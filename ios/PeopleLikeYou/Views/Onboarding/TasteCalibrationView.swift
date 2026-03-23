import SwiftUI

struct TasteCalibrationView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var narratives: [SeedNarrative] = []
    @State private var currentIndex = 0
    @State private var selectedAttrs: Set<String> = []

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

                    // Vote buttons
                    HStack(spacing: 12) {
                        Button {
                            vote(liked: true)
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
                            vote(liked: false)
                        } label: {
                            Text("Not for me")
                                .font(.subheadline.weight(.semibold))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.primary.opacity(0.15)))
                        }
                    }
                    .padding(.top, 8)
                } else if !narratives.isEmpty {
                    // Done
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
            let seeking = appState.user?.gender == "Man" ? "Woman" : "Man"
            narratives = getSeedNarrativesForGender(seeking, count: 6)
        }
    }

    private func vote(liked: Bool) {
        guard currentIndex < narratives.count, let userId = appState.userId else { return }
        let narrative = narratives[currentIndex]

        Task {
            try? await APIClient.shared.post("/api/taste-calibration", body: [
                "userId": userId,
                "narrativeId": narrative.id,
                "vote": liked,
                "attributesSelected": liked ? Array(selectedAttrs) : [],
                "narrativeStyle": narrative.style,
            ] as [String: Any])
        }

        selectedAttrs = []
        withAnimation(.easeInOut(duration: 0.3)) {
            currentIndex += 1
        }
    }
}

// Simple flow layout for attribute tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var maxHeight: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxHeight = max(maxHeight, y + rowHeight)
        }

        return (CGSize(width: maxWidth, height: maxHeight), positions)
    }
}
