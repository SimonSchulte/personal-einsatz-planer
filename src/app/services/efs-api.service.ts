import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppModeService } from './app-mode.service';
import { EfsEinsatz, EfsEinsatzkraft, EfsEinsatzmittel } from '../models/planung.model';

const EFS_API_URL = 'https://www.hiorg-server.de/api/efs/v2/';

// Raw response shapes from the HiOrg EFS-API
interface EfsApiEnvelope {
  status: string;
}

interface EfsApiVeranstaltungenResponse extends EfsApiEnvelope {
  einsaetze?: EfsApiEinsatz[];
}

interface EfsApiEinsatz {
  id: string | number;
  titel?: string;
  datum_von?: string;
  datum_bis?: string;
  ort?: string;
}

interface EfsApiEinsatzkraft {
  id?: string | number;
  hiorg_org_id?: string | number;
  vorname?: string;
  nachname?: string;
  ausbildungen?: string[];
}

interface EfsApiDetailResponse extends EfsApiEnvelope {
  einsatzkraefte_imeinsatz?: EfsApiEinsatzkraft[];
  einsatzmittel_imeinsatz?: Record<string, unknown>[];
}

export interface EfsDetailResult {
  einsatzkraefte: EfsEinsatzkraft[];
  einsatzmittel: EfsEinsatzmittel[];
}

@Injectable({ providedIn: 'root' })
export class EfsApiService {
  private readonly http = inject(HttpClient);
  private readonly appMode = inject(AppModeService);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
  }

  private buildBody(action: string, extra: Record<string, string> = {}): string {
    return new URLSearchParams({
      apikey: this.appMode.apiKey() ?? '',
      action,
      ...extra,
    }).toString();
  }

  async getVeranstaltungen(): Promise<EfsEinsatz[]> {
    const response = await firstValueFrom(
      this.http.post<EfsApiVeranstaltungenResponse>(
        EFS_API_URL,
        this.buildBody('getveranstaltungen'),
        { headers: this.headers },
      ),
    );
    if (response.status !== 'OK' || !response.einsaetze) return [];
    return response.einsaetze.map((e) => this.mapEinsatz(e));
  }

  async getVeranstaltungDetail(id: string): Promise<EfsDetailResult | null> {
    const response = await firstValueFrom(
      this.http.post<EfsApiDetailResponse>(
        EFS_API_URL,
        this.buildBody('getveranstaltung', { id }),
        { headers: this.headers },
      ),
    );
    if (response.status !== 'OK') return null;
    return {
      einsatzkraefte: (response.einsatzkraefte_imeinsatz ?? []).map((e) =>
        this.mapEinsatzkraft(e),
      ),
      einsatzmittel: (response.einsatzmittel_imeinsatz ?? []).map((e) =>
        this.mapEinsatzmittel(e),
      ),
    };
  }

  private mapEinsatz(e: EfsApiEinsatz): EfsEinsatz {
    return {
      id: String(e.id),
      titel: e.titel ?? '',
      datum_von: e.datum_von ?? '',
      datum_bis: e.datum_bis ?? '',
      ort: e.ort,
    };
  }

  private mapEinsatzkraft(e: EfsApiEinsatzkraft): EfsEinsatzkraft {
    return {
      hiorg_org_id: String(e.hiorg_org_id ?? e.id ?? ''),
      vorname: e.vorname ?? '',
      nachname: e.nachname ?? '',
      ausbildungen: e.ausbildungen ?? [],
    };
  }

  private mapEinsatzmittel(e: Record<string, unknown>): EfsEinsatzmittel {
    return {
      id: String(e['id'] ?? ''),
      bezeichnung: e['bezeichnung'] != null ? String(e['bezeichnung']) : undefined,
      funkruf: e['funkruf'] != null ? String(e['funkruf']) : undefined,
    };
  }
}
