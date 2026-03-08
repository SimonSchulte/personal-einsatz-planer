export const TAKTISCH_ORDER = ['H', 'KSH', 'GF', 'ZF', 'GdSA', 'VF'] as const;
export const MEDIZINISCH_ORDER = [
  'EH', 'SSD', 'SanH', 'SAN', 'FR', 'RS', 'RA', 'NotSan', 'RH', 'RDH', 'A', 'NA',
] as const;

export type Taktisch = (typeof TAKTISCH_ORDER)[number];
export type Medizinisch = (typeof MEDIZINISCH_ORDER)[number];

export interface Requirements {
  taktisch: Taktisch | null;
  medizinisch: Medizinisch | null;
  zusatz?: string | null;
}

export interface EinsatzkraftRef {
  id: string;
  name: string;
}

export interface Fahrzeug {
  seriennummer: string;
  funkruf: string;
  hiorgId: string;
}

export interface FahrzeugRef {
  seriennummer: string | null;
  funkruf: string;
  hiorgId: string | null;
}

export interface Position {
  id: string;
  label: string;
  requirements: Requirements;
  assigned: EinsatzkraftRef | null;
}

export interface Posten {
  id: string;
  label: string;
  fahrzeug: FahrzeugRef | null;
  positions: Position[];
}

export interface Abschnitt {
  id: string;
  label: string;
  posten: Posten[];
}

export interface Einsatzkraft {
  id: string;
  /** "Nachname Vorname" */
  name: string;
  tags: {
    taktisch?: Taktisch[];
    medizinisch?: Medizinisch[];
    zusatz?: string[];
  };
  meta?: { notes?: string };
}

export interface Planung {
  id: string;
  name: string;
  start: string;
  end: string;
  abschnitte: Abschnitt[];
  einsatzkraefte: Einsatzkraft[];
  einsatzleiter: EinsatzkraftRef | null;
}

export interface PepFile {
  version: string;
  meta: { exportedAt: string; locale: string };
  planung: Planung;
}
