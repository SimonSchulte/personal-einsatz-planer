import { Injectable, signal } from '@angular/core';
import { FahrzeugRef, Planung, Posten } from '../models/planung.model';
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
