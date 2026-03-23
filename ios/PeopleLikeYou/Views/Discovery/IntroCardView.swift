import SwiftUI

struct IntroCardView: View {
    let intro: DailyIntro
    @Binding var photoRevealed: Bool
    let onInterested: () -> Void
    let onPass: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            // Narrative — the star of the show
            VStack(alignment: .leading, spacing: 12) {
                Text("Today's Introduction")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)

                Text(intro.narrative)
                    .font(.body)
                    .lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding()
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 16))

            // Photo reveal
            if photoRevealed {
                if let url = intro.photoUrl, let imageURL = URL(string: url) {
                    VStack(spacing: 8) {
                        AsyncImage(url: imageURL) { image in
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(height: 300)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        } placeholder: {
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color(.systemGray5))
                                .frame(height: 300)
                                .overlay { ProgressView() }
                        }

                        Text(intro.name)
                            .font(.title3.weight(.semibold))
                    }
                }
            } else {
                Button {
                    withAnimation(.spring(response: 0.4)) {
                        photoRevealed = true
                    }
                } label: {
                    VStack(spacing: 8) {
                        Image(systemName: "eye")
                            .font(.title2)
                        Text("Reveal Photo")
                            .font(.subheadline.weight(.medium))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 80)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .tint(.primary)
            }

            // Action buttons
            HStack(spacing: 16) {
                Button {
                    let impact = UIImpactFeedbackGenerator(style: .light)
                    impact.impactOccurred()
                    onPass()
                } label: {
                    Text("Not for me")
                        .font(.subheadline.weight(.medium))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.bordered)
                .tint(.secondary)

                Button {
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                    onInterested()
                } label: {
                    Text("I'm interested")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(.primary)
            }
        }
        .padding()
    }
}
