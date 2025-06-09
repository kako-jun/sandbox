# Sid Note

_Read this in other languages: [日本語](README.ja.md)_

An interactive sheet music and tablature application for bass guitar practice.

## Overview

Sid Note is a web application designed to support bass guitar learning. It provides sheet music display, fingering instructions, scale and chord theory learning, and audio playback features to create an effective bass practice environment.

## Key Features

### 🎵 Sheet Music & Tablature Display

- **Interactive Sheet Music**: Clickable notation with audio playback
- **Fingering Display**: Detailed finger numbers, string numbers, and fret positions
- **Note Values**: Accurate representation of whole, half, quarter, eighth notes, etc.

### 🎼 Music Theory Support

- **Chord Theory**: Diatonic chords, 7th chords with visual and audio confirmation
- **Scale Theory**: Major and minor scale visualization
- **Interval Display**: Degree (interval) display from root notes
- **Circle of Fifths**: Visual understanding of key relationships

### 🎸 Bass-Specific Features

- **4-String Bass Support**: Standard E-A-D-G tuning
- **Fretboard Display**: Visualization of note positions on the fingerboard
- **Fingering Patterns**: Practical fingering and muting techniques
- **Range Display**: Notation optimized for bass guitar range

### 🎯 Practice Content

- **Basic Exercises**: Chromatic, pentatonic, and diatonic patterns
- **Chord Practice**: Fingering patterns for all chord types
- **Song Practice**: Practical exercises using real songs
- **Fretboard Practice**: Note name recognition on the fingerboard

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Management**: YAML + Zod validation
- **Testing**: Jest
- **Music Theory**: Custom-implemented music theory library

## Setup

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Other Commands

```bash
# Production build
npm run build

# Start production server
npm run start

# ESLint code check
npm run lint

# Run tests
npm run test
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── csr/               # Client-side components
│   │   ├── performance/   # Music playback features
│   │   ├── score/         # Sheet music display
│   │   └── track/         # Track details
│   └── ssr/               # Server-side components
│       ├── layout/        # Layout components
│       ├── setlist/       # Setlist components
│       └── track/         # Track listing
├── schemas/               # Data validation
├── utils/
│   ├── loader/           # Data loading utilities
│   └── music/            # Music theory library
│       └── theory/
│           ├── chord/    # Chord theory
│           ├── note/     # Pitch & note names
│           └── notation/ # Musical notation
public/
├── track/                # Song data (YAML)
├── note/                 # Note value icons (SVG)
├── instrument/           # Instrument icons
└── functional_harmony/   # Functional harmony diagrams
```

## Data Format

Song data is managed in YAML format and includes the following information:

- **Song Metadata**: Title, artist, key, tempo
- **Section Structure**: Intro, verse, chorus, etc.
- **Note Information**: Pitch, note values, fingering, strokes
- **Chord Progressions**: Chord names and constituent notes
- **Instrument Instructions**: Part assignments for each instrument

## Contributing

This project is for personal practice, but feedback on music theory implementation and bass education is welcome.

## License

This project is intended for personal use. Please be mindful of copyright for song data.
