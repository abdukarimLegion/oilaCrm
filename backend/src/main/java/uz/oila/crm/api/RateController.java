package uz.oila.crm.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.oila.crm.service.RateService;

import java.util.Map;

/**
 * Валюта kurslari — CBU.uz proxy (frontend'da CORS hato qilmaydi).
 */
@RestController
@RequestMapping("/api/rates")
public class RateController {

    private final RateService rates;

    public RateController(RateService rates) {
        this.rates = rates;
    }

    @GetMapping
    public Map<String, Object> get() {
        return rates.getRates();
    }
}
