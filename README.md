# Оилавий Бюджет CRM

Оила молиявичилиғини бошқарувчи CRM тизими — даромад/харажат ҳисоби, мақсадли жамғармалар, қарз дефтери, муддатли тўловлар ва AI таҳлили.

## Arxitektura

Uch qatlamli klassik web-ilova: nginx (frontend) → Spring Boot REST API → PostgreSQL.

| Qism | Texnologiya |
|------|-------------|
| Backend | Java 21, Spring Boot 3.5.6, Gradle (Kotlin DSL) |
| Ma'lumotlar bazasi | PostgreSQL 16, Flyway migratsiyalari, `ddl-auto: validate` |
| Frontend | React 19, TypeScript, Vite 8, React Router 7, TanStack Query 5 |
| Til | i18next: o'zbekcha (kirill/lotin), ruscha, inglizcha |
| Deploy | Docker Compose, nginx 1.27, GitHub Actions → ghcr.io → SSH |

```
┌────────────┐    /api/*     ┌────────────────┐   Flyway   ┌──────────────┐
│  nginx     │ ────────────► │ Spring Boot 3.5│ ─────────► │ PostgreSQL 16│
│ (frontend) │   reverse     │  REST API      │  validatsiya│  (pgdata)   │
└────────────┘    proxy      └────────────────┘            └──────────────┘
```

## Loyiha tuzilishi

```
oilacrm/
├── backend/                Java 21 + Spring Boot 3.5.6
│   ├── build.gradle.kts
│   └── src/main/
│       ├── java/uz/oila/crm/
│       │   ├── api/        REST controllers (bootstrap, transactions, goals...)
│       │   ├── domain/     JPA entity-lar
│       │   ├── repo/       Spring Data repositorylar
│       │   ├── service/    Biznes-logika (ledger, debt, recurring, seed...)
│       │   └── config/
│       └── resources/
│           ├── application.yml
│           └── db/migration/   V1__schema.sql, V2__seed.sql (Flyway)
├── frontend/               React 19 + Vite + TanStack Query + i18next
│   ├── src/services/api.ts — REST client
│   ├── src/context/AppContext.tsx — full-stack state (backend bilan sinxron)
│   └── nginx.conf          prod nginx (SPA + /api proksi)
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

## Lokal ishlatish

### 1. Backend (Java 21 + PostgreSQL talab qiladi)

```bash
cd backend
export DB_HOST=localhost DB_PORT=5432 DB_NAME=oilacrm DB_USER=oilacrm DB_PASSWORD=oilacrm
./gradlew bootRun
# API: http://localhost:8080/api/health
```

 Bazani docker bilan yaratib oling:

```bash
docker run -d --name oilacrm-db -p 5432:5432 \
  -e POSTGRES_DB=oilacrm -e POSTGRES_USER=oilacrm -e POSTGRES_PASSWORD=oilacrm \
  postgres:16-alpine
```

### 2. Frontend (Vite dev server, proksi bilan)

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 — /api so'rovlari 8080 ga proksi qilinadi
```

### 3. Butun stack docker bilan

```bash
cp .env.example .env         # sozlanmalarni ko'rib chiqing
docker compose up -d --build # db + backend + frontend (nginx 1.27)
# http://localhost
```

## REST API

Barcha endpointlar `/api` prefiksi bilan:

| Method | Endpoint | Vazifa |
|--------|----------|--------|
| GET | `/api/bootstrap` | Butun domen holati (bir so'rovda) |
| POST/PUT/DELETE | `/api/transactions` | Транзакция CRUD + ҳамён балансы |
| PUT | `/api/categories/{id}/budgets` | Кунлик/ҳафталик/ойлик лимитлар |
| POST/PUT | `/api/wallets` | Ҳамён CRUD |
| POST | `/api/goals`, `/api/goals/{id}/contributions` | Мақсад + бадал/чиқим |
| POST | `/api/debts`, `/{id}/settle`, `/{id}/payments` | Қарз дефтери |
| CRUD | `/api/recurring` | Муддатли тўловлар + auto-post |
| PUT | `/api/settings` | Курс, oylik limit, alertlar |
| GET | `/api/rates` | CBU.uz valyuta kurslari (proxy) |
| POST | `/api/ai/scan-receipt`, `/api/ai/budget-forecast` | Илтдан AI (ixtiyoriy GEMINI_API_KEY) |
| POST | `/api/dev/reset` | Demo ma'lumotlarni qayta yuklash |

## Deploy (GitHub Actions → ghcr.io → SSH)

`main` branchga push bo'lsa:
1. Backend test + build, frontend typecheck + build
2. Docker imagelar `ghcr.io/<owner>/oilacrm-{backend,frontend}:latest` ga push
3. SSH orqali serverda `docker compose pull && docker compose up -d`

Kerakli secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`.
Serverda `.env` deploy katalogida bo'lishi kerak (`.env.example` mos).

## AI funksiyalar

`GEMINI_API_KEY` env bo'lmasa — Smart Receipt Scanner va Budget Forecast demo rejimida ishlaydi. Bo'lsa — real AI javoblari qaytadi.

## Til qo'llab-quvvatlash (i18next)

1043 tarjima kaliti `frontend/src/constants/translations.ts` da; `i18next` resource bundle sifatida ulandi.
`uz_cyrl` (kirill), `uz_latn` (lotin), `ru`, `en` tillari mavjud.
