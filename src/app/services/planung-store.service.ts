import { Injectable, signal } from '@angular/core';
import { Abschnitt, Einsatzkraft, FahrzeugRef, Planung, Posten } from '../models/planung.model';
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
      abschnitte: [],
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

  addAbschnitt(): void {
    const active = this._active();
    if (!active) return;
    const newAbschnitt: Abschnitt = {
      id: crypto.randomUUID(),
      label: 'Neuer Abschnitt',
      posten: [],
    };
    this.updateActive({ ...active, abschnitte: [...active.abschnitte, newAbschnitt] });
  }

  deleteAbschnitt(abschnittId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({ ...active, abschnitte: active.abschnitte.filter((a) => a.id !== abschnittId) });
  }

  reorderPosten(abschnittId: string, fromIndex: number, toIndex: number): void {
    const active = this._active();
    if (!active || fromIndex === toIndex) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => {
        if (a.id !== abschnittId) return a;
        const posten = [...a.posten];
        const [moved] = posten.splice(fromIndex, 1);
        posten.splice(toIndex, 0, moved);
        return { ...a, posten };
      }),
    });
  }

  movePosten(postenId: string, fromAbschnittId: string, toAbschnittId: string, newIndex: number): void {
    const active = this._active();
    if (!active) return;
    const posten = active.abschnitte.flatMap((a) => a.posten).find((p) => p.id === postenId);
    if (!posten) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => {
        if (a.id === fromAbschnittId) return { ...a, posten: a.posten.filter((p) => p.id !== postenId) };
        if (a.id === toAbschnittId) {
          const next = [...a.posten];
          next.splice(newIndex, 0, posten);
          return { ...a, posten: next };
        }
        return a;
      }),
    });
  }

  renameAbschnitt(abschnittId: string, label: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => (a.id === abschnittId ? { ...a, label } : a)),
    });
  }

  addPosten(abschnittId: string): void {
    const active = this._active();
    if (!active) return;
    const newPosten: Posten = {
      id: crypto.randomUUID(),
      label: 'Neuer Posten',
      fahrzeug: null,
      positions: [],
    };
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) =>
        a.id === abschnittId ? { ...a, posten: [...a.posten, newPosten] } : a,
      ),
    });
  }

  setPostenFahrzeug(postenId: string, fahrzeug: FahrzeugRef | null): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => ({
        ...a,
        posten: a.posten.map((p) => (p.id === postenId ? { ...p, fahrzeug } : p)),
      })),
    });
  }

  deletePosten(postenId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => ({
        ...a,
        posten: a.posten.filter((p) => p.id !== postenId),
      })),
    });
  }

  clearPosten(postenId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => ({
        ...a,
        posten: a.posten.map((p) =>
          p.id === postenId
            ? { ...p, positions: p.positions.map((pos) => ({ ...pos, assigned: null })) }
            : p,
        ),
      })),
    });
  }

  assignToPosition(postenId: string, positionId: string, einsatzkraftId: string): void {
    const active = this._active();
    if (!active) return;
    const ek = active.einsatzkraefte.find((e) => e.id === einsatzkraftId);
    if (!ek) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => ({
        ...a,
        posten: a.posten.map((p) =>
          p.id === postenId
            ? {
                ...p,
                positions: p.positions.map((pos) =>
                  pos.id === positionId ? { ...pos, assigned: { id: ek.id, name: ek.name } } : pos,
                ),
              }
            : p,
        ),
      })),
    });
  }

  unassignFromPosition(postenId: string, positionId: string): void {
    const active = this._active();
    if (!active) return;
    this.updateActive({
      ...active,
      abschnitte: active.abschnitte.map((a) => ({
        ...a,
        posten: a.posten.map((p) =>
          p.id === postenId
            ? {
                ...p,
                positions: p.positions.map((pos) =>
                  pos.id === positionId ? { ...pos, assigned: null } : pos,
                ),
              }
            : p,
        ),
      })),
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
    const allPosten = active.abschnitte.flatMap((a) => a.posten);

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
      .filter((e) => allPosten.some((p) => p.positions.some((pos) => pos.assigned?.id === e.id)))
      .map((e) => e.name);

    const newAbschnitte = active.abschnitte.map((a) => ({
      ...a,
      posten: a.posten.map((p) => ({
        ...p,
        positions: p.positions.map((pos) =>
          pos.assigned && removedIds.has(pos.assigned.id) ? { ...pos, assigned: null } : pos,
        ),
      })),
    }));

    this.updateActive({ ...active, einsatzkraefte: merged, abschnitte: newAbschnitte });
    return { removedNames: removed.map((e) => e.name), affectedAssignments };
  }
}
