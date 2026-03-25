import SwiftUI

private let neonYellow = Color(red: 227/255, green: 255/255, blue: 68/255)
private let darkBg = Color(red: 26/255, green: 26/255, blue: 26/255)

// Lightweight floating emoji — just .offset animation, zero layout cost
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
                .easeInOut(duration: Double.random(in: 2.8...3.8))
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
                .transition(.move(edge: .trailing).combined(with: .opacity))
        } else {
            welcomeSplash
                .transition(.opacity)
        }
    }

    // MARK: - Welcome Splash (matches web homepage)

    private var welcomeSplash: some View {
        ZStack {
            neonYellow.ignoresSafeArea()

            // Emojis spread across full screen — matching web positions
            // Web: top-18% left-12%, top-25% right-15%, bottom-30% left-20%,
            //      bottom-22% right-12%, top-55% left-8%
            ZStack {
                // Top area
                FloatingEmoji(emoji: "\u{1F49B}", size: 52, delay: 0, amplitude: 10)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.top, 100).padding(.leading, 40)

                FloatingEmoji(emoji: "\u{2728}", size: 44, delay: 0.6, amplitude: 12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .padding(.top, 160).padding(.trailing, 50)

                // Middle
                FloatingEmoji(emoji: "\u{1F52E}", size: 40, delay: 1.0, amplitude: 8)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .padding(.top, 320).padding(.leading, 28)

                FloatingEmoji(emoji: "\u{1F399}\u{FE0F}", size: 46, delay: 0.3, amplitude: 11)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                    .padding(.top, 380).padding(.trailing, 36)

                // Bottom area
                FloatingEmoji(emoji: "\u{1F48C}", size: 48, delay: 1.4, amplitude: 9)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                    .padding(.bottom, 220).padding(.leading, 60)

                FloatingEmoji(emoji: "\u{1FA77}", size: 38, delay: 0.8, amplitude: 7)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                    .padding(.bottom, 180).padding(.trailing, 44)

                FloatingEmoji(emoji: "\u{1F31F}", size: 36, delay: 1.8, amplitude: 6)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.top, 240).padding(.leading, 280)
            }
            .opacity(0.65)

            // Hero content — centered
            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 2) {
                    Text("People")
                        .font(.system(size: 64, weight: .heavy))
                        .tracking(-1)
                        .foregroundStyle(darkBg)

                    HStack(spacing: 4) {
                        Text("Like")
                            .font(.system(size: 64, weight: .heavy))
                            .tracking(-1)
                            .italic()
                            .foregroundStyle(.white)
                        Text("You")
                            .font(.system(size: 64, weight: .heavy))
                            .tracking(-1)
                            .foregroundStyle(darkBg)
                    }
                }

                VStack(spacing: 6) {
                    Text("The matchmaker that knows you")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(darkBg.opacity(0.55))
                    Text("better than your friends do.")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(darkBg.opacity(0.55))
                    Text("Never swipe again.")
                        .font(.system(size: 18, weight: .heavy))
                        .foregroundStyle(darkBg)
                        .padding(.top, 6)
                }
                .padding(.top, 28)

                Spacer()

                // CTA
                VStack(spacing: 16) {
                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                            showAuth = true
                            isSignUp = true
                        }
                    } label: {
                        Text("Get started \u{2014} it\u{2019}s free")
                            .font(.system(size: 18, weight: .bold))
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(darkBg)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                            .shadow(color: .black.opacity(0.15), radius: 16, y: 8)
                    }

                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                            showAuth = true
                            isSignUp = false
                        }
                    } label: {
                        Text("I already have an account")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(darkBg.opacity(0.35))
                            .underline(pattern: .dot)
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 56)
            }
        }
    }

    // MARK: - Auth Fields (polished, matches brand)

    private var authFields: some View {
        ZStack {
            Color(.systemBackground).ignoresSafeArea()

            VStack(spacing: 0) {
                // Top bar with back + logo
                HStack {
                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { showAuth = false }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.primary)
                    }

                    Spacer()

                    HStack(spacing: 0) {
                        Text("P").font(.system(size: 20, weight: .heavy)).foregroundStyle(neonYellow)
                        Text("L").font(.system(size: 20, weight: .heavy)).italic().foregroundStyle(.white)
                        Text("Y").font(.system(size: 20, weight: .heavy)).foregroundStyle(neonYellow)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(darkBg)
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                    Spacer()
                    // Balance the back button
                    Color.clear.frame(width: 24)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                Spacer().frame(height: 48)

                // Title
                VStack(spacing: 6) {
                    Text(isSignUp ? "Create your account" : "Welcome back")
                        .font(.system(size: 28, weight: .bold))

                    Text(isSignUp ? "Tell your stories. Meet your people." : "Pick up where you left off.")
                        .font(.system(size: 15))
                        .foregroundStyle(.secondary)
                }

                // Form fields
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Email").font(.system(size: 12, weight: .semibold)).foregroundStyle(.secondary)
                        TextField("you@email.com", text: $email)
                            .font(.system(size: 16))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password").font(.system(size: 12, weight: .semibold)).foregroundStyle(.secondary)
                        SecureField("6+ characters", text: $password)
                            .font(.system(size: 16))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .textContentType(isSignUp ? .newPassword : .password)
                    }
                }
                .padding(.top, 32)
                .padding(.horizontal, 24)

                // Error
                if let error {
                    Text(error)
                        .font(.system(size: 13))
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.top, 12)
                        .padding(.horizontal, 24)
                }

                // Submit
                Button {
                    Task { await submit() }
                } label: {
                    Group {
                        if loading {
                            ProgressView().tint(.white)
                        } else {
                            Text(isSignUp ? "Get Started" : "Log In")
                                .font(.system(size: 17, weight: .bold))
                        }
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(!email.isEmpty && !password.isEmpty ? darkBg : darkBg.opacity(0.2))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(loading || email.isEmpty || password.isEmpty)
                .padding(.top, 24)
                .padding(.horizontal, 24)

                // Toggle
                Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isSignUp.toggle()
                        error = nil
                    }
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.secondary)
                .padding(.top, 20)

                Spacer()
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
