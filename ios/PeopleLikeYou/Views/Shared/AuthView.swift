import SwiftUI

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var isSignUp = true
    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var gender = "Man"
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer().frame(height: 60)

                // Logo
                VStack(spacing: 8) {
                    Text("People ")
                        .font(.system(size: 34, weight: .bold)) +
                    Text("Like")
                        .font(.system(size: 34, weight: .bold))
                        .italic() +
                    Text(" You")
                        .font(.system(size: 34, weight: .bold))

                    Text(isSignUp ? "Create your account" : "Welcome back")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 16) {
                    if isSignUp {
                        TextField("First name", text: $firstName)
                            .textFieldStyle(.roundedBorder)

                        Picker("I am a", selection: $gender) {
                            Text("Man").tag("Man")
                            Text("Woman").tag("Woman")
                        }
                        .pickerStyle(.segmented)
                    }

                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)

                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                        .textContentType(isSignUp ? .newPassword : .password)

                    if let error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }

                    Button {
                        Task { await submit() }
                    } label: {
                        if loading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        } else {
                            Text(isSignUp ? "Get Started" : "Log In")
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.primary)
                    .disabled(loading)

                    Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                        isSignUp.toggle()
                        error = nil
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }
                .padding(.horizontal)
            }
            .padding()
        }
    }

    private func submit() async {
        loading = true
        error = nil

        do {
            let auth = AuthService.shared
            let response: AuthResponse

            if isSignUp {
                guard !firstName.isEmpty else { error = "Please enter your name"; loading = false; return }
                response = try await auth.signUp(email: email, password: password, firstName: firstName, gender: gender)
            } else {
                response = try await auth.login(email: email, password: password)
            }

            if let err = response.error, response.accessToken == nil {
                error = err
            } else if let id = response.id, let access = response.accessToken, let refresh = response.refreshToken {
                appState.didSignIn(userId: id, accessToken: access, refreshToken: refresh)
            } else {
                error = "Unexpected response"
            }
        } catch {
            self.error = error.localizedDescription
        }

        loading = false
    }
}
