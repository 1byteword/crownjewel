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
weight or ink coverage. The hero readout measures the image's CSS box, not
the moving hands inside its canvas. Animation behavior is unchanged.

`inspector.js` reads layout and draws into a fixed, pointer-transparent shadow
tree. Only the panel receives pointer events. No page selectors are restyled.
`ResizeObserver`, resize/scroll events, image loads, and root style changes
refresh active measurements. If replacing page markup, reload to rebuild the
element list. Hiding every mode removes all debug visuals; the ordinary local
page has no inspector host until a mode is first requested.
