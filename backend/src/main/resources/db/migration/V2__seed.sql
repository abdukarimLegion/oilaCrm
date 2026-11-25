-- ==================================================
-- Boshlang'ich demo ma'lumotlar (frontend initialData.ts mos ravishda)
-- ==================================================

-- Toifalar (daromad)
INSERT INTO category (id, name_cyrl, name_latn, type, icon, color, monthly_budget, daily_budget, weekly_budget) VALUES
('inc_salary',    'Ойлик иш ҳақи',           'Oylik ish haqi',        'income', 'Briefcase',    '#10B981', NULL, NULL, NULL),
('inc_business',  'Савдо ва Бизнес',          'Savdo va Biznes',       'income', 'Store',        '#059669', NULL, NULL, NULL),
('inc_freelance', 'Фриланс ва Қўшимча',       'Frilans va Qoshimcha',  'income', 'Laptop',       '#34D399', NULL, NULL, NULL),
('inc_rent',      'Ижара тушуми',             'Ijara tushumi',         'income', 'Home',         '#047857', NULL, NULL, NULL),
('inc_other',     'Бошқа даромадлар',         'Boshqa daromadlar',     'income', 'PlusCircle',   '#6EE7B7', NULL, NULL, NULL),

-- Toifalar (xaarajat)
('exp_food',      'Озиқ-овқат & Бозор',       'Oziq-ovqat & Bozor',    'expense','ShoppingCart', '#EF4444', 4500000, 250000, 1100000),
('exp_utilities', 'Коммунал & Уй-жой',        'Kommunal & Uy-joy',     'expense','Zap',          '#F97316', 1200000, 150000,  400000),
('exp_transport', 'Транспорт & Ёқилғи',       'Transport & Yoqilgi',   'expense','Car',          '#F59E0B', 1800000, 120000,  450000),
('exp_education', 'Таълим & Болалар',         'Talim & Bolalar',       'expense','GraduationCap','#8B5CF6', 2500000, 200000,  700000),
('exp_health',    'Соғлиқ & Дорихона',        'Sogliq & Dorixona',     'expense','HeartPulse',   '#EC4899', 1000000, 100000,  300000),
('exp_clothes',   'Кийим-кечак',              'Kiyim-kechak',          'expense','Shirt',        '#6366F1', 1500000, 150000,  450000),
('exp_leisure',   'Ресторан & Ҳордиқ',        'Restoran & Hordiq',     'expense','Utensils',     '#14B8A6', 1200000, 150000,  350000),
('exp_tech',      'Техника & Харид',          'Texnika & Xarid',       'expense','Smartphone',   '#06B6D4', 1000000, 100000,  300000),
('exp_other',     'Бошқа харажатлар',         'Boshqa xarajatlar',     'expense','MoreHorizontal','#64748B',  800000,  80000,  250000);

-- Hamlonlar
INSERT INTO wallet (id, name_cyrl, name_latn, type, balance, currency, color) VALUES
('w_cash',    'Нақд пул (Ҳамён)',        'Naqd pul (Hamyon)',        'cash',    4850000,  'UZS', '#10B981'),
('w_uzcard',  'Uzcard (Ипотека банк)',   'Uzcard (Ipoteka bank)',    'card',   14200000,  'UZS', '#3B82F6'),
('w_humo',    'Humo (Алоқабанк)',        'Humo (Aloqabank)',         'card',    8650000,  'UZS', '#8B5CF6'),
('w_usd',     'Visa / Валюта ($)',       'Visa / Valyuta ($)',       'card',   19500000,  'UZS', '#F59E0B');

-- Оила аъзолари
INSERT INTO family_member (id, name_cyrl, name_latn, role_cyrl, role_latn, avatar_color) VALUES
('m_father', 'Акмал (Ота)',       'Akmal (Ota)',     'Оила бошлиғи', 'Oila boshligi', '#2563EB'),
('m_mother', 'Нилуфар (Она)',     'Nilufar (Ona)',   'Оила бекаси',  'Oila bekasi',   '#DB2777'),
('m_son',    'Жасур (Ўғли)',      'Jasur (Og''li)',  'Талаба',       'Talaba',        '#10B981'),
('m_family', 'Умумий харажат',    'Umumiy xarajat',  'Оилавий',      'Oilaviy',       '#64748B');

-- Алоқалар
INSERT INTO contact (id, name, phone, telegram, whatsapp, notes, avatar_color) VALUES
('c_sardor',   'Сардор Алимов (Дўстим)',            '+998901234567', 'sardor_alim',  '+998901234567', 'Дўкони бор, савдо билан шуғулланади',    '#3B82F6'),
('c_bobur',    'Бобур Қодиров (Ҳамкасб)',           '+998939876543', 'bobur_qodirov','+998939876543', 'Маркетинг бўлими ҳамкасбим',             '#F59E0B'),
('c_shahnoza', 'Шаҳноза опа (Қўшни)',               '+998915554433', 'shahnoza_opa', NULL,            '12-хонадон қўшнимиз',                    '#EC4899'),
('c_dilshod',  'Уста Дилшод (Ошхона ремонти)',      '+998977778899', 'dilshod_usta', NULL,            'Уй ремонти ва мебел устаси',             '#10B981'),
('c_ipoteka',  'Ипотека банки (Кредит)',            '1142',          NULL,           NULL,            'Автокредит бўлими',                      '#6366F1'),
('c_anvar',    'Анвар Каримов (Амакивачча)',        '+998903332211', 'anvar_karim',  NULL,            'Қариндош',                               '#8B5CF6');

-- Транзакциялар (октябрь 2026 намунавий)
INSERT INTO transaction (id, date, amount, type, category_id, wallet_id, member_id, note, tags) VALUES
('t_01', DATE '2026-10-27',   480000, 'expense', 'exp_food',      'w_uzcard', 'm_mother', 'Корзинка супермаркети - ҳафталик озиқ-овқат',        '["#shopping","#groceries"]'),
('t_02', DATE '2026-10-26',   260000, 'expense', 'exp_transport', 'w_cash',   'm_father', 'Автомобиль учун ёқилғи (Метан/Бензин)',              '["#urgent","#fuel"]'),
('t_03', DATE '2026-10-25',  3500000, 'income',  'inc_freelance', 'w_humo',   'm_father', 'IT хизматлари бўйича қўшимча гонорар',               '["#bonus","#work"]'),
('t_04', DATE '2026-10-24',   350000, 'expense', 'exp_leisure',   'w_humo',   'm_family', 'Оилавий кечки овқат (Миллий таомлар)',               '["#family","#gift"]'),
('t_05', DATE '2026-10-22',   150000, 'expense', 'exp_health',    'w_uzcard', 'm_mother', 'Дорихонадан витамин ва мавсумий дорилар',            '["#urgent","#health"]'),
('t_06', DATE '2026-10-20', 18500000, 'income',  'inc_salary',    'w_uzcard', 'm_father', 'Ойлик иш ҳақи (Асосий компаниядан)',                 '["#salary","#work"]'),
('t_07', DATE '2026-10-18',   620000, 'expense', 'exp_utilities', 'w_humo',   'm_father', 'Электр энергияси ва газ тўловлари',                  '["#bills","#urgent"]'),
('t_08', DATE '2026-10-16',  1200000, 'expense', 'exp_education', 'w_uzcard', 'm_son',    'Инглиз тили ва дастурлаш курслари тўлови',           '["#education","#urgent"]'),
('t_09', DATE '2026-10-15',  6500000, 'income',  'inc_salary',    'w_humo',   'm_mother', 'Нилуфарнинг ойлик маоши (Мактаб/Лицей)',             '["#salary","#work"]'),
('t_10', DATE '2026-10-12',   890000, 'expense', 'exp_clothes',   'w_cash',   'm_mother', 'Кузги кийимлар хариди',                              '["#shopping","#gift"]'),
('t_11', DATE '2026-10-10',   320000, 'expense', 'exp_food',      'w_cash',   'm_mother', 'Деҳқон бозори: мева, сабзавот, гўшт',                '["#groceries","#shopping"]'),
('t_12', DATE '2026-10-08',  2400000, 'income',  'inc_rent',      'w_cash',   'm_father', 'Сергелидаги квартиранинг ижара пули',                '["#rent"]'),
('t_13', DATE '2026-10-05',   450000, 'expense', 'exp_tech',      'w_humo',   'm_son',    'Компьютер аудиториалари ва сичқонча',                '["#tech","#shopping"]'),
('t_14', DATE '2026-10-02',   550000, 'expense', 'exp_food',      'w_uzcard', 'm_family', 'Ой бошидаги катта бозорлик',                         '["#groceries","#shopping"]');

-- Мақсадли жамғармалар
INSERT INTO savings_goal (id, title_cyrl, title_latn, target_amount, current_amount, monthly_contribution, target_date, category, icon, color, priority, notes) VALUES
('g_car',        'Янги автомобиль (Tracker 2)',          'Yangi avtomobil (Tracker 2)',          220000000, 115000000, 9500000, DATE '2027-09-01', 'Транспорт',         'Car',         '#3B82F6', 'high',   'Бошланғич тўлов ва нақд сотиб олиш мақсади'),
('g_umrah',      'Ота-она билан Умра зиёрати',           'Ota-ona bilan Umra ziyorati',           50000000,  36000000, 4500000, DATE '2027-02-15', 'Саёҳат / Зиёрат',   'Compass',     '#10B981', 'high',   '2027 йил баҳорида оилавий сафар'),
('g_renovation', 'Уй ремонтно таъмири (Меҳмонхона)',     'Uy remonti tamiri (Mehmonxona)',        35000000,  18000000, 3000000, DATE '2027-04-30', 'Уй-жой',            'Home',        '#F59E0B', 'medium', 'Обой, люстра ва юмшоқ мебеллар хариди'),
('g_emergency',  'Молиявий хавфсизлик ёстиқчаси',        'Moliyaviy xavfsizlik yostiqchasi',      40000000,  32000000, 2000000, DATE '2027-03-01', 'Хавфсизлик',        'ShieldCheck', '#8B5CF6', 'high',   '6 ойлик оилавий харажатлар захира фонди');

INSERT INTO goal_contribution (id, goal_id, date, amount, note, type) VALUES
('h_1',  'g_car',        DATE '2026-08-01', 9500000, 'Август ойи ажратмаси', 'deposit'),
('h_2',  'g_car',        DATE '2026-09-01', 9500000, 'Сентябрь ойи ажратмаси', 'deposit'),
('h_3',  'g_car',        DATE '2026-10-01', 9500000, 'Октябрь ойи ажратмаси', 'deposit'),
('h_u1', 'g_umrah',      DATE '2026-08-15', 4500000, 'Август ойи ажратмаси', 'deposit'),
('h_u2', 'g_umrah',      DATE '2026-09-15', 4500000, 'Сентябрь ойи ажратмаси', 'deposit'),
('h_u3', 'g_umrah',      DATE '2026-10-15', 4500000, 'Октябрь ойи ажратмаси', 'deposit'),
('h_r1', 'g_renovation', DATE '2026-09-10', 3000000, 'Сентябрь ажратмаси', 'deposit'),
('h_r2', 'g_renovation', DATE '2026-10-10', 3000000, 'Октябрь ажратмаси', 'deposit'),
('h_e1', 'g_emergency',  DATE '2026-10-01', 2000000, 'Октябрь захираси', 'deposit');

-- Қарзлар
INSERT INTO debt (id, contact_id, person_name, phone, telegram, whatsapp, type, total_amount, paid_amount, remaining_amount, given_date, due_date, status, notes, source_type, source_id, settled_date) VALUES
('d_1', 'c_sardor',   'Сардор Алимов (Дўстим)',       '+998901234567', 'sardor_alim',  '+998901234567', 'they_owe', 6500000, 1500000, 5000000, DATE '2026-09-01', DATE '2026-10-31', 'active',  'Дўконга янги товар олиш учун вақтинча ёрдам сўраган эди',        'wallet', 'w_uzcard', NULL),
('d_2', 'c_bobur',    'Бобур Қодиров (Ҳамкасб)',      '+998939876543', 'bobur_qodirov','+998939876543', 'they_owe', 3200000,       0, 3200000, DATE '2026-09-15', DATE '2026-10-20', 'overdue', 'Шошилинч телефон хариди учун олган, муддати ўтди',              'wallet', 'w_cash',   NULL),
('d_3', 'c_shahnoza', 'Шаҳноза опа (Қўшни)',          '+998915554433', 'shahnoza_opa', NULL,            'they_owe', 2000000,  500000, 1500000, DATE '2026-10-05', DATE '2026-11-15', 'active',  'Қизларининг тўй сарпосига ёрдам',                              'wallet', 'w_humo',   NULL),
('d_4', 'c_dilshod',  'Уста Дилшод (Ошхона ремонти)', '+998977778899', 'dilshod_usta', NULL,            'i_owe',    4000000, 1000000, 3000000, DATE '2026-10-10', DATE '2026-11-05', 'active',  'Ошхона мебеллари ва кафел ишларининг қолган ҳисоб-китоби',     'wallet', 'w_cash',   NULL),
('d_5', 'c_ipoteka',  'Ипотека банки (Автокредит ойлик тўлови)', '1142', NULL,          NULL,            'i_owe',    2800000,       0, 2800000, DATE '2026-10-01', DATE '2026-11-02', 'active',  'Ҳар ойнинг 2-санасигача тўланиши шарт бўлган график тўлови',   'wallet', 'w_uzcard', NULL),
('d_6', 'c_anvar',    'Анвар Каримов (Амакивачча)',   '+998903332211', 'anvar_karim',  NULL,            'they_owe', 2500000, 2500000,       0, DATE '2026-09-10', DATE '2026-10-15', 'settled', 'Ўқиш контракти учун вақтинча олган эди, тўлиқ ундирилди',       'wallet', 'w_uzcard', DATE '2026-10-15');

INSERT INTO debt_payment (id, debt_id, date, amount, note, target_type, target_id) VALUES
('p_1', 'd_1', DATE '2026-10-10', 1500000, 'Биринчи қисми картага ўтказилди', 'wallet', 'w_uzcard'),
('p_3', 'd_3', DATE '2026-10-20',  500000, 'Нақд пул билан қайтарди',         'wallet', 'w_cash'),
('p_4', 'd_4', DATE '2026-10-15', 1000000, 'Аванс берилган',                  'wallet', 'w_cash'),
('p_6', 'd_6', DATE '2026-10-15', 2500000, 'Тўлиқ картага қайтарди',          'wallet', 'w_uzcard');

-- Муддатли (такрорланувчи) тўловлар
INSERT INTO recurring_item (id, title, amount, type, frequency, due_day_of_month, category_id, wallet_id, member_id, last_paid_date, auto_post, last_auto_posted_date, is_active, notes) VALUES
('rec_1', 'Фитнес клуб ойлик абонементи',                450000, 'expense', 'monthly', 28, 'exp_health',    'w_humo',    'm_father', NULL,               TRUE,  NULL,        TRUE, 'Зал ва бассейн ойлик картаси (Авто-тўлов)'),
('rec_2', 'Мобил алоқа оилавий абонент тўлови',          240000, 'expense', 'monthly', 30, 'exp_tech',      'w_uzcard',  'm_family', NULL,               TRUE,  NULL,        TRUE, 'Beeline оилавий тариф режаси (Авто-тўлов)'),
('rec_3', 'Wi-Fi ва Уй интернети (Optika)',              180000, 'expense', 'monthly',  1, 'exp_utilities', 'w_humo',    'm_father', DATE '2026-10-01',  TRUE,  '2026-10',  TRUE, '100 Мбит/с чексиз интернет'),
('rec_4', 'Коммунал тўловлар (Электр, Газ, Сув)',         650000, 'expense', 'monthly', 10, 'exp_utilities', 'w_uzcard',  'm_father', NULL,               TRUE,  NULL,        TRUE, 'Ойнинг 10-санасигача тўланади');

-- Sozlanmalar (settings)
INSERT INTO app_setting (key, value) VALUES
('exchange_rate', '12850'),
('monthly_budget_limit', '6500000'),
('alert_at_80', 'true'),
('alert_at_100', 'true');
