Asset: `/img/observe-flowers.png`. Generated with the built-in imagegen tool.
Prompt: Wide botanical risograph print, vintage trumpet flowers and curling stems,
muted sage ink on #d9dcd2 paper, delicate worn halftone grain. Exact text “Observe”
in large dark green editorial serif woven among the stems, with some leaves
crossing lower edges while keeping the word readable. Pale translucent petals,
darker overlapping leaves, quiet low saturation. No border, dates, or other text.

The generated bitmap is animated using a native canvas displacement, not separate
physical flower layers. No image-generation or animation dependency at runtime.

Revision 2: `img/observe-flowers-v2.png`, edited with the built-in imagegen tool.
Prompt: Preserve palette and botanical character. Add roughly twice as many
trumpet flowers, buds, leaves and intertwined stems across the center. Strengthen
coarse printed halftone/stipple on petals, leaves and lettering. Reduce Observe
in size and contrast and obscure about half of its letterforms with irregular
petal/leaf overlaps, making it a second-look discovery. Keep important detail
in the middle two-thirds for the existing crop. No new colors or borders.

Revision 3: `img/observe-flowers-v3.png`, built-in imagegen edit of v2.
Prompt: Preserve the dense flowers and coarse dither. Replace typeset Observe
with clearly readable Observe formed entirely from curved vines, bundled stems,
leaves and petals, about 65% width, in the central crop-safe band. Botanical
letter shapes with occasional leaf overlaps, no solid font silhouettes. Keep
the palette, flowers, dimensions, and no additional text.

Wind revision: continuous 24×10 mesh, bottom-anchored bend, left-to-right delay
of 1.45s across the field, 1.3s gust and a small settling rebound. The artwork
is still a single bitmap, so this is botanical-print deformation, not separately
segmented flower animation.

Revision 4: `img/observe-flowers-v4.png`, built-in imagegen edit.
Prompt: Remove all large Observe vine lettering and replace it with naturally
arranged trumpet flowers, buds, ordinary stems and leaves matching the scene.
Preserve muted sage/paper palette, dense flowers, dither, original dimensions.
No text, letter-shaped vines, labels, or borders in the image.
A separate small HTML Observe caption is placed at the lower right.

Individual-flower revision: no Observe text. Generated sprig sheet with the
built-in imagegen tool, saved as `img/flower-sprigs-source.png`. Prompt: three
isolated trumpet flower sprigs in separate columns, distinct bloom directions,
matching muted sage/pale paper and coarse dither, long stems, no lettering.
The generator did not return usable transparency. Native Path2D silhouette
clips isolate the three bloom heads for animation; the source backdrop is not
drawn. Each bloom pivots on a separate rendered stem over the fixed v4 scene.

Foliage plate: `img/flower-foliage-background.png`, built-in imagegen edit of v4.
Prompt: Remove every blossom, trumpet, flower head, petal, stamen, and bud.
Replace their areas with ordinary leafy branches, stems, and pale green-gray
paper matching the original printed foliage. Preserve dense botanical character,
palette, grain, dither, and dimensions. No flowers, text, or borders.
All 15 visible bloom instances are then composed and animated in canvas, using
the existing three clipped sprig sources with varied sizes, lean, and mirroring.

Variety sheet: `img/flower-varieties-source.png`, built-in imagegen. Prompt:
Three separate columns of antique dithered botanical sprigs: heavy peony, light
open cosmos/daisy, drooping small bellflowers. Muted sage ink, opaque pale
green-gray petals, long stems, two leaves. Uniform pure magenta #ff00ff outside
silhouettes for native canvas chroma-key compositing; no text/shadows/borders.
The key is removed once in memory; the generated original remains unchanged.
