import React from 'react';
import { ProcessSettings, CHAR_PALETTES } from '../types';

interface ControlsProps {
  settings: ProcessSettings;
  updateSetting: <K extends keyof ProcessSettings>(key: K, value: ProcessSettings[K]) => void;
  onReset: () => void;
  onDownload: () => void;
  canExport?: boolean;
  className?: string;
}

const COLOR_MODES: { id: ProcessSettings['colorMode']; label: string; swatch: string }[] = [
  { id: 'spectral', label: 'Spectral', swatch: 'linear-gradient(90deg, #00285a, #0080dc, #50ff80, #ffb450, #ffffff)' },
  { id: 'cyber', label: 'Cyber', swatch: 'linear-gradient(90deg, #3a003a, #800080, #008080, #b4b4ff)' },
  { id: 'mono', label: 'Mono', swatch: 'linear-gradient(90deg, #1a1a1a, #7a7a7a, #ffffff)' },
  { id: 'original', label: 'Original', swatch: 'linear-gradient(90deg, #ff5b1f, #ffd23f, #3fd98a, #3a8bff, #b44cff)' },
];

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  hint: string;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, unit = '', hint, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-medium text-ink">{label}</label>
        <span className="font-mono text-[11px] tabular-nums text-ink bg-card border border-line rounded-full px-2 py-0.5">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ng-range"
        style={{ ['--p' as string]: `${pct}%` }}
      />
      <p className="text-[11px] leading-snug text-muted">{hint}</p>
    </div>
  );
};

const Section: React.FC<{ index: string; title: string; children: React.ReactNode }> = ({ index, title, children }) => (
  <section className="border-t border-line pt-5">
    <header className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[10px] text-muted">{index}</span>
      <h3 className="font-serif italic text-[22px] leading-none text-ink">{title}</h3>
    </header>
    <div className="space-y-5">{children}</div>
  </section>
);

const Controls: React.FC<ControlsProps> = ({ settings, updateSetting, onReset, onDownload, canExport = true, className = '' }) => {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">Spec sheet</p>
        <h2 className="font-serif text-4xl leading-[0.95] mt-1 text-ink">
          Tune the <em className="text-flare">signal</em>
        </h2>
      </div>

      <Section index="01" title="Resolution">
        <Slider
          label="Grid density"
          value={settings.asciiDensity}
          min={4}
          max={20}
          unit="px"
          hint="Lower value, finer detail."
          onChange={(v) => updateSetting('asciiDensity', v)}
        />
        <Slider
          label="Glyph size"
          value={settings.fontSize}
          min={6}
          max={24}
          unit="px"
          hint="Scale of each character."
          onChange={(v) => updateSetting('fontSize', v)}
        />
      </Section>

      <Section index="02" title="Particles">
        <Slider
          label="Intensity"
          value={settings.particleDensity}
          min={0}
          max={100}
          unit="%"
          hint="How often glowing dots bloom in bright areas."
          onChange={(v) => updateSetting('particleDensity', v)}
        />
        <Slider
          label="Highlight cutoff"
          value={settings.particleThreshold}
          min={50}
          max={250}
          hint="Brightness needed before particles appear."
          onChange={(v) => updateSetting('particleThreshold', v)}
        />
      </Section>

      <Section index="03" title="Tone">
        <Slider
          label="Base cutoff"
          value={settings.brightnessThreshold}
          min={0}
          max={100}
          hint="Filters background noise. Higher, deeper blacks."
          onChange={(v) => updateSetting('brightnessThreshold', v)}
        />
      </Section>

      <Section index="04" title="Glyphs">
        <div className="grid gap-2" role="radiogroup" aria-label="Character palette">
          {(Object.keys(CHAR_PALETTES) as (keyof typeof CHAR_PALETTES)[]).map((key) => {
            const active = settings.palette === key;
            return (
              <button
                key={key}
                role="radio"
                aria-checked={active}
                onClick={() => updateSetting('palette', key)}
                className={`group flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  active ? 'bg-ink border-ink text-paper' : 'bg-card border-line text-ink hover:border-ink'
                }`}
              >
                <span className="text-[13px] font-medium capitalize">{key}</span>
                <span className={`font-mono text-[11px] truncate max-w-[60%] ${active ? 'text-acid' : 'text-muted'}`}>
                  {CHAR_PALETTES[key].trim().slice(0, 14)}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section index="05" title="Colour">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Color mode">
          {COLOR_MODES.map((mode) => {
            const active = settings.colorMode === mode.id;
            return (
              <button
                key={mode.id}
                role="radio"
                aria-checked={active}
                onClick={() => updateSetting('colorMode', mode.id)}
                className={`rounded-xl border p-2 text-left transition-colors ${
                  active ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink hover:border-ink'
                }`}
              >
                <span className="block h-7 rounded-md border border-ink/20" style={{ background: mode.swatch }} />
                <span className="mt-1.5 flex items-center justify-between text-[12px] font-medium">
                  {mode.label}
                  {active && <span className="h-2 w-2 rounded-full bg-acid" />}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <div className="mt-auto pt-6 hidden md:flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-full border border-ink text-ink text-sm font-semibold hover:bg-ink hover:text-paper transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onDownload}
          disabled={!canExport}
          className="btn-pop flex-[2] py-3 rounded-full border-2 border-ink bg-acid text-ink text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export PNG
        </button>
      </div>
    </div>
  );
};

export default Controls;
