// =============================================================================
// 新しい階層化されたコンポーネント構造
// =============================================================================

// CSR (Client-Side Rendering) Components
// -----------------------------------------------------------------------------
// Canvas描画系
export { default as FretboardRenderer } from "./csr/canvas/FretboardRenderer";
export type { FretboardConfig, PositionMarker } from "./csr/canvas/FretboardRenderer";
export { default as LegacyFretboard } from "./csr/canvas/LegacyFretboard";

// 表示系（完全再現版）
export { default as LegacyChordSegment } from "./csr/display/LegacyChordSegment";

// =============================================================================
// 既存コンポーネント（段階的に移行中）
// =============================================================================

// Common Components
export { default as CornerBox } from "./common/CornerBox";
export { default as PopupOnClick } from "./common/PopupOnClick";
export { RemarkList } from "./common/RemarkList";

// Layout Components  
export { default as CenteredPage } from "./layout/CenteredPage";
export { default as Footer } from "./layout/Footer";
export { default as TitleHeader } from "./layout/TitleHeader";

// Performance Components
export { default as Keyboard } from "./performance/Keyboard";
export { default as Left } from "./performance/Left";
export { default as Right } from "./performance/Right";
export { default as Staff } from "./performance/Staff";

// Score Components
export { default as ChordSegment } from "./score/ChordSegment";
export { default as Note } from "./score/Note";
export { default as Section } from "./score/Section";

// Track Components
export { default as CircleOfFifths } from "./track/CircleOfFifths";
export { default as DiatonicChord7thTable } from "./track/DiatonicChord7thTable";
export { default as DiatonicChordTable } from "./track/DiatonicChordTable";
export { default as NoteNameTable } from "./track/NoteNameTable";
export { default as Setlist } from "./track/Setlist";
export { default as SetlistItem } from "./track/SetlistItem";
export { default as Track } from "./track/Track";
export { default as TrackSectionItem } from "./track/TrackSectionItem";
export { default as TrackSections } from "./track/TrackSections";