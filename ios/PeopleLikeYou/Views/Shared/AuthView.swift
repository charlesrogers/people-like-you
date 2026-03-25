import SwiftUI

private let neonYellow = Color(red: 227/255, green: 255/255, blue: 68/255)
private let darkBg = Color(red: 26/255, green: 26/255, blue: 26/255)

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

    // MARK: - Welcome Splash

    private var welcomeSplash: some View {
        ZStack {
            neonYellow.ignoresSafeArea()

            // Big emojis spread across entire screen
            ZStack {
                FloatingEmoji(emoji: "\u{1F49B}", size: 80, delay: 0, amplitude: 14)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.top, 70).padding(.leading, 24)

                FloatingEmoji(emoji: "\u{2728}", size: 72, delay: 0.7, amplitude: 16)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .padding(.top, 130).padding(.trailing, 20)

                FloatingEmoji(emoji: "\u{1F52E}", size: 64, delay: 1.2, amplitude: 10)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .padding(.top, 280).padding(.leading, 14)

                FloatingEmoji(emoji: "\u{1F399}\u{FE0F}", size: 76, delay: 0.4, amplitude: 13)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
                    .padding(.top, 340).padding(.trailing, 16)

                FloatingEmoji(emoji: "\u{1F48C}", size: 70, delay: 1.6, amplitude: 12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                    .padding(.bottom, 260).padding(.leading, 50)

                FloatingEmoji(emoji: "\u{1FA77}", size: 60, delay: 0.9, amplitude: 9)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                    .padding(.bottom, 230).padding(.trailing, 40)

                FloatingEmoji(emoji: "\u{1F31F}", size: 56, delay: 2.0, amplitude: 8)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
                    .padding(.bottom, 140).padding(.leading, 260)
            }
            .opacity(0.55)

            // Hero content
            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 0) {
                    Text("People")
                        .font(.system(size: 66, weight: .heavy))
                        .tracking(-2)
                        .foregroundStyle(darkBg)

                    HStack(spacing: 6) {
                        Text("Like")
                            .font(.system(size: 66, weight: .heavy))
                            .tracking(-2)
                            .italic()
                            .foregroundStyle(.white)
                            .shadow(color: darkBg.opacity(0.15), radius: 8, x: 2, y: 4)
                            .shadow(color: darkBg.opacity(0.08), radius: 20, x: 4, y: 8)
                        Text("You")
                            .font(.system(size: 66, weight: .heavy))
                            .tracking(-2)
                            .foregroundStyle(darkBg)
                    }
                }

                VStack(spacing: 6) {
                    Text("The matchmaker that knows you")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(darkBg.opacity(0.5))
                    Text("better than your friends do.")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(darkBg.opacity(0.5))
                    Text("Never swipe again.")
                        .font(.system(size: 19, weight: .heavy))
                        .foregroundStyle(darkBg)
                        .padding(.top, 8)
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
                            .frame(height: 58)
                            .background(darkBg)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                            .shadow(color: .black.opacity(0.18), radius: 20, y: 10)
                    }

                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
                            showAuth = true
                            isSignUp = false
                        }
                    } label: {
                        Text("I already have an account")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(darkBg.opacity(0.4))
                            .underline()
                    }
                }
                .padding(.horizontal, 28)
                .padding(.bottom, 56)
            }
        }
    }

    // MARK: - Auth Fields

    private var authFields: some View {
        ZStack {
            neonYellow.ignoresSafeArea()

            VStack(spacing: 0) {
                // Nav bar
                HStack {
                    Button {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) { showAuth = false }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .bold))
                            Text("Back")
                                .font(.system(size: 14, weight: .semibold))
                        }
                        .foregroundStyle(darkBg.opacity(0.5))
                    }
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        // PLY logo small
                        HStack(spacing: 0) {
                            Text("P").font(.system(size: 18, weight: .heavy)).foregroundStyle(neonYellow)
                            Text("L").font(.system(size: 18, weight: .heavy)).italic().foregroundStyle(.white)
                            Text("Y").font(.system(size: 18, weight: .heavy)).foregroundStyle(neonYellow)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(darkBg)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .padding(.top, 20)

                        // H1 — big, bold, matches the brand
                        Text(isSignUp ? "Build your profile" : "Welcome back")
                            .font(.system(size: 36, weight: .heavy))
                            .tracking(-1)
                            .foregroundStyle(darkBg)
                            .padding(.top, 20)

                        // Subtitle
                        Text(isSignUp ? "Share your stories, meet your person." : "Pick up where you left off.")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(darkBg.opacity(0.5))
                            .padding(.top, 6)

                        // Form card
                        VStack(spacing: 18) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Email")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(darkBg.opacity(0.5))
                                    .textCase(.uppercase)
                                    .tracking(0.5)
                                TextField("you@email.com", text: $email)
                                    .font(.system(size: 16))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 14)
                                    .background(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .shadow(color: darkBg.opacity(0.06), radius: 4, y: 2)
                                    .textContentType(.emailAddress)
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                            }

                            VStack(alignment: .leading, spacing: 6) {
                                Text("Password")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(darkBg.opacity(0.5))
                                    .textCase(.uppercase)
                                    .tracking(0.5)
                                SecureField("6+ characters", text: $password)
                                    .font(.system(size: 16))
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 14)
                                    .background(.white)
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                    .shadow(color: darkBg.opacity(0.06), radius: 4, y: 2)
                                    .textContentType(isSignUp ? .newPassword : .password)
                            }
                        }
                        .padding(.top, 28)
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

                        // Submit button
                        Button {
                            Task { await submit() }
                        } label: {
                            Group {
                                if loading {
                                    ProgressView().tint(.white)
                                } else {
                                    Text(isSignUp ? "Let\u{2019}s go" : "Log in")
                                        .font(.system(size: 18, weight: .bold))
                                }
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(!email.isEmpty && !password.isEmpty ? darkBg : darkBg.opacity(0.2))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .shadow(color: .black.opacity(0.12), radius: 12, y: 6)
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
                        .foregroundStyle(darkBg.opacity(0.4))
                        .padding(.top, 20)
                        .padding(.bottom, 40)
                    }
                }
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
