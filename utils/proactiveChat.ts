export interface ProactiveSchedule {
  charId: string;
  intervalMs: number;
}

// 二期工程终极重构：物理阉割原版主动消息双系统
// 我们彻底移除了本地的切屏补偿机制 (visibility-change catch-up) 以及原版的 ActiveMsg2.0 云端推送
// 所有的前端复杂定时器全被清空。本地仅仅保留保存开关状态的功能，
// 真正的主动推送完全交给部署在 Cloudflare Worker 的唯一精准 Cron 定时器。

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

export function getSchedule(charId: string): ProactiveSchedule | null {
  const map = loadSchedules();
  return map[charId] || null;
}

export function setSchedule(charId: string, intervalMs: number) {
  const map = loadSchedules();
  map[charId] = { charId, intervalMs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  console.log(`[Proactive] Saved schedule for ${charId}: ${intervalMs}ms. Local timer is disabled, awaiting Cloudflare Worker.`);
}

export function clearSchedule(charId: string) {
  const map = loadSchedules();
  delete map[charId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  console.log(`[Proactive] Cleared schedule for ${charId}.`);
}

// 占位函数，防止前端页面原本导入这些函数报错
export function setProactiveCallback() {}
export function removeProactiveCallback() {}
export function updateProactiveChar() {}
export function isProactiveConfigReady() { return true; }
