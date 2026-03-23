import SwiftUI

struct PreferencesView: View {
    let onComplete: () -> Void

    @State private var ageMin: Double = 21
    @State private var ageMax: Double = 35
    @State private var wouldRelocate = ""
    @State private var faithImportance = ""
    @State private var kids = ""
    @State private var maritalHistory = ""

    private var canProceed: Bool {
        faithImportance.isEmpty == false && kids.isEmpty == false
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("A few dealbreakers")
                    .font(.title2.bold())

                Text("These help us filter out obvious mismatches. Your stories drive the real matching.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                // Age range sliders
                VStack(alignment: .leading, spacing: 12) {
                    Text("Age range: \(Int(ageMin)) – \(Int(ageMax))")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    VStack(spacing: 8) {
                        HStack {
                            Text("Min").font(.caption2).foregroundStyle(.tertiary).frame(width: 30)
                            Slider(value: $ageMin, in: 18...60, step: 1) { _ in
                                if ageMin >= ageMax { ageMin = ageMax - 1 }
                            }
                            Text("\(Int(ageMin))").font(.subheadline.weight(.medium)).frame(width: 30, alignment: .trailing)
                        }
                        HStack {
                            Text("Max").font(.caption2).foregroundStyle(.tertiary).frame(width: 30)
                            Slider(value: $ageMax, in: 18...60, step: 1) { _ in
                                if ageMax <= ageMin { ageMax = ageMin + 1 }
                            }
                            Text("\(Int(ageMax))").font(.subheadline.weight(.medium)).frame(width: 30, alignment: .trailing)
                        }
                    }
                }

                // Would you relocate?
                ChipPicker(label: "Would you relocate for the right person?", selection: $wouldRelocate, options: [
                    ("yes", "Yes"), ("maybe", "Maybe"), ("no", "No"),
                ])

                // Faith importance
                ChipPicker(label: "How important is shared faith? *", selection: $faithImportance, options: [
                    ("essential", "Essential"), ("important", "Important"),
                    ("nice_to_have", "Nice to have"), ("doesnt_matter", "Doesn't matter"),
                ])

                // Kids
                ChipPicker(label: "Kids *", selection: $kids, options: [
                    ("has", "Have kids"), ("wants", "Want kids"),
                    ("open", "Open to kids"), ("doesnt_want", "Don't want kids"),
                ])

                // Marital history
                ChipPicker(label: "Marital history", selection: $maritalHistory, options: [
                    ("never_married", "Never married"), ("divorced", "Divorced"),
                ])

                Button {
                    AnalyticsService.shared.onboardingSectionProgressed(section: "preferences")
                    onComplete()
                } label: {
                    Text("Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                }
                .buttonStyle(.borderedProminent)
                .tint(.primary)
                .disabled(!canProceed)
                .opacity(canProceed ? 1 : 0.4)
            }
            .padding()
        }
    }
}

// Reusable chip picker
struct ChipPicker: View {
    let label: String
    @Binding var selection: String
    let options: [(String, String)]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)

            FlowLayout(spacing: 8) {
                ForEach(options, id: \.0) { value, title in
                    Button {
                        selection = value
                    } label: {
                        Text(title)
                            .font(.subheadline.weight(.medium))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(selection == value ? Color.primary : Color.clear)
                            .foregroundStyle(selection == value ? Color(.systemBackground) : .primary)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Color.primary.opacity(selection == value ? 0 : 0.15)))
                    }
                }
            }
        }
    }
}
