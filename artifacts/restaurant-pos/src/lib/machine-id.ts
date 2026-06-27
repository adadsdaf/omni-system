const STORAGE_KEY = "restaurant_pos_machine_id";

function canvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "nocanvas";
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = "#1e293b";
    ctx.font = "16px Arial";
    ctx.fillText("RestaurantPOS-LIC", 10, 30);
    ctx.fillStyle = "rgba(100,200,50,0.5)";
    ctx.fillRect(10, 5, 80, 20);
    return canvas.toDataURL().slice(-60);
  } catch {
    return "canvas-error";
  }
}

function hashString(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const val = (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0;
  return val.toString(16).toUpperCase().padStart(8, "0");
}

function formatMachineId(raw: string): string {
  const hex = hashString(raw);
  const full = hex.padEnd(16, hashString(raw.split("").reverse().join("")).slice(0, 8));
  return [full.slice(0, 4), full.slice(4, 8), full.slice(8, 12), full.slice(12, 16)].join("-");
}

function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth.toString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency?.toString() ?? "?",
    canvasFingerprint(),
  ];
  return components.join("|");
}

export function getMachineId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const fp = generateFingerprint();
  const id = formatMachineId(fp);
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function clearMachineId(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getLicenseKey(): string | null {
  return localStorage.getItem("restaurant_pos_license_key");
}

export function setLicenseKey(key: string): void {
  localStorage.setItem("restaurant_pos_license_key", key);
}

export function clearLicense(): void {
  localStorage.removeItem("restaurant_pos_license_key");
}
