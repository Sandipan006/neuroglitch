
export interface ProcessSettings {
  asciiDensity: number; // Step size for ASCII grid (lower = denser)
  particleDensity: number; // Probability of particle spawn
  brightnessThreshold: number; // Cutoff for rendering anything
  particleThreshold: number; // Cutoff for particles (highlights)
  fontSize: number;
  palette: string;
  colorMode: 'mono' | 'cyber' | 'spectral' | 'original';
}

// Palettes must be ordered: DENSE -> SPARSE -> EMPTY
export const CHAR_PALETTES = {
  encryption: '081LCGftli;:., ', // Mimics the provided reference image code style
  standard: '@%#*+=-:. ', 
  complex: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
};

export const DEFAULT_SETTINGS: ProcessSettings = {
  asciiDensity: 8,
  particleDensity: 25, 
  brightnessThreshold: 15, 
  particleThreshold: 180, 
  fontSize: 12,
  palette: 'encryption', // Default to the new style
  colorMode: 'spectral', // Default to the new style
};
