import SwiftUI

struct DatePlanningView: View {
    @EnvironmentObject var appState: AppState
    let mutualMatchId: String
    @State private var suggestions: [DateSuggestion] = []
    @State private var loading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if loading {
                    ProgressView()
                        .padding(.top, 80)
                } else if suggestions.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 40))
                            .foregroundStyle(.secondary)
                        Text("Set your availability first")
                            .font(.headline)
                        Text("We need both your schedules to suggest dates.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 80)
                } else {
                    Text("Date Ideas")
                        .font(.title2.bold())
                        .frame(maxWidth: .infinity, alignment: .leading)

                    ForEach(suggestions.indices, id: \.self) { i in
                        let suggestion = suggestions[i]
                        VStack(alignment: .leading, spacing: 8) {
                            Text(suggestion.activityType)
                                .font(.subheadline.weight(.semibold))
                            Text(suggestion.activityDescription)
                                .font(.body)
                            Text(suggestion.rationale)
                                .font(.caption)
                                .foregroundStyle(.secondary)

                            if !suggestion.venueSuggestions.isEmpty {
                                ForEach(suggestion.venueSuggestions.indices, id: \.self) { j in
                                    let venue = suggestion.venueSuggestions[j]
                                    HStack {
                                        Image(systemName: "mappin.circle.fill")
                                            .foregroundStyle(.orange)
                                        VStack(alignment: .leading) {
                                            Text(venue.name).font(.caption.weight(.medium))
                                            Text(venue.address).font(.caption2).foregroundStyle(.secondary)
                                        }
                                    }
                                }
                            }

                            Button("Propose This") {
                                Task { await propose(suggestion) }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.primary)
                            .controlSize(.small)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Plan a Date")
        .task {
            await loadSuggestions()
        }
    }

    private func loadSuggestions() async {
        do {
            suggestions = try await DateService.shared.getSuggestions(mutualMatchId: mutualMatchId)
        } catch {
            print("Failed to load suggestions: \(error)")
        }
        loading = false
    }

    private func propose(_ suggestion: DateSuggestion) async {
        guard let userId = appState.userId else { return }
        do {
            _ = try await DateService.shared.proposeDate(
                mutualMatchId: mutualMatchId,
                proposedBy: userId,
                scheduledAt: suggestion.time,
                activityType: suggestion.activityType,
                venueName: suggestion.venueSuggestions.first?.name,
                venueAddress: suggestion.venueSuggestions.first?.address
            )
        } catch {
            print("Propose failed: \(error)")
        }
    }
}
