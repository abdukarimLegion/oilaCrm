import { Category, Wallet, FamilyMember, Transaction, SavingsGoal, Debt, Contact, RecurringItem } from '../types';

export const DEFAULT_EXCHANGE_RATE = 12850; // 1 USD = 12,850 UZS
export const DEFAULT_MONTHLY_BUDGET_LIMIT = 6500000; // 6,500,000 UZS (~$505 USD default threshold)

export const INITIAL_RECURRING: RecurringItem[] = [
  {
    id: 'rec_1',
    title: 'Фитнес клуб ойлик абонементи',
    amount: 450000,
    type: 'expense',
    frequency: 'monthly',
    dueDayOfMonth: 28, // Due TODAY! (2026-10-28)
    categoryId: 'exp_health',
    walletId: 'w_humo',
    memberId: 'm_father',
    autoPost: true,
    isActive: true,
    notes: 'Зал ва бассейн ойлик картаси (Авто-тўлов)',
  },
  {
    id: 'rec_2',
    title: 'Мобил алоқа оилавий абонент тўлови',
    amount: 240000,
    type: 'expense',
    frequency: 'monthly',
    dueDayOfMonth: 30, // Due in 2 days! (Alert)
    categoryId: 'exp_tech',
    walletId: 'w_uzcard',
    memberId: 'm_family',
    autoPost: true,
    isActive: true,
    notes: 'Beeline оилавий тариф режаси (Авто-тўлов)',
  },
  {
    id: 'rec_3',
    title: 'Wi-Fi ва Уй интернети (Optika)',
    amount: 180000,
    type: 'expense',
    frequency: 'monthly',
    dueDayOfMonth: 1, // Due on 1st of month
    categoryId: 'exp_utilities',
    walletId: 'w_humo',
    memberId: 'm_father',
    autoPost: true,
    lastPaidDate: '2026-10-01',
    lastAutoPostedDate: '2026-10',
    isActive: true,
    notes: '100 Мбит/с чексиз интернет',
  },
  {
    id: 'rec_4',
    title: 'Коммунал тўловлар (Электр, Газ, Сув)',
    amount: 650000,
    type: 'expense',
    frequency: 'monthly',
    dueDayOfMonth: 10,
    categoryId: 'exp_utilities',
    walletId: 'w_uzcard',
    memberId: 'm_father',
    autoPost: true,
    lastPaidDate: '2026-10-10',
    lastAutoPostedDate: '2026-10',
    isActive: true,
    notes: 'Ҳар ойнинг 10-кунигача ҳисоблагич бўйича',
  },
  {
    id: 'rec_5',
    title: 'Ойлик иш ҳақи (Асосий компания)',
    amount: 18500000,
    type: 'income',
    frequency: 'monthly',
    dueDayOfMonth: 20,
    categoryId: 'inc_salary',
    walletId: 'w_uzcard',
    memberId: 'm_father',
    autoPost: true,
    lastPaidDate: '2026-10-20',
    lastAutoPostedDate: '2026-10',
    isActive: true,
    notes: 'Банк картасига тушадиган маош',
  },
  {
    id: 'rec_6',
    title: 'Квартира ижарасидан тушум',
    amount: 2400000,
    type: 'income',
    frequency: 'monthly',
    dueDayOfMonth: 8,
    categoryId: 'inc_rent',
    walletId: 'w_cash',
    memberId: 'm_father',
    autoPost: true,
    lastPaidDate: '2026-10-08',
    lastAutoPostedDate: '2026-10',
    isActive: true,
    notes: 'Сергелидаги квартира ижараси',
  },
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c_sardor',
    name: 'Сардор Алимов (Дўстим)',
    phone: '+998901234567',
    telegram: 'sardor_alim',
    whatsapp: '+998901234567',
    notes: 'Дўкони бор, савдо билан шуғулланади',
    avatarColor: '#3B82F6',
  },
  {
    id: 'c_bobur',
    name: 'Бобур Қодиров (Ҳамкасб)',
    phone: '+998939876543',
    telegram: 'bobur_qodirov',
    whatsapp: '+998939876543',
    notes: 'Маркетинг бўлими ҳамкасбим',
    avatarColor: '#F59E0B',
  },
  {
    id: 'c_shahnoza',
    name: 'Шаҳноза опа (Қўшни)',
    phone: '+998915554433',
    telegram: 'shahnoza_opa',
    notes: '12-хонадон қўшнимиз',
    avatarColor: '#EC4899',
  },
  {
    id: 'c_dilshod',
    name: 'Уста Дилшод (Ошхона ремонти)',
    phone: '+998977778899',
    telegram: 'dilshod_usta',
    notes: 'Уй ремонти ва мебел устаси',
    avatarColor: '#10B981',
  },
  {
    id: 'c_ipoteka',
    name: 'Ипотека банки (Кредит)',
    phone: '1142',
    notes: 'Автокредит бўлими',
    avatarColor: '#6366F1',
  },
  {
    id: 'c_anvar',
    name: 'Анвар Каримов (Амакивачча)',
    phone: '+998903332211',
    telegram: 'anvar_karim',
    notes: 'Қариндош',
    avatarColor: '#8B5CF6',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Income
  { id: 'inc_salary', name_cyrl: 'Ойлик иш ҳақи', name_latn: 'Oylik ish haqi', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: 'inc_business', name_cyrl: 'Савдо ва Бизнес', name_latn: 'Savdo va Biznes', type: 'income', icon: 'Store', color: '#059669' },
  { id: 'inc_freelance', name_cyrl: 'Фриланс ва Қўшимча', name_latn: 'Frilans va Qo\'shimcha', type: 'income', icon: 'Laptop', color: '#34D399' },
  { id: 'inc_rent', name_cyrl: 'Ижара тушуми', name_latn: 'Ijara tushumi', type: 'income', icon: 'Home', color: '#047857' },
  { id: 'inc_other', name_cyrl: 'Бошқа даромадлар', name_latn: 'Boshqa daromadlar', type: 'income', icon: 'PlusCircle', color: '#6EE7B7' },

  // Expense
  { id: 'exp_food', name_cyrl: 'Озиқ-овқат & Бозор', name_latn: 'Oziq-ovqat & Bozor', type: 'expense', icon: 'ShoppingCart', color: '#EF4444', monthlyBudget: 4500000, dailyBudget: 250000, weeklyBudget: 1100000 },
  { id: 'exp_utilities', name_cyrl: 'Коммунал & Уй-жой', name_latn: 'Kommunal & Uy-joy', type: 'expense', icon: 'Zap', color: '#F97316', monthlyBudget: 1200000, dailyBudget: 150000, weeklyBudget: 400000 },
  { id: 'exp_transport', name_cyrl: 'Транспорт & Ёқилғи', name_latn: 'Transport & Yoqilg\'i', type: 'expense', icon: 'Car', color: '#F59E0B', monthlyBudget: 1800000, dailyBudget: 120000, weeklyBudget: 450000 },
  { id: 'exp_education', name_cyrl: 'Таълим & Болалар', name_latn: 'Ta\'lim & Bolalar', type: 'expense', icon: 'GraduationCap', color: '#8B5CF6', monthlyBudget: 2500000, dailyBudget: 200000, weeklyBudget: 700000 },
  { id: 'exp_health', name_cyrl: 'Соғлиқ & Дорихона', name_latn: 'Sog\'liq & Dorixona', type: 'expense', icon: 'HeartPulse', color: '#EC4899', monthlyBudget: 1000000, dailyBudget: 100000, weeklyBudget: 300000 },
  { id: 'exp_clothes', name_cyrl: 'Кийим-кечак', name_latn: 'Kiyim-kechak', type: 'expense', icon: 'Shirt', color: '#6366F1', monthlyBudget: 1500000, dailyBudget: 150000, weeklyBudget: 450000 },
  { id: 'exp_leisure', name_cyrl: 'Ресторан & Ҳордиқ', name_latn: 'Restoran & Hordiq', type: 'expense', icon: 'Utensils', color: '#14B8A6', monthlyBudget: 1200000, dailyBudget: 150000, weeklyBudget: 350000 },
  { id: 'exp_tech', name_cyrl: 'Техника & Харид', name_latn: 'Texnika & Xarid', type: 'expense', icon: 'Smartphone', color: '#06B6D4', monthlyBudget: 1000000, dailyBudget: 100000, weeklyBudget: 300000 },
  { id: 'exp_other', name_cyrl: 'Бошқа харажатлар', name_latn: 'Boshqa xarajatlar', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', monthlyBudget: 800000, dailyBudget: 80000, weeklyBudget: 250000 },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w_cash', name_cyrl: 'Нақд пул (Ҳамён)', name_latn: 'Naqd pul (Hamyon)', type: 'cash', balance: 4850000, currency: 'UZS', color: '#10B981' },
  { id: 'w_uzcard', name_cyrl: 'Uzcard (Ипотека банк)', name_latn: 'Uzcard (Ipoteka bank)', type: 'card', balance: 14200000, currency: 'UZS', color: '#3B82F6' },
  { id: 'w_humo', name_cyrl: 'Humo (Алоқабанк)', name_latn: 'Humo (Aloqabank)', type: 'card', balance: 8650000, currency: 'UZS', color: '#8B5CF6' },
  { id: 'w_usd', name_cyrl: 'Visa / Валюта ($)', name_latn: 'Visa / Valyuta ($)', type: 'card', balance: 19500000, currency: 'UZS', color: '#F59E0B' },
];

export const INITIAL_MEMBERS: FamilyMember[] = [
  { id: 'm_father', name_cyrl: 'Акмал (Ота)', name_latn: 'Akmal (Ota)', role_cyrl: 'Оила бошлиғи', role_latn: 'Oila boshlig\'i', avatarColor: '#2563EB' },
  { id: 'm_mother', name_cyrl: 'Нилуфар (Она)', name_latn: 'Nilufar (Ona)', role_cyrl: 'Оила бекаси', role_latn: 'Oila bekasi', avatarColor: '#DB2777' },
  { id: 'm_son', name_cyrl: 'Жасур (Ўғли)', name_latn: 'Jasur (O\'g\'li)', role_cyrl: 'Талаба', role_latn: 'Talaba', avatarColor: '#10B981' },
  { id: 'm_family', name_cyrl: 'Умумий харажат', name_latn: 'Umumiy xarajat', role_cyrl: 'Оилавий', role_latn: 'Oilaviy', avatarColor: '#64748B' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // October 2026 Sample Transactions
  { id: 't_01', date: '2026-10-27', amount: 480000, type: 'expense', categoryId: 'exp_food', walletId: 'w_uzcard', memberId: 'm_mother', note: 'Корзинка супермаркети - ҳафталик озиқ-овқат', tags: ['#shopping', '#groceries'] },
  { id: 't_02', date: '2026-10-26', amount: 260000, type: 'expense', categoryId: 'exp_transport', walletId: 'w_cash', memberId: 'm_father', note: 'Автомобиль учун ёқилғи (Метан/Бензин)', tags: ['#urgent', '#fuel'] },
  { id: 't_03', date: '2026-10-25', amount: 3500000, type: 'income', categoryId: 'inc_freelance', walletId: 'w_humo', memberId: 'm_father', note: 'IT хизматлари бўйича қўшимча гонорар', tags: ['#bonus', '#work'] },
  { id: 't_04', date: '2026-10-24', amount: 350000, type: 'expense', categoryId: 'exp_leisure', walletId: 'w_humo', memberId: 'm_family', note: 'Оилавий кечки овқат (Миллий таомлар)', tags: ['#family', '#gift'] },
  { id: 't_05', date: '2026-10-22', amount: 150000, type: 'expense', categoryId: 'exp_health', walletId: 'w_uzcard', memberId: 'm_mother', note: 'Дорихонадан витамин ва мавсумий дорилар', tags: ['#urgent', '#health'] },
  { id: 't_06', date: '2026-10-20', amount: 18500000, type: 'income', categoryId: 'inc_salary', walletId: 'w_uzcard', memberId: 'm_father', note: 'Ойлик иш ҳақи (Асосий компаниядан)', tags: ['#salary', '#work'] },
  { id: 't_07', date: '2026-10-18', amount: 620000, type: 'expense', categoryId: 'exp_utilities', walletId: 'w_humo', memberId: 'm_father', note: 'Электр энергияси ва газ тўловлари', tags: ['#bills', '#urgent'] },
  { id: 't_08', date: '2026-10-16', amount: 1200000, type: 'expense', categoryId: 'exp_education', walletId: 'w_uzcard', memberId: 'm_son', note: 'Инглиз тили ва дастурлаш курслари тўлови', tags: ['#education', '#urgent'] },
  { id: 't_09', date: '2026-10-15', amount: 6500000, type: 'income', categoryId: 'inc_salary', walletId: 'w_humo', memberId: 'm_mother', note: 'Нилуфарнинг ойлик маоши (Мактаб/Лицей)', tags: ['#salary', '#work'] },
  { id: 't_10', date: '2026-10-12', amount: 890000, type: 'expense', categoryId: 'exp_clothes', walletId: 'w_cash', memberId: 'm_mother', note: 'Кузги кийимлар хариди', tags: ['#shopping', '#gift'] },
  { id: 't_11', date: '2026-10-10', amount: 320000, type: 'expense', categoryId: 'exp_food', walletId: 'w_cash', memberId: 'm_mother', note: 'Деҳқон бозори: мева, сабзавот, гўшт', tags: ['#groceries', '#shopping'] },
  { id: 't_12', date: '2026-10-08', amount: 2400000, type: 'income', categoryId: 'inc_rent', walletId: 'w_cash', memberId: 'm_father', note: 'Сергелидаги квартиранинг ижара пули', tags: ['#rent'] },
  { id: 't_13', date: '2026-10-05', amount: 450000, type: 'expense', categoryId: 'exp_tech', walletId: 'w_humo', memberId: 'm_son', note: 'Компьютер аксессуарлари ва сичқонча', tags: ['#tech', '#shopping'] },
  { id: 't_14', date: '2026-10-02', amount: 550000, type: 'expense', categoryId: 'exp_food', walletId: 'w_uzcard', memberId: 'm_family', note: 'Ой бошидаги катта бозорлик', tags: ['#groceries', '#shopping'] },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'g_car',
    title_cyrl: 'Янги автомобиль (Tracker 2)',
    title_latn: 'Yangi avtomobil (Tracker 2)',
    targetAmount: 220000000,
    currentAmount: 115000000,
    monthlyContribution: 9500000,
    targetDate: '2027-09-01',
    category: 'Транспорт',
    icon: 'Car',
    color: '#3B82F6',
    priority: 'high',
    notes: 'Бошланғич тўлов ва нақд сотиб олиш мақсади',
    history: [
      { id: 'h_1', date: '2026-08-01', amount: 9500000, note: 'Август ойи ажратмаси' },
      { id: 'h_2', date: '2026-09-01', amount: 9500000, note: 'Сентябрь ойи ажратмаси' },
      { id: 'h_3', date: '2026-10-01', amount: 9500000, note: 'Октябрь ойи ажратмаси' },
    ]
  },
  {
    id: 'g_umrah',
    title_cyrl: 'Ота-она билан Умра зиёрати',
    title_latn: 'Ota-ona bilan Umra ziyorati',
    targetAmount: 50000000,
    currentAmount: 36000000,
    monthlyContribution: 4500000,
    targetDate: '2027-02-15',
    category: 'Саёҳат / Зиёрат',
    icon: 'Compass',
    color: '#10B981',
    priority: 'high',
    notes: '2027 йил баҳорида оилавий сафар',
    history: [
      { id: 'h_u1', date: '2026-08-15', amount: 4500000, note: 'Август ойи ажратмаси' },
      { id: 'h_u2', date: '2026-09-15', amount: 4500000, note: 'Сентябрь ойи ажратмаси' },
      { id: 'h_u3', date: '2026-10-15', amount: 4500000, note: 'Октябрь ойи ажратмаси' },
    ]
  },
  {
    id: 'g_renovation',
    title_cyrl: 'Уй ремонтно таъмири (Меҳмонхона)',
    title_latn: 'Uy remonti ta\'miri (Mehmonxona)',
    targetAmount: 35000000,
    currentAmount: 18000000,
    monthlyContribution: 3000000,
    targetDate: '2027-04-30',
    category: 'Уй-жой',
    icon: 'Home',
    color: '#F59E0B',
    priority: 'medium',
    notes: 'Обой, люстра ва юмшоқ мебеллар хариди',
    history: [
      { id: 'h_r1', date: '2026-09-10', amount: 3000000, note: 'Сентябрь ажратмаси' },
      { id: 'h_r2', date: '2026-10-10', amount: 3000000, note: 'Октябрь ажратмаси' },
    ]
  },
  {
    id: 'g_emergency',
    title_cyrl: 'Молиявий хавфсизлик ёстиқчаси',
    title_latn: 'Moliyaviy xavfsizlik yostiqchasi',
    targetAmount: 40000000,
    currentAmount: 32000000,
    monthlyContribution: 2000000,
    targetDate: '2027-03-01',
    category: 'Хавфсизлик',
    icon: 'ShieldCheck',
    color: '#8B5CF6',
    priority: 'high',
    notes: '6 ойлик оилавий харажатлар захира фонди',
    history: [
      { id: 'h_e1', date: '2026-10-01', amount: 2000000, note: 'Октябрь захираси' },
    ]
  }
];

export const INITIAL_DEBTS: Debt[] = [
  // They owe me (Receivables / Мендан қарздорлар)
  {
    id: 'd_1',
    contactId: 'c_sardor',
    personName: 'Сардор Алимов (Дўстим)',
    phone: '+998901234567',
    telegram: 'sardor_alim',
    whatsapp: '+998901234567',
    type: 'they_owe',
    totalAmount: 6500000,
    paidAmount: 1500000,
    remainingAmount: 5000000,
    givenDate: '2026-09-01',
    dueDate: '2026-10-31', // Due in 3 days! Urgent alert
    status: 'active',
    notes: 'Дўконга янги товар олиш учун вақтинча ёрдам сўраган эди',
    sourceType: 'wallet',
    sourceId: 'w_uzcard',
    payments: [
      { id: 'p_1', date: '2026-10-10', amount: 1500000, note: 'Биринчи қисми картага ўтказилди', targetType: 'wallet', targetId: 'w_uzcard' }
    ]
  },
  {
    id: 'd_2',
    contactId: 'c_bobur',
    personName: 'Бобур Қодиров (Ҳамкасб)',
    phone: '+998939876543',
    telegram: 'bobur_qodirov',
    whatsapp: '+998939876543',
    type: 'they_owe',
    totalAmount: 3200000,
    paidAmount: 0,
    remainingAmount: 3200000,
    givenDate: '2026-09-15',
    dueDate: '2026-10-20', // Overdue! Red alert
    status: 'overdue',
    notes: 'Шошилинч телефон хариди учун олган, муддати ўтди',
    sourceType: 'wallet',
    sourceId: 'w_cash',
    payments: []
  },
  {
    id: 'd_3',
    contactId: 'c_shahnoza',
    personName: 'Шаҳноза опа (Қўшни)',
    phone: '+998915554433',
    telegram: 'shahnoza_opa',
    type: 'they_owe',
    totalAmount: 2000000,
    paidAmount: 500000,
    remainingAmount: 1500000,
    givenDate: '2026-10-05',
    dueDate: '2026-11-15',
    status: 'active',
    notes: 'Қизларининг тўй сарпосига ёрдам',
    sourceType: 'wallet',
    sourceId: 'w_humo',
    payments: [
      { id: 'p_3', date: '2026-10-20', amount: 500000, note: 'Нақд пул билан қайтарди', targetType: 'wallet', targetId: 'w_cash' }
    ]
  },

  // I owe (Payables / Менинг қарзларим)
  {
    id: 'd_4',
    contactId: 'c_dilshod',
    personName: 'Уста Дилшод (Ошхона ремонти)',
    phone: '+998977778899',
    telegram: 'dilshod_usta',
    type: 'i_owe',
    totalAmount: 4000000,
    paidAmount: 1000000,
    remainingAmount: 3000000,
    givenDate: '2026-10-10',
    dueDate: '2026-11-05',
    status: 'active',
    notes: 'Ошхона мебеллари ва кафел ишларининг қолган ҳисоб-китоби',
    sourceType: 'wallet',
    sourceId: 'w_cash',
    payments: [
      { id: 'p_4', date: '2026-10-15', amount: 1000000, note: 'Аванс берилган', targetType: 'wallet', targetId: 'w_cash' }
    ]
  },
  {
    id: 'd_5',
    contactId: 'c_ipoteka',
    personName: 'Ипотека банки (Автокредит ойлик тўлови)',
    phone: '1142',
    type: 'i_owe',
    totalAmount: 2800000,
    paidAmount: 0,
    remainingAmount: 2800000,
    givenDate: '2026-10-01',
    dueDate: '2026-11-02',
    status: 'active',
    notes: 'Ҳар ойнинг 2-санасигача тўланиши шарт бўлган график тўлови',
    sourceType: 'wallet',
    sourceId: 'w_uzcard',
    payments: []
  },

  // Settled example
  {
    id: 'd_6',
    contactId: 'c_anvar',
    personName: 'Анвар Каримов (Амакивачча)',
    phone: '+998903332211',
    telegram: 'anvar_karim',
    type: 'they_owe',
    totalAmount: 2500000,
    paidAmount: 2500000,
    remainingAmount: 0,
    givenDate: '2026-09-10',
    dueDate: '2026-10-15',
    status: 'settled',
    notes: 'Ўқиш контракти учун вақтинча олган эди, тўлиқ ундирилди',
    settledDate: '2026-10-15',
    sourceType: 'wallet',
    sourceId: 'w_uzcard',
    payments: [
      { id: 'p_6', date: '2026-10-15', amount: 2500000, note: 'Тўлиқ картага қайтарди', targetType: 'wallet', targetId: 'w_uzcard' }
    ]
  }
];
