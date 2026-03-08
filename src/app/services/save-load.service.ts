import { Injectable } from '@angular/core';
import { Planung, PepFile } from '../models/planung.model';

const CURRENT_VERSION = '1.1';

@Injectable({ providedIn: 'root' })
export class SaveLoadService {
  save(planung: Planung): void {
    const pepFile: PepFile = {
      version: CURRENT_VERSION,
      meta: { exportedAt: new Date().toISOString(), locale: 'de-DE' },
      planung,
    };
    const json = JSON.stringify(pepFile, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${planung.name}.pep.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  load(): Promise<{ planung: Planung; versionWarning: boolean } | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.pep.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const pepFile: PepFile = JSON.parse(reader.result as string);
            const versionWarning = pepFile.version !== CURRENT_VERSION;
            resolve({ planung: pepFile.planung, versionWarning });
          } catch {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      input.oncancel = () => resolve(null);
      input.click();
    });
  }
}
