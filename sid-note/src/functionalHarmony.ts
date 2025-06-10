import { Chord, Note, Scale } from './musicTheory';

export enum ChordFunction {
  Tonic = 'Tonic',
  Supertonic = 'Supertonic',
  Mediant = 'Mediant',
  Subdominant = 'Subdominant',
  Dominant = 'Dominant',
  Submediant = 'Submediant',
  LeadingTone = 'LeadingTone'
}

export interface FunctionalHarmony {
  tonic: Chord;
  supertonic: Chord;
  mediant: Chord;
  subdominant: Chord;
  dominant: Chord;
  submediant: Chord;
  leadingTone: Chord;
}

export function getChordFunction(chord: Chord, key: Note): ChordFunction {
  const scale = new Scale(key, key.isMajor() ? 'major' : 'minor');
  const harmony = getFunctionalHarmony(scale);

  if (chord.equals(harmony.tonic)) return ChordFunction.Tonic;
  if (chord.equals(harmony.supertonic)) return ChordFunction.Supertonic;
  if (chord.equals(harmony.mediant)) return ChordFunction.Mediant;
  if (chord.equals(harmony.subdominant)) return ChordFunction.Subdominant;
  if (chord.equals(harmony.dominant)) return ChordFunction.Dominant;
  if (chord.equals(harmony.submediant)) return ChordFunction.Submediant;
  if (chord.equals(harmony.leadingTone)) return ChordFunction.LeadingTone;

  return ChordFunction.Tonic; // Default case
}

export function getFunctionalHarmony(scale: Scale): FunctionalHarmony {
  const notes = scale.getNotes();
  const isMajor = scale.getType() === 'major';

  return {
    tonic: new Chord(notes[0].toString(), isMajor ? '' : 'm'),
    supertonic: new Chord(notes[1].toString(), 'm'),
    mediant: new Chord(notes[2].toString(), isMajor ? 'm' : ''),
    subdominant: new Chord(notes[3].toString(), isMajor ? '' : 'm'),
    dominant: new Chord(notes[4].toString(), ''),
    submediant: new Chord(notes[5].toString(), isMajor ? 'm' : ''),
    leadingTone: new Chord(notes[6].toString(), 'dim')
  };
}
