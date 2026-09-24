
import { ProcessSettings, CHAR_PALETTES } from '../types';

/**
 * Loads an image from a File object.
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Maps a brightness value (0-255) to a character from the palette.
 * Assumes palette is ordered from DENSE (@) to SPARSE (.) to EMPTY ( ).
 * For White-on-Black: Bright pixel = Dense Character.
 */
const mapBrightnessToChar = (brightness: number, paletteKey: string): string => {
  const chars = CHAR_PALETTES[paletteKey as keyof typeof CHAR_PALETTES] || CHAR_PALETTES.standard;
  
  // Normalize brightness (0-1)
  const normalized = 1 - (brightness / 255);
  const index = Math.floor(normalized * (chars.length - 1));
  
  return chars[Math.max(0, Math.min(index, chars.length - 1))];
};

/**
 * Applies a convolution filter to sharpen the image.
 * This helps defined edges stand out in the ASCII conversion.
 * Uses a standard 3x3 sharpen kernel:
 *  0 -1  0
 * -1  5 -1
 *  0 -1  0
 */
const applySharpenFilter = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  // Create a copy to read unmodified neighbor values while writing new ones
  const buff = new Uint8ClampedArray(data);

  const w4 = w * 4; // Row width in bytes

  // Iterate skipping the 1px border to avoid complex boundary checks
  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w4;
    const prevRowOffset = (y - 1) * w4;
    const nextRowOffset = (y + 1) * w4;

    for (let x = 1; x < w - 1; x++) {
      const pixelOffset = rowOffset + (x * 4);
      
      // Apply kernel to R(0), G(1), B(2)
      for (let c = 0; c < 3; c++) {
        const centerIdx = pixelOffset + c;
        
        // Convolution: 5*Center - Sum(Neighbors)
        const val = (5 * buff[centerIdx])
                  - buff[prevRowOffset + (x * 4) + c]    // Top
                  - buff[nextRowOffset + (x * 4) + c]    // Bottom
                  - buff[rowOffset + ((x - 1) * 4) + c]  // Left
                  - buff[rowOffset + ((x + 1) * 4) + c]; // Right
        
        data[centerIdx] = val;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Main render function.
 */
export const renderCombined = (
  sourceImg: HTMLImageElement,
  canvas: HTMLCanvasElement,
  settings: ProcessSettings
) => {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // 1. Setup Offscreen Processing
  const MAX_WIDTH = 1200;
  const scale = Math.min(1, MAX_WIDTH / sourceImg.width);
  const w = Math.floor(sourceImg.width * scale);
  const h = Math.floor(sourceImg.height * scale);

  canvas.width = w;
  canvas.height = h;

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = w;
  offscreenCanvas.height = h;
  const offCtx = offscreenCanvas.getContext('2d');
  if (!offCtx) return;

  offCtx.drawImage(sourceImg, 0, 0, w, h);

  // 1.5 Apply Sharpen Filter
  // This enhances edges before we sample pixels, making ASCII shapes more defined.
  applySharpenFilter(offCtx, w, h);

  const imageData = offCtx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  // 2. Clear Background (Pure Black)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  // 3. Configure Font
  ctx.font = `bold ${settings.fontSize}px 'Space Mono', monospace`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  const step = Math.max(1, Math.floor(settings.asciiDensity));
  const particleChance = settings.particleDensity / 100;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Calculate Perceived Luminance
      let brightness = (0.299 * r + 0.587 * g + 0.114 * b);

      // Apply Contrast/Gamma Curve
      brightness = Math.pow(brightness / 255, 1.2) * 255;

      if (brightness < settings.brightnessThreshold) continue;

      // --- COLOR ENGINE ---
      let fillStyle = '#FFFFFF';
      
      if (settings.colorMode === 'original') {
         // True Color Mode - sample exact pixel color
         // Boost saturation slightly for effect
         fillStyle = `rgb(${Math.min(255, r * 1.3)}, ${Math.min(255, g * 1.3)}, ${Math.min(255, b * 1.3)})`;
      } else if (settings.colorMode === 'spectral') {
         // Gradient: Deep Blue -> Cyan -> Green -> Orange -> White
         if (brightness > 235) fillStyle = '#FFFFFF'; // White Peak
         else if (brightness > 180) fillStyle = `rgb(255, ${Math.floor((brightness - 100) * 1.5)}, 80)`; // Orange/Gold
         else if (brightness > 130) fillStyle = `rgb(80, 255, ${Math.floor(brightness - 50)})`; // Green/Cyan
         else if (brightness > 80) fillStyle = `rgb(0, ${Math.floor(brightness + 50)}, 220)`; // Cyan/Blue
         else fillStyle = `rgb(0, 40, ${Math.floor(brightness * 1.2 + 40)})`; // Deep Blue
      } else if (settings.colorMode === 'cyber') {
        if (brightness > 180) fillStyle = `rgb(${brightness}, ${brightness}, 255)`;
        else if (brightness > 100) fillStyle = `rgb(0, ${brightness}, ${brightness})`;
        else fillStyle = `rgb(${brightness}, 0, ${brightness})`;
      }

      // --- PARTICLE LOGIC ---
      let drawnParticle = false;
      
      if (brightness > settings.particleThreshold) {
         const brightnessFactor = (brightness - settings.particleThreshold) / (255 - settings.particleThreshold);
         
         if (Math.random() < (particleChance + brightnessFactor * 0.5)) {
            ctx.beginPath();
            const radius = (step / 3) * (0.8 + brightnessFactor);
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            
            // Particles inherit color but are brighter
            ctx.fillStyle = settings.colorMode === 'mono' ? '#FFFFFF' : fillStyle;
            
            // Add Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0;
            drawnParticle = true;
         }
      }

      // --- ASCII LAYER ---
      // Skip text if particle was drawn in very bright area to avoid clutter
      if (drawnParticle && brightness > 230) continue;

      ctx.fillStyle = fillStyle;

      const char = mapBrightnessToChar(brightness, settings.palette);
      if (char && char.trim() !== '') {
        ctx.fillText(char, x, y);
      }
    }
  }
};

/**
 * Procedurally paints a demo scene (sun over mountains and water) so people
 * can try the effect without having an image at hand.
 */
export const createSampleImage = (): Promise<HTMLImageElement> => {
  const w = 1200;
  const h = 800;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas unavailable'));

  const horizon = h * 0.62;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#07051a');
  sky.addColorStop(0.55, '#3b1360');
  sky.addColorStop(1, '#ff6a3d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);

  // Stars
  for (let i = 0; i < 160; i++) {
    const a = Math.random() * 0.8 + 0.2;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(Math.random() * w, Math.random() * horizon * 0.6, 2, 2);
  }

  // Sun with retro cut bars
  const cx = w / 2;
  const cy = horizon - 40;
  const r = 230;
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, '#fff6b0');
  sun.addColorStop(0.5, '#ffb347');
  sun.addColorStop(1, '#ff3d7f');
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = sun;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (let i = 0; i < 7; i++) {
    const y = cy + 10 + i * 30;
    ctx.clearRect(cx - r, y, r * 2, 4 + i * 2.2);
  }
  ctx.restore();
  // Re-fill the cleared bars with sky colour
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);
  ctx.globalCompositeOperation = 'source-over';

  // Mountains
  const ridge = (base: number, amp: number, color: string, seed: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= w; x += 20) {
      // Flatten the ridge near the centre so the sun stays visible
      const falloff = Math.min(1, Math.abs(x - cx) / 420);
      const y = base - (Math.abs(Math.sin(x * 0.006 + seed) * amp) + Math.sin(x * 0.021 + seed * 2) * amp * 0.25) * falloff;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();
  };
  ridge(horizon - 10, 150, '#2a0f45', 1.3);
  ridge(horizon, 90, '#12061f', 4.1);

  // Water
  const water = ctx.createLinearGradient(0, horizon, 0, h);
  water.addColorStop(0, '#1b0b33');
  water.addColorStop(1, '#030208');
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Sun reflection
  for (let i = 0; i < 26; i++) {
    const y = horizon + 8 + i * 11;
    const spread = r * (1 - i / 30) * (0.6 + Math.random() * 0.5);
    ctx.fillStyle = `rgba(255, ${170 - i * 4}, ${90 + i * 3}, ${0.9 - i * 0.03})`;
    ctx.fillRect(cx - spread, y, spread * 2, 3 + (i % 3));
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL('image/png');
  });
};
