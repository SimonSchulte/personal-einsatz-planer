import { Injectable, signal } from '@angular/core';
import { Einsatzkraft, EfsEinsatz, FahrzeugRef, Planung, Posten } from '../models/planung.model';
import { EXAMPLE_PLANUNG } from '../data/example-planung';

@Injectable({ providedIn: 'root' })
export class PlanungStoreService {
  /** List of all planungen (in-memory; later: persisted) */
  private readonly _planungen = signal<Planung[]>([EXAMPLE_PLANUNG]);

  /** The currently open Planung, or null */
  private readonly _active = signal<Planung | null>(null);

  readonly planungen = this._planungen.asReadonly();
  readonly active = this._active.asReadonly();

  openPlanung(id: string): void {
    const found = this._planungen().find((p) => p.id === id) ?? null;
    this._active.set(found);
  }

  closePlanung(): void {
    this._active.set(null);
  }

  createPlanung(name: string): Planung {
    const planung: Planung = {
      id: crypto.randomUUID(),
      name,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      posten: [],
      einsatzkraefte: [],
      einsatzleiter: null,
    };
    this._planungen.update((list) => [...list, planung]);
    this._active.set(planung);
    return planung;
  }

  updateActive(planung: Planung): void {
    this._active.set(planung);
    this._planungen.update((list) => list.map((p) => (p.id === planung.id ? planung : p)));
  }

  addPosten(): void {
    const active = this._active();
    if (!active) return;
    const newPosten: Posten = {
      id: crypto.randomUUID(),
      label: 'Neuer Posten',
      fahrzeug: null,
      positions: [],
    };
    this.updateActive({ ...active, posten: [...active.posten, newPosten] });
  }

  setPostenFahrzeug(postenId: string, fahrzeug: FahrzeugRef | null): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      posten: active.posten.map((p) => (p.id === postenId ? { ...p, fahrzeug } : p)),
    });
  }

  deletePosten(postenId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({ ...active, posten: active.posten.filter((p) => p.id !== postenId) });
  }

  clearPosten(postenId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      posten: active.posten.map((p) =>
        p.id === postenId
          ? { ...p, positions: p.positions.map((pos) => ({ ...pos, assigned: null })) }
          : p,
      ),
    });
  }

  assignToPosition(postenId: string, positionId: string, einsatzkraftId: string): void {
    const active = this._active();
    if (!active) return;
    const ek = active.einsatzkraefte.find((e) => e.id === einsatzkraftId);
    if (!ek) return;
    this.updateActive({
      ...active,
      posten: active.posten.map((p) =>
        p.id === postenId
          ? {
              ...p,
              positions: p.positions.map((pos) =>
                pos.id === positionId ? { ...pos, assigned: { id: ek.id, name: ek.name } } : pos,
              ),
            }
          : p,
      ),
    });
  }

  importPlanung(planung: Planung): void {
    const exists = this._planungen().some((p) => p.id === planung.id);
    if (exists) {
      this._planungen.update((list) => list.map((p) => (p.id === planung.id ? planung : p)));
    } else {
      this._planungen.update((list) => [...list, planung]);
    }
    this._active.set(planung);
  }

  importRoster(
    incoming: Einsatzkraft[],
    mode: 'replace' | 'merge',
  ): { removedNames: string[]; affectedAssignments: string[] } {
    const active = this._active();
    if (!active) return { removedNames: [], affectedAssignments: [] };

    const current = active.einsatzkraefte;

    // Merge: reuse existing entries for known names, add new ones
    const merged = incoming.map((inc) => current.find((e) => e.name === inc.name) ?? inc);

    if (mode === 'merge') {
      const existingNames = new Set(current.map((e) => e.name));
      const toAdd = merged.filter((e) => !existingNames.has(e.name));
      this.updateActive({ ...active, einsatzkraefte: [...current, ...toAdd] });
      return { removedNames: [], affectedAssignments: [] };
    }

    // replace mode
    const incomingNames = new Set(incoming.map((e) => e.name));
    const removed = current.filter((e) => !incomingNames.has(e.name));
    const removedIds = new Set(removed.map((e) => e.id));

    const affectedAssignments = removed
      .filter((e) =>
        active.posten.some((p) => p.positions.some((pos) => pos.assigned?.id === e.id)),
      )
      .map((e) => e.name);

    const newPosten = active.posten.map((p) => ({
      ...p,
      positions: p.positions.map((pos) =>
        pos.assigned && removedIds.has(pos.assigned.id) ? { ...pos, assigned: null } : pos,
      ),
    }));

    this.updateActive({ ...active, einsatzkraefte: merged, posten: newPosten });
    return { removedNames: removed.map((e) => e.name), affectedAssignments };
  }

  /** Creates a new Planung from an EFS event and sets it as active. */
  openEfsEinsatz(einsatz: EfsEinsatz): Planung {
    const existing = this._planungen().find((p) => p.hiorg_einsatz_id === einsatz.id);
    if (existing) {
      this._active.set(existing);
      return existing;
    }
    const planung: Planung = {
      id: crypto.randomUUID(),
      name: einsatz.titel,
      start: einsatz.datum_von,
      end: einsatz.datum_bis,
      posten: [],
      einsatzkraefte: [],
      einsatzleiter: null,
      hiorg_einsatz_id: einsatz.id,
    };
    this._planungen.update((list) => [...list, planung]);
    this._active.set(planung);
    return planung;
  }

  /**
   * Merges incoming Einsatzkräfte into the active Planung without overwriting existing ones.
   * Deduplication uses hiorg_org_id first, then full name.
   */
  mergeEfsEinsatzkraefte(incoming: Einsatzkraft[]): void {
    const active = this._active();
    if (!active) return;
    const current = active.einsatzkraefte;
    const existingHiorgIds = new Set(current.map((e) => e.hiorg_org_id).filter(Boolean));
    const existingNames = new Set(current.map((e) => e.name));
    const toAdd = incoming.filter(
      (e) =>
        !(e.hiorg_org_id && existingHiorgIds.has(e.hiorg_org_id)) && !existingNames.has(e.name),
    );
    if (toAdd.length > 0) {
      this.updateActive({ ...active, einsatzkraefte: [...current, ...toAdd] });
    }
  }

  unassignFromPosition(postenId: string, positionId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      posten: active.posten.map((p) =>
        p.id === postenId
          ? {
              ...p,
              positions: p.positions.map((pos) =>
                pos.id === positionId ? { ...pos, assigned: null } : pos,
              ),
            }
          : p,
      ),
    });
  }
}
