package uz.oila.crm.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Demo ma'lumotlarni qayta yuklaydi (resetToSampleData funksiyasi backend ekvivalenti).
 */
@Service
@RequiredArgsConstructor
public class SeedService {

    private final JdbcTemplate jdbc;

    /**
     * Barcha jadvalni bo'shatib, V2__seed.sql dagi ma'lumotlarni qayta yuklaydi.
     */
    @Transactional
    public void reset() {
        jdbc.execute("""
                TRUNCATE debt_payment, debt, goal_contribution, savings_goal, transaction,
                          recurring_item, contact, wallet, family_member, category, app_setting
                RESTART IDENTITY CASCADE""");

        try (var in = getClass().getResourceAsStream("/db/migration/V2__seed.sql")) {
            if (in == null) {
                throw new IllegalStateException("V2__seed.sql classpath'da topilmadi");
            }
            String sql = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            for (String stmt : splitStatements(sql)) {
                jdbc.execute(stmt);
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Seed qayta yuklashda xatolik", e);
        }
    }

    private List<String> splitStatements(String sql) {
        List<String> list = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        for (String line : sql.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("--")) continue;
            current.append(line).append("\n");
            if (trimmed.endsWith(";")) {
                String stmt = current.toString().trim();
                current.setLength(0);
                if (stmt.length() > 1) {
                    list.add(stmt.substring(0, stmt.length() - 1));
                }
            }
        }
        String rest = current.toString().trim();
        if (!rest.isEmpty()) list.add(rest);
        return list;
    }
}
