import React, { useState, useRef, useEffect, useCallback } from 'react';
import Dropzone from './components/Dropzone';
import Controls from './components/Controls';
import { renderCombined } from './utils/imageProcessing';
import { ProcessSettings, DEFAULT_SETTINGS } from './types';
import { analyzeImageArt } from './services/gemini';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<ProcessSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initial render effect
  useEffect(() => {
    if (sourceImage && canvasRef.current) {
      // Small timeout to allow UI to update before heavy sync calc
      const timer = setTimeout(() => {
        setIsProcessing(true);
        requestAnimationFrame(() => {
            if (sourceImage && canvasRef.current) {
                renderCombined(sourceImage, canvasRef.current, settings);
            }
            setIsProcessing(false);
        });
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [sourceImage, settings]);

  const handleImageLoaded = (img: HTMLImageElement) => {
    setSourceImage(img);
    setAiAnalysis(""); // Reset AI text on new image
  };

  const updateSetting = useCallback(<K extends keyof ProcessSettings>(key: K, value: ProcessSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSourceImage(null);
    setAiAnalysis("");
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `neuroglitch-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const triggerAiAnalysis = async () => {
      if (!canvasRef.current) return;
      setIsAnalyzing(true);
      setAiAnalysis("Interfacing with neural net...");
      
      const dataUrl = canvasRef.current.toDataURL('image/png');
      await analyzeImageArt(dataUrl, setAiAnalysis);
      setIsAnalyzing(false);
  };

  return (
    <div className="flex h-dvh w-screen bg-black text-white font-sans overflow-hidden relative">
      
      {/* Desktop Sidebar (Visible only on md+) */}
      <aside className="hidden md:flex w-80 h-full flex-col border-r border-neutral-800 z-10 shrink-0 relative bg-neutral-900 overflow-y-auto">
        <Controls 
            className="p-6 min-h-full"
            settings={settings} 
            updateSetting={updateSetting} 
            onReset={handleReset}
            onDownload={handleDownload}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#050505] relative">
        
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-neutral-800 bg-black/40 backdrop-blur flex items-center justify-between px-6 z-20 sticky top-0 md:relative">
             <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                 <h1 className="font-mono font-bold text-xl tracking-[0.2em] text-white">
                    NEURO<span className="text-cyan-400">GLITCH</span>
                 </h1>
             </div>
             
             {sourceImage && (
                 <button 
                    onClick={handleReset}
                    className="md:hidden bg-neutral-800 text-white px-3 py-1 text-xs font-mono rounded border border-neutral-700"
                 >
                    RESET
                 </button>
             )}
        </header>

        {/* Scrollable Content Container (Mobile: Scrolls y, Desktop: Fixed/Hidden overflow) */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden relative flex flex-col md:flex-row gap-4">
          
          {/* Canvas / Dropzone Area */}
          <div className="flex-1 w-full min-h-[50vh] md:h-full flex flex-col items-center justify-start md:justify-center px-4 pt-8 md:pt-24 pb-8 md:p-8 relative shrink-0">
            
            {!sourceImage ? (
              <div className="w-full max-w-xl z-10 animate-fade-in-up">
                 <Dropzone onImageLoaded={handleImageLoaded} />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center animate-fade-in min-h-[300px]">
                  {/* The Canvas Container */}
                  <div className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl shadow-black/50 border border-neutral-800 bg-black">
                      <canvas 
                          ref={canvasRef}
                          className="max-w-full max-h-[80vh] md:max-h-full object-contain block"
                          style={{ imageRendering: 'pixelated' }}
                      />
                      
                      {/* Processing Indicator Overlay */}
                      {isProcessing && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                              <div className="font-mono text-cyan-400 text-sm animate-pulse bg-black/80 px-6 py-3 rounded border border-cyan-900/50 tracking-widest">
                                  PROCESSING_MATRIX...
                              </div>
                          </div>
                      )}
                  </div>
              </div>
            )}
          </div>

          {/* Mobile Controls (Visible only on small screens, below image) */}
          <div className="md:hidden w-full bg-neutral-900 border-t border-neutral-800 shrink-0 mt-8 z-10 relative pb-32">
             <Controls 
                className="px-6 pt-10 pb-0" 
                settings={settings} 
                updateSetting={updateSetting} 
                onReset={handleReset}
                onDownload={handleDownload}
             />
          </div>

        </div>

        {/* Bottom Bar / AI Interaction (Fixed on Desktop, part of flow logic or fixed on mobile) */}
        {sourceImage && (
            <div className="h-14 shrink-0 border-t border-neutral-800 bg-neutral-900/90 backdrop-blur px-6 flex items-center gap-4 z-40 md:static fixed bottom-0 left-0 right-0 w-full">
                 <button
                    onClick={triggerAiAnalysis}
                    disabled={isAnalyzing}
                    className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-[10px] font-mono font-bold border border-neutral-700 hover:border-cyan-500/50 rounded transition-all disabled:opacity-50 whitespace-nowrap tracking-wider uppercase"
                 >
                    {isAnalyzing ? "SCANNING..." : "ANALYZE_ARTIFACT"}
                 </button>
                 <div className="h-4 w-px bg-neutral-700 mx-2"></div>
                 <p className="text-xs font-mono text-neutral-400 truncate flex-1">
                    {aiAnalysis ? (
                        <span className="animate-fade-in text-cyan-100">{aiAnalysis}</span>
                    ) : (
                        <span className="opacity-30">/// Awaiting Neural Link...</span>
                    )}
                 </p>
            </div>
        )}

        {/* Background Grid Decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 mix-blend-screen fixed" 
             style={{
                 backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '40px 40px'
             }}>
        </div>
      </main>

      {/* Mobile Fixed Action Buttons (Reset & Export) - Outside main for proper fixed positioning */}
      {sourceImage && (
          <div className="md:hidden fixed bottom-14 left-0 right-0 w-full h-16 shrink-0 border-t border-neutral-800 bg-neutral-900/95 backdrop-blur px-4 flex items-center gap-3 z-[100]">
              <button
                  onClick={handleReset}
                  className="flex-1 py-3 border border-neutral-700 text-neutral-400 text-sm font-bold rounded hover:bg-neutral-800 hover:text-white transition-colors font-mono"
              >
                  RESET
              </button>
              <button
                  onClick={handleDownload}
                  className="flex-[2] py-3 bg-cyan-600 text-white text-sm font-bold rounded shadow-lg shadow-cyan-900/50 hover:bg-cyan-500 transition-colors flex items-center justify-center gap-2 font-mono"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  EXPORT PNG
              </button>
          </div>
      )}
    </div>
  );
};

export default App;