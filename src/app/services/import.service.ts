import { Injectable } from '@angular/core';
import {
  Einsatzkraft,
  Medizinisch,
  MEDIZINISCH_ORDER,
  Taktisch,
  TAKTISCH_ORDER,
} from '../models/planung.model';

@Injectable({ providedIn: 'root' })
export class ImportService {
  parseRoster(text: string): Einsatzkraft[] {
    const seen = new Set<string>();
    const result: Einsatzkraft[] = [];

    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line) continue;

      const match = line.match(/^(.+?)\s*(?:\(([^)]*)\))?$/);
      if (!match) continue;

      const name = match[1].trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);

      const taktisch: Taktisch[] = [];
      const medizinisch: Medizinisch[] = [];
      const zusatz: string[] = [];

      if (match[2]) {
        for (const raw of match[2].split('|')) {
          const tag = raw.trim().toUpperCase();
          if (!tag) continue;
          const taktischMatch = TAKTISCH_ORDER.find((t) => t.toUpperCase() === tag);
          const medizinischMatch = MEDIZINISCH_ORDER.find((m) => m.toUpperCase() === tag);
          if (taktischMatch) taktisch.push(taktischMatch);
          else if (medizinischMatch) medizinisch.push(medizinischMatch);
          else zusatz.push(tag);
        }
      }

      result.push({
        id: crypto.randomUUID(),
        name,
        tags: {
          ...(taktisch.length ? { taktisch } : {}),
          ...(medizinisch.length ? { medizinisch } : {}),
          ...(zusatz.length ? { zusatz } : {}),
        },
      });
    }

    return result;
  }
}
