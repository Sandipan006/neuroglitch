import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dropzone from './components/Dropzone';
import Controls from './components/Controls';
import { renderCombined, loadImage, createSampleImage } from './utils/imageProcessing';
import { ProcessSettings, DEFAULT_SETTINGS } from './types';

const TICKER = ['Pictures into living type', 'ASCII', 'Particles', 'Spectral colour', '100% in-browser', 'No uploads', 'Export PNG'];

const Marquee: React.FC = () => (
  <div className="overflow-hidden border-y-2 border-ink bg-ink text-acid select-none" aria-hidden="true">
    <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
      {[0, 1].map((copy) => (
        <div key={copy} className="flex">
          {[...TICKER, ...TICKER].map((word, i) => (
            <span key={i} className="font-mono text-xs uppercase tracking-[0.2em] px-5">
              {word} <span className="text-flare pl-5">✺</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<ProcessSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render whenever the image or settings change
  useEffect(() => {
    if (sourceImage && canvasRef.current) {
      // Small timeout to allow UI to update before heavy sync calc
      const timer = setTimeout(() => {
        setIsProcessing(true);
        requestAnimationFrame(() => {
            if (sourceImage && canvasRef.current) {
                renderCombined(sourceImage, canvasRef.current, settings);
                setDims({ w: canvasRef.current.width, h: canvasRef.current.height });
            }
            setIsProcessing(false);
        });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [sourceImage, settings]);

  const handleImageLoaded = useCallback((img: HTMLImageElement) => {
    setSourceImage(img);
  }, []);

  const handleSample = useCallback(() => {
    createSampleImage().then(setSourceImage).catch(() => {});
  }, []);

  // Paste an image from the clipboard anywhere on the page
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (!file) return;
      e.preventDefault();
      loadImage(file).then(setSourceImage).catch(() => {});
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  const updateSetting = useCallback(<K extends keyof ProcessSettings>(key: K, value: ProcessSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSourceImage(null);
    setDims(null);
  };

  const handleDownload = () => {
    if (!canvasRef.current || !sourceImage) return;
    const link = document.createElement('a');
    link.download = `neuroglitch-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const peekHandlers = {
    onPointerDown: () => setShowOriginal(true),
    onPointerUp: () => setShowOriginal(false),
    onPointerLeave: () => setShowOriginal(false),
    onPointerCancel: () => setShowOriginal(false),
  };

  return (
    <div className="flex h-dvh w-screen bg-paper text-ink font-sans overflow-hidden">

      {/* Main column */}
      <main className="flex-1 flex flex-col h-full min-w-0">

        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-line bg-paper/90 backdrop-blur z-20">
          <a href="/" className="flex items-center gap-2.5" aria-label="NeuroGlitch home">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-ink" />
            <span className="font-serif text-[26px] leading-none tracking-tight">
              Neuro<em className="text-flare">glitch</em>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <span className="hidden lg:inline font-mono text-[10px] uppercase tracking-[0.2em] text-muted mr-2">
              Local · Private · Free
            </span>
            {sourceImage && (
              <button
                onClick={handleReset}
                className="rounded-full border border-ink px-4 py-1.5 text-xs font-semibold hover:bg-ink hover:text-paper transition-colors"
              >
                New image
              </button>
            )}
          </div>
        </header>

        {/* Scrollable content (mobile scrolls; desktop keeps the stage fixed) */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col">

          {/* Stage */}
          <div className="paper-grid shrink-0 md:shrink md:flex-1 md:min-h-0 flex flex-col">
            {!sourceImage ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center px-4 sm:px-10 lg:px-16 py-10 md:overflow-y-auto">
                  <div className="w-full max-w-3xl animate-fade-in-up">
                    <p className="inline-flex items-center gap-2 rounded-full border border-ink bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-flare" />
                      ASCII studio
                    </p>
                    <h1 className="mt-5 font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] tracking-tight">
                      Turn pictures into <em className="relative whitespace-nowrap">
                        <span className="relative z-10">living type</span>
                        <span className="absolute left-0 right-0 bottom-[0.08em] h-[0.32em] bg-acid z-0" aria-hidden="true" />
                      </em>.
                    </h1>
                    <p className="mt-5 max-w-xl text-base sm:text-lg text-muted leading-relaxed">
                      Neuroglitch rebuilds your photo out of characters and glowing particles.
                      Pick a glyph set, dial in the colour, export a print-ready PNG.
                    </p>
                    <div className="mt-8">
                      <Dropzone onImageLoaded={handleImageLoaded} onSample={handleSample} />
                    </div>
                  </div>
                </div>
                <Marquee />
              </div>
            ) : (
              <div className="flex-1 min-h-[55vh] md:min-h-0 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 animate-fade-in">
                {/* Mounted print */}
                <figure className="relative max-w-full max-h-full flex flex-col min-h-0">
                  <div className="relative bg-ink p-2 sm:p-3 rounded-[18px] shadow-[8px_8px_0_rgba(20,20,18,0.9)] min-h-0">
                    <div className="relative overflow-hidden rounded-[10px]">
                      <canvas
                        ref={canvasRef}
                        className="block max-w-full max-h-[62vh] md:max-h-[calc(100dvh-14rem)] object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {showOriginal && (
                        <img src={sourceImage.src} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
                      )}
                      {isProcessing && (
                        <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-acid text-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                          Rendering
                        </div>
                      )}
                    </div>
                  </div>
                  <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    <span>
                      <span className="text-ink">Plate 01</span>
                      {dims && <> — {dims.w}×{dims.h}px</>} · {settings.palette} · {settings.colorMode}
                    </span>
                    <button
                      {...peekHandlers}
                      className="select-none touch-none rounded-full border border-ink bg-card px-3 py-1 text-ink hover:bg-ink hover:text-paper transition-colors"
                    >
                      {showOriginal ? 'Showing original' : 'Hold to compare'}
                    </button>
                  </figcaption>
                </figure>
              </div>
            )}
          </div>

          {/* Mobile controls (below the stage) */}
          <div className="md:hidden w-full bg-card border-t-2 border-ink shrink-0 pb-28">
            <Controls
              className="px-5 pt-8"
              settings={settings}
              updateSetting={updateSetting}
              onReset={handleReset}
              onDownload={handleDownload}
              canExport={!!sourceImage}
            />
          </div>
        </div>
      </main>

      {/* Desktop panel */}
      <aside className="hidden md:flex w-[360px] lg:w-[380px] h-full shrink-0 flex-col border-l-2 border-ink bg-card overflow-y-auto">
        <Controls
          className="p-6 min-h-full"
          settings={settings}
          updateSetting={updateSetting}
          onReset={handleReset}
          onDownload={handleDownload}
          canExport={!!sourceImage}
        />
      </aside>

      {/* Mobile action bar */}
      {sourceImage && (
        <div className="md:hidden fixed bottom-3 left-3 right-3 flex items-center gap-2 rounded-full border-2 border-ink bg-paper p-1.5 shadow-[4px_4px_0_#141412] z-[100]">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-full text-sm font-semibold text-ink"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            className="flex-[2] py-3 rounded-full bg-ink text-acid text-sm font-bold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PNG
          </button>
        </div>
      )}
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
