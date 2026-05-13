export interface ProactiveSchedule {
  charId: string;
  intervalMs: number;
}

const STORAGE_KEY = 'proactive_schedules';
const WORKER_URL = 'https://my-sully-api.3142140243.workers.dev/api/proactive/sync';

export function loadSchedules(): Record<string, ProactiveSchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function syncToWorker(payload: any) {
  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('[Proactive] Sync failed:', err));
}

let heartbeatTimer: any = null;
function startHeartbeat() {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncToWorker({ type: 'heartbeat' });
    }
  }, 60000);
  syncToWorker({ type: 'heartbeat' });
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export const ProactiveChat = {
  onTrigger(callback: any) {},
  start(charId: string, intervalMinutes: number) {
    const intervalMs = intervalMinutes * 60 * 1000;
    const map = loadSchedules();
    map[charId] = { charId, intervalMs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    
    syncToWorker({ type: 'config', active: true, intervalMinutes });
    startHeartbeat();
    console.log(`[Proactive] Saved & Synced: ${intervalMs}ms. Cloudflare handle it.`);
  },
  stop(charId: string) {
    const map = loadSchedules();
    delete map[charId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    
    syncToWorker({ type: 'config', active: false });
    stopHeartbeat();
    console.log(`[Proactive] Stopped & Synced.`);
  },
  resume() {
    const map = loadSchedules();
    const schedules = Object.values(map);
    if (schedules.length > 0) {
      const intervalMinutes = schedules[0].intervalMs / 60000;
      syncToWorker({ type: 'config', active: true, intervalMinutes });
      startHeartbeat();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncToWorker({ type: 'heartbeat' });
      }
    });
  },
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
