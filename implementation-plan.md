# Spec-Gap-Analyse & Implementierungsplan

## Implementierte Features (Referenz)

Folgende Kern-Features sind **vollständig** implementiert:
- Drag & Drop (Assign/Swap/Unassign, Match-Highlighting)
- PDF-Export (pdfMake, farbkodiert)
- JSON Save/Load (`*.pep.json`, Version-Check)
- EFS-API-Integration (HiOrg-Server, Veranstaltungen, Einsatzkräfte-Sync)
- Import-Dialog (Plaintext-Parser, Merge/Replace)
- Stärke-Berechnung (F/UF/H/Ges, Ist/Soll, Farbkodierung)
- Posten-Verwaltung (add/delete/leeren mit Bestätigung)
- Fahrzeugauswahl (Autocomplete per Posten)
- Rechtsklick-Kontextmenü (Einsatzkraft → freie Position)
- Einsatzleiter-Dropdown
- AppMode (standalone / connected-to-efs-api)

---

## Fehlende Features

### Phase 1 — Kernfunktionen: Planung bearbeiten
*Ohne diese ist die App für Neuanlage von Planungen kaum nutzbar.*

| # | Feature | Beschreibung | Betroffene Dateien |
|---|---------|-------------|-------------------|
| 1.1 | **CORS-Proxy wiederherstellen** | `proxy.conf.json` wurde gelöscht. EFS-API-Calls schlagen im Dev-Modus wegen CORS fehl. | `proxy.conf.json`, `angular.json` |
| 1.2 | **Planung-Name/Start/End editierbar** | Top-Bar zeigt Name und Datum als statischen Text. Muss inline bearbeitbar sein. | `planning-editor.html`, `planning-editor.ts`, `planung-store.service.ts` |
| 1.3 | **Neue Position innerhalb Posten anlegen** | Kein „+ Neue Position"-Button. Positionen können nur per Template-Import oder EFS-Sync entstehen. | `planning-editor.html`, `planning-editor.ts`, `planung-store.service.ts` |
| 1.4 | **Posten-Label inline bearbeiten** | Posten-Label im Accordion ist read-only. | `planning-editor.html`, `planning-editor.ts`, `planung-store.service.ts` |
| 1.5 | **Position-Label & Requirements bearbeiten** | Inspector zeigt Position-Details read-only. Kein Editieren von Label, taktisch/medizinisch. | `planning-editor.html`, `planning-editor.ts`, `planung-store.service.ts` |

### Phase 2 — Usability & UX

| # | Feature | Beschreibung | Betroffene Dateien |
|---|---------|-------------|-------------------|
| 2.1 | **Roster-Suche & Tag-Filter** | Spec: „search, filter by tag" im linken Pane. Derzeit keine Suche. | `planning-editor.html`, `planning-editor.ts` |
| 2.2 | **Quick-Assign-Vorschläge im Inspector** | Spec: Inspector zeigt „best matches" für die ausgewählte Position. | `planning-editor.html`, `planning-editor.ts` |
| 2.3 | **Einsatzkraft-Notizen (meta.notes)** | `Einsatzkraft.meta.notes` existiert im Modell, kein UI zum Anzeigen/Bearbeiten. | `planning-editor.html`, `planning-editor.ts`, `planung-store.service.ts` |
| 2.4 | **Undo** | Spec/CLAUDE.md: „Undo"-Button in der Top-Bar. Kein Undo-Stack implementiert. | `planung-store.service.ts`, `planning-editor.html`, `planning-editor.ts` |

### Phase 3 — Architektur & Qualität

| # | Feature | Beschreibung | Betroffene Dateien |
|---|---------|-------------|-------------------|
| 3.1 | **MatchService extrahieren** | CLAUDE.md & Spec: `MatchService` als eigener Service. Matching-Logik ist derzeit inline in `planning-editor.ts` (`matchLevel()`, `positionMatchClass()`). | neues `src/app/services/match.service.ts`, `planning-editor.ts` |
| 3.2 | **Unit-Tests: MatchService** | Spec fordert Unit-Tests für Qualifikations-Matching-Logik. | `match.service.spec.ts` |
| 3.3 | **Unit-Tests: ImportService** | Spec fordert Tests für den Roster-Parser (verschiedene Input-Varianten). | `import.service.spec.ts` |
| 3.4 | **Unit-Tests: SaveLoadService** | Spec fordert JSON-Roundtrip-Test. | `save-load.service.spec.ts` |

### Phase 4 — Polish & Accessibility

| # | Feature | Beschreibung | Betroffene Dateien |
|---|---------|-------------|-------------------|
| 4.1 | **Autosave-Toggle** | Spec: „Autosave: optional toggle". | `planung-store.service.ts`, `planning-editor.html` |
| 4.2 | **Accessibility** | Spec: Keyboard-Assign/Unassign, ARIA-Labels für Chips und Drag-Targets. | `planning-editor.html`, global styles |
| 4.3 | **i18n / ngx-translate** | Spec: ngx-translate-Struktur, Default de-DE. Derzeit hard-coded Deutsch ohne i18n-Keys. | `app.config.ts`, alle Templates, neues `assets/i18n/de.json` |
| 4.4 | **E2E-Tests** | Spec: Tests für Drag & Drop, Import-Replace-Flow, PDF-Export. | `e2e/` |

---

## Implementierungs-Reihenfolge

```
Phase 1 (Grundlage — Planung bearbeitbar machen)
  1.1 CORS-Proxy
  1.2 Name/Start/End editierbar
  1.3 Neue Position anlegen
  1.4 Posten-Label editierbar
  1.5 Position-Label & Requirements editierbar

Phase 2 (Usability)
  2.1 Roster-Suche & Tag-Filter
  2.2 Quick-Assign-Vorschläge im Inspector
  2.3 Einsatzkraft-Notizen
  2.4 Undo

Phase 3 (Architektur & Tests)
  3.1 MatchService extrahieren
  3.2 Unit-Tests MatchService
  3.3 Unit-Tests ImportService
  3.4 Unit-Tests SaveLoadService

Phase 4 (Polish)
  4.1 Autosave-Toggle
  4.2 Accessibility (Keyboard + ARIA)
  4.3 i18n / ngx-translate
  4.4 E2E-Tests
```
