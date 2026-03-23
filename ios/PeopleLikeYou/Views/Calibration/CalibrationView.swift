import SwiftUI

struct CalibrationView: View {
    @EnvironmentObject var appState: AppState
    @State private var candidates: [CalibrationCandidate] = []
    @State private var currentIndex = 0
    @State private var loading = true
    @State private var voteCount = 0

    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Text("Quick Calibration")
                    .font(.title2.bold())
                Text("This helps us understand your type. Tap yes or no — go fast, trust your gut.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top)

            if loading {
                Spacer()
                ProgressView("Loading candidates...")
                Spacer()
            } else if currentIndex < candidates.count {
                let candidate = candidates[currentIndex]

                Spacer()

                // Photo
                if let url = candidate.photoUrl, let imageURL = URL(string: url) {
                    AsyncImage(url: imageURL) { image in
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 260, height: 340)
                            .clipShape(RoundedRectangle(cornerRadius: 20))
                    } placeholder: {
                        RoundedRectangle(cornerRadius: 20)
                            .fill(Color(.systemGray5))
                            .frame(width: 260, height: 340)
                            .overlay { ProgressView() }
                    }
                } else {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color(.systemGray5))
                        .frame(width: 260, height: 340)
                        .overlay {
                            Text(candidate.firstName.prefix(1))
                                .font(.system(size: 60, weight: .bold))
                                .foregroundStyle(.secondary)
                        }
                }

                Text(candidate.firstName)
                    .font(.title3.weight(.semibold))

                Spacer()

                // Vote buttons
                HStack(spacing: 40) {
                    Button {
                        Task { await vote(outcome: 0) }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.title.bold())
                            .frame(width: 64, height: 64)
                            .background(Color(.systemGray5))
                            .clipShape(Circle())
                    }
                    .tint(.secondary)

                    Button {
                        Task { await vote(outcome: 1) }
                    } label: {
                        Image(systemName: "heart.fill")
                            .font(.title.bold())
                            .frame(width: 64, height: 64)
                            .background(Color.pink.opacity(0.15))
                            .clipShape(Circle())
                    }
                    .tint(.pink)
                }

                // Progress
                Text("\(currentIndex + 1) / \(candidates.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.bottom)

            } else {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.green)
                    Text("All done!")
                        .font(.title3.weight(.semibold))
                    Text("We've calibrated your preferences.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()

                Button {
                    appState.didCompleteCalibration()
                } label: {
                    Text("See Your Matches")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(.primary)
                .padding(.horizontal)
                .padding(.bottom)
            }
        }
        .padding(.horizontal)
        .task {
            await loadCandidates()
        }
    }

    private func loadCandidates() async {
        guard let user = appState.user else { return }
        let seekingGender = user.seeking == .men ? "Man" : "Woman"
        do {
            candidates = try await MatchService.shared.getCalibrationCandidates(
                gender: seekingGender, excludeUserId: user.id
            )
            AnalyticsService.shared.calibrationStarted()
        } catch {
            print("Failed to load candidates: \(error)")
        }
        loading = false
    }

    private func vote(outcome: Int) async {
        let candidate = candidates[currentIndex]
        AnalyticsService.shared.calibrationVote(outcome: outcome, candidateId: candidate.id)
        voteCount += 1
        currentIndex += 1
    }
}
