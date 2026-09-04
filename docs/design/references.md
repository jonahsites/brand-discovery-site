# References for the six looks

You said the current pass reads flat and AI-ish. Below is a curated board per look — real sites and physical objects to react to. For each look I've noted what to steal (mood + specific device) so I can implement it, and what to avoid so it doesn't drift into template land. Open the links and mark which two or three you like; I'll rebuild the look from those.

---

## 1. Minimal — quiet marketplace

**Steal from:**
- **A.P.C.** apc.com — cream ground, tiny grotesk labels under generous photography, category tabs that read as text not chips.
- **COS** cos.com — 12-column grid, one large product image per row on hover, hairline dividers instead of cards.
- **Very Goods (2014, archive.org)** — the reference for a marketplace that felt curated, not algorithmic.

**Devices to add:**
- Product name in serif italic when hovered (COS trick).
- Filter chips replaced with a text list on the left rail.
- One accent hue per season, taken from that week's featured brand.

**Avoid:** Round-corner card grid with equal padding — the current look. It reads Squarespace-template.

---

## 2. Heritage — old-fashioned catalogue

This is the look your buttons image hinted at (raised, tactile). Retro-industrial, warm oat, real print.

**Steal from:**
- **Filson** filson.com — cover as a full-bleed photo, then tabbed product spec sheet underneath (materials, made in, warranty).
- **RRL by Ralph Lauren** ralphlauren.com/rrl — serif nameplates, tan paper, deep brown accents, small trade-catalogue icons.
- **Best Made Co. (2016, archive.org)** — the definitive catalogue web design of the last decade.
- **Freemans Sporting Club** freemanssportingclub.com — hand-drawn dividers, plain type.

**Devices to add:**
- Serif nameplate for the brand and product (Instrument Serif is already loaded — try Marfa Semi Serif if we want to license one).
- A "spec sheet" strip on product pages: Made in / Materials / Weight / Care in a grid of underlined pairs.
- Small trade-catalogue icons (a tag, a spool, a needle) instead of emoji.

**Avoid:** Any drop shadow. Distressed textures.

---

## 3. Street — hard contrast

**Steal from:**
- **Union LA** unionlosangeles.com — white ground, one huge photograph per drop, a red run of type across the header.
- **Palace** palaceskateboards.com — tabular Space Mono captions, tri-tone photography, aggressive weight jumps.
- **KITH** kith.com — grid tiles with a black band across the top of each card carrying the brand, price on the right.
- **Human Made** humanmade.jp — playful glyphs, hand-lettered marks between sections.

**Devices to add:**
- A rolling ticker across the top: new drops, on-sale, most-followed, then a sponsor mark. Physical, not marquee-slick.
- A hand-lettered mark or a rubber-stamp graphic under every headline.
- Sticker-style promo tags (black background, one word, slight rotate) instead of pill chips.

**Avoid:** Neon gradients, cyberpunk fonts.

---

## 4. Tech — physical buttons

This is directly the image you sent (the four-button key fob). Function-first, dark, tactile.

**Steal from:**
- **Teenage Engineering** teenage.engineering — flat, orthographic-perspective product photos on a raised console surface. The whole site reads like a device manual.
- **Panic (Playdate)** play.date — inset buttons, LED indicators, one accent green.
- **Field Notes** fieldnotesbrand.com — technical drawings and dieline layouts as chrome.
- **Hollows (workstation add-ons)** hollows.pl — dark chrome with tactile controls.

**Devices to add:**
- Chrome buttons with an inset bevel and an LED indicator that turns green when a filter is on. `box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 -3px 0 rgba(0,0,0,.4)` is already on `.bg-ink` in this look; extend it to the primary CTA and pill chips.
- Product photos on a chrome plinth (a subtle radial gradient behind the piece, no shadow).
- Every value gets a monospace numeric readout (price, sizes in stock, drop countdown).

**Avoid:** Glass or blur. RGB. Anything that reads gaming.

---

## 5. Cozy — warm and round

**Steal from:**
- **Aimé Leon Dore café** aimeleondore.com/cafe — warm oat ground, terracotta accents, quiet serif headings.
- **Doen** shopdoen.com — hand-set editorial headlines, mixed serif + script, no cards, lots of whitespace.
- **Everlane knits pages** — one big hero photo per collection, product names in a hand-set italic caption.
- **Merci Paris** merci-merci.com — mustard/terracotta accents, a hand-drawn line between sections.

**Devices to add:**
- Handwritten one-line caption on the hero (an SVG signature or Caveat font).
- Rounded 30px+ cards but very short — reduce the perceived height with generous top padding on text.
- Colour-of-the-week band across the top: three swatches from the featured brand.

**Avoid:** Overpolished CGI, Instagram-lifestyle stock photos, overuse of the terracotta accent.

---

## 6. Avant — editorial

**Steal from:**
- **SSENSE** ssense.com — huge italic serif headline, hairline everything, dense filter rail, all-lowercase captions.
- **Balenciaga** balenciaga.com — full-bleed video hero, one word per screen, aggressive white space.
- **032c** 032c.com — magazine layout: brand + issue + spread number on every product row.
- **Machine-A** machine-a.com — tight tabular type, monoline dividers.

**Devices to add:**
- Product photos framed by a single 1px stroke, no shadow, no radius.
- Uppercase tabular navigation with letter-spacing at .16em, no active pill — an underline instead.
- Italic Instrument Serif headlines (already loaded); pair with Söhne Mono for the labels.

**Avoid:** Warmth, playfulness, any radius > 0.

---

## Cross-cutting things I want to try (all looks)

Independent of the look choice these would fix the "flat" feeling you mentioned. Pick any:

1. **Photography rules.** All product photos on a natural surface (linen, plywood, tile) with a real drop shadow from a physical light — not a CSS shadow. Cheapest way to lose the AI look.
2. **Hand touches.** One SVG mark per look — a signature under the hero, a torn edge on the cream panels, or hand-drawn dividers.
3. **A magazine section.** A "Kindred Weekly" letter from the founder every week (real markdown post). Read like a newspaper column.
4. **Real people quotes.** Under every brand: one sentence from a shopper who bought from them ("wore it every day this winter — Ada, Berlin").
5. **A physical brand plate.** Each brand gets a serialised plate on their page: `KND · 002 · FORM & VOID · EST 2021 · ROTTERDAM · 6 pieces`. Same on the packing slip.
6. **A ritual.** Daily pick lands at 7am local time, with a countdown to the next one under the current pick. Small, calendar-anchored ritual instead of infinite scroll.

Mark which references and which cross-cutting ideas you like and I'll implement them.
