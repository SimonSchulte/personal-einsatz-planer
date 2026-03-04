import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { DragDropModule, CdkDragDrop, CdkDragStart } from '@angular/cdk/drag-drop';
import { PlanungStoreService } from '../../services/planung-store.service';
import { SaveLoadService } from '../../services/save-load.service';
import {
  Einsatzkraft,
  Fahrzeug,
  FahrzeugRef,
  Planung,
  Posten,
  Position,
  TAKTISCH_ORDER,
  MEDIZINISCH_ORDER,
  Taktisch,
  Medizinisch,
} from '../../models/planung.model';
import { FAHRZEUGE } from '../../data/fahrzeuge';
import { ImportDialog } from '../../components/import-dialog/import-dialog';

interface DragData {
  einsatzkraftId: string;
  fromPostenId: string | null;
  fromPositionId: string | null;
}

interface DropData {
  postenId: string;
  positionId: string;
}

type MatchLevel = 'full' | 'partial' | 'mismatch' | 'neutral';

interface Staerke {
  fuhrer: number;
  unterfuehrer: number;
  helfer: number;
  gesamt: number;
}

@Component({
  selector: 'app-planning-editor',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatChipsModule,
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    DatePipe,
    DragDropModule,
  ],
  templateUrl: './planning-editor.html',
  styleUrl: './planning-editor.less',
})
export class PlanningEditor {
  private readonly store = inject(PlanungStoreService);
  private readonly router = inject(Router);
  private readonly saveLoad = inject(SaveLoadService);
  private readonly dialog = inject(MatDialog);

  readonly planung = this.store.active;

  /** Selected items for inspector pane — Posten takes priority over Position */
  selectedPosten: Posten | null = null;
  selectedPosition: { posten: Posten; position: Position } | null = null;

  readonly inspectorCollapsed = signal(true);
  toggleInspector(): void { this.inspectorCollapsed.update(v => !v); }
  toggleAssignedList(): void { this.assignedListCollapsed.update(v => !v); }

  readonly TAKTISCH_LABEL: Record<Taktisch, string> = {
    H: 'Helfer',
    KSH: 'Katastrophenschutzhelfer',
    GF: 'Gruppenführer',
    ZF: 'Zugführer',
    GdSA: 'Grundlagen der Stabsarbeit',
    VF: 'Verbandsführer',
  };

  readonly MEDIZINISCH_LABEL: Record<Medizinisch, string> = {
    EH: 'Ersthelfer',
    SSD: 'Schulsanitätsdienst',
    SanH: 'Sanitätshelfer',
    SAN: 'Sanitäter',
    FR: 'First Responder',
    RS: 'Rettungssanitäter',
    RA: 'Rettungsassistent',
    NotSan: 'Notfallsanitäter',
    RH: 'Rettungshelfer',
    RDH: 'Rettungsdiensthelfer',
    A: 'Arzt',
    NA: 'Notarzt',
  };

  readonly fahrzeugFilter = signal<Record<string, string>>({});

  filteredFahrzeuge(postenId: string): Fahrzeug[] {
    const q = (this.fahrzeugFilter()[postenId] ?? '').toLowerCase();
    if (!q) return FAHRZEUGE;
    return FAHRZEUGE.filter(
      (f) => f.funkruf.toLowerCase().includes(q) || f.seriennummer.toLowerCase().includes(q),
    );
  }

  fahrzeugInputValue(posten: Posten): string {
    return this.fahrzeugFilter()[posten.id] ?? '';
  }

  updateFahrzeugFilter(postenId: string, value: string): void {
    this.fahrzeugFilter.update((m) => ({ ...m, [postenId]: value }));
  }

  onFahrzeugSelected(postenId: string, value: Fahrzeug | null): void {
    if (value === null) {
      this.store.setPostenFahrzeug(postenId, null);
    } else {
      const ref: FahrzeugRef = {
        seriennummer: value.seriennummer,
        funkruf: value.funkruf,
        hiorgId: value.hiorgId,
      };
      this.store.setPostenFahrzeug(postenId, ref);
    }
    this.fahrzeugFilter.update((m) => ({ ...m, [postenId]: '' }));
    // Keep selectedPosten in sync with updated store state
    if (this.selectedPosten?.id === postenId) {
      this.selectedPosten = this.planung()?.posten.find((p) => p.id === postenId) ?? null;
    }
  }

  fahrzeugDisplayFn(_: Fahrzeug | null): string {
    return '';
  }

  readonly draggingEinsatzkraft = signal<Einsatzkraft | null>(null);
  readonly assignedListCollapsed = signal(true);

  onDragStarted(event: CdkDragStart<DragData>): void {
    const id = event.source.data.einsatzkraftId;
    const p = this.planung();
    this.draggingEinsatzkraft.set(p?.einsatzkraefte.find((e) => e.id === id) ?? null);
  }

  onDragEnded(): void {
    this.draggingEinsatzkraft.set(null);
  }

  onDropToPosition(event: CdkDragDrop<DropData, DragData>): void {
    const drag = event.item.data as DragData;
    const drop = event.container.data;
    const p = this.planung();
    if (!p) return;

    // Read current occupant of the target position before assigning
    const targetPosten = p.posten.find((po) => po.id === drop.postenId);
    const targetPosition = targetPosten?.positions.find((pos) => pos.id === drop.positionId);
    const displaced = targetPosition?.assigned ?? null;

    this.store.assignToPosition(drop.postenId, drop.positionId, drag.einsatzkraftId);

    if (drag.fromPostenId && drag.fromPositionId) {
      if (displaced) {
        // Swap: assign displaced person to source position
        this.store.assignToPosition(drag.fromPostenId, drag.fromPositionId, displaced.id);
      } else {
        // Simple move: unassign source
        this.store.unassignFromPosition(drag.fromPostenId, drag.fromPositionId);
      }
    }
  }

  onDropToRoster(event: CdkDragDrop<null, DragData>): void {
    const drag = event.item.data as DragData;
    if (drag.fromPostenId && drag.fromPositionId) {
      this.store.unassignFromPosition(drag.fromPostenId, drag.fromPositionId);
    }
  }

  save(): void {
    const p = this.planung();
    if (!p) return;
    this.saveLoad.save(p);
  }

  openImportDialog(): void {
    this.dialog.open(ImportDialog, { width: '560px' });
  }

  goBack(): void {
    this.store.closePlanung();
    this.router.navigate(['/']);
  }

  setEinsatzleiter(id: string | null): void {
    const p = this.planung();
    if (!p) return;
    const ref = id ? (p.einsatzkraefte.find((e) => e.id === id) ?? null) : null;
    const einsatzleiter = ref ? { id: ref.id, name: ref.name } : null;
    this.store.updateActive({ ...p, einsatzleiter });
  }

  addPosten(): void {
    this.store.addPosten();
  }

  deletePosten(posten: Posten): void {
    const msg = `Posten "${posten.label}" löschen? Diese Aktion kann nicht rückgängig gemacht werden.`;
    if (window.confirm(msg)) {
      this.store.deletePosten(posten.id);
    }
  }

  clearPosten(posten: Posten): void {
    const names = posten.positions
      .filter((pos) => pos.assigned !== null)
      .map((pos) => pos.assigned!.name)
      .join(', ');
    const msg = names
      ? `Alle Zuteilungen in "${posten.label}" aufheben?\nBetroffen: ${names}`
      : `Alle Zuteilungen in "${posten.label}" aufheben?`;
    if (window.confirm(msg)) {
      this.store.clearPosten(posten.id);
    }
  }

  selectPosten(posten: Posten): void {
    this.selectedPosten = posten;
    this.selectedPosition = null;
    this.inspectorCollapsed.set(false);
  }

  selectPosition(posten: Posten, position: Position): void {
    this.selectedPosten = null;
    this.selectedPosition = { posten, position };
    this.inspectorCollapsed.set(false);
  }

  assignedCount(posten: Posten): number {
    return posten.positions.filter((p) => p.assigned !== null).length;
  }

  taktischColor(tag: Taktisch): { bg: string; fg: string } {
    const i = TAKTISCH_ORDER.indexOf(tag);
    if (i <= 1) return { bg: '#C7CCD9', fg: '#000548' };
    if (i === 2) return { bg: '#4A6FB8', fg: '#FFFFFF' };
    if (i <= 4) return { bg: '#EB003C', fg: '#FFFFFF' };
    return { bg: '#FFFFFF', fg: '#000548' };
  }

  medizinischColor(tag: Medizinisch): { bg: string; fg: string } {
    const i = MEDIZINISCH_ORDER.indexOf(tag);
    if (i <= 3) return { bg: '#C7CCD9', fg: '#000548' };
    if (i <= 5) return { bg: '#DEE100', fg: '#000548' };
    if (i <= 7) return { bg: '#EB003C', fg: '#FFFFFF' };
    if (i <= 9) return { bg: '#2F8F68', fg: '#FFFFFF' };
    return { bg: '#4A6FB8', fg: '#FFFFFF' };
  }

  positionMatchClass(position: Position, einsatzkraft?: Einsatzkraft | null): string {
    if (!einsatzkraft) return 'neutral';
    return this.matchLevel(position, einsatzkraft);
  }

  private matchLevel(position: Position, person: Einsatzkraft): MatchLevel {
    const req = position.requirements;
    let satisfied = 0;
    let total = 0;

    if (req.taktisch !== null) {
      total++;
      const reqIdx = TAKTISCH_ORDER.indexOf(req.taktisch);
      const personIdx = Math.max(-1, ...(person.tags.taktisch ?? []).map((t) => TAKTISCH_ORDER.indexOf(t)));
      if (personIdx >= reqIdx) satisfied++;
    }

    if (req.medizinisch !== null) {
      total++;
      const reqIdx = MEDIZINISCH_ORDER.indexOf(req.medizinisch);
      const personIdx = Math.max(-1, ...(person.tags.medizinisch ?? []).map((t) => MEDIZINISCH_ORDER.indexOf(t)));
      if (personIdx >= reqIdx) satisfied++;
    }

    if (total === 0) return 'full';
    if (satisfied === total) return 'full';
    if (satisfied > 0) return 'partial';
    return 'mismatch';
  }

  assignedPerson(position: Position): Einsatzkraft | null {
    if (!position.assigned || !this.planung()) return null;
    return this.planung()!.einsatzkraefte.find((e) => e.id === position.assigned!.id) ?? null;
  }

  private sollRole(t: Taktisch | null): 'fuhrer' | 'unterfuehrer' | 'helfer' {
    if (t === 'ZF' || t === 'VF') return 'fuhrer';
    if (t === 'GF') return 'unterfuehrer';
    return 'helfer';
  }

  private istRole(person: Einsatzkraft): 'fuhrer' | 'unterfuehrer' | 'helfer' {
    const maxIdx = Math.max(-1, ...(person.tags.taktisch ?? []).map((t) => TAKTISCH_ORDER.indexOf(t)));
    const top = maxIdx >= 0 ? TAKTISCH_ORDER[maxIdx] : null;
    if (top === 'ZF' || top === 'VF') return 'fuhrer';
    if (top === 'GF') return 'unterfuehrer';
    return 'helfer';
  }

  postenSoll(posten: Posten): Staerke {
    const s = { fuhrer: 0, unterfuehrer: 0, helfer: 0, gesamt: posten.positions.length };
    for (const pos of posten.positions) s[this.sollRole(pos.requirements.taktisch)]++;
    return s;
  }

  postenIst(posten: Posten): Staerke {
    const assigned = posten.positions.filter((p) => p.assigned);
    const s = { fuhrer: 0, unterfuehrer: 0, helfer: 0, gesamt: assigned.length };
    for (const pos of assigned) {
      const person = this.planung()!.einsatzkraefte.find((e) => e.id === pos.assigned!.id);
      s[person ? this.istRole(person) : 'helfer']++;
    }
    return s;
  }

  planungSoll(planung: Planung): Staerke {
    const all = planung.posten.flatMap((p) => p.positions);
    const s = { fuhrer: 0, unterfuehrer: 0, helfer: 0, gesamt: all.length };
    for (const pos of all) s[this.sollRole(pos.requirements.taktisch)]++;
    return s;
  }

  planungIst(planung: Planung): Staerke {
    const assigned = planung.posten.flatMap((p) => p.positions).filter((p) => p.assigned);
    const s = { fuhrer: 0, unterfuehrer: 0, helfer: 0, gesamt: assigned.length };
    for (const pos of assigned) {
      const person = planung.einsatzkraefte.find((e) => e.id === pos.assigned!.id);
      s[person ? this.istRole(person) : 'helfer']++;
    }
    return s;
  }

  staerkeStatus(ist: number, soll: number): string {
    if (ist < soll) return 'status-under';
    if (ist > soll) return 'status-over';
    return 'status-met';
  }

  unassignedRoster(planung: Planung): Einsatzkraft[] {
    const assignedIds = new Set(
      planung.posten.flatMap((p) => p.positions.map((pos) => pos.assigned?.id)).filter(Boolean),
    );
    return planung.einsatzkraefte.filter((e) => !assignedIds.has(e.id));
  }
}
