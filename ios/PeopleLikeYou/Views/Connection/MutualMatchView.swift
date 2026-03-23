import SwiftUI

struct MutualMatchView: View {
    let mutualMatchId: String
    @State private var disclosureState: DisclosureState?
    @State private var loading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if loading {
                    ProgressView()
                        .padding(.top, 100)
                } else if let state = disclosureState {
                    // Status
                    VStack(spacing: 8) {
                        Image(systemName: "heart.circle.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.pink)
                        Text("It's mutual!")
                            .font(.title2.bold())
                        Text("Round \(state.mutualMatch.currentRound) of 3")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top)

                    // Current round
                    if let round = state.currentRound {
                        DisclosureRoundCard(round: round, mutualMatchId: mutualMatchId) {
                            await loadState()
                        }
                    }

                    // History
                    ForEach(state.exchanges.filter({ $0.id != state.currentRound?.id })) { exchange in
                        CompletedRoundCard(exchange: exchange)
                    }
                } else {
                    Text("Couldn't load match data.")
                        .foregroundStyle(.secondary)
                        .padding(.top, 100)
                }
            }
            .padding()
        }
        .navigationTitle("Connection")
        .task {
            await loadState()
        }
    }

    private func loadState() async {
        do {
            disclosureState = try await DisclosureService.shared.getDisclosure(mutualMatchId: mutualMatchId)
        } catch {
            print("Failed to load disclosure: \(error)")
        }
        loading = false
    }
}

struct DisclosureRoundCard: View {
    let round: DisclosureExchange
    let mutualMatchId: String
    let onSubmit: () async -> Void

    @EnvironmentObject var appState: AppState
    @State private var response = ""
    @State private var submitting = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Round \(round.roundNumber)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.orange)

            Text(round.promptText)
                .font(.body.weight(.medium))

            TextField("Your response...", text: $response, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(3...6)

            Button {
                Task {
                    submitting = true
                    guard let userId = appState.userId else { return }
                    do {
                        _ = try await DisclosureService.shared.submitResponse(
                            mutualMatchId: mutualMatchId, userId: userId, response: response
                        )
                        await onSubmit()
                    } catch {
                        print("Submit failed: \(error)")
                    }
                    submitting = false
                }
            } label: {
                if submitting {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                } else {
                    Text("Send")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.primary)
            .disabled(response.isEmpty || submitting)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct CompletedRoundCard: View {
    let exchange: DisclosureExchange

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Round \(exchange.roundNumber)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(exchange.promptText)
                .font(.subheadline.weight(.medium))
            if let a = exchange.userAResponse {
                Text(a)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if let b = exchange.userBResponse {
                Text(b)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
