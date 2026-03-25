import SwiftUI
import PhotosUI

struct PhotoUploadView: View {
    @EnvironmentObject var appState: AppState
    let onComplete: () -> Void

    @State private var photos: [UIImage] = []
    @State private var photoItems: [PhotosPickerItem] = []
    @State private var uploading = false
    @State private var uploadedCount = 0

    var body: some View {
        VStack(spacing: 24) {
            Text("Add your photos")
                .font(.title2.bold())

            Text("1-3 photos. These are shown to other members during calibration. Pick ones that actually look like you.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // Photo grid
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(photos.indices, id: \.self) { i in
                    Image(uiImage: photos[i])
                        .resizable()
                        .scaledToFill()
                        .frame(height: 140)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(alignment: .topTrailing) {
                            Button {
                                photos.remove(at: i)
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundStyle(.white)
                                    .shadow(radius: 2)
                            }
                            .padding(4)
                        }
                }

                if photos.count < 3 {
                    PhotosPicker(selection: $photoItems, maxSelectionCount: 3 - photos.count, matching: .images) {
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(style: StrokeStyle(lineWidth: 2, dash: [8]))
                            .foregroundStyle(.secondary)
                            .frame(height: 140)
                            .overlay {
                                Image(systemName: "plus")
                                    .font(.title)
                                    .foregroundStyle(.secondary)
                            }
                    }
                }
            }
            .padding(.horizontal)
            .onChange(of: photoItems) {
                Task { await loadImages() }
            }

            Spacer()

            PLYPrimaryButton("Continue", disabled: photos.isEmpty, loading: uploading) {
                Task { await uploadAll() }
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
    }

    private func loadImages() async {
        for item in photoItems {
            if let data = try? await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                photos.append(image)
            }
        }
        photoItems = []
    }

    private func uploadAll() async {
        guard let userId = appState.userId else { return }
        uploading = true
        for (i, photo) in photos.enumerated() {
            do {
                _ = try await PhotoService.shared.uploadPhoto(image: photo, userId: userId, sortOrder: i + 1)
                uploadedCount += 1
            } catch {
                print("Photo upload failed: \(error)")
            }
        }
        uploading = false
        AnalyticsService.shared.onboardingCompleted()
        onComplete()
    }
}
