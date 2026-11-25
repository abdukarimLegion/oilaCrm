-- ============================================
-- Оилавий Бюджет CRM — boshlang'ich sxema
-- ============================================

CREATE TABLE category (
    id             VARCHAR(63) PRIMARY KEY,
    name_cyrl      VARCHAR(255) NOT NULL,
    name_latn      VARCHAR(255) NOT NULL,
    type           VARCHAR(16)  NOT NULL CHECK (type IN ('income', 'expense')),
    icon           VARCHAR(64)  NOT NULL DEFAULT 'MoreHorizontal',
    color          VARCHAR(32)  NOT NULL DEFAULT '#64748B',
    monthly_budget BIGINT,
    daily_budget   BIGINT,
    weekly_budget  BIGINT
);

CREATE TABLE wallet (
    id        VARCHAR(63) PRIMARY KEY,
    name_cyrl VARCHAR(255) NOT NULL,
    name_latn VARCHAR(255) NOT NULL,
    type      VARCHAR(16)  NOT NULL CHECK (type IN ('cash', 'card', 'bank', 'savings')),
    balance   BIGINT       NOT NULL DEFAULT 0,
    currency  VARCHAR(8)   NOT NULL DEFAULT 'UZS',
    color     VARCHAR(32)  NOT NULL DEFAULT '#64748B'
);

CREATE TABLE family_member (
    id           VARCHAR(63) PRIMARY KEY,
    name_cyrl    VARCHAR(255) NOT NULL,
    name_latn    VARCHAR(255) NOT NULL,
    role_cyrl    VARCHAR(255) NOT NULL DEFAULT '',
    role_latn    VARCHAR(255) NOT NULL DEFAULT '',
    avatar_color VARCHAR(32)  NOT NULL DEFAULT '#64748B'
);

CREATE TABLE transaction (
    id                VARCHAR(63) PRIMARY KEY,
    date              DATE        NOT NULL,
    amount            BIGINT      NOT NULL,
    type              VARCHAR(16) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id       VARCHAR(63) NOT NULL REFERENCES category (id),
    wallet_id         VARCHAR(63) NOT NULL REFERENCES wallet (id),
    member_id         VARCHAR(63) NOT NULL REFERENCES family_member (id),
    note              TEXT,
    currency          VARCHAR(8),
    original_amount   BIGINT,
    tags              TEXT,
    is_recurring      BOOLEAN     NOT NULL DEFAULT FALSE,
    recurring_item_id VARCHAR(63)
);

CREATE INDEX idx_transaction_date ON transaction (date DESC);
CREATE INDEX idx_transaction_category ON transaction (category_id);
CREATE INDEX idx_transaction_wallet ON transaction (wallet_id);

CREATE TABLE savings_goal (
    id                   VARCHAR(63) PRIMARY KEY,
    title_cyrl           VARCHAR(255) NOT NULL,
    title_latn           VARCHAR(255) NOT NULL,
    target_amount        BIGINT       NOT NULL DEFAULT 0,
    current_amount       BIGINT       NOT NULL DEFAULT 0,
    monthly_contribution BIGINT       NOT NULL DEFAULT 0,
    target_date          DATE,
    category             VARCHAR(127),
    icon                 VARCHAR(64)  NOT NULL DEFAULT 'Target',
    color                VARCHAR(32)  NOT NULL DEFAULT '#10B981',
    priority             VARCHAR(16)  NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes                TEXT
);

CREATE TABLE goal_contribution (
    id       VARCHAR(63) PRIMARY KEY,
    goal_id  VARCHAR(63) NOT NULL REFERENCES savings_goal (id) ON DELETE CASCADE,
    date     DATE        NOT NULL,
    amount   BIGINT      NOT NULL,
    note     TEXT,
    wallet_id VARCHAR(63),
    type     VARCHAR(16) NOT NULL DEFAULT 'deposit' CHECK (type IN ('deposit', 'withdrawal'))
);

CREATE INDEX idx_contribution_goal ON goal_contribution (goal_id);

CREATE TABLE contact (
    id           VARCHAR(63) PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    phone        VARCHAR(63)  NOT NULL,
    telegram     VARCHAR(127),
    whatsapp     VARCHAR(127),
    notes        TEXT,
    avatar_color VARCHAR(32)  NOT NULL DEFAULT '#64748B'
);

CREATE TABLE debt (
    id               VARCHAR(63) PRIMARY KEY,
    contact_id       VARCHAR(63) REFERENCES contact (id),
    person_name      VARCHAR(255) NOT NULL,
    phone            VARCHAR(63)  NOT NULL DEFAULT '',
    telegram         VARCHAR(127),
    whatsapp         VARCHAR(127),
    type             VARCHAR(16)  NOT NULL CHECK (type IN ('they_owe', 'i_owe')),
    total_amount     BIGINT       NOT NULL DEFAULT 0,
    paid_amount      BIGINT       NOT NULL DEFAULT 0,
    remaining_amount BIGINT       NOT NULL DEFAULT 0,
    given_date       DATE,
    due_date         DATE,
    status           VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'settled', 'overdue')),
    notes            TEXT,
    source_type      VARCHAR(16)  NOT NULL DEFAULT 'wallet',
    source_id        VARCHAR(63),
    settled_date     DATE
);

CREATE TABLE debt_payment (
    id          VARCHAR(63) PRIMARY KEY,
    debt_id     VARCHAR(63) NOT NULL REFERENCES debt (id) ON DELETE CASCADE,
    date        DATE        NOT NULL,
    amount      BIGINT      NOT NULL,
    note        TEXT,
    target_type VARCHAR(16) NOT NULL DEFAULT 'wallet' CHECK (target_type IN ('wallet', 'goal')),
    target_id   VARCHAR(63)
);

CREATE INDEX idx_debt_payment_debt ON debt_payment (debt_id);

CREATE TABLE recurring_item (
    id                    VARCHAR(63) PRIMARY KEY,
    title                 VARCHAR(255) NOT NULL,
    amount                BIGINT       NOT NULL DEFAULT 0,
    type                  VARCHAR(16)  NOT NULL CHECK (type IN ('income', 'expense')),
    frequency             VARCHAR(16)  NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    due_day_of_month      INT          NOT NULL DEFAULT 1,
    category_id           VARCHAR(63)  NOT NULL REFERENCES category (id),
    wallet_id             VARCHAR(63)  NOT NULL REFERENCES wallet (id),
    member_id             VARCHAR(63)  NOT NULL REFERENCES family_member (id),
    last_paid_date        DATE,
    auto_post             BOOLEAN      NOT NULL DEFAULT FALSE,
    last_auto_posted_date VARCHAR(7),
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    notes                 TEXT
);

CREATE TABLE app_setting (
    key   VARCHAR(63) PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);
