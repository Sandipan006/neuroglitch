
import React from 'react';
import { ProcessSettings, CHAR_PALETTES } from '../types';

interface ControlsProps {
  settings: ProcessSettings;
  updateSetting: <K extends keyof ProcessSettings>(key: K, value: ProcessSettings[K]) => void;
  onReset: () => void;
  onDownload: () => void;
  className?: string;
}

const Controls: React.FC<ControlsProps> = ({ settings, updateSetting, onReset, onDownload, className = '' }) => {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white tracking-tighter font-mono">
          <span className="text-cyan-400">{'>'}</span> PARAMETERS
        </h2>
        <p className="text-xs text-neutral-500 font-mono mt-1">Adjust visual matrix</p>
      </div>

      {/* ASCII Density */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-neutral-300">Grid Density</label>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded">
            {settings.asciiDensity}px
          </span>
        </div>
        <input
          type="range"
          min="4"
          max="20"
          step="1"
          value={settings.asciiDensity}
          onChange={(e) => updateSetting('asciiDensity', Number(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-neutral-500">Lower value = Higher Resolution</p>
      </div>

      {/* Particle Density */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-neutral-300">Particle Intensity</label>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded">
            {settings.particleDensity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.particleDensity}
          onChange={(e) => updateSetting('particleDensity', Number(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-neutral-500">Frequency of glowing dots in bright areas.</p>
      </div>

      {/* Thresholds Group */}
      <div className="space-y-4 pt-4 border-t border-neutral-800">
         {/* Brightness Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Base Cutoff</label>
            <span className="text-xs font-mono text-neutral-500">{settings.brightnessThreshold}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.brightnessThreshold}
            onChange={(e) => updateSetting('brightnessThreshold', Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
          />
          <p className="text-[10px] text-neutral-500">Filters background noise. Higher = darker blacks.</p>
        </div>

        {/* Highlight Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs text-neutral-400 uppercase tracking-wider">Highlight Cutoff</label>
            <span className="text-xs font-mono text-neutral-500">{settings.particleThreshold}</span>
          </div>
          <input
            type="range"
            min="50"
            max="250"
            value={settings.particleThreshold}
            onChange={(e) => updateSetting('particleThreshold', Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
          />
          <p className="text-[10px] text-neutral-500">Brightness level required for particles to appear.</p>
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3 pt-4 border-t border-neutral-800">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-neutral-300">Font Size</label>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded">
            {settings.fontSize}px
          </span>
        </div>
        <input
          type="range"
          min="6"
          max="24"
          value={settings.fontSize}
          onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
          className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
        />
        <p className="text-[10px] text-neutral-500">Scale of the ASCII text characters.</p>
      </div>

      {/* Palette Selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-300">Char Palette</label>
        <select
          value={settings.palette}
          onChange={(e) => updateSetting('palette', e.target.value)}
          className="w-full bg-neutral-800 text-white text-sm border-none rounded p-2 focus:ring-1 focus:ring-cyan-500 uppercase font-mono"
        >
          {Object.keys(CHAR_PALETTES).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-neutral-500">Symbol set used to build the image.</p>
      </div>

      {/* Color Mode */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-neutral-300">Color Mode</label>
        <div className="grid grid-cols-2 gap-1 bg-neutral-800 p-1 rounded-md">
          {['mono', 'spectral', 'cyber', 'original'].map((mode) => (
             <button
                key={mode}
                onClick={() => updateSetting('colorMode', mode as any)}
                className={`text-[10px] py-1.5 rounded uppercase font-mono transition-all ${settings.colorMode === mode ? 'bg-neutral-600 text-white font-bold shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
             >
                {mode}
             </button>
          ))}
        </div>
        <p className="text-[10px] text-neutral-500">Visual style and color grading.</p>
      </div>

      <div className="mt-auto pt-6 hidden md:flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 border border-neutral-700 text-neutral-400 text-sm font-bold rounded hover:bg-neutral-800 hover:text-white transition-colors"
        >
          RESET
        </button>
        <button
          onClick={onDownload}
          className="flex-[2] py-3 bg-cyan-600 text-white text-sm font-bold rounded shadow-lg shadow-cyan-900/50 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          EXPORT PNG
        </button>
      </div>
    </div>
  );
};

export default Controls;
