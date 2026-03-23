import SwiftUI

struct PreferencesView: View {
    let onComplete: () -> Void

    @State private var ageMin = "25"
    @State private var ageMax = "35"
    @State private var distance = "anywhere"
    @State private var kids = "open"
    @State private var smoking = "no"
    @State private var energyLevel = "balanced"
    @State private var communicationStyle = "direct"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("What matters to you?")
                    .font(.title2.bold())

                Text("These help us filter — but chemistry is what makes the match.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                // Hard preferences
                VStack(alignment: .leading, spacing: 16) {
                    Text("Dealbreakers")
                        .font(.headline)

                    HStack {
                        LabeledField(label: "Age min") {
                            TextField("25", text: $ageMin)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.numberPad)
                        }
                        LabeledField(label: "Age max") {
                            TextField("35", text: $ageMax)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.numberPad)
                        }
                    }

                    LabeledField(label: "Distance") {
                        Picker("", selection: $distance) {
                            Text("Same metro").tag("same_metro")
                            Text("Few hours").tag("few_hours")
                            Text("Anywhere").tag("anywhere")
                        }
                        .pickerStyle(.segmented)
                    }

                    LabeledField(label: "Kids") {
                        Picker("", selection: $kids) {
                            Text("Has").tag("has")
                            Text("Wants").tag("wants")
                            Text("Open").tag("open")
                            Text("No").tag("doesnt_want")
                        }
                        .pickerStyle(.segmented)
                    }

                    LabeledField(label: "Smoking") {
                        Picker("", selection: $smoking) {
                            Text("Yes").tag("yes")
                            Text("No").tag("no")
                            Text("Sometimes").tag("sometimes")
                        }
                        .pickerStyle(.segmented)
                    }
                }

                Divider()

                // Soft preferences
                VStack(alignment: .leading, spacing: 16) {
                    Text("Vibes")
                        .font(.headline)

                    LabeledField(label: "Energy level") {
                        Picker("", selection: $energyLevel) {
                            Text("Adventurous").tag("adventurous")
                            Text("Balanced").tag("balanced")
                            Text("Homebody").tag("homebody")
                        }
                        .pickerStyle(.segmented)
                    }

                    LabeledField(label: "Communication") {
                        Picker("", selection: $communicationStyle) {
                            Text("Direct").tag("direct")
                            Text("Gentle").tag("gentle")
                            Text("Expressive").tag("expressive")
                        }
                        .pickerStyle(.segmented)
                    }
                }

                Button {
                    AnalyticsService.shared.onboardingSectionProgressed(section: "preferences")
                    onComplete()
                } label: {
                    Text("Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(.primary)
            }
            .padding()
        }
    }
}
