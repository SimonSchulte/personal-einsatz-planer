import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Content, ContentText, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Planung, Posten, Taktisch, Medizinisch, TAKTISCH_ORDER, MEDIZINISCH_ORDER } from '../models/planung.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = (pdfFonts as any).vfs;

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  export(planung: Planung): void {
    const fmt = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
    });
    const now = fmt.format(new Date());
    const start = fmt.format(this.parseDate(planung.start));
    const end = fmt.format(this.parseDate(planung.end));

    const content: Content[] = [
      { text: planung.name, style: 'planungName' },
      { text: `${start} – ${end}`, style: 'dateRange', margin: [0, 0, 0, 4] },
    ];

    if (planung.einsatzleiter) {
      content.push({
        text: `Einsatzleiter: ${planung.einsatzleiter.name}`,
        style: 'einsatzleiter',
        margin: [0, 0, 0, 12],
      });
    } else {
      content.push({ text: '', margin: [0, 0, 0, 12] });
    }

    for (const posten of planung.posten) {
      content.push(...this.buildPostenBlock(posten, planung));
    }

    const docDef: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 50],
      header: () => ({ text: '', margin: [40, 20] }),
      footer: (_page: number, _pages: number) => ({
        text: `Exportiert am: ${now}`,
        alignment: 'right',
        fontSize: 8,
        color: '#666666',
        margin: [40, 10],
      }),
      content,
      styles: {
        planungName: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
        dateRange: { fontSize: 11, color: '#444444' },
        einsatzleiter: { fontSize: 11, italics: true },
        postenHeader: { fontSize: 13, bold: true, margin: [0, 12, 0, 4] },
        tableHeader: { bold: true, fontSize: 9, fillColor: '#E8E8E8' },
      },
      defaultStyle: { fontSize: 10 },
    };

    const filename = `${planung.name}.pep.pdf`;
    pdfMake.createPdf(docDef).download(filename);
  }

  private buildPostenBlock(posten: Posten, planung: Planung): Content[] {
    const heading = posten.fahrzeug
      ? `${posten.label} · ${posten.fahrzeug.funkruf}`
      : posten.label;

    const tableBody: Content[][] = [
      [
        { text: 'Position', style: 'tableHeader' },
        { text: 'Taktisch', style: 'tableHeader' },
        { text: 'Medizinisch', style: 'tableHeader' },
        { text: 'Zusatz', style: 'tableHeader' },
        { text: 'Einsatzkraft', style: 'tableHeader' },
      ],
    ];

    for (const pos of posten.positions) {
      const person = pos.assigned
        ? planung.einsatzkraefte.find((e) => e.id === pos.assigned!.id) ?? null
        : null;

      const tStyle = this.taktischStyle(pos.requirements.taktisch);
      const mStyle = this.medizinischStyle(pos.requirements.medizinisch);

      const tCell: ContentText = pos.requirements.taktisch
        ? { text: pos.requirements.taktisch, fillColor: tStyle.fillColor, color: tStyle.color, alignment: 'center' }
        : { text: '–', color: '#AAAAAA', alignment: 'center' };

      const mCell: ContentText = pos.requirements.medizinisch
        ? { text: pos.requirements.medizinisch, fillColor: mStyle.fillColor, color: mStyle.color, alignment: 'center' }
        : { text: '–', color: '#AAAAAA', alignment: 'center' };

      const zusatzText = pos.requirements.zusatz ?? (person?.tags.zusatz?.join(', ') ?? '–');
      const assignedName = pos.assigned ? pos.assigned.name : '—';

      tableBody.push([
        { text: pos.label },
        tCell,
        mCell,
        { text: zusatzText || '–' },
        { text: assignedName },
      ]);
    }

    return [
      { text: heading, style: 'postenHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', '*'],
          body: tableBody,
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 8],
      },
    ];
  }

  private parseDate(str: string): Date {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    // German format: DD.MM.YYYY or DD.MM.YYYY HH:MM
    const m = str.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (m) {
      const [, dd, mm, yyyy, hh = '0', min = '0'] = m;
      return new Date(+yyyy, +mm - 1, +dd, +hh, +min);
    }
    console.warn('PdfExportService: cannot parse date:', str);
    return new Date(0);
  }

  private taktischStyle(tag: Taktisch | null): { fillColor: string; color: string } {
    if (!tag) return { fillColor: '#FFFFFF', color: '#000000' };
    const i = TAKTISCH_ORDER.indexOf(tag);
    if (i <= 1) return { fillColor: '#C7CCD9', color: '#000548' };
    if (i === 2) return { fillColor: '#4A6FB8', color: '#FFFFFF' };
    if (i <= 4) return { fillColor: '#EB003C', color: '#FFFFFF' };
    return { fillColor: '#FFFFFF', color: '#000548' };
  }

  private medizinischStyle(tag: Medizinisch | null): { fillColor: string; color: string } {
    if (!tag) return { fillColor: '#FFFFFF', color: '#000000' };
    const i = MEDIZINISCH_ORDER.indexOf(tag);
    if (i <= 2) return { fillColor: '#C7CCD9', color: '#000548' };
    if (i === 3) return { fillColor: '#2F8F68', color: '#FFFFFF' };
    if (i === 4) return { fillColor: '#DEE100', color: '#000548' };
    if (i <= 6) return { fillColor: '#EB003C', color: '#FFFFFF' };
    return { fillColor: '#4A6FB8', color: '#FFFFFF' };
  }
}
