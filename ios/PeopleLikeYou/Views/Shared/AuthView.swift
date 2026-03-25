import SwiftUI

// Brand colors matching web
private let neonYellow = Color(red: 227/255, green: 255/255, blue: 68/255) // #e3ff44
private let darkBg = Color(red: 26/255, green: 26/255, blue: 26/255) // #1a1a1a

// MARK: - Floating emoji component (lightweight, no GeometryReader)

private struct FloatingEmoji: View {
    let emoji: String
    let size: CGFloat
    let delay: Double
    let amplitude: CGFloat

    @State private var floating = false

    var body: some View {
        Text(emoji)
            .font(.system(size: size))
            .offset(y: floating ? -amplitude : amplitude)
            .animation(
                .easeInOut(duration: Double.random(in: 2.5...3.5))
                .repeatForever(autoreverses: true)
                .delay(delay),
                value: floating
            )
            .onAppear { floating = true }
    }
}

struct AuthView: View {
    @EnvironmentObject var appState: AppState
    @State private var showAuth = false
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

    // MARK: - Welcome Splash

    private var welcomeSplash: some View {
        ZStack {
            neonYellow.ignoresSafeArea()

            // Floating emojis — big, spread out, gentle bob
            VStack {
                HStack {
                    FloatingEmoji(emoji: "\u{1F49B}", size: 44, delay: 0, amplitude: 8)
                        .padding(.leading, 28)
                    Spacer()
                    FloatingEmoji(emoji: "\u{2728}", size: 38, delay: 0.5, amplitude: 10)
                        .padding(.trailing, 36)
                }
                .padding(.top, 80)

                Spacer()

                HStack {
                    FloatingEmoji(emoji: "\u{1F52E}", size: 36, delay: 1.2, amplitude: 7)
                        .padding(.leading, 20)
                    Spacer()
                }

                HStack {
                    Spacer()
                    FloatingEmoji(emoji: "\u{1F399}\u{FE0F}", size: 40, delay: 0.8, amplitude: 9)
                        .padding(.trailing, 44)
                }

                HStack {
                    FloatingEmoji(emoji: "\u{1F48C}", size: 42, delay: 1.5, amplitude: 8)
                        .padding(.leading, 50)
                    Spacer()
                    FloatingEmoji(emoji: "\u{1FA77}", size: 34, delay: 0.3, amplitude: 6)
                        .padding(.trailing, 24)
                }
                .padding(.bottom, 130)
            }
            .opacity(0.7)

            // Content
            VStack(spacing: 0) {
                Spacer()

                // Headline
                VStack(spacing: 4) {
                    Text("People")
                        .font(.system(size: 58, weight: .heavy))
                        .foregroundStyle(darkBg)
                    HStack(spacing: 0) {
                        Text("Like")
                            .font(.system(size: 58, weight: .heavy))
                            .italic()
                            .foregroundStyle(darkBg.opacity(0.45))
                        Text(" You")
                            .font(.system(size: 58, weight: .heavy))
                            .foregroundStyle(darkBg)
                    }
                }

                // Tagline
                VStack(spacing: 6) {
                    Text("The matchmaker that knows you")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(darkBg.opacity(0.55))
                    Text("better than your friends do.")
                        .font(.title3.weight(.medium))
                        .foregroundStyle(darkBg.opacity(0.55))
                    Text("Never swipe again.")
                        .font(.title3.weight(.heavy))
                        .foregroundStyle(darkBg)
                        .padding(.top, 6)
                }
                .padding(.top, 24)

                Spacer()

                // CTA buttons
                VStack(spacing: 14) {
                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            showAuth = true
                            isSignUp = true
                        }
                    } label: {
                        Text("Get started \u{2014} it\u{2019}s free")
                            .font(.system(size: 17, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(darkBg)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                            .shadow(color: .black.opacity(0.15), radius: 12, y: 6)
                    }

                    Button {
                        withAnimation(.spring(response: 0.35)) {
                            showAuth = true
                            isSignUp = false
                        }
                    } label: {
                        Text("I already have an account")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(darkBg.opacity(0.35))
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 52)
            }
        }
    }

    // MARK: - Auth Fields (styled to match brand)

    private var authFields: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer().frame(height: 60)

                // Logo
                HStack(spacing: 0) {
                    Text("P").font(.system(size: 30, weight: .heavy)).foregroundStyle(neonYellow)
                    Text("L").font(.system(size: 30, weight: .heavy)).italic().foregroundStyle(.white)
                    Text("Y").font(.system(size: 30, weight: .heavy)).foregroundStyle(neonYellow)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 10)
                .background(darkBg)
                .clipShape(RoundedRectangle(cornerRadius: 14))

                Text(isSignUp ? "Create your account" : "Welcome back")
                    .font(.title2.weight(.bold))
                    .padding(.top, 28)

                Text(isSignUp ? "Tell your stories. Meet your people." : "Pick up where you left off.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .padding(.top, 4)

                // Form
                VStack(spacing: 14) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email").font(.caption.weight(.medium)).foregroundStyle(.secondary)
                        TextField("you@email.com", text: $email)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password").font(.caption.weight(.medium)).foregroundStyle(.secondary)
                        SecureField("6+ characters", text: $password)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .textContentType(isSignUp ? .newPassword : .password)
                    }
                }
                .padding(.top, 28)
                .padding(.horizontal, 28)

                if let error {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.top, 12)
                        .padding(.horizontal, 28)
                }

                // Submit button
                Button {
                    Task { await submit() }
                } label: {
                    if loading {
                        ProgressView()
                            .tint(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(darkBg)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    } else {
                        Text(isSignUp ? "Get Started" : "Log In")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(!email.isEmpty && !password.isEmpty ? darkBg : darkBg.opacity(0.25))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .disabled(loading || email.isEmpty || password.isEmpty)
                .padding(.top, 20)
                .padding(.horizontal, 28)

                // Toggle signup / login
                Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                    isSignUp.toggle()
                    error = nil
                }
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
                .padding(.top, 16)

                Spacer()

                // Back
                Button {
                    withAnimation(.spring(response: 0.35)) { showAuth = false }
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left").font(.footnote.weight(.semibold))
                        Text("Back").font(.footnote.weight(.semibold))
                    }
                    .foregroundStyle(.secondary)
                }
                .padding(.bottom, 36)
            }
        }
    }

    // MARK: - Submit

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
