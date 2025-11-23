import React, { useCallback, useState } from 'react';

interface DropzoneProps {
  onImageLoaded: (image: HTMLImageElement) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => onImageLoaded(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onImageLoaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
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
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        w-full h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center
        transition-all duration-300 cursor-pointer group
        ${isDragging 
          ? 'border-cyan-400 bg-cyan-900/20 scale-[1.02]' 
          : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-800/50'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700 group-hover:text-white'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">Upload Image</h3>
        <p className="text-neutral-400 text-sm text-center max-w-xs">
          Drag & drop your file here, or click to browse.
          <br/>
          <span className="text-xs opacity-50 mt-2 block">Supports JPG, PNG, WEBP</span>
        </p>
      </label>
    </div>
  );
};

export default Dropzone;