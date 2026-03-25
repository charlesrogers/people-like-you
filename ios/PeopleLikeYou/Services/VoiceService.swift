import AVFoundation
import Combine
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

// MARK: - Audio recorder with metering

@MainActor
final class AudioRecorder: ObservableObject {
    @Published var isRecording = false
    @Published var duration: TimeInterval = 0
    @Published var audioData: Data?
    @Published var audioLevel: Float = -160 // dB, -160 = silence
    @Published var hasDetectedSignal = false
    @Published var isSilent = false // set after recording if no signal detected

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private var peakLevel: Float = -160
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
            recorder?.isMeteringEnabled = true
            recorder?.record()
            isRecording = true
            duration = 0
            audioData = nil
            hasDetectedSignal = false
            isSilent = false
            peakLevel = -160

            let recorder = self.recorder
            timer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
                recorder?.updateMeters()
                let time = recorder?.currentTime ?? 0
                let level = recorder?.averagePower(forChannel: 0) ?? -160
                let peak = recorder?.peakPower(forChannel: 0) ?? -160

                Task { @MainActor [weak self] in
                    guard let self else { return }
                    self.duration = time
                    self.audioLevel = level
                    if peak > -40 {
                        self.hasDetectedSignal = true
                    }
                    if peak > self.peakLevel {
                        self.peakLevel = peak
                    }
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

        // Check if recording was silent
        isSilent = !hasDetectedSignal && duration > 1

        if FileManager.default.fileExists(atPath: fileURL.path) {
            audioData = try? Data(contentsOf: fileURL)
        }
    }
}
