# Yoga Voice - React Prototype

A beautiful React + Tailwind CSS prototype for generating guided meditations with custom scripts.

## Features

- Clean, modern UI with soft color palette
- Text input for yoga narration/meditation scripts
- Background music selection (Ocean Waves, Forest Ambience, Campfire Crackle, Soft Instrumental, No Music)
- Audio player with play/pause controls and progress bar
- Download and regenerate functionality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AudioPlayer.jsx    # Audio playback controls
│   │   └── MusicSelector.jsx  # Background music selection
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles with Tailwind
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite build configuration
└── postcss.config.js          # PostCSS configuration
```

## Technologies

- **React 18** - UI library
- **Tailwind CSS 3** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

