import SwiftUI

struct BasicsView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @State private var firstName = ""
    @State private var lastName = ""
    @State private var birthYear = ""
    @State private var state = ""
    @State private var gender = "Man"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("First, tell us about you")
                    .font(.title2.bold())

                Text("This helps us find the right people.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                VStack(spacing: 16) {
                    LabeledField(label: "First name") {
                        TextField("", text: $firstName)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.givenName)
                    }

                    LabeledField(label: "Last name (optional)") {
                        TextField("", text: $lastName)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.familyName)
                    }

                    LabeledField(label: "I am a") {
                        Picker("Gender", selection: $gender) {
                            Text("Man").tag("Man")
                            Text("Woman").tag("Woman")
                        }
                        .pickerStyle(.segmented)
                    }

                    LabeledField(label: "Birth year") {
                        TextField("1990", text: $birthYear)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.numberPad)
                    }

                    LabeledField(label: "State") {
                        TextField("e.g. California", text: $state)
                            .textFieldStyle(.roundedBorder)
                    }
                }

                Button {
                    onComplete()
                } label: {
                    Text("Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(.primary)
                .disabled(firstName.isEmpty)
            }
            .padding()
        }
        .onAppear {
            if let user = appState.user {
                firstName = user.firstName
                lastName = user.lastName ?? ""
                if let by = user.birthYear { birthYear = String(by) }
                state = user.state ?? ""
                gender = user.gender.rawValue
            }
        }
    }
}

struct LabeledField<Content: View>: View {
    let label: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
            content
        }
    }
}
