import React, { useCallback, useState } from 'react';
import { loadImage } from '../utils/imageProcessing';

interface DropzoneProps {
  onImageLoaded: (image: HTMLImageElement) => void;
  onSample: () => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageLoaded, onSample }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    loadImage(file).then(onImageLoaded).catch(() => {});
  }, [onImageLoaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative rounded-[28px] border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-ink bg-acid scale-[1.015]' : 'border-ink/40 bg-card hover:border-ink'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="sr-only"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col sm:flex-row items-center gap-5 px-6 py-8 sm:px-8 sm:py-10 cursor-pointer text-center sm:text-left"
        >
          <span className="relative shrink-0 grid place-items-center w-20 h-20 rounded-full bg-ink text-acid">
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <path id="ng-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="font-mono" fontSize="9.5" letterSpacing="2.4" fill="currentColor">
                <textPath href="#ng-circle">DROP · IMAGE · HERE · DROP · IMAGE ·</textPath>
              </text>
            </svg>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block font-serif text-3xl leading-tight text-ink">
              {isDragging ? 'Let it go.' : <>Drop a photo, or <span className="underline decoration-flare decoration-2 underline-offset-4">browse</span></>}
            </span>
            <span className="mt-1 block text-sm text-muted">
              JPG, PNG or WEBP. You can also paste with <kbd className="font-mono text-[11px] border border-line bg-paper rounded px-1.5 py-0.5 text-ink">⌘/Ctrl V</kbd>
            </span>
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
        <button
          onClick={onSample}
          className="btn-pop rounded-full border-2 border-ink bg-paper px-4 py-2 font-semibold text-ink"
        >
          ✺ Try a sample
        </button>
        <span className="text-muted">Everything runs in your browser. Nothing is uploaded.</span>
      </div>
    </div>
  );
};

export default Dropzone;
