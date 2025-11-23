
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
