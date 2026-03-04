import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DatePipe } from '@angular/common';
import { PlanungStoreService } from '../../services/planung-store.service';

@Component({
  selector: 'app-planning-list',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatToolbarModule, DatePipe],
  templateUrl: './planning-list.html',
  styleUrl: './planning-list.less',
})
export class PlanningList {
  private readonly store = inject(PlanungStoreService);
  private readonly router = inject(Router);

  readonly planungen = this.store.planungen;

  openPlanung(id: string): void {
    this.store.openPlanung(id);
    this.router.navigate(['/editor']);
  }

  createNew(): void {
    const name = `Neue Planung ${new Date().toLocaleDateString('de-DE')}`;
    this.store.createPlanung(name);
    this.router.navigate(['/editor']);
  }
}
