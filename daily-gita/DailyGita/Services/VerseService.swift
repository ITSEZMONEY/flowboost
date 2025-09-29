import Foundation
import Combine

class VerseService: ObservableObject {
    @Published var currentVerse: Verse?
    @Published var aiInsight: String = ""
    @Published var journalPrompt: String = ""
    @Published var isLoading: Bool = false
    @Published var error: String?

    private let baseURL = "https://api.anthropic.com/v1/messages"
    private let apiKey = Bundle.main.object(forInfoDictionaryKey: "CLAUDE_API_KEY") as? String ?? ""

    // MARK: - Core Functions

    func loadDailyVerse() async {
        await MainActor.run {
            isLoading = true
            error = nil
        }

        do {
            let verse = getDailyVerse()
            let insight = await generateAIInsight(for: verse)
            let prompt = await generateJournalPrompt(for: verse, insight: insight)

            await MainActor.run {
                self.currentVerse = verse
                self.aiInsight = insight
                self.journalPrompt = prompt
                self.isLoading = false
            }

            // Cache for offline access
            await cacheVerse(verse, insight: insight, prompt: prompt)

        } catch {
            await MainActor.run {
                self.error = error.localizedDescription
                self.isLoading = false
                // Load cached data as fallback
                self.loadCachedVerse()
            }
        }
    }

    private func getDailyVerse() -> Verse {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let verseIndex = (dayOfYear - 1) % Verse.sampleVerses.count
        return Verse.sampleVerses[verseIndex]
    }

    // MARK: - AI Integration

    private func generateAIInsight(for verse: Verse) async -> String {
        guard !apiKey.isEmpty else {
            return generateFallbackInsight(for: verse)
        }

        let prompt = """
        Provide a modern, practical insight (100-200 words) for this Bhagavad Gita verse. Focus on how someone today can apply this wisdom to reduce stress, find clarity, and live with more purpose. Be culturally sensitive and avoid religious preaching. Make it relatable to urban professionals, yoga practitioners, and spiritual seekers.

        Verse: \(verse.english)

        Original Sanskrit: \(verse.sanskrit)

        Keep the tone warm, accessible, and transformative. End with a practical takeaway they can implement today.
        """

        do {
            let insight = try await callClaudeAPI(prompt: prompt)
            return insight
        } catch {
            print("Claude API error: \(error)")
            return generateFallbackInsight(for: verse)
        }
    }

    private func generateJournalPrompt(for verse: Verse, insight: String) async -> String {
        guard !apiKey.isEmpty else {
            return generateFallbackPrompt(for: verse)
        }

        let prompt = """
        Create a reflective journaling prompt (1-2 questions) based on this Gita verse and modern insight. The prompt should help someone examine their life, identify areas for growth, and apply the verse's wisdom practically. Keep it personal and actionable.

        Verse: \(verse.english)
        Insight: \(insight)

        Format as open-ended questions that encourage self-reflection without being preachy.
        """

        do {
            let journalPrompt = try await callClaudeAPI(prompt: prompt)
            return journalPrompt
        } catch {
            print("Claude API error for prompt: \(error)")
            return generateFallbackPrompt(for: verse)
        }
    }

    private func callClaudeAPI(prompt: String) async throws -> String {
        guard let url = URL(string: baseURL) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

        let requestBody = ClaudeRequest(
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 300,
            messages: [
                ClaudeMessage(role: "user", content: prompt)
            ]
        )

        request.httpBody = try JSONEncoder().encode(requestBody)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }

        let claudeResponse = try JSONDecoder().decode(ClaudeResponse.self, from: data)
        return claudeResponse.content.first?.text ?? ""
    }

    // MARK: - Fallback Content

    private func generateFallbackInsight(for verse: Verse) -> String {
        switch verse.id {
        case 1:
            return "Life constantly presents us with battles between our higher and lower nature. This verse reminds us that every challenge is an opportunity to choose dharma - righteous action aligned with our values. When facing difficult decisions today, pause and ask: 'What would my highest self do?' The battlefield of Kurukshetra exists within each of us, and every moment offers a chance to fight for what's right."

        case 2:
            return "This profound teaching liberates us from the anxiety of outcomes. In our achievement-driven world, we often tie our worth to results we can't fully control. Krishna teaches that our power lies in wholehearted action, not in forcing specific outcomes. Today, focus on giving your best effort while releasing attachment to how things unfold. This paradox - caring deeply while holding lightly - is the secret to both effectiveness and inner peace."

        case 3:
            return "Your mind can be your greatest ally or your worst enemy. This verse emphasizes the power of self-responsibility - no one else can rescue you from negative thought patterns or limiting beliefs. The good news? You have the tools to train your mind toward clarity and strength. Start today by observing your thoughts without judgment, then consciously choose ones that serve your growth. Small daily practices compound into profound transformation."

        default:
            return "This ancient wisdom speaks to timeless human challenges we still face today. The Gita's teachings on duty, detachment, and spiritual growth offer practical guidance for navigating modern stress and uncertainty. Take a moment to reflect on how this verse's message might apply to your current circumstances and relationships."
        }
    }

    private func generateFallbackPrompt(for verse: Verse) -> String {
        switch verse.id {
        case 1:
            return "What internal battles between right and wrong are you facing right now? How can you choose to act from your highest values today, even in small ways?"

        case 2:
            return "Where in your life are you too attached to specific outcomes? What would change if you focused fully on your effort while releasing control over results?"

        case 3:
            return "When has your mind been your enemy versus your friend recently? What small step can you take today to train your thoughts toward greater clarity and positivity?"

        default:
            return "How does this verse's wisdom apply to a challenge you're currently facing? What practical action can you take today to embody this teaching?"
        }
    }

    // MARK: - Caching & Offline Support

    private func cacheVerse(_ verse: Verse, insight: String, prompt: String) async {
        let cacheData = CachedVerseData(
            verse: verse,
            insight: insight,
            prompt: prompt,
            cachedAt: Date()
        )

        if let encoded = try? JSONEncoder().encode(cacheData) {
            UserDefaults.standard.set(encoded, forKey: "dailyVerse_\(verse.id)")

            // Keep only last 10 cached verses
            var cachedIds = UserDefaults.standard.object(forKey: "cachedVerseIds") as? [Int] ?? []
            cachedIds.append(verse.id)
            if cachedIds.count > 10 {
                let removedId = cachedIds.removeFirst()
                UserDefaults.standard.removeObject(forKey: "dailyVerse_\(removedId)")
            }
            UserDefaults.standard.set(cachedIds, forKey: "cachedVerseIds")
        }
    }

    private func loadCachedVerse() {
        let dayOfYear = Calendar.current.ordinality(of: .day, in: .year, for: Date()) ?? 1
        let verse = getDailyVerse()

        if let cached = UserDefaults.standard.data(forKey: "dailyVerse_\(verse.id)"),
           let cacheData = try? JSONDecoder().decode(CachedVerseData.self, from: cached) {

            currentVerse = cacheData.verse
            aiInsight = cacheData.insight
            journalPrompt = cacheData.prompt
        } else {
            currentVerse = verse
            aiInsight = generateFallbackInsight(for: verse)
            journalPrompt = generateFallbackPrompt(for: verse)
        }
    }
}

// MARK: - Helper Types

private struct CachedVerseData: Codable {
    let verse: Verse
    let insight: String
    let prompt: String
    let cachedAt: Date
}

enum APIError: Error {
    case invalidURL
    case serverError
    case decodingError

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid API URL"
        case .serverError:
            return "Server error occurred"
        case .decodingError:
            return "Failed to decode response"
        }
    }
}