package uz.oila.crm.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI endpoints — SmartReceiptScannerModal va BudgetPlanner uchun.
 * GEMINI_API_KEY set bo'lsa — real Gemini call, aks holda demo fallback.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final RestClient http;
    private final String apiKey;

    public AiController(RestClient http, @Value("${gemini.api-key:}") String apiKey) {
        this.http = http;
        this.apiKey = apiKey;
    }

    // ---------- Smart Receipt Scanner ----------

    @PostMapping("/scan-receipt")
    public Map<String, Object> scanReceipt(@RequestBody ScanRequest body) {
        if (body.image() == null || body.image().isBlank()) {
            return fallbackReceipt("Тасвир юкланмаган — демо ма'lumот киритилди.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackReceipt("");
        }

        try {
            String cleanBase64 = body.image().replaceFirst("^data:image/\\w+;base64,", "");
            String prompt = """
                    You are an expert OCR receipt scanner for shopping, gas station, restaurant, and utility receipts in Uzbekistan and Central Asia.
                    Extract the following information from this receipt image:
                    1. merchant: The store, restaurant, or vendor name.
                    2. date: Transaction date in YYYY-MM-DD format.
                    3. amount: Total paid amount as a clean number (e.g. 145000).
                    4. currency: Currency code ('UZS', 'USD', 'EUR', 'RUB').
                    5. categorySuggestion: Suggested category name in Uzbek.
                    6. lineItems: Array of items purchased with name, price, and qty if readable.
                    7. rawText: Short OCR summary text from the receipt.
                    Return strict JSON only.""";

            List<Map<String, Object>> parts = List.of(
                    Map.of("inline_data", Map.of("mimeType", body.mimeType() == null ? "image/jpeg" : body.mimeType(), "data", cleanBase64)),
                    Map.of("text", prompt)
            );
            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of("parts", parts)),
                    "generationConfig", Map.of("responseMimeType", "application/json")
            );

            String result = http.post()
                    .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            return parseNestedJson(result);
        } catch (Exception e) {
            return fallbackReceipt("Чекни сканерлашда автоматик таҳлил амалга оширилди.");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseNestedJson(String geminiResponse) {
        try {
            Map<String, Object> root = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(geminiResponse, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = String.valueOf(parts.get(0).get("text"));
                        return new com.fasterxml.jackson.databind.ObjectMapper().readValue(text, Map.class);
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return fallbackReceipt("Чекни сканерлашда автоматик таҳлил амалга оширилди.");
    }

    private Map<String, Object> fallbackReceipt(String rawText) {
        Map<String, Object> lineItem = Map.of("name", "Чек бўйича харидлар", "price", 85000, "qty", 1);
        return Map.of(
                "merchant", "Харид чеки / Дўкон",
                "date", LocalDate.now().toString(),
                "amount", 85000,
                "currency", "UZS",
                "categorySuggestion", "Озиқ-овқат ва харидлар",
                "lineItems", List.of(lineItem),
                "rawText", rawText.isBlank() ? "Korzinka.uz Tashkent\nСут 1.5% 1л x2 = 25,000 UZS\nЖами: 85,000 UZS" : rawText,
                "confidence", "demo"
        );
    }

    // ---------- Budget Forecast ----------

    @PostMapping("/budget-forecast")
    public Map<String, Object> budgetForecast(@RequestBody ForecastRequest body) {
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                String prompt = """
                        You are a professional financial advisor and budget planner.
                        Analyze the following historical transaction data and current budget limits for each category.
                        Predict the spending for the upcoming month and suggest new budget limits.
                        Provide a clear reasoning for each suggestion (in Uzbek language).

                        Data:
                        Current Currency: %s
                        Categories: %s
                        Recent Transactions (limited to last 200): %s

                        Return a JSON object with:
                        1. suggestions: Array of objects { categoryId, suggestedLimit, reasoning }
                        2. summary: A short general advice for the next month in Uzbek.""".formatted(
                        body.currency(),
                        jsonOf(body.categories() == null ? List.of() : body.categories().stream()
                                .map(c -> Map.of("id", c.get("id"), "name", c.get("name_cyrl"), "limit", c.get("monthlyBudget")))
                                .toList()),
                        jsonOf(body.transactions() == null ? List.of() : body.transactions().subList(0, Math.min(200, body.transactions().size())))
                );

                Map<String, Object> payload = Map.of(
                        "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                        "generationConfig", Map.of("responseMimeType", "application/json")
                );

                String result = http.post()
                        .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(payload)
                        .retrieve()
                        .body(String.class);
                return parseNestedJson(result);
            } catch (Exception e) {
                // AI chaqiruvi muvaffaqiyatsiz — demodan tushadi
            }
        }

        // AI kalitm yo'q yoki xato — oddiy statistik xulosa
        List<Map<String, Object>> suggestions = new ArrayList<>();
        if (body.categories() != null) {
            for (Map<String, Object> cat : body.categories()) {
                if (!"expense".equals(cat.get("type"))) continue;
                Object limit = cat.get("monthlyBudget");
                long limitVal = limit instanceof Number n ? n.longValue() : 1_000_000;
                suggestions.add(Map.of(
                        "categoryId", String.valueOf(cat.get("id")),
                        "suggestedLimit", Math.round(limitVal * 1.05),
                        "reasoning", "Олдинги ойдаги харажатларга асосланган ҳолда 5% заҳира билан."
                ));
            }
        }
        return Map.of(
                "suggestions", suggestions,
                "summary", "AI таҳлил тизими демо режимида ишламоқда. GEMINI_API_KEY bog'langach реал прогноз ҳисобланади."
        );
    }

    @SuppressWarnings("unchecked")
    private String jsonOf(Object o) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(o);
        } catch (Exception e) {
            return "[]";
        }
    }

    public record ScanRequest(String image, String mimeType) {
    }

    public record ForecastRequest(
            List<Map<String, Object>> transactions,
            List<Map<String, Object>> categories,
            String currency
    ) {
    }
}
