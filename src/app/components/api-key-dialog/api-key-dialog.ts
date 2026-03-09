import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-api-key-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './api-key-dialog.html',
  styleUrl: './api-key-dialog.less',
})
export class ApiKeyDialog {
  private readonly dialogRef = inject(MatDialogRef<ApiKeyDialog>);
  readonly appMode = inject(AppModeService);

  readonly apiKey = signal(this.appMode.apiKey() ?? '');

  save(): void {
    this.appMode.setApiKey(this.apiKey() || null);
    this.dialogRef.close();
  }

  remove(): void {
    this.appMode.setApiKey(null);
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
