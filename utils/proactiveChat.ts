export interface ProactiveSchedule {
  charId: string;
  intervalMs: number;
}

const STORAGE_KEY = 'proactive_schedules';

export function loadSchedules(): Record<string, ProactiveSchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export const ProactiveChat = {
  onTrigger(callback: any) {},
  start(charId: string, intervalMinutes: number) {
    const intervalMs = intervalMinutes * 60 * 1000;
    const map = loadSchedules();
    map[charId] = { charId, intervalMs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    console.log(`[Proactive] Saved schedule for ${charId}: ${intervalMs}ms. Local timer disabled.`);
  },
  stop(charId: string) {
    const map = loadSchedules();
    delete map[charId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    console.log(`[Proactive] Cleared schedule for ${charId}.`);
  },
  resume() {},
  isActiveFor(charId: string): boolean {
    return !!loadSchedules()[charId];
  },
  getIntervalMinutes(charId: string): number | null {
    const schedule = loadSchedules()[charId];
    return schedule ? schedule.intervalMs / 60000 : null;
  },
  getSchedule(charId: string): ProactiveSchedule | null {
    return loadSchedules()[charId] || null;
  },
  getSchedules(): ProactiveSchedule[] {
    return Object.values(loadSchedules());
  }
};
