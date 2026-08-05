---
name: Collins Equipments
description: Heavy machinery to buy or hire, presented as an engineer's working drawings.
colors:
  blueprint-black: "#000000"
  panel-black: "#0B0C0F"
  field-black: "#14171C"
  paper-white: "#FFFFFF"
  ink-white: "#FFFFFF"
  ink-dim: "#A6ADB8"
  ink-faint: "#6C7481"
  line-faint: "rgba(255,255,255,0.14)"
  line-mid: "rgba(255,255,255,0.30)"
  line-strong: "rgba(255,255,255,0.60)"
  safety-yellow: "#FFDD04"
  on-yellow: "#000000"
  construction-orange: "#DF790D"
  collins-navy: "#081459"
  collins-blue: "#0050F0"
  whatsapp-green: "#25D366"
typography:
  display:
    fontFamily: "Anton, 'Archivo Variable', sans-serif"
    fontSize: "clamp(3.2rem, 2rem + 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Anton, sans-serif"
    fontSize: "clamp(2.4rem, 1.6rem + 3vw, 3.6rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.005em"
  body:
    fontFamily: "'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.18vw, 1.08rem)"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "'Spline Sans Mono Variable', ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 600
    letterSpacing: "0.2em"
rounded:
  sharp: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  gutter: "44px"
components:
  button-primary:
    backgroundColor: "{colors.safety-yellow}"
    textColor: "{colors.on-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "13px 22px"
  button-primary-hover:
    backgroundColor: "#FFE64A"
    textColor: "{colors.on-yellow}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-white}"
    typography: "{typography.label}"
    rounded: "{rounded.sharp}"
    padding: "13px 22px"
  button-secondary-hover:
    backgroundColor: "{colors.construction-orange}"
    textColor: "{colors.paper-white}"
  input:
    backgroundColor: "{colors.panel-black}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.sharp}"
    padding: "12px 14px"
  drawing-sheet:
    backgroundColor: "{colors.blueprint-black}"
    textColor: "{colors.ink-white}"
    rounded: "{rounded.sharp}"
    padding: "26px 24px"
---

# Design System: Collins Equipments

## Overview

**Creative North Star: "The Working Drawing"**

Collins' site is built as an engineer's set of working drawings. Every surface behaves like a drafting sheet: a black blueprint ground ruled with a faint grid, white hairline linework, dimensioned callouts, title blocks, and buy/hire stamps. The interface doesn't decorate the equipment — it *specifies* it. The register is technical, confident, and industrial; this is a supplier that measures things.

The palette is taken from the reference competitor (SP Heavy Rental), verified against its live site: a black ground with **safety-yellow** as the single action color and **construction-orange** as its second. Collins' own navy and blue survive only as the logo and the tint of the drawing lines, preserving brand continuity. **Anton** sets every headline in tight industrial caps; a monospace (**Spline Sans Mono**) carries the drawing's annotation voice — specs, labels, part numbers, dimensions — and **Archivo** handles running prose.

Deliberately rejected: the category's sunset-silhouette hero and safety-yellow-everywhere shout (the reference site's own default); rounded, soft, card-heavy SaaS UI; gradient and glass decoration.

**Key Characteristics:** blueprint ground (light paper by default) · hairline linework + dimension callouts · safety-yellow means *action only* · Anton industrial caps · monospace for measurement · sharp 0px corners · flat by default, CAD-style selection on hover.

**Theming.** The system **defaults to a light "drafting on paper" ground** (navy ink on paper); the **dark blueprint** is the opt-in alternate (`:root[data-theme="dark"]`, white ink on black — the original committed world). Ground, ink, hairlines, and *thin-line* accents flip per theme (construction-orange carries thin accents on light, safety-yellow on dark); the **yellow action-fill, the Collins blues, and WhatsApp green are constant**. The hex values in the sections below are the dark-blueprint reference / semantic roles — read them as roles, not fixed grounds.

## Colors

A near-monochrome blueprint (black ground, white linework) carried by a single loud action color, with Collins' brand blues held in reserve.

### Primary
- **Safety Yellow** (#FFDD04): the one action color. Primary CTA fills (always with black text), the single hero accent (the "OUTPUT" dimension bracket), the CAD selection outline on hover, active toggle state, and footer heading underlines. Never a background field, never a text color on light.

### Secondary
- **Construction Orange** (#DF790D): second action / outline buttons and their hover fill; the orange Call FAB; the "BUY" title-block stamp; low-contrast accent lines where yellow would disappear.

### Neutral
- **Blueprint Black** (#000000): the primary ground of every section — the paper of the drawing.
- **Panel Black** (#0B0C0F) / **Field Black** (#14171C): raised bands, footer, form inputs.
- **Ink White** (#FFFFFF): body text and the drawing's linework on dark.
- **Ink Dim** (#A6ADB8) / **Ink Faint** (#6C7481): secondary text and drawing meta; tinted cool toward the blueprint, never pure grey.
- **Line Faint / Mid / Strong** (rgba white .14 / .30 / .60): the three weights of blueprint hairline — grid, dividers, and drawn linework respectively.

### Collins Brand (continuity, reserved)
- **Collins Navy** (#081459) / **Collins Blue** (#0050F0): the logo wordmark (never recolored) and, at low opacity, the tint of drawing lines. Not general-purpose accents.
- **WhatsApp Green** (#25D366): the WhatsApp FAB only (platform-standard).

**The Yellow-Is-Action Rule.** Safety-yellow appears only where the visitor can act (a primary button, the active toggle) or on the single most important accent per view. Its scarcity is the signal; the moment it becomes decoration it stops meaning "do this".

## Typography

**Display Font:** Anton (with Archivo, sans-serif)
**Body Font:** Archivo Variable (with system-ui)
**Label / Mono Font:** Spline Sans Mono Variable (with ui-monospace)

**Character:** Anton is a single-weight industrial black — tall, tight, uppercase — and it does the shouting. Archivo keeps prose calm and legible underneath it. The monospace is not a costume: it is the drawing's lettering, used wherever the content is a measurement, a spec, a code, or a label.

### Hierarchy
- **Display** (Anton, 400, clamp(3.2rem → 6rem), lh 0.9, uppercase): the hero thesis line only.
- **Headline** (Anton, 400, clamp(2.4rem → 3.6rem), lh 0.92, uppercase): section titles.
- **Title** (Anton, 400, ~1.7rem, uppercase): catalog-sheet names, stat figures, branch names.
- **Body** (Archivo, 400, ~1.05rem, lh 1.62): running copy; measure ~44–48ch on hero/lead intros.
- **Label** (Spline Sans Mono, 600, 0.68rem, letter-spacing 0.2em, uppercase): eyebrows-that-aren't (drawing labels), spec numerals (tabular), button text, DWG numbers, footer headings.

**The Drafting-Label Rule.** Monospace is reserved for measurement and labelling — specs, part numbers, dimensions, control labels, tabular numerals. Never set a running sentence or a paragraph in it; that's Archivo's job.

## Layout

Content sits in a **1280px** max-width container with fluid side padding (clamp(16px → 44px)). Vertical rhythm is generous: sections run `padding-block: clamp(56px → 112px)`, with more space above a heading than below it. Grids are ruled like a drawing: multi-column layouts (catalog 3-up, services 3-up) are separated by **1px hairline gaps** rather than card gutters, so the divider reads as a drafting line. The hero carries a literal **34px blueprint grid** as its background, masked to fade. Responsive: 3-up collapses to 2-up at 900px and 1-up at 520px; two-column hero/lead/branch/about grids stack at 900px; the nav collapses to a slide-in menu below 900px.

## Elevation & Depth

Flat by default — the world is ink on paper, not stacked material. Depth is conveyed by line weight and layering (panel-black bands over blueprint-black), not by resting shadows.

### Shadow Vocabulary (state only)
- **Sheet lift** (`box-shadow: 0 16px 40px rgba(0,0,0,0.55)`): a catalog sheet on hover, paired with a −3px rise.
- **FAB** (`box-shadow: 0 8px 24px rgba(0,0,0,0.5)`): the floating Call/WhatsApp buttons, the only element elevated at rest.

**The Flat-Blueprint Rule.** Surfaces are flat linework at rest. Elevation — a soft shadow, a −3px lift, and a 1px safety-yellow outline — appears only on hover, and reads as *selecting an entity on a drawing*, not as a floating card.

## Shapes

Everything is drawn with a straightedge: **0px radius everywhere** (`--radius: 0`). Structure comes from **1px hairline borders** in the three line weights, echoing blueprint linework. Recurring motifs: the **title block** (a bordered, subdivided cell carrying drawing metadata), **dimension lines** (with arrowhead markers and tick extensions), and **stamps** (rotated mono text: BUY / HIRE). Icons are authored SVG line-work at a consistent 1.6px stroke — never emoji, never filled glyphs.

**The Sharp-Corner Rule.** No rounded corners, anywhere — buttons, inputs, cards, images. A radius breaks the drafting metaphor.

## Components

### Buttons
- **Shape:** sharp (0px), mono uppercase text (label type), padding 13px 22px.
- **Primary:** safety-yellow fill, black text. **Hover:** lighten to #FFE64A, translateY(−2px).
- **Secondary:** transparent with a 1px construction-orange border, white text. **Hover:** fill orange, white text, translateY(−2px).
- **Focus:** 2px safety-yellow outline, 3px offset (global focus-visible).

### Inputs / Fields
- **Style:** panel-black fill, 1px line-mid border, white text, sharp corners, mono uppercase labels above.
- **Focus:** border shifts to safety-yellow (no glow).

### Cards / "Drawing Sheets"
- **Corner:** sharp. **Background:** blueprint-black, sitting in a 1px hairline grid (gaps reveal line-faint).
- **Top row:** mono DWG number + sheet ref, underlined by a hairline.
- **Hover:** panel-black fill, −3px lift, sheet-lift shadow, and a 1px safety-yellow selection outline (inset). No accent rail.

### Navigation
- Sticky, translucent black (rgba(0,0,0,0.86)) with 8px backdrop-blur and a hairline bottom border. Links are ink-dim → ink-white on hover; the "Request a Quote" primary button sits at the end. Below 900px the links collapse into a checkbox-driven slide-in menu (opacity + transform, never max-height).

### Intent Toggle (signature)
- A segmented Buy / Hire control in mono uppercase; the active segment fills safety-yellow with black text. It sets enquiry intent and, in the hero, flips the drawing's title-block stamp (BUY ↔ HIRE) via `:has()`.

### Floating Actions
- Two stacked 54px squares bottom-right: **construction-orange Call** above **WhatsApp-green** WhatsApp, each with an authored SVG icon and the FAB shadow. Lift + brighten on hover.

### The Working Drawing (signature)
- The hero's dimensioned machine: white hairline linework on the blueprint ground, dimension lines with arrowhead markers, a yellow "OUTPUT" bracket, and a title block. Its one authored motion is the **dimension-lines draw-on** (staggered `stroke-dashoffset`) on load, disabled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** keep safety-yellow for action and one accent per view (the Yellow-Is-Action Rule).
- **Do** render every spec, code, dimension, and label in Spline Sans Mono with tabular numerals.
- **Do** build structure from 1px hairlines and title-block/dimension motifs; separate grid cells with 1px gaps, not gutters.
- **Do** keep corners sharp (0px) on every element, and draw icons as 1.6px-stroke SVG.
- **Do** treat hover as CAD selection: lift + shadow + 1px yellow outline.

### Don't:
- **Don't** round corners, add gradient text, or use glass/blur as decoration.
- **Don't** put a thick colored border on one side of a card — use the selection outline instead.
- **Don't** set running prose in the monospace, or use yellow as a text color / decorative fill.
- **Don't** recolor the Collins logo, or promote Collins navy/blue into a general accent.
- **Don't** reach for the reference site's sunset-photo hero or all-yellow-buttons default.
