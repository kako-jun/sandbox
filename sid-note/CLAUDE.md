# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Background & Vision

**Sid Note** is a bass fretboard visualization web application. The name combines "Sid Vicious", "Death Note", and musical notes.

### Problem Statement
- Bass chord charts don't show unique fingering positions (octave/string variations)
- TAB notation shows fingering but can't express muting techniques (right hand, left hand, fingers, palm)
- Existing fretboard diagrams are static images (Photoshop-created), difficult to modify

### Solution
- Canvas-generated fretboard diagrams showing fingering and muting suggestions with reasoning
- Currently personal use (embedded in TSX)
- Future: Web API returning canvas images for blog embedding

### Current Status
- **sid-note_old**: Working reference implementation (ideal state)
- **Current version**: Degraded after AI refactoring, needs restoration

### Refactoring Goals
1. **Restore functionality**: No feature degradation from sid-note_old
2. **Revert styling**: Remove Tailwind CSS, return to inline styles
3. **Preserve structure**: Keep utils/ directory organization and core/ naming
4. **Maintain tests**: Preserve valuable test cases (handles complex musical chords)
5. **Japanese notation**: Support ♭ (flat) and ＃ (sharp) characters

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests in watch mode
npm run test -- --watch
```

## Project Architecture

### Component Organization

The project uses a strict CSR/SSR component separation:

- `src/components/ssr/` - Server-side rendered components (static content)
- `src/components/csr/` - Client-side rendered components (interactive features)

This separation is architectural - SSR components handle data presentation while CSR components handle user interactions like audio playback and dynamic UI.

### Music Theory Library

Located in `src/utils/music/theory/`, this is a comprehensive music theory implementation using a "default + delta" design pattern:

- **Core modules** (`core/`): Notes, intervals, chords, scales, pitch, frequency, notation
- **Harmony modules** (`harmony/`): Functional harmony analysis and chord progressions
- **Audio modules** (`audio/`): Sound generation and playback management

The chord system implements the "default + delta" pattern where chords start with a major triad (1, 3, 5) and apply modifications (e.g., 'm' changes 3 to ♭3).

### Data Management

- **YAML + Zod validation**: Track data stored in `public/track/` as YAML files
- **Schema validation**: `src/schemas/` contains Zod schemas for type-safe data validation
- **Loaders**: `src/utils/loader/` handles data loading and validation

### Track Data Structure

Each track contains:
- Metadata (title, artist, key, tempo, time signature)
- Sections (intro, verse, chorus, etc.)
- Notes with fingering instructions (finger, string, fret positions)
- Chord segments with harmonic analysis

## Key Technical Patterns

### TypeScript Configuration

- Strict mode enabled with additional checks (`noUnusedLocals`, `noImplicitReturns`)
- Path mapping: `@/*` maps to `src/*`
- ESLint enforces explicit function return types and no-any policies

### Testing Strategy

- Jest with ts-jest preset
- Coverage thresholds set to 80% across all metrics
- Test files follow `*.test.ts` pattern
- Music theory modules have comprehensive unit tests

### File Naming Conventions

- React components: PascalCase (e.g., `ChordSegment.tsx`)
- Utilities: camelCase (e.g., `chordUtil.ts`)
- Test files: `*.test.ts` suffix
- Schema files: `*Schema.ts` suffix

## Music Theory Library Specifications

### Design Philosophy
- **Custom implementation**: No external music theory libraries (for Japanese language support)
- **Bass-focused**: 4-string bass primary, 6-string bass future support (no guitar support needed)
- **Reusable**: Future NPM package candidate

### Notation Standards
- **Input normalization**: Accept b, #, ♯, ♭ → normalize to ♭, ＃ internally
- **Interval notation**: ♭3, ＃5 format
- **Pitch notation**: C3, D♭4 format  
- **Enharmonic notation**: C＃/D♭3 format (not C＃3/D♭3)
- **Roman numerals**: Ⅶ format (not VII)
- **Internal unit**: Fret numbers (semitones) for calculations

### Key Functions Required
- Normalization (♭, ＃)
- Note/octave parsing (regex)
- Interval/pitch/chord/key/scale/cadence conversions
- Functional harmony analysis
- Chord voicing generation

### Reference Implementation
- **sid-note_old**: Correct behavior reference
- **Current tests**: Valuable test cases to preserve
- **Test expectations**: May need updates for new internal units

## Music Theory Implementation Notes

When working with the music theory modules:

- Chord parsing uses regex patterns to extract musical information
- Interval calculations are semitone-based
- Note names support both sharp (#) and flat (♭) notations
- Audio generation uses Web Audio API for precise frequency control

## Development Workflow

1. Always run type checking before committing: `npm run type-check`
2. Lint code: `npm run lint`
3. Run tests to ensure music theory accuracy: `npm run test`
4. Use the existing component patterns when adding new features
5. Follow the CSR/SSR separation for new components

## Refactoring Principles

### Priority Order
1. **sid-note_old as truth**: When uncertain, sid-note_old behavior is correct
2. **No functional regression**: All features must work as before
3. **Preserve valuable tests**: Test cases handle complex musical scenarios
4. **Internal structure improvement**: Better organization without external changes

### Approach
- Remove Tailwind CSS completely, revert to inline styles
- Fix broken utils/ functions while preserving directory structure
- Update test expectations if internal units change
- Maintain CSR/SSR component separation
- Keep core/ naming and organization

## Work History

### 2025/6/10 - Debug Execution Fix
- Next.js 14.1.0 → 15.3.2 upgrade
- React 18 → 19 upgrade  
- Fixed params Promise type compatibility
- Removed unused variables and import errors
- Successfully restored build and dev server functionality