import SwiftUI

struct AvailabilityView: View {
    @EnvironmentObject var appState: AppState
    @State private var availability = UserAvailability(
        monday: DaySlots(morning: false, afternoon: false, evening: false),
        tuesday: DaySlots(morning: false, afternoon: false, evening: false),
        wednesday: DaySlots(morning: false, afternoon: false, evening: false),
        thursday: DaySlots(morning: false, afternoon: false, evening: false),
        friday: DaySlots(morning: false, afternoon: false, evening: false),
        saturday: DaySlots(morning: false, afternoon: false, evening: false),
        sunday: DaySlots(morning: false, afternoon: false, evening: false)
    )
    @State private var saving = false

    private let days: [(String, WritableKeyPath<UserAvailability, DaySlots>)] = [
        ("Mon", \.monday), ("Tue", \.tuesday), ("Wed", \.wednesday),
        ("Thu", \.thursday), ("Fri", \.friday), ("Sat", \.saturday), ("Sun", \.sunday),
    ]

    var body: some View {
        VStack(spacing: 16) {
            Text("When are you free for dates?")
                .font(.title3.weight(.semibold))

            // Grid header
            HStack {
                Text("").frame(width: 44)
                ForEach(["AM", "PM", "Eve"], id: \.self) { label in
                    Text(label)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity)
                }
            }

            // Day rows
            ForEach(days, id: \.0) { (label, keyPath) in
                HStack {
                    Text(label)
                        .font(.subheadline.weight(.medium))
                        .frame(width: 44, alignment: .leading)

                    SlotToggle(isOn: Binding(
                        get: { availability[keyPath: keyPath].morning },
                        set: { availability[keyPath: keyPath].morning = $0 }
                    ))
                    SlotToggle(isOn: Binding(
                        get: { availability[keyPath: keyPath].afternoon },
                        set: { availability[keyPath: keyPath].afternoon = $0 }
                    ))
                    SlotToggle(isOn: Binding(
                        get: { availability[keyPath: keyPath].evening },
                        set: { availability[keyPath: keyPath].evening = $0 }
                    ))
                }
            }

            Spacer()

            Button {
                Task { await save() }
            } label: {
                if saving {
                    ProgressView().frame(maxWidth: .infinity)
                } else {
                    Text("Save").font(.headline).frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(.primary)
            .frame(height: 48)
        }
        .padding()
        .navigationTitle("Availability")
    }

    private func save() async {
        guard let userId = appState.userId else { return }
        saving = true
        do {
            try await DateService.shared.updateAvailability(userId: userId, availability: availability)
        } catch {
            print("Save failed: \(error)")
        }
        saving = false
    }
}

struct SlotToggle: View {
    @Binding var isOn: Bool

    var body: some View {
        Button {
            isOn.toggle()
        } label: {
            RoundedRectangle(cornerRadius: 8)
                .fill(isOn ? Color.primary : Color(.systemGray5))
                .frame(maxWidth: .infinity)
                .frame(height: 36)
                .overlay {
                    if isOn {
                        Image(systemName: "checkmark")
                            .font(.caption.bold())
                            .foregroundStyle(.white)
                    }
                }
        }
        .buttonStyle(.plain)
    }
}
