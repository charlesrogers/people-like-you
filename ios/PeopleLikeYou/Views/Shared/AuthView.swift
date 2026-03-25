import SwiftUI

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var phone = ""
    @State private var otpSent = false
    @State private var otpCode = ""
    @State private var useEmail = false
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = true
    @State private var loading = false
    @State private var error: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer().frame(height: 80)

                VStack(spacing: 8) {
                    Text("People \(Text("Like").italic()) You")
                        .font(.system(size: 34, weight: .bold))

                    Text(otpSent ? "Enter the code we sent you." : "Enter your phone number to get started.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                VStack(spacing: 16) {
                    if !useEmail {
                        // Phone-first flow
                        if !otpSent {
                            HStack(spacing: 8) {
                                Text("+1")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 10)
                                    .background(Color(.secondarySystemBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 8))

                                TextField("(555) 123-4567", text: $phone)
                                    .textFieldStyle(.roundedBorder)
                                    .keyboardType(.phonePad)
                                    .textContentType(.telephoneNumber)
                            }
                        } else {
                            TextField("123456", text: $otpCode)
                                .textFieldStyle(.roundedBorder)
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.center)
                                .font(.system(.title2, design: .monospaced))
                                .onChange(of: otpCode) { _, newValue in
                                    otpCode = String(newValue.filter(\.isNumber).prefix(6))
                                }

                            Button("Use a different number") {
                                otpSent = false
                                otpCode = ""
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        }
                    } else {
                        // Email fallback
                        TextField("Email", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        SecureField("Password", text: $password)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(isSignUp ? .newPassword : .password)
                    }

                    if let error {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                    }

                    // Primary button
                    Button {
                        Task { await submit() }
                    } label: {
                        if loading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        } else {
                            Text(buttonLabel)
                                .font(.headline)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.primary)
                    .disabled(loading || !canSubmit)

                    // Toggle between phone and email
                    Button(useEmail ? "Use phone number instead" : "Use email instead") {
                        useEmail.toggle()
                        otpSent = false
                        otpCode = ""
                        error = nil
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    // Login/signup toggle (email mode only)
                    if useEmail {
                        Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                            isSignUp.toggle()
                            error = nil
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal)
            }
            .padding()
        }
    }

    private var buttonLabel: String {
        if useEmail { return isSignUp ? "Get Started" : "Log In" }
        return otpSent ? "Verify" : "Send Code"
    }

    private var canSubmit: Bool {
        if useEmail { return !email.isEmpty && !password.isEmpty }
        if otpSent { return otpCode.count == 6 }
        return phone.filter(\.isNumber).count >= 10
    }

    private func submit() async {
        loading = true
        error = nil

        do {
            let auth = AuthService.shared

            if useEmail {
                // Email flow
                let response: AuthResponse
                if isSignUp {
                    response = try await auth.signUp(email: email, password: password, firstName: "", gender: "Man")
                } else {
                    response = try await auth.login(email: email, password: password)
                }
                handleAuthResponse(response)
            } else if !otpSent {
                // Send OTP
                let response = try await auth.requestOTP(phone: phone)
                if let err = response.error {
                    error = err
                } else {
                    otpSent = true
                }
            } else {
                // Verify OTP
                let response = try await auth.verifyOTP(phone: phone, code: otpCode)
                handleAuthResponse(response)
            }
        } catch let apiError as APIError {
            self.error = apiError.localizedDescription
        } catch {
            self.error = error.localizedDescription
        }

        loading = false
    }

    private func handleAuthResponse(_ response: AuthResponse) {
        if let err = response.error, response.accessToken == nil {
            error = err
        } else if let id = response.id, let access = response.accessToken, let refresh = response.refreshToken {
            appState.didSignIn(userId: id, accessToken: access, refreshToken: refresh)
        } else {
            error = "Unexpected response"
        }
    }
}
