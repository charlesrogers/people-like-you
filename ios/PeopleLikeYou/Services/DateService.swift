import Foundation

final class DateService {
    static let shared = DateService()
    private let api = APIClient.shared

    func getAvailability(userId: String) async throws -> UserAvailability {
        struct Response: Codable {
            let availability: AvailabilityWrapper
        }
        struct AvailabilityWrapper: Codable {
            let availability: UserAvailability
        }
        let response: Response = try await api.get("/availability", query: ["userId": userId])
        return response.availability.availability
    }

    func updateAvailability(userId: String, availability: UserAvailability) async throws {
        struct Body: Codable {
            let userId: String
            let availability: UserAvailability
        }
        struct Response: Codable { let ok: Bool }
        let _: Response = try await api.put("/availability", body: Body(userId: userId, availability: availability))
    }

    func getSuggestions(mutualMatchId: String) async throws -> [DateSuggestion] {
        struct Response: Codable {
            let suggestions: [DateSuggestion]
            let message: String?
        }
        let response: Response = try await api.get("/dates/suggestions", query: ["mutualMatchId": mutualMatchId])
        return response.suggestions
    }

    func proposeDate(
        mutualMatchId: String,
        proposedBy: String,
        scheduledAt: String,
        activityType: String?,
        venueName: String?,
        venueAddress: String?
    ) async throws -> ScheduledDate {
        struct Body: Codable {
            let mutualMatchId: String
            let proposedBy: String
            let scheduledAt: String
            let activityType: String?
            let venueName: String?
            let venueAddress: String?
        }
        struct Response: Codable { let ok: Bool; let date: ScheduledDate }
        let response: Response = try await api.post("/dates", body: Body(
            mutualMatchId: mutualMatchId, proposedBy: proposedBy,
            scheduledAt: scheduledAt, activityType: activityType,
            venueName: venueName, venueAddress: venueAddress
        ))
        return response.date
    }
}
