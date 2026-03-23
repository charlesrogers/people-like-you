import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var deliveryHour = 9
    @State private var isPaused = false

    var body: some View {
        Form {
            Section("Delivery") {
                Picker("Daily intro time", selection: $deliveryHour) {
                    ForEach(6..<23) { hour in
                        Text("\(hour > 12 ? hour - 12 : hour) \(hour >= 12 ? "PM" : "AM")").tag(hour)
                    }
                }

                Toggle("Pause matches", isOn: $isPaused)
            }

            Section("Account") {
                Button("Sign Out", role: .destructive) {
                    appState.signOut()
                }
            }
        }
        .navigationTitle("Settings")
    }
}
