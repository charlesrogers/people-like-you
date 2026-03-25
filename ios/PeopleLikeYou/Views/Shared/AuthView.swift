import SwiftUI

// Brand colors matching web
private let neonYellow = Color(red: 227/255, green: 255/255, blue: 68/255) // #e3ff44
private let darkBg = Color(red: 26/255, green: 26/255, blue: 26/255) // #1a1a1a

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var showAuth = false
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
        if showAuth {
            authFields
        } else {
            welcomeSplash
        }
    }

    // MARK: - Welcome Splash (matches web homepage)

    private var welcomeSplash: some View {
        ZStack {
            neonYellow.ignoresSafeArea()

            // Floating emojis
            floatingEmoji("\u{1F49B}", x: 0.12, y: 0.18, animation: .wiggle)
            floatingEmoji("\u{2728}", x: 0.85, y: 0.25, animation: .float)
            floatingEmoji("\u{1F399}\u{FE0F}", x: 0.20, y: 0.70, animation: .bounce)
            floatingEmoji("\u{1F48C}", x: 0.88, y: 0.72, animation: .wiggle)
            floatingEmoji("\u{1F52E}", x: 0.08, y: 0.55, animation: .float)

            VStack(spacing: 0) {
                Spacer()

                // Headline
                VStack(spacing: 4) {
                    Text("People")
                        .font(.system(size: 56, weight: .heavy))
                        .foregroundStyle(darkBg)
                    HStack(spacing: 0) {
                        Text("Like")
                            .font(.system(size: 56, weight: .heavy))
                            .italic()
                            .foregroundStyle(darkBg.opacity(0.5))
                        Text(" You")
                            .font(.system(size: 56, weight: .heavy))
                            .foregroundStyle(darkBg)
                    }
                }

                // Tagline
                VStack(spacing: 4) {
                    Text("The matchmaker that knows you")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(darkBg.opacity(0.6))
                    Text("better than your friends do.")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(darkBg.opacity(0.6))
                    Text("Never swipe again.")
                        .font(.title3.weight(.heavy))
                        .foregroundStyle(darkBg)
                        .padding(.top, 4)
                }
                .padding(.top, 24)

                Spacer()

                // CTA
                VStack(spacing: 12) {
                    Button {
                        withAnimation(.spring(response: 0.35)) { showAuth = true }
                    } label: {
                        Text("Get started \u{2014} it\u{2019}s free")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(darkBg)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                    }

                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            showAuth = true
                            isSignUp = false
                            useEmail = true
                        }
                    } label: {
                        Text("I already have an account")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(darkBg.opacity(0.4))
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
            }
        }
    }

    // MARK: - Auth Fields

    private var authFields: some View {
        ScrollView {
            VStack(spacing: 32) {
                Spacer().frame(height: 40)

                // Logo
                HStack(spacing: 0) {
                    Text("P")
                        .font(.system(size: 28, weight: .heavy))
                        .foregroundStyle(neonYellow)
                    Text("L")
                        .font(.system(size: 28, weight: .heavy))
                        .italic()
                        .foregroundStyle(.white)
                    Text("Y")
                        .font(.system(size: 28, weight: .heavy))
                        .foregroundStyle(neonYellow)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(darkBg)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                Text(otpSent ? "Enter the code we sent you." : (useEmail ? (isSignUp ? "Create your account" : "Welcome back") : "Enter your phone number"))
                    .font(.title3.weight(.semibold))

                VStack(spacing: 16) {
                    if !useEmail {
                        // Phone flow
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

                    // Primary button — dark bg, white text (not .borderedProminent)
                    Button {
                        Task { await submit() }
                    } label: {
                        if loading {
                            ProgressView()
                                .tint(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(darkBg)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        } else {
                            Text(buttonLabel)
                                .font(.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(canSubmit ? darkBg : darkBg.opacity(0.3))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .disabled(loading || !canSubmit)

                    // Toggle phone / email
                    Button(useEmail ? "Use phone number instead" : "Use email instead") {
                        useEmail.toggle()
                        otpSent = false
                        otpCode = ""
                        error = nil
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    if useEmail {
                        Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                            isSignUp.toggle()
                            error = nil
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }

                    // Back to welcome
                    Button {
                        withAnimation(.spring(response: 0.35)) { showAuth = false }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.caption)
                        Text("Back")
                            .font(.caption)
                    }
                    .foregroundStyle(.secondary)
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
            }
            .padding()
        }
    }

    // MARK: - Helpers

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
                let response: AuthResponse
                if isSignUp {
                    response = try await auth.signUp(email: email, password: password, firstName: "", gender: "Man")
                } else {
                    response = try await auth.login(email: email, password: password)
                }
                handleAuthResponse(response)
            } else if !otpSent {
                let response = try await auth.requestOTP(phone: phone)
                if let err = response.error {
                    error = err
                } else {
                    otpSent = true
                }
            } else {
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

    // MARK: - Floating emoji helper

    private enum EmojiAnimation { case wiggle, float, bounce }

    private func floatingEmoji(_ emoji: String, x: Double, y: Double, animation: EmojiAnimation) -> some View {
        GeometryReader { geo in
            Text(emoji)
                .font(.system(size: 32))
                .position(
                    x: geo.size.width * x,
                    y: geo.size.height * y
                )
                .opacity(0.8)
        }
    }
}
