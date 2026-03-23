import Foundation
import UIKit

struct PhotoUploadResponse: Codable {
    let id: String
    let url: String
}

final class PhotoService {
    static let shared = PhotoService()
    private let api = APIClient.shared

    func uploadPhoto(image: UIImage, userId: String, sortOrder: Int) async throws -> PhotoUploadResponse {
        guard let data = image.jpegData(compressionQuality: 0.8) else {
            throw APIError.badRequest("Could not compress image")
        }

        return try await api.upload(
            "/upload-photo",
            fileData: data,
            fileName: "photo_\(sortOrder).jpg",
            mimeType: "image/jpeg",
            fieldName: "photo",
            fields: [
                "userId": userId,
                "sortOrder": String(sortOrder),
            ]
        )
    }
}
