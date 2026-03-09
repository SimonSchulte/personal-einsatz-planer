import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlanungStoreService } from '../../services/planung-store.service';
import { SaveLoadService } from '../../services/save-load.service';
import { AppModeService } from '../../services/app-mode.service';
import { EfsApiService } from '../../services/efs-api.service';
import { ImportService } from '../../services/import.service';
import { ApiKeyDialog } from '../../components/api-key-dialog/api-key-dialog';
import { EfsEinsatz } from '../../models/planung.model';

@Component({
  selector: 'app-planning-list',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatToolbarModule,
  ],
  templateUrl: './planning-list.html',
  styleUrl: './planning-list.less',
})
export class PlanningList implements OnInit {
  private readonly store = inject(PlanungStoreService);
  private readonly router = inject(Router);
  private readonly saveLoad = inject(SaveLoadService);
  private readonly dialog = inject(MatDialog);
  readonly appMode = inject(AppModeService);
  private readonly efsApi = inject(EfsApiService);
  private readonly importService = inject(ImportService);

  readonly planungen = this.store.planungen;

  readonly efsEinsaetze = signal<EfsEinsatz[]>([]);
  readonly efsLoading = signal(false);
  readonly efsError = signal<string | null>(null);

  readonly upcomingEinsaetze = computed(() =>
    this.efsEinsaetze()
      .filter((e) => {
        const d = new Date(e.datum_bis);
        return isNaN(d.getTime()) || d >= new Date();
      })
      .sort((a, b) => new Date(a.datum_von).getTime() - new Date(b.datum_von).getTime()),
  );

  readonly pastEinsaetze = computed(() =>
    this.efsEinsaetze()
      .filter((e) => {
        const d = new Date(e.datum_bis);
        return !isNaN(d.getTime()) && d < new Date();
      })
      .sort((a, b) => new Date(b.datum_von).getTime() - new Date(a.datum_von).getTime()),
  );

  readonly einsatzColumns = ['titel', 'datum_von', 'datum_bis', 'ort'];

  ngOnInit(): void {
    if (this.appMode.mode() === 'connected-to-efs-api') {
      this.loadEfsEinsaetze();
    }
  }

  async loadEfsEinsaetze(): Promise<void> {
    this.efsLoading.set(true);
    this.efsError.set(null);
    try {
      const einsaetze = await this.efsApi.getVeranstaltungen();
      this.efsEinsaetze.set(einsaetze);
    } catch {
      this.efsError.set(
        'Fehler beim Laden der Veranstaltungen. Bitte API-Key prüfen und erneut versuchen.',
      );
    } finally {
      this.efsLoading.set(false);
    }
  }

  async openEfsEinsatz(einsatz: EfsEinsatz): Promise<void> {
    const planung = this.store.openEfsEinsatz(einsatz);
    this.router.navigate(['/editor']);

    // Load Einsatzkräfte in the background
    try {
      const detail = await this.efsApi.getVeranstaltungDetail(einsatz.id);
      if (detail) {
        const mapped = detail.einsatzkraefte.map((ek) =>
          this.importService.mapEfsEinsatzkraft(ek),
        );
        this.store.mergeEfsEinsatzkraefte(mapped);
      }
    } catch {
      // Non-critical: Einsatzkräfte can be loaded later via the editor
    }

    void planung;
  }

  openPlanung(id: string): void {
    this.store.openPlanung(id);
    this.router.navigate(['/editor']);
  }

  async loadFromFile(): Promise<void> {
    const result = await this.saveLoad.load();
    if (!result) return;
    if (result.versionWarning) {
      window.alert(
        'Versionswarnung: Die Datei wurde mit einer anderen Version gespeichert. Die Daten wurden trotzdem geladen, können aber unvollständig sein.',
      );
    }
    this.store.importPlanung(result.planung);
    this.router.navigate(['/editor']);
  }

  createNew(): void {
    const name = `Neue Planung ${formatDate(new Date(), 'dd.MM.yyyy', 'de-DE')}`;
    this.store.createPlanung(name);
    this.router.navigate(['/editor']);
  }

  openApiKeyDialog(): void {
    const ref = this.dialog.open(ApiKeyDialog, { width: '460px' });
    ref.afterClosed().subscribe(() => {
      if (this.appMode.mode() === 'connected-to-efs-api') {
        this.loadEfsEinsaetze();
      } else {
        this.efsEinsaetze.set([]);
      }
    });
  }
}
