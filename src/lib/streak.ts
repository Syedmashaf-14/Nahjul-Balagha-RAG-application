export interface DayActivity {
  dayName: string;
  dateStr: string;
  completed: boolean;
  isToday: boolean;
}

export interface StreakInfo {
  count: number;
  lastActiveDate: string | null;
  recentDays: DayActivity[];
}

const STORAGE_KEY = 'nahj_learning_activity_dates_v1';

/**
 * Returns formatted local date string YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Records an active learning/reading action for today
 */
export function recordDailyStudyActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = getLocalDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    const dates: string[] = stored ? JSON.parse(stored) : [];

    if (!dates.includes(today)) {
      dates.push(today);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
    }
  } catch (err) {
    console.warn('Could not record study activity:', err);
  }
}

/**
 * Computes active streak and 5-day activity tracker
 */
export function getActiveStreak(): StreakInfo {
  if (typeof window === 'undefined') {
    return {
      count: 1,
      lastActiveDate: null,
      recentDays: [
        { dayName: 'D1', dateStr: '', completed: true, isToday: false },
        { dayName: 'D2', dateStr: '', completed: false, isToday: false },
        { dayName: 'D3', dateStr: '', completed: false, isToday: false },
        { dayName: 'D4', dateStr: '', completed: false, isToday: false },
        { dayName: 'D5', dateStr: '', completed: false, isToday: true },
      ],
    };
  }

  try {
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const stored = localStorage.getItem(STORAGE_KEY);
    let dates: string[] = stored ? JSON.parse(stored) : [];

    // Automatically count today upon visiting/opening platform
    if (!dates.includes(todayStr)) {
      dates.push(todayStr);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
    }

    const dateSet = new Set(dates);

    // Compute consecutive streak backwards from today or yesterday
    let streakCount = 0;
    const checkDate = new Date(today);

    // Check today
    if (dateSet.has(getLocalDateString(checkDate))) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If not yet today, check if yesterday was completed
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dateSet.has(getLocalDateString(checkDate))) {
      streakCount++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Generate last 5 days
    const recentDays: DayActivity[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      recentDays.push({
        dayName: dayNames[d.getDay()],
        dateStr: dStr,
        completed: dateSet.has(dStr),
        isToday: dStr === todayStr,
      });
    }

    return {
      count: Math.max(1, streakCount),
      lastActiveDate: todayStr,
      recentDays,
    };
  } catch {
    return {
      count: 1,
      lastActiveDate: null,
      recentDays: [],
    };
  }
}
