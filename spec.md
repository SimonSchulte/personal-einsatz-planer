# Technical Specification — Personaleinsatzplanung (PEP) App

## Overview

**Purpose:** Desktop-first Angular app (Material) for planners to create and manage local Einsatzplanungen made of Posten and Position and assign Einsatzkräfte. Save/load as JSON; export planning to PDF.

**Primary constraints:** Local-only (`ng serve` / Docker), no auth, German locale (DE), translatable UI, responsive-friendly.

---

## Deployment-Modi (AppMode)

The app supports two modes, selectable via an API-Key dialog on the dashboard:

| Mode | Description |
|---|---|
| `standalone` | Default; local plannings only, no API key required. |
| `connected-to-efs-api` | API key stored in `localStorage` (`pep_efs_api_key`); unlocks EFS/HiOrg-Server features. |

Mode switch is triggered via the API-Key dialog on the Planning List / Dashboard.

---

## EFS-API-Integration (HiOrg-Server)

- **API endpoint:** `/api/efs/` — form-encoded POST, `version=2`
- **Actions:** `checkapikey`, `getveranstaltungen`, `getveranstaltung` (with `id`)
- **Dashboard:** Shows EFS Einsatz list (upcoming / past). Clicking an Einsatz creates a new Planung with `hiorg_einsatz_id` set and loads Einsatzkräfte in the background.
- **Editor:** Sync button updates Einsatzkräfte from EFS (merge by `hiorg_org_id`, then name).
- **Qualification mapping:** `med_qual` / `fuehr_qual` strings from EFS are mapped to Taktisch / Medizinisch enum values.

---

## Core Concepts / Domain Model

### Planung (Planning)

| Field | Type |
|---|---|
| `id` | `string` (UUID) |
| `name` | `string` |
| `start` | `string` (ISO 8601 with timezone; use `Europe/Berlin`) |
| `end` | `string` |
| `posten` | `Posten[]` |
| `einsatzkraefte` | `Einsatzkraft[]` (the roster) |
| `einsatzleiter` | `EinsatzkraftRef \| null` |
| `hiorg_einsatz_id` | `string \| undefined` — ID des verknüpften HiOrg-Server-Einsatzes (nur bei EFS-Modus gesetzt) |

### EinsatzleiterIn

- Every Planung has exactly one EinsatzleiterIn slot (not modeled as a Posten).
- Selectable via a dropdown populated from `Planung.einsatzkraefte`.
- Stored as `EinsatzkraftRef | null` on the Planung.
- Displayed prominently in the editor top bar or Planning header.

### Posten (Position group / unit)

| Field | Type |
|---|---|
| `id` | `string` |
| `label` | `string` |
| `fahrzeug` | `FahrzeugRef \| null` (optional vehicle assignment) |
| `positions` | `Position[]` |

### Fahrzeug (vehicle master data, from CSV)

| Field | Type | Displayed |
|---|---|---|
| `seriennummer` | `string` | Yes (Seriennummer/Größe) |
| `funkruf` | `string` | Yes |
| `hiorgId` | `string` | No (reserved for future use) |

### FahrzeugRef (stored on Posten)

| Field | Type |
|---|---|
| `seriennummer` | `string \| null` (null for free-text entry) |
| `funkruf` | `string` |
| `hiorgId` | `string \| null` (null for free-text entry) |

**Fahrzeugliste:** 31 vehicles embedded as static data from `fahrzeuge2.csv`.
Dropdown display format: `"<Funkruf> (<Seriennummer>)"` e.g. `"72 GW-SAN 01 (NRW 8-2077)"`.
Free-text entry (Funkruf only) sets `seriennummer: null`, `hiorgId: null`.

### Position (slot to fill)

| Field | Type |
|---|---|
| `id` | `string` |
| `label` | `string` |
| `requirements` | `{ taktisch: Taktisch\|null, medizinisch: Medizinisch\|null, zusatz?: string\|null }` |
| `assigned` | `EinsatzkraftRef\|null` *(optional)* |

### Einsatzkraft (person)

| Field | Type |
|---|---|
| `id` | `string` (generated locally; uniqueness enforced by name) |
| `name` | `string` (`"Nachname Vorname"`) |
| `tags` | `{ taktisch?: Taktisch[], medizinisch?: Medizinisch[], zusatz?: string[] }` |
| `meta` | `{ notes?: string }` *(optional)* |
| `hiorg_org_id` | `string \| undefined` — Personennummer aus HiOrg-Server (für Sync-Deduplizierung) |

### EinsatzkraftRef

| Field | Type |
|---|---|
| `id` | `string` |
| `name` | `string` |

> **Uniqueness rule:** Einsatzkraft identity is full name (`Nachname Vorname`). During import, dedupe by full name.

---

## Enums & Qualification Hierarchies

Qualification lists are ordered arrays (lowest → highest). A higher-level qualification satisfies a lower-level requirement.

**Taktisch** (low → high):
```
["H", "KSH", "GF", "ZF", "GdSA", "VF"]
```

**Medizinisch** (low → high):
```
["EH","SSD","SanH","RH","RS","RA","NotSan","A","NA"]
```

> Note: reorder/extend as needed; evaluation uses index position.

---

## Color & Styling Rules

### Taktisch

| Qualifier(s) | Background | Text |
|---|---|---|
| H, KSH | `#C7CCD9` | `#000548` |
| GF | `#4A6FB8` | `#FFFFFF` |
| ZF, GdSA | `#EB003C` | `#FFFFFF` |
| VF | `#FFFFFF` | `#000548` (+ border `#000548`) |

### Medizinisch

| Qualifier(s) | Background | Text |
|---|---|---|
| EH, SSD, SanH | `#C7CCD9` | `#000548` |
| RH | `#2F8F68` | `#FFFFFF` |
| RS | `#DEE100` | `#000548` |
| RA, NotSan | `#EB003C` | `#FFFFFF` |
| A, NA | `#4A6FB8` | `#FFFFFF` |

### Match Visualization

- **Matched requirement:** subtle green outline or check icon on position.
- **Not matched:** subtle red outline or warning icon.
- **Neutral/unassigned:** grey outline.
- **Chip rendering:** show each requirement as a Material chip with its color & text color (contrast must be readable).
- When assigned, the Einsatzkraft entry shows small chips of their tags with matching highlights inline.
- When a Position has an assigned Einsatzkraft, display their qualification tags inline as chips (using the same taktisch/medizinisch color rules), below or alongside the person's name.

**Stärke-Farbkodierung (Ist-Werte):** Jeder Ist-Wert (F, UF, H, Ges) wird individuell gegen den entsprechenden Soll-Wert verglichen und eingefärbt:
- Rot (`#c62828`): Ist < Soll (Unterbesetzung)
- Orange (`#e65100`): Ist > Soll (Überbesetzung)
- Grün (`#2e7d32`): Ist == Soll (exakt erfüllt)

---

## Import Format (Roster)

Plain text, one Einsatzkraft per line.

**Format:** `Nachname Vorname (TagA|TagB|TagC)`

Parentheses are optional. Tags are separated by `|`. Tags can be any Taktisch, Medizinisch, or Zusatz identifier.

**Examples:**
```
Meyer Anna (SanH|H)
Schmidt Peter (A|GF)
```

### Import Rules

- Parsed tags are normalized (trim/uppercase).
- If an imported name already exists in `Planung.einsatzkraefte` (exact match), it is not duplicated.
- **Default import operation replaces the roster:** entries missing from the new import are removed from the planning (prompt user to confirm). Option: provide a "merge" toggle to keep existing entries.
- After import, any assignments to removed people are unassigned; prompt to confirm or automatically unassign.

---

## Assignment & Drag & Drop Rules

- Drag Einsatzkraft from roster to a Position to assign.
- Assign is allowed even if requirements do not match.

### Visual Feedback During Drag

| State | Highlight |
|---|---|
| Full match | Green |
| Partial match | Amber |
| Mismatch | Red |

If a requirement is `null`, it is always treated as a match.

### Matching Logic

For each requirement type (`taktisch` / `medizinisch`): requirement `R` is satisfied if any of the person's tags in that category has `index >= index(R)` in the qualification order array.

- **Full match:** all non-empty requirement types satisfied.
- **Partial match:** some requirement types satisfied.
- **Mismatch:** no requirement types satisfied.

### Reassignment

- An assigned Einsatzkraft can be dragged back to the roster to unassign.
- **Swap:** dropping a person onto an already-filled position swaps the two.

### Rechtsklick-Zuweisung (Kontextmenü)

- Right-click on an unassigned Einsatzkraft in the roster opens a context menu at the mouse position.
- The menu lists all Posten (as group headers) with their free Positions including requirement chips.
- Clicking a Position assigns the Einsatzkraft (equivalent to drag & drop; no swap).

---

## Persistence & File Format

- **Save/Load:** local JSON file. Filename convention: `<nameofplanung>.pep.json`
- **Vorlage importieren:** Loads a `.pep.json` and imports only the Posten/Position structure (including Fahrzeuge) into the active Planung. Existing Einsatzkräfte and assignments are mapped by `hiorg_org_id` (then name) where possible. Used to reuse Posten structures across plannings.

### JSON Schema (high-level)

```json
{
  "version": "1.0",
  "meta": { "exportedAt": "...", "locale": "..." },
  "planung": { "..." }
}
```

- Keep format extensible: include `version` and allow unknown fields.
- When loading an older/newer version: show a compatibility warning.
- **Future backend:** use the same JSON as request/response payload; server can accept uploads/downloads.

---

## PDF Export

**Format:** list/tree export.

### Layout

- **Header:** `Planung.name`, start/end datetime; page footer with export timestamp.
- **For each Posten:**
  - Posten header (label, Fahrzeug-Funkruf if assigned)
  - Table or indented list of Positions with columns:

| Column | Description |
|---|---|
| Position label | Name of the slot |
| Taktisch | Chip label + color box |
| Medizinisch | Chip label + color box |
| Zusatz | Additional qualifier |
| Assigned Name | Person assigned to slot |

- Use `jspdf` / `pdfmake` to generate the PDF client-side.
- No logo required initially. Allow optional header/footer text in future.

---

## UI / Components

### Main Views

- **Planning List / Dashboard:** Create / Open / Import roster / Export JSON / Export PDF.
- **Planning Editor (primary):**
  - **Left pane:** Einsatzkräfte roster (search, filter by tag, import).
  - **Center:** Plan tree (Posten → Positions). Each Position row shows requirement chips, assigned person, and drag target area.
  - **Right pane / inspector:** Position details, notes, quick assign suggestions (best matches).
  - **Top bar:** Name, Start, End, Save, Export, Undo. Includes **EinsatzleiterIn** dropdown (populated from roster).
  - **Posten management:** A **"+ Neuer Posten"** button appends a new Posten. Each Posten has a **delete button** (requires confirmation) and a **"Leeren"** button (clears all `Position.assigned` values within that Posten, requires confirmation).
  - **Fahrzeugauswahl:** Dropdown at the Posten header with search/filter over the 31 vehicles plus a "Freie Eingabe" option. The selected Fahrzeug's Funkruf is shown as plain text next to the Posten label (no badge). The `hiorgId` is persisted in JSON but never shown in the UI.

### Components

| Component | Description |
|---|---|
| `PostenTree` | Collapsible tree |
| `PositionRow` | Chips, assign area, swap/unassign |
| `EinsatzkraftListItem` | Draggable card with tags |
| `ImportDialog` | Paste-text import |
| `SaveLoadDialog` | File picker |
| `PdfExportService` | Generates PDF export |
| `MatchService` | Qualification evaluation logic |

### Stärke-Berechnung

**Role classification** (based on highest taktisch tag):
- **Führer (F):** ZF, VF
- **Unterführer (UF):** GF
- **Helfer (H):** all others (including no taktisch tags)

**Display:** `Ist F/UF/H/Ges` vs `Soll F/UF/H/Ges` — shown per Posten (panel header) and overall (pane header). Each Ist value is color-coded against its Soll value (see Stärke-Farbkodierung).

**Soll** is derived from the `requirements.taktisch` fields of the Positions within the Posten.

### Accessibility

Keyboard assign/unassign support, ARIA labels for chips and drag targets.

---

## Behavioral Details & Edge Cases

- **Multi-tag persons:** tags parsed into respective categories. If a tag name is ambiguous, provide a mapping config (admin-editable).
- **Unknown tags:** stored as `zusatz` and displayed as neutral chips.
- **Removing a person via import:** prompt confirm; show list of removed assignments and allow cancel.
- **Posten removal:** prompt confirm; show list of affected assignments and allow cancel.
- **Posten leeren:** prompt confirm; list assigned persons that will be unassigned.
- **Autosave:** optional toggle; otherwise require user to Save manually.

---

## Localization

Provide i18n structure; use Angular i18n or `ngx-translate` to allow translations. **Default language: German.**

---

## Dev Setup & Dependencies (suggested)

| Dependency | Purpose |
|---|---|
| Angular (latest LTS) | Framework |
| Angular Material | UI components |
| Roboto | Font |
| CDK DragDrop | Drag & drop |
| ngx-translate | i18n |
| pdfmake or jspdf | PDF generation |
| uuid | UUID generation |
| date-fns-tz or luxon | Timezone handling |

**Basic commands:**
```bash
npm install
npm run start   # or: ng serve
```

**Dockerfile:** simple Node image running `ng serve` or serving a production build with nginx. *(Template provided on request.)*

---

## Testing & Acceptance Criteria

### Unit Tests

- `MatchService` (qualification logic)
- Import parser (various input variants)
- Save/Load JSON roundtrip

### E2E Tests

- Drag & drop assign/unassign and swap
- Import replace flow with confirmation
- PDF export contains expected table rows

**Acceptance:** planner can create a planning, import a roster, assign people via drag & drop, save JSON, and export PDF without errors.

---

## Deliverables & Milestones (rough)

| Milestone | Scope | Effort |
|---|---|---|
| M1 | Project scaffolding, core models, MatchService, import parser, JSON save/load | 2–3 days |
| M2 | UI core: roster list, Posten/Position tree, drag & drop assignment, visual match indicators | 3–4 days |
| M3 | Import/replace behaviors, undo/unassign, assignment swap | 2 days |
| M4 | PDF export, filename convention, PDF layout tuning | 2–3 days |
| M5 | Dockerfile, i18n hookup, polish, accessibility checks | 1–2 days |

**Total rough estimate:** 10–14 developer days (single engineer) to MVP.

---

## Open Questions / Configurable Choices

- **Default import behavior:** replace (current spec) vs merge — recommend keeping replace with "merge" toggle.
- **Exact Medizinisch ordering:** confirm final order if different from spec.
- **PDF column selection and styling:** confirm desired columns or use default tree list.
