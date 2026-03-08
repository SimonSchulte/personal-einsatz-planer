import { Planung } from '../models/planung.model';

export const EXAMPLE_PLANUNG: Planung = {
  id: 'example-001',
  name: 'Stadtfest Musterstadt 2026',
  start: '2026-06-15T09:00:00+02:00',
  end: '2026-06-15T22:00:00+02:00',
  einsatzkraefte: [
    { id: 'ek-01', name: 'Meyer Anna', tags: { taktisch: ['GF'], medizinisch: ['SanH'] } },
    { id: 'ek-02', name: 'Schmidt Peter', tags: { taktisch: ['H'], medizinisch: ['A'] } },
    { id: 'ek-03', name: 'Fischer Laura', tags: { taktisch: ['ZF'], medizinisch: ['NotSan'] } },
    { id: 'ek-04', name: 'Wagner Klaus', tags: { taktisch: ['GF'], medizinisch: ['RS'] } },
    { id: 'ek-05', name: 'Becker Sophie', tags: { taktisch: ['KSH'], medizinisch: ['SAN'] } },
    { id: 'ek-06', name: 'Hoffmann Max', tags: { taktisch: ['H'], medizinisch: ['EH'] } },
    { id: 'ek-07', name: 'Schulz Lena', tags: { taktisch: ['GdSA'], medizinisch: ['NA'] } },
    { id: 'ek-08', name: 'Koch Thomas', tags: { taktisch: ['H'], medizinisch: ['RS'] } },
    { id: 'ek-09', name: 'Bauer Julia', tags: { medizinisch: ['RA'] } },
    { id: 'ek-10', name: 'Richter Felix', tags: { taktisch: ['VF'], medizinisch: ['NotSan'] } },
  ],
  einsatzleiter: { id: 'ek-03', name: 'Fischer Laura' },
  abschnitte: [
    {
      id: 'abschnitt-01',
      label: 'Fahrzeuge',
      posten: [
        {
          id: 'posten-01',
          label: 'RTW 1',
          fahrzeug: { seriennummer: 'NRW 8-2077', funkruf: '72 GW-SAN 01', hiorgId: '1905000000628130000187984' },
          positions: [
            {
              id: 'pos-01-01',
              label: 'Fahrer',
              requirements: { taktisch: 'H', medizinisch: 'RS' },
              assigned: { id: 'ek-08', name: 'Koch Thomas' },
            },
            {
              id: 'pos-01-02',
              label: 'Sanitäter',
              requirements: { taktisch: null, medizinisch: 'RA' },
              assigned: { id: 'ek-09', name: 'Bauer Julia' },
            },
          ],
        },
        {
          id: 'posten-02',
          label: 'KTW 1',
          fahrzeug: { seriennummer: 'NRW 8-2017', funkruf: '72 KTW-B 01', hiorgId: '1905000001220750000350003' },
          positions: [
            {
              id: 'pos-02-01',
              label: 'Fahrer',
              requirements: { taktisch: 'H', medizinisch: 'SAN' },
              assigned: { id: 'ek-06', name: 'Hoffmann Max' },
            },
            {
              id: 'pos-02-02',
              label: 'Beifahrer',
              requirements: { taktisch: null, medizinisch: 'SanH' },
              assigned: null,
            },
          ],
        },
      ],
    },
    {
      id: 'abschnitt-02',
      label: 'Fußtrupps',
      posten: [
        {
          id: 'posten-03',
          label: 'Sanitätsposten Bühne',
          fahrzeug: null,
          positions: [
            {
              id: 'pos-03-01',
              label: 'Postenführer',
              requirements: { taktisch: 'GF', medizinisch: 'SAN' },
              assigned: { id: 'ek-01', name: 'Meyer Anna' },
            },
            {
              id: 'pos-03-02',
              label: 'San-Helfer 1',
              requirements: { taktisch: null, medizinisch: 'EH' },
              assigned: { id: 'ek-05', name: 'Becker Sophie' },
            },
            {
              id: 'pos-03-03',
              label: 'San-Helfer 2',
              requirements: { taktisch: null, medizinisch: 'EH' },
              assigned: null,
            },
          ],
        },
        {
          id: 'posten-04',
          label: 'Einsatzleitung',
          fahrzeug: null,
          positions: [
            {
              id: 'pos-04-01',
              label: 'Einsatzleiter',
              requirements: { taktisch: 'ZF', medizinisch: null },
              assigned: { id: 'ek-03', name: 'Fischer Laura' },
            },
            {
              id: 'pos-04-02',
              label: 'Stellv. Einsatzleiter',
              requirements: { taktisch: 'GF', medizinisch: null },
              assigned: { id: 'ek-04', name: 'Wagner Klaus' },
            },
          ],
        },
      ],
    },
  ],
};
