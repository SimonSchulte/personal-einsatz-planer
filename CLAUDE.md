# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep your replies extremly concise and focus on conveying the key information. No unnessesary fluff, no long code snippets.

When working with any third-party library or something similar, you MUST look up the official documentation to ensure that u are working with up-to-date information. 
Use the DocsExplorer subagent for efficient documentation lookup.

## Commands

```bash
npm start          # ng serve — dev server at http://localhost:4200
npm run build      # production build → dist/
npm test           # Karma/Jasmine unit tests (headless Chrome)
ng generate component src/app/<path>/<name>   # scaffold a new component
```

Run a single spec file:
```bash
ng test --include src/app/path/to/file.spec.ts
```

## Project Context

This is a **desktop-first Angular 20 app** (Personaleinsatzplanung / PEP) for emergency-service shift planners. It is fully local — no backend, no auth. The full product specification lives in `spec.md`.

## Architecture

The app is in early scaffolding state. The intended architecture (per spec) is:

- **Two routes:** Planning List (dashboard) → Planning Editor.
- **Three-pane editor layout:** roster pane (left) | Posten/Position tree (center) | inspector (right).
- **Zoneless change detection** (`provideZonelessChangeDetection`) — use signals and `signal()`/`computed()` instead of `ngZone` or `async` pipe where possible.
- **Standalone components only** — no `NgModule`.
- Styles: **LESS** (configured globally and per-component via `styleUrl`).

### Planned services (not yet created)

| Service | Responsibility |
|---|---|
| `MatchService` | Qualification matching: taktisch / medizinisch index comparison |
| `PlanungStoreService` | In-memory state for the active `Planung` (signals-based) |
| `ImportService` | Parse plain-text roster (`Nachname Vorname (Tag|Tag)`) |
| `SaveLoadService` | JSON file save/load (`*.pep.json`) |
| `PdfExportService` | Client-side PDF via pdfmake/jspdf |

### Domain model (TypeScript types to create under `src/app/models/`)

Key types: `Planung`, `Posten`, `Position`, `Einsatzkraft`, `EinsatzkraftRef`. See `spec.md §Core Concepts` for full field definitions.

`Planung` also has `einsatzleiter: EinsatzkraftRef | null` — shown as a dropdown in the editor top bar.

- Posten can be added (+ Neuer Posten), deleted (confirmation required), and cleared/Leeren (confirmation required).
- Assigned Einsatzkräfte show their qualification chips inline on the Position row.

Qualification enums (ordered arrays, index = rank):
- **Taktisch:** `["H","KSH","GF","ZF","GdSA","VF"]`
- **Medizinisch:** `["EH","SSD","SanH","SAN","FR","RS","RA","NotSan","RH","RDH","A","NA"]`

### Drag & drop

Uses Angular CDK `DragDropModule`. Match logic during drag: compare tag index against requirement index in the ordered enum arrays. Drop highlight: green (full match) / amber (partial) / red (mismatch).

### Persistence format

`*.pep.json` — top-level fields: `version`, `meta`, `planung`. Always keep `version` field; show warning on version mismatch when loading.

## Conventions

- Prettier is configured: `printWidth: 100`, `singleQuote: true`, Angular HTML parser for templates.
- Strict TypeScript: `strict`, `noImplicitOverride`, `noImplicitReturns`, `strictTemplates` all enabled.
- Component class names use the class name without `Component` suffix (Angular 20 convention, e.g., `export class PostenTree`).
- Template files: `<name>.html`, style files: `<name>.less` (not inline).
- i18n: wire with `ngx-translate`; default locale **de-DE**.
