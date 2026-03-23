import Foundation
// import PostHog  // Uncomment after adding PostHog Swift SDK

final class AnalyticsService {
    static let shared = AnalyticsService()

    private let apiKey = "phc_Nqt473j5rO9hJ2HRlYyAtb25sbtB6SL9sVuYEWF0hLG"
    private let host = "https://us.i.posthog.com"

    func configure() {
        // PostHogSDK.shared.setup(
        //     PostHogConfig(apiKey: apiKey, host: host)
        // )
        print("[Analytics] Configured with PostHog (SDK not yet linked)")
    }

    func identify(userId: String) {
        // PostHogSDK.shared.identify(userId)
        print("[Analytics] Identify: \(userId)")
    }

    func track(_ event: String, properties: [String: Any] = [:]) {
        // PostHogSDK.shared.capture(event, properties: properties)
        print("[Analytics] \(event): \(properties)")
    }

    // MARK: - Convenience events

    func onboardingStarted() {
        track("onboarding_started")
    }

    func onboardingSectionProgressed(section: String, recordings: Int? = nil) {
        var props: [String: Any] = ["section": section]
        if let recordings { props["recordings"] = recordings }
        track("onboarding_section_progressed", properties: props)
    }

    func onboardingCompleted() {
        track("onboarding_completed")
    }

    func calibrationStarted() {
        track("calibration_started")
    }

    func calibrationVote(outcome: Int, candidateId: String) {
        track("calibration_vote", properties: ["outcome": outcome, "candidate_id": candidateId])
    }

    func dashboardLoaded(hasIntro: Bool, isPaused: Bool) {
        track("dashboard_loaded", properties: ["has_intro": hasIntro, "is_paused": isPaused])
    }

    func matchInterested(introId: String) {
        track("match_interested", properties: ["intro_id": introId])
    }

    func matchPassed(introId: String) {
        track("match_passed", properties: ["intro_id": introId])
    }
}
