import { Currency, Language } from '../types';

export const CURRENT_DATE_STR = '2026-10-28';

export interface LiveExchangeRates {
  USD: number;
  EUR: number;
  RUB: number;
}

export const DEFAULT_LIVE_RATES: LiveExchangeRates = {
  USD: 12850,
  EUR: 13920,
  RUB: 138,
};

export function formatMoney(
  amount: number,
  currency: Currency = 'UZS',
  lang: Language = 'uz_cyrl',
  rates: number | LiveExchangeRates = DEFAULT_LIVE_RATES
): string {
  const usdRate = typeof rates === 'number' ? rates : rates.USD || 12850;

  if (currency === 'USD') {
    const val = amount / usdRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: val >= 100 ? 0 : 2,
    }).format(val);
  }

  // UZS formatting with spaced thousands
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const suffix = lang === 'uz_cyrl' ? 'сўм' : 'so\'m';
  return `${formatted} ${suffix}`;
}

export function formatCompactMoney(
  amount: number,
  currency: Currency = 'UZS',
  lang: Language = 'uz_cyrl',
  rates: number | LiveExchangeRates = DEFAULT_LIVE_RATES
): string {
  const usdRate = typeof rates === 'number' ? rates : rates.USD || 12850;

  if (currency === 'USD') {
    const valInUSD = amount / usdRate;
    if (valInUSD >= 1000000) return `$${(valInUSD / 1000000).toFixed(1)}M`;
    if (valInUSD >= 1000) return `$${(valInUSD / 1000).toFixed(1)}K`;
    return `$${Math.round(valInUSD)}`;
  }

  if (amount >= 1000000000) {
    const v = (amount / 1000000000).toFixed(1);
    return `${v} ${lang === 'uz_cyrl' ? 'млрд' : 'mlrd'}`;
  }
  if (amount >= 1000000) {
    const v = (amount / 1000000).toFixed(1);
    return `${v} ${lang === 'uz_cyrl' ? 'млн' : 'mln'}`;
  }
  if (amount >= 1000) {
    const v = (amount / 1000).toFixed(0);
    return `${v} ${lang === 'uz_cyrl' ? 'минг' : 'ming'}`;
  }
  return formatMoney(amount, currency, lang, rates);
}

export function formatDateUz(dateString: string, lang: Language = 'uz_cyrl'): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;

  const monthsCyrl = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];
  const monthsLatn = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];

  const m = lang === 'uz_cyrl' ? monthsCyrl[month - 1] : monthsLatn[month - 1];
  return `${day}-${m}, ${year}`;
}

export function getDaysDifference(targetDateStr: string, fromDateStr: string = CURRENT_DATE_STR): number {
  const target = new Date(targetDateStr + 'T00:00:00');
  const from = new Date(fromDateStr + 'T00:00:00');
  const diffTime = target.getTime() - from.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDueStatus(dueDateStr: string, isSettled: boolean, fromDateStr: string = CURRENT_DATE_STR) {
  if (isSettled) {
    return {
      status: 'settled',
      labelCyrl: 'Ундирилди / Қайтарилди',
      labelLatn: 'Undirildi / Qaytarildi',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      daysDiff: 0,
    };
  }

  const days = getDaysDifference(dueDateStr, fromDateStr);

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      status: 'overdue',
      labelCyrl: `${absDays} кун муддати ўтган`,
      labelLatn: `${absDays} kun muddati o'tgan`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      daysDiff: days,
      isAlert: true,
    };
  }

  if (days === 0) {
    return {
      status: 'today',
      labelCyrl: 'Бугун тўлаш муддати!',
      labelLatn: 'Bugun to\'lash muddati!',
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      daysDiff: 0,
      isAlert: true,
    };
  }

  if (days <= 3) {
    return {
      status: 'soon',
      labelCyrl: `${days} кун қолди (яқинлашди)`,
      labelLatn: `${days} kun qoldi (yaqinlashdi)`,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      daysDiff: days,
      isAlert: true,
    };
  }

  return {
    status: 'normal',
    labelCyrl: `${days} кун қолди`,
    labelLatn: `${days} kun qoldi`,
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    daysDiff: days,
    isAlert: false,
  };
}

// Calculate projection for savings goals
export function calculateGoalTimeline(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  extraMonthly: number = 0,
  referenceDateStr: string = CURRENT_DATE_STR
) {
  const remaining = Math.max(0, targetAmount - currentAmount);
  const effectiveMonthly = monthlyContribution + extraMonthly;

  if (remaining <= 0) {
    return {
      monthsNeeded: 0,
      projectedDate: referenceDateStr,
      progressPercent: 100,
      remainingAmount: 0,
      isAchieved: true,
    };
  }

  if (effectiveMonthly <= 0) {
    return {
      monthsNeeded: 999,
      projectedDate: 'Номаълум',
      progressPercent: Math.min(100, Math.round((currentAmount / targetAmount) * 100)),
      remainingAmount: remaining,
      isAchieved: false,
    };
  }

  const monthsNeeded = Math.ceil(remaining / effectiveMonthly);
  
  // Calculate projected finish date
  const ref = new Date(referenceDateStr + 'T00:00:00');
  ref.setMonth(ref.getMonth() + monthsNeeded);
  const y = ref.getFullYear();
  const m = String(ref.getMonth() + 1).padStart(2, '0');
  const d = String(ref.getDate()).padStart(2, '0');
  const projectedDate = `${y}-${m}-${d}`;

  return {
    monthsNeeded,
    projectedDate,
    progressPercent: Math.min(100, Math.round((currentAmount / targetAmount) * 100)),
    remainingAmount: remaining,
    isAchieved: false,
  };
}

// Recurring item due status calculation
export function getRecurringStatus(dueDayOfMonth: number, lastPaidDate?: string, currentDateStr: string = CURRENT_DATE_STR) {
  const [currYear, currMonth, currDay] = currentDateStr.split('-').map(Number);
  const currentMonthPrefix = `${currYear}-${String(currMonth).padStart(2, '0')}`;
  const isPaidThisMonth = lastPaidDate && lastPaidDate.startsWith(currentMonthPrefix);

  if (isPaidThisMonth) {
    return {
      status: 'paid',
      labelCyrl: 'Бу ой тўланди',
      labelLatn: 'Bu oy to\'landi',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      daysDiff: 999,
      isAlert: false,
    };
  }

  const diff = dueDayOfMonth - currDay;

  if (diff === 0) {
    return {
      status: 'today',
      labelCyrl: 'Бугун тўлаш куни!',
      labelLatn: 'Bugun to\'lash kuni!',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-300',
      daysDiff: 0,
      isAlert: true,
    };
  }

  if (diff > 0 && diff <= 3) {
    return {
      status: 'soon',
      labelCyrl: `${diff} кун қолди`,
      labelLatn: `${diff} kun qoldi`,
      badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      daysDiff: diff,
      isAlert: true,
    };
  }

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return {
      status: 'overdue',
      labelCyrl: `${absDiff} кун кечиккан!`,
      labelLatn: `${absDiff} kun kechikkan!`,
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      daysDiff: diff,
      isAlert: true,
    };
  }

  return {
    status: 'upcoming',
    labelCyrl: `${diff} кундан сўнг`,
    labelLatn: `${diff} kundan so'ng`,
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-200',
    daysDiff: diff,
    isAlert: false,
  };
}
