# People Like You — iOS App

Native SwiftUI app for People Like You.

## Setup in Xcode

1. Open Xcode → **File → New → Project**
2. Choose **App** template, SwiftUI interface, Swift language
3. Product Name: `PeopleLikeYou`
4. Bundle ID: `com.peoplelikeyou.app`
5. Set deployment target: **iOS 17.0**
6. Save the project inside this `ios/` directory

### Add source files

7. Delete the auto-generated `ContentView.swift` and `PeopleLikeYouApp.swift`
8. Drag the `PeopleLikeYou/` folder into the Xcode project navigator
9. Make sure "Copy items if needed" is **unchecked** (files are already here)
10. Ensure all `.swift` files have the correct target membership

### Add dependencies (Swift Package Manager)

11. **File → Add Package Dependencies**
12. Add PostHog: `https://github.com/PostHog/posthog-ios` (optional — uncomment in AnalyticsService.swift)

### Configure capabilities

13. **Signing & Capabilities → + Capability**:
    - **Push Notifications** (for APNs)
    - **Background Modes → Background fetch** (for pre-fetching intros)
14. Add **Microphone Usage Description** in Info.plist: `"We use your microphone to record voice memos that help us understand your personality."`
15. Add **Photo Library Usage Description**: `"We need access to your photos for your dating profile."`

### API configuration

16. The API base URL is configured in `Services/APIClient.swift`:
    - Debug: `http://localhost:3000/api` (run the Next.js dev server)
    - Release: `https://people-like-you.com/api`

### Build & Run

17. Select an iOS 17+ simulator or device
18. **Product → Run** (⌘R)
19. For local development, also run `npm run dev` in the web app root

## Project Structure

```
PeopleLikeYou/
├── App/
│   ├── PeopleLikeYouApp.swift    # Entry point
│   └── AppState.swift             # Global state + navigation
├── Models/
│   ├── User.swift                 # User, preferences types
│   ├── Match.swift                # DailyIntro, feedback types
│   ├── CompositeProfile.swift     # Personality composite
│   ├── Disclosure.swift           # Mutual match, disclosure exchange
│   └── ScheduledDate.swift        # Dates, availability
├── Services/
│   ├── APIClient.swift            # HTTP client with auth
│   ├── AuthService.swift          # Signup/login + Keychain
│   ├── ProfileService.swift       # Profile + extraction status
│   ├── MatchService.swift         # Calibration + daily intros
│   ├── VoiceService.swift         # Audio recording + upload
│   ├── PhotoService.swift         # Photo upload
│   ├── DisclosureService.swift    # Mutual match exchanges
│   ├── DateService.swift          # Date planning
│   └── AnalyticsService.swift     # PostHog events
└── Views/
    ├── Shared/AuthView.swift      # Login / signup
    ├── Onboarding/                # 4-step onboarding flow
    ├── Calibration/               # Elo calibration
    ├── Discovery/                 # Dashboard + intro cards
    ├── Connection/                # Mutual match + disclosure + dates
    └── Profile/                   # Settings + availability
```

## App Flow

```
Auth → Onboarding (basics → voice → prefs → photos) → Calibration → Dashboard
                                                                        ↓
                                                        Daily Intro → Interested / Pass
                                                                        ↓
                                                        Mutual Match → Disclosure (3 rounds)
                                                                        ↓
                                                                    Date Planning
```
