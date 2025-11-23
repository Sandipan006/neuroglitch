<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NeuroGlitch 🎨⚡

<div align="center">
  <h3>Transform images into stunning ASCII art with cyberpunk aesthetics</h3>
  <p>Image processor that converts photos into glitchy, neon-drenched ASCII masterpieces</p>
</div>

## 🌟 Features

- **ASCII Art Conversion**: Transform any image into pixel-perfect ASCII art with multiple character palettes
- **Real-time Processing**: Adjust parameters and see changes instantly on your canvas
- **Multiple Color Modes**: Choose from mono, spectral, cyber, or original color schemes
- **Particle Effects**: Add glowing particle overlays for that extra cyberpunk vibe
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Export Functionality**: Download your creations as high-quality PNG files
- **No API Keys Required**: Works out of the box with no external dependencies

## 📸 Screenshots

### Desktop View
![Desktop Screenshot](./screenshots/desktop.png)

### Mobile View
![Mobile Screenshot](./screenshots/mobile.png)

### Example Output
![Example Output](./screenshots/example-output.png)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sandipan006/neuroglitch.git
cd neuroglitch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## 🎛️ Controls

- **Grid Density**: Adjust the resolution of the ASCII grid (lower = higher resolution)
- **Particle Intensity**: Control the frequency of glowing particle effects
- **Base Cutoff**: Filter background noise and dark areas
- **Highlight Cutoff**: Set brightness threshold for particle appearance
- **Font Size**: Scale the ASCII character size
- **Char Palette**: Choose from encryption, standard, or complex character sets
- **Color Mode**: Switch between mono, spectral, cyber, or original color schemes

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Image processing and rendering

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔧 Configuration

No configuration needed! The app works out of the box. Just install dependencies and run.

## 📦 Project Structure

```
neuroglitch/
├── components/
│   ├── Controls.tsx      # Parameter controls panel
│   └── Dropzone.tsx      # Image upload component
├── utils/
│   └── imageProcessing.ts # Core ASCII conversion logic
├── App.tsx               # Main application component
├── types.ts              # TypeScript type definitions
└── vite.config.ts        # Vite configuration
```

## 🎨 Usage

1. **Upload an Image**: Drag & drop or click to browse for an image file
2. **Adjust Parameters**: Use the controls to fine-tune the visual output
3. **Export**: Click "EXPORT PNG" to download your creation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and Vite
- Built with modern web technologies
- Font: Space Mono

---

<div align="center">
  Made with ⚡ and 🎨
</div>