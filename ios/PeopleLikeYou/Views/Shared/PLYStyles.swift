import SwiftUI

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLY iOS Style Guide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Colors:
//   neon:   #e3ff44  — brand yellow, backgrounds, accents
//   dark:   #1a1a1a  — primary text, buttons, UI chrome
//   white:  #ffffff  — input backgrounds, cards
//
// Typography:
//   H1:     system 34pt heavy, tracking -1
//   H2:     system 22pt bold
//   Body:   system 16pt regular
//   Caption: system 12-13pt, secondary color
//   Label:  system 12pt bold uppercase, tracking 0.5
//
// Buttons:
//   Primary: dark bg (#1a1a1a), white text, 14px rounded, 52pt height
//   NEVER use .borderedProminent + .tint(.primary) — invisible on neon
//
// Inputs:
//   White bg, 12px rounded, 16pt font, dark text
//   Always set .foregroundStyle(plyDark) and .tint(plyDark)
//
// Chips (selected): dark bg, white text
// Chips (unselected): clear bg, dark text, dark 15% stroke
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// MARK: - Brand Colors

let plyNeon = Color(red: 227/255, green: 255/255, blue: 68/255)    // #e3ff44
let plyDark = Color(red: 26/255, green: 26/255, blue: 26/255)       // #1a1a1a

// MARK: - Primary Button

struct PLYPrimaryButton: View {
    let title: String
    let disabled: Bool
    let loading: Bool
    let action: () -> Void

    init(_ title: String, disabled: Bool = false, loading: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.disabled = disabled
        self.loading = loading
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            Group {
                if loading {
                    ProgressView().tint(.white)
                } else {
                    Text(title)
                        .font(.system(size: 17, weight: .bold))
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(disabled ? plyDark.opacity(0.2) : plyDark)
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .disabled(disabled || loading)
    }
}

// MARK: - Input Field

struct PLYTextField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var contentType: UITextContentType?
    var secure: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(plyDark.opacity(0.5))
                .textCase(.uppercase)
                .tracking(0.5)

            Group {
                if secure {
                    SecureField(placeholder, text: $text)
                        .textContentType(contentType)
                } else {
                    TextField(placeholder, text: $text)
                        .textContentType(contentType)
                        .keyboardType(keyboard)
                        .autocapitalization(.none)
                }
            }
            .font(.system(size: 16))
            .foregroundStyle(plyDark)
            .tint(plyDark)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: plyDark.opacity(0.06), radius: 4, y: 2)
        }
    }
}
