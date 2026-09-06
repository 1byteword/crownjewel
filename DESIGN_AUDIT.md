# Current design audit

User-directed refinement after the initial audit: the homepage intro now
shares the writing titles' size and line-height tokens: 22px / 1.25 above
560px, and 16px / 1.3 at ≤560px. Its former 800px size override also points
to the title size. The measurements and verification below record the original
design before these refinements; intro wrapping and left-column density change.
The masthead now uses equal grid tracks to align the surname text box with
the column divider, retaining its type sizes, shared baseline, and name gap.
The hero now has zero inline margin at every breakpoint, aligning its box
with the inner content edges; its existing aspect ratios remain in place.
A subsequent user-directed typography pass makes left body/project descriptions
share excerpt size and line-height (15px/1.5 desktop, 13px/1.5 mobile), project
names share title size/line-height/tracking (22px/1.25, 16px/1.3), and Selected
work share metadata size (11px, 10px). Contact links share All writing sizing.
Project descriptions and writing excerpts now share an 11px top gap (10px
mobile); project links form explicit text blocks. The lead now also shares
title tracking. These changes retain independent column flow and text colors.
The overlay now marks first baselines on both columns' titles and body text.
The latest user-directed structural pass replaces independent flow with shared
CSS subgrid rows: intro/article 1, dogwatch/article 2, Ryo/article 3. Titles,
metadata slots, descriptions, separators, and footer links align across columns.
Selected work occupies dogwatch's metadata slot; entries without metadata
reserve that row. Longer text on either side expands the shared row. Left
entries now have matching separators. `publish` maintains the shared row count
for the mirrored posts (minimum three for the three left entries). Paragraph
breaks use one body line-height, keeping later lines on the paired text rhythm.
Browser checks at eight widths (320–1440px) measure zero coordinate difference
for every paired title, description start, and separator, plus matching footers.
Homepage writing dates were subsequently removed at the user's request. Empty
metadata tracks now collapse; Selected work retains its label slot in pair 2.
Archive and standalone-post dates remain. The publisher omits homepage dates.
The latest refinement also removes the visible Selected work label and the
metadata track entirely. Each pair now has three shared tracks: title,
description, separator. Both columns use the same title/description CSS rules,
including secondary text color on all descriptions. Selected work remains
as the projects section's accessible label. The left description and Elsewhere
text are now a single paragraph, removing the intervening blank line while
retaining all wording and the link.

Instrumentation only. These are observed differences, not judgments or proposed
corrections. Measurements below use macOS Chrome, CSS-pixel viewports 1440, 768,
and 390px wide, DPR 1, reduced motion, and the current four homepage entries.
System font availability and device pixel ratio affect text and rasterization.
Numbers are rounded to two decimals. Coordinates are document coordinates.
See [debug/README.md](debug/README.md) for controls and token editing.

## Alignment

| Homepage measurement | 1440px | 768px | 390px |
| --- | ---: | ---: | ---: |
| Page left / right | 130 / 1310 | 0 / 768 | 0 / 390 |
| Inner content left / right | 165 / 1275 | 35 / 733 | 16 / 374 |
| Image left / right | 148 / 1292 | 18 / 750 | 10 / 380 |
| Engineering heading left | 165 | 35 | 16 |
| Writing heading / titles / dates left | 751 | 406 | 207 |
| Divider x | 720 | 384 | 195 |
| Each CSS grid track width | 555 | 349 | 179 |
| Each text measure | 524 | 327 | 167 |
| Facing-padding gutter | 62 | 44 | 24 |
| Masthead given-name box left | 284.92 | 120.67 | 23.47 |
| Masthead surname box left | 699.84 | 371.80 | 187.05 |

The image extends 17px beyond each content edge above 560px, and 6px below.
Engineering aligns with the outer content container, not the image. Writing
starts one half-gutter inside the second track. The 1px divider's **left** edge
lands on the 50% track boundary; its center lies 0.5px to the right at DPR 1.
Article rules share Writing's left edge and end at the content right edge.
Page edge rules instead span the full book width.

The masthead uses flex baseline alignment and mathematical centering. At
1440px its two text boxes jointly span x=284.92–1155.06, with midpoint ≈720px.
Their top edges differ: given name y=88px, surname y=75px. The instrumented
baseline is y=242px for both. These are text boxes/baselines, not visible glyph
edges: italic overhang and negative tracking affect the optical result.

## Spacing

| Homepage vertical landmark | 1440px | 768px | 390px |
| --- | ---: | ---: | ---: |
| Masthead box top | 75 | 45 | 54 |
| Image top | 296.52 | 186.69 | 152.72 |
| Image bottom / spread start | 677.84 | 430.69 | 324.80 |
| Section heading top | 706.84 | 459.69 | 348.80 |
| Intro / first article top | 770.84 | 523.69 | 394.14 |

The masthead bottom-to-image gap is 19px. Image-to-heading spacing is 29px
above 560px, 24px below. Section headings have 23px bottom margin above 560px,
20px below. Lead/body bottom margins are 21px desktop and 16px mobile.
Selected work adds a 21px top margin desktop (14px mobile) after a paragraph
that already has bottom margin. The flex-column margins do not collapse.
Project entries are separated by 26px; descriptions start 8px below projects.

Homepage article separators follow 23px bottom padding plus a 1px border and
19px bottom margin. Mobile uses 18px padding and 18px margin. Title-to-date
gap is 6px desktop, 7px at 561–800px, and 6px at ≤560px. Excerpts add 11px
above desktop and 10px mobile. Values such as 19/20/21/22/23px remain distinct.
The new 8px baseline grid is a measuring reference; existing vertical positions
and line-heights do not consistently fall on its lines.

## Typography

| Homepage role | Desktop size / line-height | At ≤560px |
| --- | --- | --- |
| Masthead | `clamp(90px, 14.5vw, 184px)` / 1.03 | 18.6vw (begins at ≤720px) / 1.03 |
| Section | 41px / 1 | `clamp(24px, 6.5vw, 32px)` / 1 |
| Lead | 27px / 1.27; 24px at ≤800px | `clamp(16px, 4.2vw, 21px)` / 1.35 |
| Body | 18px / 1.5 | 14px / 1.5 |
| Project | 23px / normal | 18px / normal |
| Project description | 15px / 1.4 | 13px / 1.45 |
| Article title | 22px / 1.25 | 16px / 1.3 |
| Excerpt | 15px / 1.5 | 13px / 1.5 |
| Date | 11px / normal | 10px / normal |
| Selected work label | 12px / normal | 10px / normal |
| Nav | 12px / normal | 11px only at ≤420px |

Given name: italic system Bodoni/Didot/Times, weight 400, tracking −.075em.
Surname: Arial Black/Helvetica Neue/Arial, weight 900, tracking −.09em.
Masthead gap is .12em on the homepage; the unused shared masthead rules in
writing pages specify .075em and 14.4vw at ≤720px. They are preserved.
Section tracking is −.035em, lead −.02em, project/title −.025em; body is normal.
The browser's default/inherited weight is 400 where no explicit weight is set.

Writing-index titles instead use serif 37px/1.1, reducing to 31px on mobile;
excerpts use 18px/1.45 (17px mobile). Reading body uses 19px/1.65 (18px mobile),
and its lead uses 25px/1.3 (23px mobile). These roles have not been unified.
Metadata line-height remains `normal`, so measured line boxes depend on fonts.
Dates follow title wrapping on the homepage; their vertical offsets vary by
article. Homepage dates use month/year; archive/post dates use YYYY.MM.DD.
Labels/nav retain source capitalization with no CSS text-transform.

## Line/rule

- Page top and bottom rules: authored **4.5px**, solid, different accent colors.
  Chrome at DPR 1 reports/renders 4px borders; inspect at your intended DPR.
- Homepage vertical divider and article separators: **1px**, `#c7cec1`.
  Divider begins 20px below the spread top (16px mobile) and stops before the
  spread's 32px bottom padding; no divider crosses the image.
- Writing-index, reading navigation, and footer rules: **1px**, `#bdc7b6`.
- Link underline: **1px**, 4px offset. Focus outline: **2px**, 5px offset.
- Project/footer SVG arrows use a stroke width of **1 SVG user unit** inside
  a 16-unit viewBox displayed at .8em. That is not a fixed 1 CSS-pixel rule.

## Color

| Usage | Current value / token |
| --- | --- |
| Paper / outer surround | `#e8ebe2` / `#cfd6cb` (`--background`, `--surround`) |
| Primary / secondary text | `#202c23` / `#566153` |
| Homepage dates | `#495544` (`--date-color`); differs from archive/post metadata |
| Top edge accent | `#a85364` (`--accent`) |
| Bottom edge accent | `#c5d58b` (`--accent-bottom`) |
| Link hover | `#52643b` (`--link-hover`) |
| Selection | `#d1dc84` background, primary ink text |
| Homepage / writing rules | `#c7cec1` / `#bdc7b6` |
| Animated art background | `#d9dcd2` (`--art-background`) |
| Reading code background | `#dce2d6` (`--code-background`) |

These CSS colors are opaque; the art image/canvas use multiply blending.
The unchanged animation extracts ink as RGB(28,32,27) with per-pixel alpha in
its inline script. Image pixels and animation compositing are not a new CSS
palette. Theme-color metadata remains `#e8ebe2`. Some palette tokens are
catalogued in page families where they have no active usage; the table above
identifies actual usage rather than implying every token appears everywhere.

## Density

Both homepage leaf border boxes stretch to equal heights, despite different
content extents. At 1440px, available height after top padding is 728.5px:
Engineering occupies 530.56px through the contact links; Writing uses 728.5px.
That leaves about 197.94px below Engineering. Whitespace-normalized text
counts are 414 and 726 characters respectively. These measures describe
content extent and quantity, not perceived visual weight.

The hero is 1144×381.33px desktop, 732×244px at 768px, and 370×172.08px at
390px. The masthead box is 202.52px high desktop versus 79.72px at 390px.
Their sizes and the column extents are reported live for other widths.

## Responsive behavior

| Inclusive max-width breakpoint | Preserved behavior |
| --- | --- |
| 1180px | Book's 30px vertical / auto horizontal margins become zero; maximum width remains 1180px. |
| 800px | Homepage gutter 62→44px, lead 27→24px, title/date gap 6→7px. |
| 720px | Book inner padding 35→22px; homepage masthead switches to 18.6vw, top margin 5→16px, horizontal masthead padding 12→0px. |
| 560px | Homepage inner padding 22→16px, gutter 44→24px, columns remain side by side; image overhang 17→6px and ratio 3→2.15. Typography/spacing changes as above. |
| 560px, writing pages | Archive intro and article date/content grids collapse to one column. Book inner padding stays 22px. Reading margins become 35px auto; reading title becomes fixed 44px. |
| 420px | Running header type 12→11px, header gap 24→15px, nav gap 25→16px. No nav collapse/menu. |

No distinct tablet layout is inferred: the existing overlapping breakpoints
apply. At 721→720px the homepage masthead switches from 14.5vw to 18.6vw,
so it grows as the viewport narrows across this boundary. Reading titles can
also grow at 561→560px, switching from a 42px minimum to fixed 44px.

The hero's source ratio is 2:1, while its CSS crop is 3:1 or 2.15:1 with
`object-fit: cover`. The canvas follows that box. Reduced motion shows the
still image; motion otherwise pauses offscreen/in hidden tabs. The archive
image keeps a fixed 160px height and `object-position: center 40%`, including
after its grid stacks. Reading measure is capped at 680px; archive excerpts
at 55ch. There is no homepage column collapse at mobile widths.

## Verification

Compared all six pages against pre-change browser captures at 14 widths
(320, 390, 420, 560, 561, 720, 721, 768, 800, 801, 1024, 1180, 1181, 1440px):
all 84 element-geometry/computed-style comparisons passed, as did all 18
full-page screenshot comparisons at 390/768/1440px. Content markup is unchanged.
Grid, baseline, bounds, inspector, hover/pinning, touch selection, scrolling,
and animation checks passed. Existing post styles match the `publish` template.
