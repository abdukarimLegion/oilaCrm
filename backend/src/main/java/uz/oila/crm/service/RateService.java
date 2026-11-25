package uz.oila.crm.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Валюта kurslari: CBU.uz asosiy manba, open.er-api.com fallback.
 */
@Service
public class RateService {

    private final RestClient http;

    public RateService(RestClient http) {
        this.http = http;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getRates() {
        // 1) CBU.uz
        try {
            var items = http.get()
                    .uri("https://cbu.uz/uz/arkhiv-kursov-valyut/json/")
                    .retrieve()
                    .body(java.util.List.class);
            if (items != null) {
                Double usd = null;
                Double eur = null;
                Double rub = null;
                for (Object o : items) {
                    if (o instanceof Map<?, ?> m) {
                        String ccy = String.valueOf(m.get("Ccy"));
                        Double rate = parse(m.get("Rate"));
                        if ("USD".equals(ccy)) usd = rate;
                        else if ("EUR".equals(ccy)) eur = rate;
                        else if ("RUB".equals(ccy)) rub = rate;
                    }
                }
                if (usd != null) {
                    return Map.of(
                            "source", "cbu",
                            "USD", Math.round(usd),
                            "EUR", eur != null ? Math.round(eur) : 0,
                            "RUB", rub != null ? Math.round(rub * 10) / 10.0 : 0
                    );
                }
            }
        } catch (Exception ignored) {
        }

        // 2) Fallback: open.er-api.com
        try {
            var body = http.get()
                    .uri("https://open.er-api.com/v6/latest/USD")
                    .retrieve()
                    .body(Map.class);
            if (body != null && body.get("rates") instanceof Map<?, ?> ratesMap) {
                Object uzs = ratesMap.get("UZS");
                Object eur = ratesMap.get("EUR");
                Object rub = ratesMap.get("RUB");
                double uzsRate = uzs == null ? 12850.0 : Double.parseDouble(String.valueOf(uzs));
                double eurRate = eur == null ? 0.92 : Double.parseDouble(String.valueOf(eur));
                double rubRate = rub == null ? 93.0 : Double.parseDouble(String.valueOf(rub));
                return Map.of(
                        "source", "erapi",
                        "USD", Math.round(uzsRate),
                        "EUR", Math.round(uzsRate / eurRate),
                        "RUB", Math.round(uzsRate / rubRate * 10) / 10.0
                );
            }
        } catch (Exception ignored) {
        }

        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Kurs ma'lumotlari olinmadi");
    }

    private Double parse(Object value) {
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
