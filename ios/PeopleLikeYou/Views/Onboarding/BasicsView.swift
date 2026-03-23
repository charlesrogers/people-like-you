import SwiftUI

struct BasicsView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @State private var firstName = ""
    @State private var email = ""
    @State private var birthYear = ""
    @State private var state = ""
    @State private var gender = "Man"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("Let's start with the basics")
                    .font(.title2.bold())

                VStack(spacing: 16) {
                    LabeledField(label: "First name") {
                        TextField("", text: $firstName)
                            .textFieldStyle(.roundedBorder)
                    }

                    LabeledField(label: "Email") {
                        TextField("", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
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
                    // For now, just advance — profile was created at signup
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
            // Pre-fill from user if available
            if let user = appState.user {
                firstName = user.firstName
                email = user.email
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
