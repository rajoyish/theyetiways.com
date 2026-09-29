import fs from "node:fs";
import path from "node:path";

export interface MeshGradient {
  backgroundColor: string;
  backgroundImage: string;
  style: string;
}

const BASE_STOPS = [
  { x: 55, y: 12 },
  { x: 9, y: 74 },
  { x: 96, y: 31 },
  { x: 42, y: 24 },
  { x: 32, y: 52 },
  { x: 2, y: 51 },
  { x: 11, y: 53 },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Fallback procedural mesh gradient based on deterministic hashing. */
export function fallbackMeshGradient(id: string = "default"): MeshGradient {
  const hash = hashString(id);
  const baseHue = hash % 360;
  const baseSat = 75;
  const baseLight = 68;

  const baseColor = hslToHex(baseHue, baseSat, baseLight);

  const hueOffsets = [35, 75, 130, 190, 240, 295, 330];
  const stops = BASE_STOPS.map((stop, i) => {
    const jitterX = ((hash >> (i * 3)) & 15) - 7;
    const jitterY = ((hash >> (i * 3 + 1)) & 15) - 7;
    const x = Math.max(0, Math.min(100, stop.x + jitterX));
    const y = Math.max(0, Math.min(100, stop.y + jitterY));
    const h = (baseHue + hueOffsets[i]) % 360;
    const s = 65 + ((hash + i * 17) % 25);
    const l = 62 + ((hash + i * 13) % 14);
    return {
      at: `${x}% ${y}%`,
      hsla: `hsla(${h},${s}%,${l}%,1)`,
    };
  });

  const gradients = stops.map(
    (s) => `radial-gradient(at ${s.at}, ${s.hsla} 0px, transparent 50%)`,
  );

  return {
    backgroundColor: baseColor,
    backgroundImage: gradients.join(",\n"),
    style: `background-color: ${baseColor}; background-image: ${gradients.join(", ")};`,
  };
}

let cachedMeshMap: Map<string, MeshGradient> | null = null;

function getMeshMap(): Map<string, MeshGradient> {
  if (cachedMeshMap) return cachedMeshMap;

  const map = new Map<string, MeshGradient>();
  const jsonPath = path.join(process.cwd(), "src/assets/thumbs/mesh-gradients.json");

  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, "utf8");
      const data = JSON.parse(raw);
      for (const [id, gradient] of Object.entries(data)) {
        map.set(id, gradient as MeshGradient);
      }
    } catch (err) {
      console.warn("mesh: could not parse mesh-gradients.json", err);
    }
  }

  cachedMeshMap = map;
  return map;
}

/**
 * Returns the extracted mesh gradient for a YouTube video id, falling back
 * to a harmonious deterministic procedural mesh if not yet extracted.
 */
export function getMeshGradient(id?: string): MeshGradient {
  if (!id) return fallbackMeshGradient("fallback");
  const map = getMeshMap();
  const gradient = map.get(id);
  if (gradient) return gradient;
  return fallbackMeshGradient(id);
}
