# Design Principles — Personaleinsatzplanung (PEP) App

> Umfassender Style Guide und UX-Leitfaden für die Entwicklung einer Angular Material Personaleinsatzplanungs-Applikation.
> Zielgruppe: Entwickler, Designer und Product Owner.

---

## 1. Design-Philosophie

### 1.1 Leitsätze

Die PEP-App ist ein **operatives Werkzeug unter Zeitdruck**. Einsatzplanungen werden häufig kurzfristig erstellt oder angepasst — oft mit 30+ Einsatzkräften, dutzenden Positionen und komplexen Qualifikationsanforderungen. Jede Design-Entscheidung muss sich an folgenden Prinzipien messen:

1. **Geschwindigkeit vor Ästhetik** — Der Planer muss in Sekunden erkennen, wo Unterbesetzung herrscht, welche Qualifikationen fehlen und wer verfügbar ist. Visuelle Eleganz ist willkommen, darf aber nie die Informationsdichte oder Scan-Geschwindigkeit reduzieren.

2. **Fehlerprävention durch Sichtbarkeit** — Falschzuweisungen (z. B. ein SanH auf einer RA-Position) sind im Einsatz gefährlich. Das System muss solche Mismatches sofort visuell signalisieren, ohne den Workflow zu blockieren.

3. **Progressive Disclosure** — Übersicht zuerst, Details bei Bedarf. Die Stärke-Übersicht (Soll/Ist) ist immer sichtbar; einzelne Qualifikations-Tags und Notizen werden kontextuell eingeblendet.

4. **Direkte Manipulation** — Drag & Drop als primäre Interaktion, unterstützt durch Kontextmenüs und Tastatursteuerung als gleichwertige Alternativen.

5. **Visuelle Konsistenz** — Qualifikations-Chips verwenden überall identische Farben, Formen und Hierarchien — im Roster, in Positionen, im PDF-Export und in der Stärke-Anzeige.

### 1.2 Zielgruppe & Nutzungskontext

Der primäre Nutzer ist ein **Einsatzplaner** (Zugführer, Abschnittsleiter oder Stabsmitglied) der:
- unter Zeitdruck arbeitet (Einsatzvorbereitung oft ≤ 1 Stunde)
- Expertise in taktischen und medizinischen Qualifikationsstufen besitzt
- oft mehrere Planungen parallel verwaltet
- auf einem Desktop-Monitor (≥ 1440px Breite) arbeitet, gelegentlich auf einem Laptop (1280px)
- möglicherweise in unruhiger Umgebung (Bereitstellungsraum, Stab) operiert

---

## 2. Farbsystem & Corporate Identity

### 2.1 CI-Primärfarben

Das Farbsystem basiert auf den definierten CI-Farben des Hilfsorganisations-Kontextes:

| Token              | Hex       | Verwendung                                     |
|---------------------|-----------|-------------------------------------------------|
| `--ci-dark-blue`    | `#000548` | Primärfarbe, Überschriften, Navigationsleiste   |
| `--ci-red`          | `#EB003C` | Akzentfarbe, Warnungen, kritische Qualifikationen |
| `--ci-blue`         | `#4A6FB8` | Sekundär-Akzent, mittlere Qualifikationen       |
| `--ci-green`        | `#2F8F68` | Erfolg, Match-Indikator, Rettungshelfer         |
| `--ci-yellow`       | `#DEE100` | Achtung, partielle Matches, Rettungssanitäter   |
| `--ci-light-grey`   | `#C7CCD9` | Hintergrund Basis-Qualifikationen, neutrale Elemente |
| `--ci-white`        | `#FFFFFF` | Hintergrund, VF-Qualifikation                   |

### 2.2 Qualifikations-Chipfarben

Qualifikations-Chips sind das zentrale visuelle Element der App. Sie müssen **sofort erkennbar**, **konsistent** und **barrierefrei** sein.

#### Taktische Qualifikationen

| Stufe    | Hintergrund | Textfarbe  | Kontrast-Ratio | Semantik            |
|----------|-------------|------------|----------------|---------------------|
| H, KSH   | `#C7CCD9`   | `#000548`  | ≈ 8.5:1 ✅ AA  | Basis-Führung       |
| GF       | `#4A6FB8`   | `#FFFFFF`  | ≈ 4.6:1 ✅ AA  | Gruppenführer       |
| ZF, GdSA | `#EB003C`   | `#FFFFFF`  | ≈ 5.2:1 ✅ AA  | Zugführer / Stabsarbeit |
| VF       | `#FFFFFF`   | `#000548`  | ≈ 16.8:1 ✅ AAA | Verbandsführer      |

> **VF-Sonderregel:** VF-Chips erhalten einen 1px solid Border in `#000548`, um sich vom Hintergrund abzuheben.

#### Medizinische Qualifikationen

| Stufe        | Hintergrund | Textfarbe  | Kontrast-Ratio | Semantik            |
|--------------|-------------|------------|----------------|---------------------|
| EH, SSD, SanH | `#C7CCD9` | `#000548`  | ≈ 8.5:1 ✅ AA  | Basis-Sanitätsdienst |
| RH           | `#2F8F68`   | `#FFFFFF`  | ≈ 4.6:1 ✅ AA  | Rettungshelfer       |
| RS           | `#DEE100`   | `#000548`  | ≈ 14.2:1 ✅ AAA | Rettungssanitäter   |
| RA, NotSan   | `#EB003C`   | `#FFFFFF`  | ≈ 5.2:1 ✅ AA  | Rettungsassistent / Notfallsanitäter |
| A, NA        | `#4A6FB8`   | `#FFFFFF`  | ≈ 4.6:1 ✅ AA  | Arzt / Notarzt       |

### 2.3 Chip-Anatomie

```
┌──────────────┐
│  border-radius: 16px (pill shape)
│  padding: 2px 10px
│  font-size: 12px / font-weight: 600
│  letter-spacing: 0.5px
│  text-transform: uppercase
│  min-width: 32px
│  text-align: center
│  line-height: 20px
│  height: 24px
└──────────────┘
```

**Regeln für Chip-Rendering:**
- Chips werden immer in **Hierarchie-Reihenfolge** angezeigt: taktisch zuerst, dann medizinisch, dann Zusatz.
- Bei Platzmangel werden Chips gestapelt (vertikales Wrapping), nicht abgeschnitten.
- Zusatz-Qualifikationen verwenden: Hintergrund `#E8E8E8`, Text `#424242`, kein Border.
- Chips dürfen **niemals nur über Farbe** kommunizieren — jeder Chip zeigt sein Kürzel als Text.

### 2.4 Semantische Zustandsfarben

Zusätzlich zu den Qualifikationsfarben verwendet die App semantische Farben für Zustandsindikatoren:

| Zustand              | Farbe      | Token                | Verwendung                         |
|----------------------|------------|----------------------|------------------------------------|
| Exakt erfüllt        | `#2E7D32`  | `--status-match`     | Soll == Ist, vollständiger Match   |
| Unterbesetzt         | `#C62828`  | `--status-under`     | Ist < Soll, fehlende Qualifikation |
| Überbesetzt          | `#E65100`  | `--status-over`      | Ist > Soll                         |
| Neutral / Leer       | `#9E9E9E`  | `--status-neutral`   | Unzugewiesen, kein Soll definiert  |
| Drag-Match (voll)    | `#C8E6C9`  | `--drag-match-full`  | Hintergrund bei Full-Match-Drop    |
| Drag-Match (partiell)| `#FFF3E0`  | `--drag-match-partial` | Hintergrund bei Partial-Match    |
| Drag-Mismatch        | `#FFCDD2`  | `--drag-mismatch`    | Hintergrund bei Mismatch-Drop      |

### 2.5 Barrierefreiheit (WCAG 2.2 AA)

- **Alle Text/Hintergrund-Kombinationen** müssen ein Kontrastverhältnis ≥ 4.5:1 einhalten (Normaltext) bzw. ≥ 3:1 (großer Text / UI-Komponenten).
- **Farbe ist nie der einzige Informationsträger:** Jeder Match-Zustand wird durch Farbe UND Icon/Text/Border kommuniziert.
- **Icons als Redundanz:**
  - ✅ Häkchen-Icon bei erfüllter Anforderung
  - ⚠️ Warndreieck bei partiellem Match
  - ❌ Kreuz-Icon bei Mismatch
  - ○ Leerer Kreis bei unzugewiesener Position
- **Fokus-Indikatoren:** 2px solid Outline in `--ci-blue` für alle interaktiven Elemente.

---

## 3. Layout-Architektur

### 3.1 Drei-Spalten-Layout (Editor-Hauptansicht)

Die Editor-Ansicht verwendet ein **Three-Panel Layout** — das bewährte Pattern für Master-Detail-Ansichten in datenintensiven Enterprise-Applikationen:

```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar (fixiert)                                               │
│  [Planungsname] [Start] [End] [Einsatzleiter ▼] [💾] [📥] [↩]  │
├──────────┬───────────────────────────────────┬───────────────────┤
│ Linkes   │  Zentrale Planungsfläche          │  Rechtes Panel    │
│ Panel    │                                   │  (Inspector)      │
│          │  ┌─ Posten 1 ──────────────────┐  │                   │
│ Roster   │  │  Position 1.1 [Chips] [Name]│  │  Position-Details │
│ (Einsatz-│  │  Position 1.2 [Chips] [    ]│  │  Notizen          │
│ kräfte)  │  └─────────────────────────────┘  │  Quick-Assign     │
│          │                                   │  Vorschläge       │
│ [🔍]     │  ┌─ Posten 2 ──────────────────┐  │                   │
│ [Filter] │  │  Position 2.1 [Chips] [Name]│  │  Stärke-Detail    │
│          │  │  Position 2.2 [Chips] [    ]│  │                   │
│ [Liste]  │  └─────────────────────────────┘  │                   │
│          │                                   │                   │
├──────────┴───────────────────────────────────┴───────────────────┤
│  Status Bar (Gesamt-Stärke: Soll F/UF/H/Ges — Ist F/UF/H/Ges)  │
└──────────────────────────────────────────────────────────────────┘
```

#### Proportionen und Verhalten

| Panel              | Breite (Standard) | Min-Breite | Verhalten                           |
|--------------------|-------------------|------------|-------------------------------------|
| Links (Roster)     | 280px             | 240px      | Collapsible, resizable              |
| Mitte (Planung)    | flex: 1           | 480px      | Scroll-Bereich, Hauptfokus          |
| Rechts (Inspector) | 320px             | 280px      | Collapsible, kontextabhängig        |

- Panels sind per **Drag-Handle** in der Breite verstellbar.
- Bei < 1280px Bildschirmbreite: Inspector wird zum Overlay-Panel (Slide-in von rechts).
- Bei < 1024px: Linkes Panel wird ebenfalls zum Overlay (Hamburger-Menü-Pattern).

### 3.2 Top Bar

Die Top Bar ist **fixiert** (sticky) und enthält alle planungsweiten Steuerungen:

| Bereich | Inhalte |
|---------|---------|
| Links   | Planungsname (editierbar inline), Start-/End-Datetime (Material Datepicker mit Timezone `Europe/Berlin`) |
| Mitte   | EinsatzleiterIn-Dropdown (populated aus Roster, zeigt Name + höchste Qualifikation als Chip) |
| Rechts  | Action-Buttons: Speichern, JSON-Export, PDF-Export, Undo, Einstellungen |

**Design-Regeln:**
- Höhe: 56px (Material Standard)
- Hintergrund: `#FFFFFF` mit 1px Bottom-Border in `#E0E0E0`
- Kein Schatten (flat design, maximiert vertikalen Platz)
- Action-Buttons als Icon-Buttons mit Tooltip, kein Text (Platzersparnis)
- EinsatzleiterIn-Dropdown zeigt prominenten blauen Akzent-Ring wenn leer (Aufmerksamkeitssteuerung)

### 3.3 Status Bar (Gesamt-Stärke)

Am unteren Rand oder als fixierte Zusammenfassung oberhalb des Planungsbereichs:

```
Gesamt-Stärke:  Soll  2F / 4UF / 24H / 30Ges    Ist  1F / 3UF / 22H / 26Ges
                      ↑rot   ↑rot   ↑rot   ↑rot
```

- Jeder Ist-Wert wird **individuell farbcodiert** gegen seinen Soll-Wert.
- Font: `Roboto Mono` oder `Roboto` mit tabular figures (`font-feature-settings: "tnum"`) für saubere Ausrichtung der Zahlen.
- Schriftgröße: 14px, Gewicht: 500.

---

## 4. Komponentenspezifische Design-Richtlinien

### 4.1 Einsatzkräfte-Roster (Linkes Panel)

#### Suchfeld
- Permanent sichtbar am oberen Rand des Panels.
- Material Input mit Leading Search-Icon.
- Suche filtert sofort (debounced, 150ms) nach Name und Qualifikationen.
- Platzhaltertext: *„Name oder Qualifikation suchen…"*

#### Filter-Chips
- Unterhalb der Suche: horizontale Chip-Leiste mit schnell-Filtern.
- Filter-Optionen: „Unzugewiesen", „Zugewiesen", einzelne Qualifikations-Tags.
- Aktive Filter erscheinen als gefüllte Chips, inaktive als Outline-Chips.
- Filter sind kombinierbar (AND-Logik).

#### Roster-Liste
- Jede Einsatzkraft wird als **kompakte Karte** dargestellt:

```
┌─────────────────────────────────┐
│ ⠿ Nachname Vorname              │   ⠿ = Drag-Handle
│   [GF] [RS]  [SanH]            │   Qualification Chips
│   ─── zugewiesen: Posten 1/P2  │   Zuweisungs-Info (falls vorhanden)
└─────────────────────────────────┘
```

- **Drag-Handle:** Vertikale 6-Punkt-Griffleiste (⠿) links. Wird bei Hover sichtbar (opacity 0.4 → 1.0).
- **Zugewiesene Einsatzkräfte** erhalten eine dezente visuelle Markierung:
  - Linker Rand: 3px solid `--ci-blue` 
  - Text-Opacity: 0.65 (visuell "zurücknehmen", da bereits vergeben)
  - Zuweisungs-Info als einzeilige Subline in `--status-neutral`
- **Unzugewiesene Einsatzkräfte** sind visuell prominent:
  - Kein linker Rand
  - Volle Opacity
  - Leicht erhöhter Kontrast
- Sortierung: unzugewiesene zuerst, dann alphabetisch. Alternativ: nach höchster Qualifikation.
- **Rechtsklick** öffnet Kontextmenü zur Position-Zuweisung (siehe 4.5).

#### Stärke-Zusammenfassung im Roster-Header

Oberhalb der Liste zeigt ein kompakter Header die Gesamt-Verfügbarkeit:

```
Einsatzkräfte (26/30 zugewiesen)
[████████████████████░░░░] 87%
```

### 4.2 Posten-Baum (Zentrale Planungsfläche)

#### Posten-Header

Jeder Posten wird als **Expansion Panel** (Material `mat-expansion-panel`) dargestellt:

```
┌─ Posten-Header ──────────────────────────────────────────────────┐
│  ▼ Sanitätswache Nord    72 GW-SAN 01     Ist 0/1/3/4 Soll 0/1/4/5  │
│    [Fahrzeug-Dropdown ▼] [+ Position] [🗑 Leeren] [✕ Löschen]        │
└──────────────────────────────────────────────────────────────────────┘
```

**Design-Regeln:**
- Hintergrund: `#F5F5F5` (Material grey-100)
- Linker Rand: 4px solid `--ci-dark-blue`
- Posten-Label: `font-size: 16px`, `font-weight: 500`
- Fahrzeug-Funkruf: plain text neben dem Label, `font-weight: 400`, `color: #616161`
- Stärke-Anzeige: rechtsbündig, jeder Wert individuell farbcodiert
- Collapse/Expand: Standard Material-Pfeil, smooth Animation (225ms)
- Bei Collapse bleibt die Stärke-Übersicht im Header sichtbar

#### Fahrzeug-Dropdown
- Autocomplete-Dropdown mit Suchfeld
- Format: `"<Funkruf> (<Seriennummer>)"` z. B. `"72 GW-SAN 01 (NRW 8-2077)"`
- Letzte Option: „Freie Eingabe" — öffnet Textfeld für Funkruf-Eingabe
- `hiorgId` wird intern gespeichert, nie angezeigt

#### Position-Zeilen

Innerhalb eines Postens sind Positionen als **horizontale Zeilen** arrangiert:

```
┌── Position-Zeile ─────────────────────────────────────────────┐
│  Positionsführer     [GF] [RS]     │  ●  Schmidt Peter [GF][RA] │
│  (Label)         (Anforderungen)   │ (Status)  (Zugewiesene Person + Tags)  │
└───────────────────────────────────────────────────────────────┘
```

| Element                | Beschreibung                                          |
|------------------------|-------------------------------------------------------|
| **Position-Label**      | Links, `font-weight: 500`, max-width: 160px, ellipsis bei Überlauf |
| **Anforderungs-Chips**  | Taktisch + Medizinisch + Zusatz, in CI-Farben         |
| **Status-Indikator**    | Kreis-Icon: ✅ Match, ⚠️ Partial, ❌ Mismatch, ○ Leer |
| **Zugewiesene Person**  | Name + persönliche Qualifikations-Chips (klein, 20px Höhe) |
| **Drop-Zone**           | Gesamte rechte Hälfte der Zeile ist Drop-Target       |
| **Unassign-Button**     | ✕ Icon, erscheint bei Hover über zugewiesene Person    |

**Zeilen-Höhe:** 48px (Material Dense Standard) — ermöglicht 10-12 sichtbare Positionen ohne Scrollen.

**Alternating Row Background:** Gerade Zeilen `#FFFFFF`, ungerade `#FAFAFA` — subtile Unterscheidung zur Scan-Hilfe.

### 4.3 Inspector Panel (Rechtes Panel)

Der Inspector zeigt kontextabhängige Details:

#### Bei Klick auf eine Position:
- Position-Label (editierbar)
- Anforderungen (editierbar: Dropdowns für Taktisch/Medizinisch/Zusatz)
- Zugewiesene Person mit vollständigem Profil
- **Quick-Assign-Vorschläge:** Top-5 unzugewiesene Einsatzkräfte, sortiert nach Match-Qualität
  - Voller Match: grüner Rand, prominente Darstellung
  - Partieller Match: orangefarbener Rand
  - Kein Match: grauer Rand, am Ende der Liste
  - Klick auf Vorschlag = Sofortzuweisung

#### Bei Klick auf eine Einsatzkraft:
- Vollständiges Profil: Name, alle Tags, Notizen
- Aktuelle Zuweisung (falls vorhanden) mit Link zum Posten
- Liste aller passenden offenen Positionen

### 4.4 Drag & Drop Interaktion

Die Drag-&-Drop-Interaktion ist das Herzstück der App und muss **präzise, vorhersagbar und feedback-reich** sein.

#### Drag-Zustände

| Phase          | Visuelles Feedback                                                           |
|----------------|-------------------------------------------------------------------------------|
| **Idle**       | Drag-Handle sichtbar bei Hover (cursor: grab)                                |
| **Grab**       | Karte hebt sich an (box-shadow: `0 8px 16px rgba(0,0,0,0.15)`), cursor: grabbing |
| **Drag**       | Halbtransparente Kopie ("Ghost") folgt dem Cursor, Original wird ausgegraut  |
| **Über Drop-Zone** | Drop-Zone ändert Hintergrundfarbe basierend auf Match-Qualität          |
| **Drop (Erfolg)** | Kurze Erfolgs-Animation (150ms fade-in), Chip-Farben aktualisieren sich  |
| **Drop (Swap)** | Beide Personen animieren ihre Platzwechsel (225ms slide)                   |
| **Zurück zum Roster** | Position wird geleert, Person erscheint wieder ungefiltert im Roster  |

#### Drop-Zone-Highlighting

```
┌─────────────────────────────────────────────┐
│  Full Match:                                 │
│  background: #C8E6C9 (grün, 20% opacity)    │
│  border: 2px dashed #2E7D32                  │
│  icon: ✅                                    │
├─────────────────────────────────────────────┤
│  Partial Match:                              │
│  background: #FFF3E0 (orange, 20% opacity)   │
│  border: 2px dashed #E65100                  │
│  icon: ⚠️                                    │
├─────────────────────────────────────────────┤
│  Mismatch:                                   │
│  background: #FFCDD2 (rot, 20% opacity)      │
│  border: 2px dashed #C62828                  │
│  icon: ❌                                    │
├─────────────────────────────────────────────┤
│  Bereits besetzt (Swap möglich):             │
│  border: 2px dashed #4A6FB8                  │
│  icon: ⇄ (Swap-Icon)                        │
└─────────────────────────────────────────────┘
```

#### Keyboard-Alternative

- `Tab` navigiert durch Positionen und Roster-Einträge
- `Enter` auf einer unzugewiesenen Einsatzkraft öffnet das Kontextmenü
- `Enter` auf einer Vorschlagsliste im Inspector weist zu
- `Delete` auf einer zugewiesenen Position entfernt die Zuweisung
- `Ctrl+Z` macht die letzte Aktion rückgängig

### 4.5 Kontextmenü (Rechtsklick-Zuweisung)

Bei Rechtsklick auf eine unzugewiesene Einsatzkraft:

```
┌── Zuweisen an... ─────────────────────────┐
│                                            │
│  ▸ Sanitätswache Nord                      │
│    ├─ Positionsführer [GF][RS]        ✅   │
│    ├─ Sanitäter 1     [SanH]         ⚠️   │
│    └─ Sanitäter 2     [SanH]         ⚠️   │
│                                            │
│  ▸ Rettungswache Süd                       │
│    ├─ RTW-Fahrer      [RS]           ✅   │
│    └─ Beifahrer       [RH]          ❌   │
│                                            │
└────────────────────────────────────────────┘
```

- Posten als Gruppen-Header (nicht klickbar, fett)
- Nur **freie Positionen** werden angezeigt
- Jede Position zeigt ihre Anforderungs-Chips und Match-Icon
- Full-Match-Positionen stehen oben (sortiert nach Match-Qualität)
- Klick = sofortige Zuweisung, Menü schließt sich
- Max. Höhe: 400px mit Scroll, falls nötig
- Position am Mauszeiger (Material CDK Overlay)

---

## 5. Typografie

### 5.1 Schriftart

**Primär:** Roboto (Google Material Standard)
**Monospaced:** Roboto Mono (für Stärke-Zahlen und Code-artige Darstellungen)

### 5.2 Typografie-Skala

| Anwendung              | Größe  | Gewicht | Zeilenhöhe | Letter-Spacing |
|------------------------|--------|---------|------------|----------------|
| Planungsname (Top Bar) | 20px   | 500     | 28px       | 0.15px         |
| Posten-Header          | 16px   | 500     | 24px       | 0.15px         |
| Position-Label         | 14px   | 500     | 20px       | 0.1px          |
| Einsatzkraft-Name      | 14px   | 400     | 20px       | 0.1px          |
| Chip-Text              | 12px   | 600     | 16px       | 0.5px          |
| Stärke-Zahlen          | 14px   | 500     | 20px       | 0 (Tabular)    |
| Subline / Meta         | 12px   | 400     | 16px       | 0.4px          |
| Tooltip                | 12px   | 400     | 16px       | 0.4px          |

### 5.3 Regeln

- **Alle Qualifikations-Kürzel** werden in UPPERCASE dargestellt (sie sind Abkürzungen).
- **Namen** werden in Originalschreibweise dargestellt: „Nachname Vorname".
- **Zahlen in Stärke-Anzeigen** verwenden `font-feature-settings: "tnum"` für tabellarische Ausrichtung.
- **Keine Unterstreichungen** außer bei Links.
- **Maximale Textlänge** für Labels: Ellipsis (`text-overflow: ellipsis`) mit Tooltip bei Abschneidung.

---

## 6. Spacing & Grid

### 6.1 Basis-Einheit

Alle Abstände basieren auf einem **4px-Raster** (Material Design Standard):

| Token    | Wert  | Verwendung                                   |
|----------|-------|----------------------------------------------|
| `xs`     | 4px   | Chip-Innenabstand, Icon-Margin               |
| `sm`     | 8px   | Zwischen-Chips, Zeilen-Padding               |
| `md`     | 16px  | Panel-Padding, Abstand zwischen Sektionen    |
| `lg`     | 24px  | Posten-Abstand untereinander                 |
| `xl`     | 32px  | Panel-Außenabstände                          |

### 6.2 Dense Mode

Für die PEP-App wird **Material Dense Mode** als Standard empfohlen:
- Zeilen: 48px statt 56px
- Buttons: 32px Höhe statt 36px
- Inputs: 40px Höhe statt 48px
- Chips: 24px Höhe statt 32px

Begründung: Bei 30+ Einsatzkräften und 20+ Positionen ist vertikaler Platz das wertvollste Gut. Jeder gesparte Pixel reduziert Scrollen und beschleunigt die Übersicht.

---

## 7. Ikongrafie

### 7.1 Icon-Set

**Material Symbols (Outlined)** als primäres Icon-Set. Konsistent mit Angular Material.

### 7.2 Spezifische Icons

| Funktion                | Icon                       | Größe  |
|-------------------------|----------------------------|--------|
| Drag-Handle             | `drag_indicator`           | 20px   |
| Speichern               | `save`                     | 24px   |
| JSON-Export              | `download`                 | 24px   |
| PDF-Export               | `picture_as_pdf`           | 24px   |
| Undo                    | `undo`                     | 24px   |
| Position hinzufügen     | `add_circle_outline`       | 20px   |
| Posten löschen          | `delete_outline`           | 20px   |
| Posten leeren           | `cleaning_services`        | 20px   |
| Match: Voll             | `check_circle`             | 16px   |
| Match: Partiell         | `warning`                  | 16px   |
| Match: Mismatch         | `cancel`                   | 16px   |
| Position: Leer          | `radio_button_unchecked`   | 16px   |
| Swap                    | `swap_horiz`               | 16px   |
| Einsatzleiter           | `military_tech`            | 20px   |
| Suche                   | `search`                   | 20px   |
| Filter                  | `filter_list`              | 20px   |
| Expand                  | `expand_more`              | 24px   |
| Collapse                | `expand_less`              | 24px   |
| Fahrzeug                | `local_shipping`           | 20px   |
| Import (Roster)         | `group_add`                | 24px   |
| Einstellungen           | `settings`                 | 24px   |

---

## 8. Animationen & Transitions

### 8.1 Grundsätze

- **Funktional, nicht dekorativ:** Jede Animation muss einen Informationszweck erfüllen.
- **Schnell:** Max. 225ms für UI-Transitions, 150ms für Hover-Effekte.
- **Unterdrückbar:** `prefers-reduced-motion: reduce` wird respektiert.

### 8.2 Spezifische Animationen

| Interaktion                    | Animation                                  | Dauer   | Easing              |
|--------------------------------|--------------------------------------------|---------|---------------------|
| Panel Expand/Collapse          | Höhe animieren                             | 225ms   | ease-in-out         |
| Drag-Start (Lift)              | Scale 1.0 → 1.02, Shadow einblenden       | 150ms   | ease-out            |
| Drop-Zone Highlight            | Hintergrundfarbe einblenden                | 100ms   | ease-in             |
| Erfolgreiche Zuweisung         | Fade-in der Person in Position             | 150ms   | ease-out            |
| Swap                           | Slide beider Elemente                      | 225ms   | ease-in-out         |
| Unassign                       | Fade-out aus Position, Fade-in ins Roster  | 150ms   | ease-out            |
| Stärke-Wert-Änderung           | Kurzes Pulsieren der Zahl (scale 1.0→1.1→1.0) | 300ms | ease-in-out       |
| Chip erscheint                 | Scale 0.8 → 1.0 + Opacity 0 → 1          | 100ms   | ease-out            |
| Toast / Snackbar               | Slide-in von unten                         | 225ms   | ease-out            |

---

## 9. Dialog & Bestätigungs-Design

### 9.1 Grundsatz

Bestätigungsdialoge werden sparsam eingesetzt — nur bei **destruktiven oder schwer rückgängig zu machenden Aktionen**.

### 9.2 Dialoge nach Schweregrad

| Aktion                        | Bestätigung erforderlich? | Dialog-Typ              |
|-------------------------------|---------------------------|-------------------------|
| Person zuweisen               | Nein                      | —                       |
| Person unassignen             | Nein (Undo verfügbar)     | —                       |
| Swap                          | Nein (Undo verfügbar)     | —                       |
| Posten leeren                 | Ja                        | Warndialog mit Liste    |
| Posten löschen                | Ja                        | Warndialog mit Liste    |
| Import (Replace)              | Ja                        | Warndialog mit Diff     |
| Import (Merge)                | Nein                      | —                       |
| Planung speichern             | Nein                      | —                       |
| Ungespeicherte Änderungen     | Ja (bei Navigation weg)   | Einfacher Warndialog    |

### 9.3 Warndialog-Anatomie

```
┌─ Dialog ─────────────────────────────────────────┐
│                                                   │
│  ⚠️  Posten „Sanitätswache Nord" leeren?          │
│                                                   │
│  Folgende Zuweisungen werden entfernt:            │
│                                                   │
│  • Schmidt Peter → Positionsführer                │
│  • Meyer Anna → Sanitäter 1                       │
│  • Weber Max → Sanitäter 2                        │
│                                                   │
│  Diese Aktion kann mit Strg+Z rückgängig          │
│  gemacht werden.                                  │
│                                                   │
│              [Abbrechen]  [Leeren]                │
│                                                   │
└───────────────────────────────────────────────────┘
```

- **Primär-Button** (destruktive Aktion): Rot (`--ci-red`), Text weiß
- **Sekundär-Button** (Abbrechen): Outline, `--ci-dark-blue`
- Betroffene Einträge werden als Liste dargestellt (max. 10, danach „...und X weitere")
- Hinweis auf Undo-Möglichkeit reduziert Entscheidungsangst

---

## 10. Responsive Verhalten

### 10.1 Breakpoints

| Breakpoint | Breite         | Layout-Anpassung                              |
|------------|----------------|-----------------------------------------------|
| Desktop XL | ≥ 1920px       | Drei-Spalten, großzügiges Spacing              |
| Desktop    | 1440–1919px    | Drei-Spalten, Standard-Spacing                 |
| Laptop     | 1280–1439px    | Drei-Spalten, komprimiertes Spacing            |
| Tablet     | 1024–1279px    | Zwei-Spalten (Roster als Overlay)              |
| Mobile     | < 1024px       | Single-Column, Tab-Navigation zwischen Panels  |

### 10.2 Mobile Anpassungen

Obwohl die App desktop-first ist, sollte sie auf Tablets bedienbar sein:
- Drag & Drop wird durch **Tap-to-Select → Tap-to-Assign** ergänzt
- Kontextmenü wird zum Bottom-Sheet
- Chips werden auf 28px Höhe vergrößert (Touch-Target ≥ 44px)
- Inspector wird zum Full-Screen-Overlay

---

## 11. Empty States & Onboarding

### 11.1 Empty States

Jeder Bereich hat einen gestalteten Empty State mit Handlungsaufforderung:

| Bereich              | Nachricht                                           | Aktion              |
|----------------------|-----------------------------------------------------|---------------------|
| Roster leer          | „Noch keine Einsatzkräfte vorhanden."               | [Roster importieren] |
| Keine Posten         | „Erstelle deinen ersten Posten, um zu beginnen."    | [+ Neuer Posten]     |
| Position unbesetzt   | „Ziehe eine Einsatzkraft hierher oder nutze Rechtsklick im Roster." | — |
| Keine Planungen      | „Willkommen! Erstelle deine erste Planung."         | [Neue Planung]       |

- Empty States verwenden ein dezentes Illustration-Icon (z. B. `groups` / `assignment`) in `#E0E0E0`.
- Text ist zentriert, `font-size: 14px`, `color: #757575`.

### 11.2 Tooltips & Contextual Help

- **Erstbenutzung:** Optionale Tooltip-Tour (3-4 Schritte) über Key-Features.
- **Persistent Tooltips:** Alle Icons und Buttons haben `matTooltip` mit deutschem Text.
- **Match-Erklärung:** Bei Hover über einen Match-Indikator wird erklärt, warum der Match vollständig / partiell / fehlend ist (z. B. „Benötigt RS, hat SanH — medizinische Anforderung nicht erfüllt").

---

## 12. PDF-Export Styling

### 12.1 Layout-Prinzipien

Der PDF-Export folgt dem Prinzip: **Lesbarkeit auf Papier** — keine interaktiven Elemente, aber konsistente Farbkodierung.

### 12.2 Seiten-Layout

- **Seitengröße:** A4 Hochformat
- **Ränder:** 20mm oben/unten, 15mm links/rechts
- **Header:** Planungsname (18pt, bold), Datum/Uhrzeit (12pt), EinsatzleiterIn
- **Footer:** Export-Zeitstempel, Seitennummer

### 12.3 Qualifikations-Darstellung im PDF

Qualifikations-Chips werden als **farbige Rechtecke mit Text** nachgebildet:
- Breite: automatisch (Textbreite + 8px Padding)
- Höhe: 16pt
- Border-Radius: 8pt (visuell rund)
- Farben identisch zu den UI-Chips
- Schriftgröße: 9pt, UPPERCASE, bold

### 12.4 Posten/Position-Tabelle

| Spalte          | Breite  | Inhalt                                |
|-----------------|---------|---------------------------------------|
| Position        | 25%     | Label der Position                    |
| Taktisch        | 12%     | Farbiger Chip (oder „—")              |
| Medizinisch     | 12%     | Farbiger Chip (oder „—")              |
| Zusatz          | 12%     | Text (oder „—")                       |
| Zugewiesen      | 25%     | Name der zugewiesenen Einsatzkraft    |
| Match           | 14%     | ✅ / ⚠️ / ❌ / ○ + Klartext           |

- Posten-Header als grau hinterlegte Zeile mit Fahrzeug-Funkruf.
- Stärke-Übersicht pro Posten unterhalb des Posten-Blocks.
- Gesamt-Stärke auf der letzten Seite.

---

## 13. Zustandsmanagement & Feedback

### 13.1 Undo-System

- **Undo-Stack:** Mindestens 20 Aktionen tief.
- **Undo-fähige Aktionen:** Alle Zuweisungen, Unassigns, Swaps, Posten-Änderungen, Import.
- **Shortcut:** `Ctrl+Z` (global), auch als Button in der Top Bar.
- **Snackbar-Feedback:** Jede Aktion zeigt eine Snackbar mit „[Aktion] — Rückgängig" Button (5 Sekunden sichtbar).

### 13.2 Autosave-Indikator

- Wenn Autosave aktiviert: Dezenter Indikator in der Top Bar:
  - „Gespeichert" (grüner Punkt) / „Änderungen vorhanden" (orangefarbener Punkt) / „Speichern..." (Spinner)
- Wenn Autosave deaktiviert: Prominenter „Ungespeicherte Änderungen"-Hinweis mit pulsierendem Punkt.

### 13.3 Fehlerzustände

| Fehler                          | Feedback                                                |
|---------------------------------|---------------------------------------------------------|
| JSON-Datei ungültig             | Snackbar rot: „Datei konnte nicht geladen werden."      |
| Versionskonflikt beim Laden     | Dialog mit Warnung und Option fortzufahren              |
| PDF-Export fehlgeschlagen       | Snackbar rot mit Retry-Button                           |
| EFS-API nicht erreichbar        | Banner oben: „Verbindung zu HiOrg-Server fehlgeschlagen." |
| Import: Doppelte Namen gefunden | Dialog mit Merge/Replace-Optionen                       |

---

## 14. Lokalisierung

### 14.1 Grundsätze

- **Standardsprache:** Deutsch (de-DE)
- Alle UI-Texte über `ngx-translate` externalisiert
- Qualifikations-Kürzel (H, GF, RS, etc.) werden **nicht übersetzt** — sie sind Fachbegriffe
- Datums-/Uhrzeitformate folgen dem Gebietsschema: `DD.MM.YYYY`, `HH:mm`
- Dezimaltrennzeichen: Komma

### 14.2 Textlängen-Toleranz

Deutsche UI-Texte sind durchschnittlich 30% länger als englische. Alle Layouts müssen mit der **längsten erwarteten Zeichenkette** getestet werden:
- Labels: max. 25 Zeichen
- Buttons: max. 18 Zeichen
- Tooltips: max. 80 Zeichen
- Dialog-Titel: max. 50 Zeichen

---

## 15. Performance-Richtlinien

### 15.1 Rendering-Budget

| Metrik                        | Zielwert           |
|-------------------------------|--------------------|
| First Contentful Paint        | < 1.5s             |
| Time to Interactive           | < 3s               |
| Drag-Start-Latenz             | < 100ms            |
| Drop-Feedback-Latenz          | < 50ms             |
| Roster-Filter-Reaktion        | < 150ms            |
| JSON-Save (30 Einsatzkräfte)  | < 200ms            |
| PDF-Export (30 Einsatzkräfte) | < 5s               |

### 15.2 Optimierungs-Strategien

- **Virtual Scrolling** für das Roster bei > 50 Einsatzkräften
- **OnPush Change Detection** für alle Posten- und Position-Komponenten
- **TrackBy-Funktion** in allen `*ngFor`-Schleifen
- **Lazy Loading** für PDF-Export-Bibliothek (nur bei Bedarf laden)
- **Debouncing** der Suchfeld-Eingabe (150ms)

---

## 16. Design-Token-Referenz (CSS Custom Properties)

```css
:root {
  /* CI-Farben */
  --ci-dark-blue: #000548;
  --ci-red: #EB003C;
  --ci-blue: #4A6FB8;
  --ci-green: #2F8F68;
  --ci-yellow: #DEE100;
  --ci-light-grey: #C7CCD9;
  --ci-white: #FFFFFF;

  /* Semantische Zustandsfarben */
  --status-match: #2E7D32;
  --status-under: #C62828;
  --status-over: #E65100;
  --status-neutral: #9E9E9E;

  /* Drag & Drop Feedback */
  --drag-match-full-bg: #C8E6C9;
  --drag-match-full-border: #2E7D32;
  --drag-match-partial-bg: #FFF3E0;
  --drag-match-partial-border: #E65100;
  --drag-mismatch-bg: #FFCDD2;
  --drag-mismatch-border: #C62828;
  --drag-swap-border: #4A6FB8;

  /* Oberflächen */
  --surface-primary: #FFFFFF;
  --surface-secondary: #F5F5F5;
  --surface-tertiary: #FAFAFA;
  --surface-hover: #EEEEEE;

  /* Text */
  --text-primary: #212121;
  --text-secondary: #616161;
  --text-disabled: #9E9E9E;
  --text-on-dark: #FFFFFF;

  /* Borders */
  --border-light: #E0E0E0;
  --border-medium: #BDBDBD;

  /* Schatten (Material Elevation) */
  --elevation-1: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --elevation-2: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  --elevation-drag: 0 8px 16px rgba(0, 0, 0, 0.15);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Border Radius */
  --radius-chip: 16px;
  --radius-card: 8px;
  --radius-button: 4px;
  --radius-dialog: 12px;

  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 225ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## 17. Checkliste für Implementierung

Verwende diese Checkliste bei der Entwicklung jeder Komponente:

- [ ] **Farben:** Nur Design-Tokens verwenden, keine Hex-Werte inline
- [ ] **Kontrast:** Alle Text/Hintergrund-Kombinationen auf WCAG AA prüfen
- [ ] **Redundanz:** Information wird nie ausschließlich über Farbe transportiert
- [ ] **Keyboard:** Alle Interaktionen sind per Tastatur erreichbar
- [ ] **ARIA:** Drag-Targets haben `aria-dropeffect`, Chips haben `aria-label` mit vollem Qualifikationsnamen
- [ ] **Dense Mode:** Komponente nutzt Material Dense-Variante
- [ ] **Responsive:** Verhalten bei < 1280px getestet
- [ ] **Undo:** Aktion ist im Undo-Stack registriert
- [ ] **i18n:** Alle Texte sind über Translation-Keys externalisiert
- [ ] **Animation:** `prefers-reduced-motion` wird respektiert
- [ ] **Loading:** Asynchrone Aktionen zeigen Fortschrittsindikator
- [ ] **Error:** Fehlerzustände sind gestaltet und getestet
- [ ] **Tooltip:** Alle Icons haben deutschen Tooltip-Text
- [ ] **PDF:** Darstellung ist im PDF-Export konsistent mit UI