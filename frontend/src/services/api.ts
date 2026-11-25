/**
 * РАМ API client — Spring Boot backend (backend/) ga moslash.
 * Barcha so'rovlar `/api/...` ostida, prod da nginx orqali proksi qilinadi.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function http<T>(
    method: string,
    path: string,
    body?: unknown
): Promise<T> {
    const res = await fetch(`${BASE}/api${path}`, {
        method,
        headers: body !== undefined ? {'Content-Type': 'application/json'} : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) {
        return undefined as T;
    }

    if (!res.ok) {
        let message = `Xatolik: ${res.status}`;
        try {
            const data = await res.json();
            if (data && data.message) message = data.message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return (await res.json()) as T;
}

// ---------- Bootstrap ----------

export const bootstrap = () => http<Bootstrap>('GET', '/bootstrap');

export interface Bootstrap {
    categories: import('../types').Category[];
    wallets: import('../types').Wallet[];
    members: import('../types').FamilyMember[];
    transactions: import('../types').Transaction[];
    goals: import('../types').SavingsGoal[];
    debts: import('../types').Debt[];
    contacts: import('../types').Contact[];
    recurringItems: import('../types').RecurringItem[];
    settings: {
        exchangeRate: number;
        monthlyBudgetLimit: number;
        alertAt80: boolean;
        alertAt100: boolean;
    };
    serverDate: string;
}

// ---------- Transactions ----------

export const transactions = {
    create: (body: Partial<import('../types').Transaction>) =>
        http<import('../types').Transaction>('POST', '/transactions', body),
    update: (id: string, body: Partial<import('../types').Transaction>) =>
        http<import('../types').Transaction>('PUT', `/transactions/${id}`, body),
    remove: (id: string) => http<void>('DELETE', `/transactions/${id}`),
};

// ---------- Categories (budget limits) ----------

export const categories = {
    updateBudgets: (
        id: string,
        budgets: { dailyBudget?: number; weeklyBudget?: number; monthlyBudget?: number }
    ) => http<import('../types').Category>('PUT', `/categories/${id}/budgets`, budgets),
};

// ---------- Wallets ----------

export const wallets = {
    create: (body: Partial<import('../types').Wallet>) =>
        http<import('../types').Wallet>('POST', '/wallets', body),
    update: (id: string, body: Partial<import('../types').Wallet>) =>
        http<import('../types').Wallet>('PUT', `/wallets/${id}`, body),
};

// ---------- Goals ----------

export const goals = {
    create: (body: Partial<import('../types').SavingsGoal>) =>
        http<import('../types').SavingsGoal>('POST', '/goals', body),
    update: (id: string, body: Partial<import('../types').SavingsGoal>) =>
        http<import('../types').SavingsGoal>('PUT', `/goals/${id}`, body),
    remove: (id: string) => http<void>('DELETE', `/goals/${id}`),
    contribute: (
        id: string,
        body: { amount: number; walletId?: string; note?: string; type: 'deposit' | 'withdrawal' }
    ) => http<import('../types').SavingsGoal>('POST', `/goals/${id}/contributions`, body),
};

// ---------- Contacts ----------

export const contacts = {
    create: (body: Partial<import('../types').Contact>) =>
        http<import('../types').Contact>('POST', '/contacts', body),
    update: (id: string, body: Partial<import('../types').Contact>) =>
        http<import('../types').Contact>('PUT', `/contacts/${id}`, body),
    remove: (id: string) => http<void>('DELETE', `/contacts/${id}`),
};

// ---------- Debts ----------

export const debts = {
    create: (body: Partial<import('../types').Debt>) =>
        http<import('../types').Debt>('POST', '/debts', body),
    update: (id: string, body: Partial<import('../types').Debt>) =>
        http<import('../types').Debt>('PUT', `/debts/${id}`, body),
    remove: (id: string) => http<void>('DELETE', `/debts/${id}`),
    settle: (
        id: string,
        body: { targetType?: 'wallet' | 'goal'; targetId?: string }
    ) => http<import('../types').Debt>('POST', `/debts/${id}/settle`, body),
    payPartial: (
        id: string,
        body: { amount: number; targetType: 'wallet' | 'goal'; targetId: string; note?: string }
    ) => http<import('../types').Debt>('POST', `/debts/${id}/payments`, body),
};

// ---------- Recurring ----------

export const recurring = {
    create: (body: Partial<import('../types').RecurringItem>) =>
        http<import('../types').RecurringItem>('POST', '/recurring', body),
    update: (id: string, body: Partial<import('../types').RecurringItem>) =>
        http<import('../types').RecurringItem>('PUT', `/recurring/${id}`, body),
    remove: (id: string) => http<void>('DELETE', `/recurring/${id}`),
    pay: (id: string, date?: string) =>
        http<import('../types').RecurringItem>(
            'POST',
            `/recurring/${id}/pay${date ? `?date=${date}` : ''}`
        ),
};

// ---------- Settings ----------

export const settings = {
    update: (body: {
        exchangeRate?: number;
        monthlyBudgetLimit?: number;
        alertAt80?: boolean;
        alertAt100?: boolean;
    }) => http<Bootstrap['settings']>('PUT', '/settings', body),
};

// ---------- Rates ----------

export const rates = {
    get: () =>
        http<{ source: string; USD: number; EUR: number; RUB: number }>('GET', '/rates'),
};

// ---------- AI ----------

export const ai = {
    scanReceipt: (image: string, mimeType?: string) =>
        http<ReceiptScanResult>('POST', '/ai/scan-receipt', {image, mimeType}),
    budgetForecast: (payload: unknown) =>
        http<{ suggestions: Array<{ categoryId: string; suggestedLimit: number; reasoning: string }>; summary: string }>(
            'POST',
            '/ai/budget-forecast',
            payload
        ),
};

export interface ReceiptScanResult {
    merchant: string;
    date: string;
    amount: number;
    currency: string;
    categorySuggestion?: string;
    lineItems?: Array<{ name: string; price: number; qty: number }>;
    rawText?: string;
    confidence?: string;
}

// ---------- Dev ----------

export const dev = {
    reset: () => http<{ status: string }>('POST', '/dev/reset'),
};
