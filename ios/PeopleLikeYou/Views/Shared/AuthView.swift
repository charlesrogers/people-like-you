import SwiftUI

// Brand colors matching web
private let neonYellow = Color(red: 227/255, green: 255/255, blue: 68/255) // #e3ff44
private let darkBg = Color(red: 26/255, green: 26/255, blue: 26/255) // #1a1a1a

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

            // Emojis — simple Text overlays, no GeometryReader
            VStack {
                HStack {
                    Text("\u{1F49B}").font(.largeTitle).padding(.leading, 30)
                    Spacer()
                    Text("\u{2728}").font(.title).padding(.trailing, 40)
                }
                .padding(.top, 60)

                Spacer()

                HStack {
                    Text("\u{1F399}\u{FE0F}").font(.title).padding(.leading, 50)
                    Spacer()
                    Text("\u{1F48C}").font(.largeTitle).padding(.trailing, 30)
                }

                HStack {
                    Text("\u{1F52E}").font(.title2).padding(.leading, 24)
                    Spacer()
                }
                .padding(.bottom, 120)
            }
            .opacity(0.6)

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
                        withAnimation(.spring(response: 0.35)) {
                            showAuth = true
                            isSignUp = true
                        }
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

    // MARK: - Auth Fields (email only for now)

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

                Text(isSignUp ? "Create your account" : "Welcome back")
                    .font(.title3.weight(.semibold))

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

                    // Primary button
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
                            Text(isSignUp ? "Get Started" : "Log In")
                                .font(.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                                .background(!email.isEmpty && !password.isEmpty ? darkBg : darkBg.opacity(0.3))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                    .disabled(loading || email.isEmpty || password.isEmpty)

                    Button(isSignUp ? "Already have an account? Log in" : "New here? Sign up") {
                        isSignUp.toggle()
                        error = nil
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)

                    // Back to welcome
                    Button {
                        withAnimation(.spring(response: 0.35)) { showAuth = false }
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "chevron.left").font(.caption)
                            Text("Back").font(.caption)
                        }
                    }
                    .foregroundStyle(.secondary)
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
            }
            .padding()
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
