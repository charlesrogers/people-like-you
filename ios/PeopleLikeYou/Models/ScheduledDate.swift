import Foundation

struct ScheduledDate: Codable, Identifiable {
    let id: String
    let mutualMatchId: String
    let proposedBy: String
    let confirmedBy: String?
    let scheduledAt: String
    let activityType: String?
    let venueName: String?
    let venueAddress: String?
    let status: String
    let conversationStarter: String?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, status
        case mutualMatchId = "mutual_match_id"
        case proposedBy = "proposed_by"
        case confirmedBy = "confirmed_by"
        case scheduledAt = "scheduled_at"
        case activityType = "activity_type"
        case venueName = "venue_name"
        case venueAddress = "venue_address"
        case conversationStarter = "conversation_starter"
        case createdAt = "created_at"
    }
}

struct DateSuggestion: Codable {
    let time: String
    let activityType: String
    let activityDescription: String
    let rationale: String
    let venueSuggestions: [VenueSuggestion]

    enum CodingKeys: String, CodingKey {
        case time
        case activityType = "activity_type"
        case activityDescription = "activity_description"
        case rationale
        case venueSuggestions = "venue_suggestions"
    }
}

struct VenueSuggestion: Codable {
    let name: String
    let address: String
    let placeId: String

    enum CodingKeys: String, CodingKey {
        case name, address
        case placeId = "place_id"
    }
}

struct UserAvailability: Codable {
    var monday: DaySlots
    var tuesday: DaySlots
    var wednesday: DaySlots
    var thursday: DaySlots
    var friday: DaySlots
    var saturday: DaySlots
    var sunday: DaySlots
}

struct DaySlots: Codable {
    var morning: Bool
    var afternoon: Bool
    var evening: Bool
}
