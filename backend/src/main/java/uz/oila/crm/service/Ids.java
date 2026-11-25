package uz.oila.crm.service;

import uz.oila.crm.domain.Transaction;

import java.util.concurrent.ThreadLocalRandom;

public final class Ids {

    private Ids() {
    }

    public static String newId(String prefix) {
        long ts = System.currentTimeMillis();
        String rand = Long.toString(ThreadLocalRandom.current().nextLong(36028797018963968L, Long.MAX_VALUE), 36)
                .substring(0, 6);
        return prefix + ts + rand;
    }
}
