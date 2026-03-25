import SwiftUI

struct PreferencesView: View {
    let onComplete: () -> Void

    @State private var ageMin: Double = 21
    @State private var ageMax: Double = 35
    @State private var wouldRelocate = ""
    @State private var faithImportance = ""
    @State private var religion = ""
    @State private var observanceLevel = ""
    @State private var observanceMatch = ""
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
                    Text("Age range: \(Int(ageMin)) \u{2013} \(Int(ageMax))")
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

                // Religion — always shown
                VStack(alignment: .leading, spacing: 8) {
                    Text("What's your background?")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.secondary)

                    if faithImportance == "essential" || faithImportance == "important" {
                        Text("This will help us filter your matches.")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }

                    FlowLayout(spacing: 8) {
                        ForEach([
                            ("lds", "Latter-day Saint (LDS)"),
                            ("jehovahs_witness", "Jehovah's Witness"),
                            ("orthodox_jewish", "Orthodox Jewish"),
                            ("jewish", "Jewish (Conservative/Reform)"),
                            ("catholic", "Catholic"),
                            ("protestant", "Protestant / Evangelical"),
                            ("muslim", "Muslim"),
                            ("hindu", "Hindu"),
                            ("buddhist", "Buddhist"),
                            ("sikh", "Sikh"),
                            ("spiritual", "Spiritual but not religious"),
                            ("agnostic", "Agnostic"),
                            ("atheist", "Atheist / None"),
                            ("other", "Other"),
                        ], id: \.0) { value, label in
                            Button {
                                religion = value
                            } label: {
                                Text(label)
                                    .font(.caption)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(religion == value ? plyDark : Color.clear)
                                    .foregroundStyle(religion == value ? Color(.systemBackground) : .primary)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(plyDark.opacity(religion == value ? 0 : 0.15)))
                            }
                        }
                    }
                }

                // Observance level — only after religion selected
                if !religion.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("What does this look like in your daily life?")
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(.secondary)

                        ForEach([
                            ("practicing", "Practicing", "Shapes my daily choices"),
                            ("cultural", "Cultural", "Part of my identity, flexible day-to-day"),
                            ("background", "Background", "Raised in it, not a driving force"),
                        ], id: \.0) { value, label, desc in
                            Button {
                                observanceLevel = value
                            } label: {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(label).font(.subheadline.weight(.semibold))
                                    Text(desc).font(.caption).foregroundStyle(observanceLevel == value ? .white.opacity(0.7) : .secondary)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(observanceLevel == value ? plyDark : Color.clear)
                                .foregroundStyle(observanceLevel == value ? Color(.systemBackground) : .primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(plyDark.opacity(observanceLevel == value ? 0 : 0.15)))
                            }
                        }
                    }
                }

                // Observance match — only after observance selected
                if !observanceLevel.isEmpty {
                    ChipPicker(label: "How important is it that your partner is at the same level?", selection: $observanceMatch, options: [
                        ("must_match", "Must match my level"),
                        ("prefer_same", "Prefer same, but flexible"),
                        ("respect_only", "Doesn't matter if they respect it"),
                    ])
                }

                // Kids
                ChipPicker(label: "Kids *", selection: $kids, options: [
                    ("has", "Have kids"), ("wants", "Want kids"),
                    ("open", "Open to kids"), ("doesnt_want", "Don't want kids"),
                ])

                // Marital history
                ChipPicker(label: "Marital history", selection: $maritalHistory, options: [
                    ("never_married", "Never married"), ("divorced", "Divorced"),
                ])

                PLYPrimaryButton("Continue", disabled: !canProceed) {
                    AnalyticsService.shared.onboardingSectionProgressed(section: "preferences")
                    onComplete()
                }
            .padding()
        }
    }
}

struct ChipPicker: View {
    let label: String
    @Binding var selection: String
    let options: [(String, String)]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label)
                .font(.subheadline.weight(.medium))
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
                            .background(selection == value ? plyDark : Color.clear)
                            .foregroundStyle(selection == value ? Color(.systemBackground) : plyDark)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(plyDark.opacity(selection == value ? 0 : 0.15)))
                    }
                }
            }
        }
    }
}
