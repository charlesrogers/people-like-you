import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var matchData: MatchesResponse?
    @State private var loading = true
    @State private var showingIntro = false
    @State private var photoRevealed = false
    @State private var showingHistory = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if loading {
                        ProgressView()
                            .frame(maxHeight: .infinity)
                            .padding(.top, 100)
                    } else if let intro = matchData?.currentIntro {
                        IntroCardView(
                            intro: intro,
                            photoRevealed: $photoRevealed,
                            onInterested: { Task { await submitFeedback(intro: intro, action: "interested") } },
                            onPass: { Task { await submitFeedback(intro: intro, action: "not_interested") } }
                        )
                    } else if matchData?.cadenceState?.isPaused == true {
                        // Paused state
                        VStack(spacing: 16) {
                            Image(systemName: "pause.circle.fill")
                                .font(.system(size: 48))
                                .foregroundStyle(.secondary)
                            Text("Your matches are paused")
                                .font(.title3.weight(.semibold))
                            Text("Resume whenever you're ready.")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 80)
                    } else {
                        // No intro today
                        VStack(spacing: 16) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 48))
                                .foregroundStyle(.secondary)
                            Text("No new intro today")
                                .font(.title3.weight(.semibold))
                            if let next = matchData?.nextDeliveryAt {
                                Text("Next one arrives \(next)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 80)
                    }

                    // Bonus intro
                    if let bonus = matchData?.bonusIntro {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Bonus Match")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(.orange)
                            Text(bonus.name)
                                .font(.headline)
                            Text(bonus.narrative)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .lineLimit(3)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .padding(.horizontal)
                    }
                }
            }
            .refreshable {
                await loadMatches()
            }
            .navigationTitle("People *Like* You")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Match History") { showingHistory = true }
                        Button("Settings") { /* TODO */ }
                        Button("Sign Out", role: .destructive) { appState.signOut() }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showingHistory) {
                MatchHistoryView(history: matchData?.history ?? [])
            }
            .task {
                await loadMatches()
            }
        }
    }

    private func loadMatches() async {
        loading = true
        do {
            matchData = try await MatchService.shared.getMatches()
            let hasIntro = matchData?.currentIntro != nil
            let isPaused = matchData?.cadenceState?.isPaused ?? false
            AnalyticsService.shared.dashboardLoaded(hasIntro: hasIntro, isPaused: isPaused)
        } catch {
            print("Failed to load matches: \(error)")
        }
        loading = false
    }

    private func submitFeedback(intro: DailyIntro, action: String) async {
        guard let userId = appState.userId else { return }
        let request = FeedbackRequest(
            introId: intro.id,
            matchId: intro.matchId,
            userId: userId,
            action: action,
            reason: nil,
            details: nil,
            photoRevealedBeforeDecision: photoRevealed,
            matchedUserId: intro.matchedUserId
        )
        do {
            let response = try await MatchService.shared.submitFeedback(request)
            if action == "interested" {
                AnalyticsService.shared.matchInterested(introId: intro.id)
            } else {
                AnalyticsService.shared.matchPassed(introId: intro.id)
            }

            // Refresh to show bonus or next state
            if response.bonusIntro != nil || response.mutualMatch != nil {
                await loadMatches()
            } else {
                matchData?.currentIntro = nil
            }
        } catch {
            print("Feedback failed: \(error)")
        }
    }
}
