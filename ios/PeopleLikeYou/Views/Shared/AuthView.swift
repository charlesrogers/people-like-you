import SwiftUI

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var isSignUp = true
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer().frame(height: 80)

                VStack(spacing: 8) {
                    (Text("People ") + Text("Like").italic() + Text(" You"))
                        .font(.system(size: 34, weight: .bold))

                    Text(isSignUp ? "Let's find your person." : "Welcome back")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 16) {
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
                            .multilineTextAlignment(.center)
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
                    .disabled(loading || email.isEmpty || password.isEmpty)

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
                response = try await auth.signUp(email: email, password: password, firstName: "", gender: "Man")
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
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }

        loading = false
    }
}
