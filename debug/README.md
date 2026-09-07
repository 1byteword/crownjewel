# Local design instrumentation

Run `make dev`, then open `http://localhost:8000/?grid=1&inspector=1`.
The local server injects the loader on the homepage, writing index, and
extensionless post URLs. Nothing is enabled by default, even locally.
The nginx image has neither the loader nor the debug directory.

| Key | Query parameter | Mode |
| --- | --- | --- |
| G | `grid=1` | Actual grid, content boxes, rules, coordinate landmarks and first text baselines |
| B | `baseline=1` | Horizontal baseline grid, anchored at document y=0 |
| O | `bounds=1` | Important element outlines |
| I | `inspector=1` | Measurements, element properties, reference comparison and token inventory |
| P | — | Pin the currently inspected element's coordinates |
| Escape | — | Hide all modes |

Modes are independent. The panel also has checkboxes and can move to either
side with ↔. On touch screens, open with query parameters and use the element
selector. Selecting an element locks inspection; choose “Hover an element…”
to resume hover. Pin one element and inspect another to compare their left/top
coordinates and gaps from the reference's right/bottom edges. The reference is
a snapshot: repin after resizing or editing if you want a new reference.
Shortcuts ignore text inputs, selectors, modifiers, and editable content.
Modes are not saved across navigation; use query parameters on each page.

`--debug-baseline: 8px` is injected by `dev.py`. Change it in browser devtools
or use the panel's Step field (CSS pixels). The baseline grid follows document
coordinates while scrolling. It does not snap or reposition any content.

## Editing current values

Tokens live at the top of each page's inline style block. `publish` contains
the same reading-page tokens for future posts. Edit the appropriate page
family's values; there is deliberately no new build step or CSS dependency.

- `--space-23` means the observed **23px**, not the 23rd step of a new scale.
  Negative values are named `--space-neg-N`.
- `--page-width` is the book's maximum border-box width; `--page-margin`
  is the original desktop **inner padding**, not the measured outer margin.
- `--grid-columns: 1fr 1fr` preserves the actual homepage track definition.
  `--grid-gutter` is the sum of the facing leaf paddings (62px). Its
  `-under-800` and `-under-560` variants are 44px and 24px.
- `-under-N` tokens are consumed by the existing `max-width: Npx` rules.
  Editing a desktop token doesn't remove an existing mobile override.
- `--font-size-*`, `--line-height-*`, `--tracking-*`, and `--font-weight-*`
  retain existing role differences. Properties left to inheritance or browser
  defaults (for example `normal` metadata line-height) remain inherited;
  inspect their computed values in the panel.
- `--rule-medium` retains the authored 4.5px colored page edges. The browser
  may rasterize these differently at different device pixel ratios.
- Palette aliases `--paper`, `--ink`, `--muted`, `--rule`, and `--serif`
  preserve the existing naming and refer to the descriptive tokens.

## Shared homepage rows

The homepage pairs intro/article 1, dogwatch/article 2, and Ryo/article 3
using CSS subgrid. Each pair shares title, description, and separator tracks. `--paired-entry-count` reserves enough rows for the published entries;
`publish` updates it automatically. Homepage dates and the visible Selected work label are removed; there is no
metadata track. Both sides share title and description styling, including color. The intro description is one continuous paragraph, including Elsewhere.
Footer links share a final row. This is the user-directed refinement following
the original instrumentation audit.

## Measurement semantics and limits

All coordinates are CSS pixels. The panel uses document coordinates;
rectangles are drawn in viewport coordinates. Grid tracks come from computed
CSS, text measures subtract actual borders/padding, and gutters come from
rendered box edges. Single-column or stacked layouts report no horizontal
gutter/divider rather than inventing one. The archive's intro grid and each
article's bounds remain inspectable separately.

Blue lines mark geometric boundaries; amber areas mark gutters and exterior
margins. Purple dashed outlines mark element boxes. Orange marks rendered
border boxes and the homepage's `::before` divider. Pink lines mark first
text baselines. Repeated horizontal blue lines are the independent baseline
reference grid. Rule properties are available when inspecting their owning
element; the pseudo-element divider has its own dimension/color readout.

Text baseline positions use an invisible replica with the element's computed
font and a zero-size baseline marker inside the shadow tree. They approximate
the first line's typographic baseline for this site's horizontal text; they
are not glyph-ink bounds or optical corrections. System font availability
can change metrics. No marker is inserted into site text. Multiline titles
show their first baseline; their line-height is in the panel.

Density is content extent (from the padded column top to its last child's
bottom), available content height, and whitespace-normalized character count.
It includes internal whitespace and does **not** estimate perceived visual
weight or ink coverage. The homepage hero readout measures the fixed print stage. It stays the same
size as editions rotate. Older image-based pages report the image box.

`inspector.js` reads layout and draws into a fixed, pointer-transparent shadow
tree. Only the panel receives pointer events. No page selectors are restyled.
`ResizeObserver`, resize/scroll events, image loads, and root style changes
refresh active measurements. If replacing page markup, reload to rebuild the
element list. Hiding every mode removes all debug visuals; the ordinary local
page has no inspector host until a mode is first requested.

## Masthead trials

Open `/debug/mastheads.html` locally for three previews, or open the full page
with `?masthead=mixed`, `?masthead=script`, or `?masthead=grotesk`.
The alternatives reuse the current italic serif / bold sans-serif treatments
for both names, preserving the current type size and surname grid anchor.
They are exploratory font swaps, not production changes or separately tuned
responsive lockups. Combine with `&grid=1` to inspect their different measures.

The first-name mock is `?masthead=first`: only Azhan, centered, in the existing
italic serif. `--tracking-first-name: .01em` replaces the original −.075em
tracking, with native font kerning enabled. It remains local only.

The homepage now uses the print series. Previous full-name trials are preserved
at `/debug/masthead-base.html?masthead=mixed` (or `script` / `grotesk`).
The current hero can be inspected at `/?grid=1&inspector=1`; `--print-*`
tokens control the editions, and Pause holds a print for measurement.

The four editions now include the original animated hands. Typography and frames
use the same green-gray/ink palette and a Bayer dither. Adjust `--print-dot-size`
(CSS pixels per raster pixel) and `--print-ink-density` (0–1 coverage) in `index.html`.
Pause stops both rotation and hand movement. Reduced motion starts paused.

Calligraphic masthead trial: `/debug/calligraphic.html`. Uses the original
masthead-above-hands layout with a generated raster lettering study.
Prompt and asset provenance: `calligraphic-prompt.md`.

No-name trial: `/debug/no-masthead.html`. Removes the visible masthead entirely;
keeps the original navigation, animated hands, and content.

The no-masthead trial now alternates the original hands and a frameless,
stippled THINK print every 3 seconds. `--art-cycle-ms` sets the interval;
`--think-ink-coverage` sets ink density. Pause and Next support manual review.
Rotation pauses offscreen/in hidden tabs; reduced motion starts paused.

THINK now darkens from 18% opacity over 1800ms, then adds ! for the remainder
of its 3-second turn. Punctuation space is reserved to avoid a layout jump.
`--think-darken-ms` and `--think-start-opacity` expose the animation values.
Reduced motion shows the finished THINK! print when manually selected.

THINK motion comparisons: `/debug/think-animations.html`, with three independent
solid-ink variants (roller, letters, press), replay controls and full-page links.
Shared implementation is `think-motion.html`; each retains the 3s cadence and
reduced-motion pause. No brightness animation is used in these trials.

Selected combination: `/debug/rolling-masthead.html` (also the local homepage).
Restores the live mixed-type masthead with hands first, then rolling THINK!.

Multilingual animation studies: `/debug/language-animations.html`. Two each for
DENK, 想, and سوچیے; shared runtime in `language-motion.html`. Full-page studies
retain the original masthead and hands. Urdu is shaped as a complete RTL word,
with left-side punctuation. These are candidates, not added to the homepage yet.

The selected local homepage rotation is now hands → THINK! (rolling) → DENK!
(press) → 想! (downward) → سوچیے! (rising), with the same 3-second cadence.
`/debug/rolling-masthead.html` mirrors this selection.

Sixth print: projected rotating loops with circular THINK lettering, inspired
by the supplied animated reference. Uses native canvas, the existing ink/paper
palette, and shared playback controls. Start there with `/?art=orbit` or
`/debug/rolling-masthead.html?art=orbit`.

Seventh print: Observe floral artwork with a subtle traveling wind displacement.
Start directly at `/debug/rolling-masthead.html?art=flowers`. The word is embedded
in the image; animation bends the outer regions while damping the center.

Floral revision: all Observe text removed. The background bitmap stays fixed;
three clipped foreground blooms pivot at independent stem bases, with a gust
delayed left-to-right. No mesh or whole-image displacement remains.

All-flower revision: the background is now foliage-only. Fifteen blossom
instances (three silhouette sources, varied in scale, lean, and mirroring)
move independently at fixed stem anchors. No flowers remain baked into the
static backdrop. Motion remains delayed left-to-right.

Dense floral selection: 36 flower/sprig instances, mixing trumpets, heavy peonies,
light cosmos and bellflower clusters. Each has its own stem pivot and phase;
response amplitude, delay, duration, and settling depend on the variety’s mass.
Background foliage stays static. New sprites are keyed once at load time.

Arrangement revision: flower centers use staggered rows with small offsets,
light petal overlap, and smaller heads to fill the field. At 3:1 there are
60 heads plus nine bellflower clusters. Tubes and stems render behind all
faces, preventing stalks crossing the centers of neighboring blooms.

Wind amplitude increased 20%: flower heads .025 → .030 radians before mass
adjustment, bellflower sprigs .040 → .048 radians. Timing is unchanged.

Flower sway increased another 20% (.036 radians / mass adjustment; bells .0576).
Flowers now hold for `--flowers-cycle-ms: 6000`; other editions remain 3000ms.
The passing breeze repeats every 3.2s throughout the longer hold.
