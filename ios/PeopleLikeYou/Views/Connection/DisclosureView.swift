import SwiftUI

// DisclosureView is a thin wrapper that navigates to MutualMatchView
// when a mutual match is detected from the dashboard
struct DisclosureView: View {
    let mutualMatchId: String

    var body: some View {
        MutualMatchView(mutualMatchId: mutualMatchId)
    }
}
