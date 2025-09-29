import Foundation

// MARK: - Core Data Models
struct Verse: Codable, Identifiable {
    let id: Int
    let chapter: Int
    let verse: Int
    let sanskrit: String
    let transliteration: String
    let english: String
    let commentary: String?

    var shortReference: String {
        return "\(chapter).\(verse)"
    }
}

struct AIInsight: Codable {
    let verseId: Int
    let insight: String
    let journalPrompt: String
    let generatedAt: Date
}

struct JournalEntry: Codable, Identifiable {
    let id: UUID
    let verseId: Int
    let content: String
    let mood: Double? // 1-5 scale
    let createdAt: Date
    let tags: [String]

    init(verseId: Int, content: String, mood: Double? = nil, tags: [String] = []) {
        self.id = UUID()
        self.verseId = verseId
        self.content = content
        self.mood = mood
        self.createdAt = Date()
        self.tags = tags
    }
}

// MARK: - API Response Models
struct ClaudeResponse: Codable {
    let content: [ClaudeContent]
}

struct ClaudeContent: Codable {
    let text: String
}

struct ClaudeRequest: Codable {
    let model: String
    let max_tokens: Int
    let messages: [ClaudeMessage]
}

struct ClaudeMessage: Codable {
    let role: String
    let content: String
}

// MARK: - App Settings
struct AppSettings: Codable {
    var notificationTime: Date
    var hasSeenOnboarding: Bool
    var preferredLanguage: String // "en", "hi", "sa"
    var enableMoodTracking: Bool
    var premiumSubscribed: Bool

    static let defaultSettings = AppSettings(
        notificationTime: Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date(),
        hasSeenOnboarding: false,
        preferredLanguage: "en",
        enableMoodTracking: false,
        premiumSubscribed: false
    )
}

// MARK: - Sample Data for MVP
extension Verse {
    static let sampleVerses: [Verse] = [
        Verse(
            id: 1,
            chapter: 1,
            verse: 1,
            sanskrit: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥",
            transliteration: "dharma-kṣetre kuru-kṣetre\nsamavetā yuyutsavaḥ\nmāmakāḥ pāṇḍavāś caiva\nkim akurvata sañjaya",
            english: "Dhritarashtra said: O Sanjaya, after my sons and the sons of Pandu assembled in the place of pilgrimage at Kurukshetra, desiring to fight, what did they do?",
            commentary: "This opening verse sets the stage for the great dialogue. Kurukshetra, the field of dharma, represents not just a physical battlefield but the eternal struggle between right and wrong within each soul."
        ),
        Verse(
            id: 2,
            chapter: 2,
            verse: 47,
            sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
            transliteration: "karmaṇy evādhikāras te\nmā phaleṣu kadācana\nmā karma-phala-hetur bhūr\nmā te saṅgo 'stv akarmaṇi",
            english: "You have a right to perform your prescribed duty, but do not consider yourself entitled to the fruits of action. Never think yourself the cause of the results of your activities, and never be attached to not doing your duty.",
            commentary: "This is one of the most famous verses of the Gita, teaching the principle of nishkama karma - action without attachment to results."
        ),
        Verse(
            id: 3,
            chapter: 6,
            verse: 5,
            sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥",
            transliteration: "uddhared ātmanātmānaṁ\nnātmānam avasādayet\nātmaiva hy ātmano bandhur\nātmaiva ripur ātmanaḥ",
            english: "One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.",
            commentary: "This verse emphasizes self-responsibility and the dual nature of the mind - it can be our greatest ally or our worst enemy, depending on how we train it."
        )
    ]
}