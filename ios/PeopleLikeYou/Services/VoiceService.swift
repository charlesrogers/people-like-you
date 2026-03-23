import AVFoundation
import Foundation

struct VoiceMemoResponse: Codable {
    let id: String
    let status: String
}

final class VoiceService {
    static let shared = VoiceService()
    private let api = APIClient.shared

    func uploadMemo(
        audioData: Data,
        userId: String,
        promptId: String,
        dayNumber: Int,
        durationSeconds: Int
    ) async throws -> VoiceMemoResponse {
        return try await api.upload(
            "/voice-memo",
            fileData: audioData,
            fileName: "memo.m4a",
            mimeType: "audio/m4a",
            fieldName: "audio",
            fields: [
                "userId": userId,
                "promptId": promptId,
                "dayNumber": String(dayNumber),
                "durationSeconds": String(durationSeconds),
            ]
        )
    }
}

// MARK: - Audio recorder wrapper

@MainActor
final class AudioRecorder: ObservableObject {
    @Published var isRecording = false
    @Published var duration: TimeInterval = 0
    @Published var audioData: Data?

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private var fileURL: URL {
        FileManager.default.temporaryDirectory.appendingPathComponent("ply_memo.m4a")
    }

    func startRecording() {
        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.record, mode: .default)
            try session.setActive(true)
        } catch {
            print("Audio session error: \(error)")
            return
        }

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]

        do {
            recorder = try AVAudioRecorder(url: fileURL, settings: settings)
            recorder?.record()
            isRecording = true
            duration = 0
            audioData = nil

            timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                Task { @MainActor in
                    self?.duration = self?.recorder?.currentTime ?? 0
                }
            }
        } catch {
            print("Recording error: \(error)")
        }
    }

    func stopRecording() {
        recorder?.stop()
        timer?.invalidate()
        timer = nil
        isRecording = false

        if FileManager.default.fileExists(atPath: fileURL.path) {
            audioData = try? Data(contentsOf: fileURL)
        }
    }
}
