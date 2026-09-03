# Claude Design prompt — brand discovery marketplace

Copy everything below the line into Claude Design. Attach the phone mockup image and mention the two Variant links as references.

---

I'm building **[NAME]**, a web platform that is half social feed, half marketplace, built only for independent clothing brands. Brands get a profile and post drops, lookbooks, and products directly. Shoppers come to discover brands they have never heard of, follow them, and buy in one checkout even when the cart spans several brands. The pitch is "find your next favorite clothing brand." It ships on Vercel (Next.js), desktop-first with a fully responsive mobile layout.

Design a complete, high-fidelity UI for it. Not a landing page. A working product.

## Design language

The overall feel is **modern, soft, rounded, and slightly liquid glass**. Nothing sharp, nothing boxy, nothing that looks like a default Shopify theme.

- **Shapes.** Every card, input, button, and image container is rounded. Radius scale: 12px small, 20px medium, 32px for large cards and hero blocks, full pill for chips and primary buttons. Corners of big cards can be 32px while image thumbnails inside them are 20px.
- **Liquid glass.** Floating surfaces (top nav, the mobile bottom tab bar, filter drawers, cart drawer, sticky "Add to bag" bars, toasts, dropdowns) are translucent frosted glass: semi-transparent white or off-white fill, backdrop blur around 20 to 30px, a 1px inner highlight border at low opacity, a soft wide shadow, and a subtle specular gradient at the top edge. Content should visibly blur behind them as you scroll. Keep this for floating chrome only. Main content cards are solid so the page stays readable.
- **Background.** Warm cream `#F5F0E8` for the page. Cards sit on it in white or in flat pastel blocks.
- **Accent palette.** Lavender `#D4B7FF`, lime `#D2E07E`, coral `#E87E60`, deep teal `#003C35`, near-black `#121212`, text `#1A1A1A`. Use the pastels as big flat color blocks behind hero and editorial cards. Use teal or black as the dark contrast card. One accent per card, never a gradient rainbow.
- **Type.** A clean geometric sans like Inter or Geist. Headlines are large, tight letter-spacing, bold, sentence case ("Minimalism for the messy."). Small labels are uppercase, tracked out, 11 to 12px, muted. Prices are medium weight, never red unless it's a sale.
- **Buttons.** Primary is a black pill with white text. Secondary is a white pill with a 1px hairline. Icon buttons are 40 to 44px circles, white on light surfaces, glass on floating surfaces. The "arrow-out" circle button in the corner of a card is a recurring motif.
- **Chips.** Pill-shaped filter chips in a horizontally scrolling row. Selected state is solid black on cream.
- **Imagery.** Product photos on plain light backgrounds with lots of padding, floating in the card. Lifestyle photos allowed on brand pages and lookbooks.
- **Motion.** Hover lifts cards 2 to 4px with the shadow growing. Glass surfaces have a slight scale on press. Nothing bouncy.
- **Reference material.** See the attached phone mockups (rounded product cards, lavender category tiles, floating pill tab bar, size pills, quantity steppers, clean cart rows) and the two Variant designs (cream page, pastel editorial hero cards, pill chip row, feed with left sidebar, brand cards with "items • followers", "Add to Bag" product grid). Match that level of polish. Take the layout ideas, not the name.

## Screens to design (desktop and mobile for each)

1. **Home / Discover feed.** Left sidebar: Discover (For You, Following, New Drops, Trending Brands), then Categories. Top: glass nav with logo, search bar ("Search brands, styles, lookbooks"), notification bell, bag with count badge, avatar. Below nav, a segmented pill control: For You / Following / Drops. The feed mixes card types: a large pastel editorial card ("Brand of the week", "Editor's pick") with a floating product photo; a brand post card (avatar, brand name, follow button, image or carousel, caption, shoppable product tags with prices, like / save / share); a "Curated for you, based on your interest in Japanese streetwear" row of 3 or 4 product cards; a "New brands you might like" row of brand tiles.
2. **Explore / Browse with filters.** Sticky glass filter bar with chip row (All, Outerwear, Knitwear, Footwear, Accessories, Streetwear, Minimalist, Sustainable, Upcycled, Designer). A "Filters" button opens a glass side drawer with: price range slider, size, color swatches, brand size (indie under 1k followers / rising / established), brand location, materials, sustainability tags, ships-from country, on sale. Product grid with rounded cards: image, brand name small on top, product name, price, a heart in the corner, and a quick "Add to Bag" pill that appears on hover.
3. **Brand profile.** Cover image with 32px radius, brand avatar overlapping the bottom edge, name, location, tagline, follower and item counts, Follow and Message pills. Tabs: Shop, Posts, Lookbooks, About. Shop tab is a product grid. Posts tab is the social grid. About has the brand story, founder photo, values badges (small-batch, made in X, recycled), and shipping info.
4. **Product detail.** Left: large image with rounded thumbnails below (as in the mockup). Right: brand chip with avatar, product name, price with strikethrough original if on sale, size pills (L M XL XXL 3XL, selected state filled lavender), color swatches, quantity stepper, a black "Add to Bag" pill, secondary "Save" heart circle and share circle. Below: accordions for details, materials, size guide, shipping and returns. Then "More from this brand" row and "Similar from other brands" row. Then reviews with photo uploads and a fit rating (runs small / true / runs large).
5. **Bag / cart.** Glass slide-over drawer from the right, and a full page version. Items grouped by brand with the brand header showing that brand's shipping estimate. Each row: rounded thumbnail, name, size/color, price pill, quantity stepper. Summary card: subtotal, shipping per brand, total, black "Checkout" pill. Promo code input. "You might also want" mini row.
6. **Checkout.** Single page, three stacked rounded cards: address, shipping option per brand, payment. Order summary sticky on the right in a glass card. Express pay buttons at top.
7. **Lookbook.** Full-bleed editorial page with big rounded image blocks in a masonry layout, each image having numbered shoppable hotspots that open a small glass product popover.
8. **Search.** Glass overlay with recent searches, trending brands, and results grouped into Brands / Products / Lookbooks as you type.
9. **User profile.** Avatar, saved items grid, followed brands row, order history, style preferences (the tags that drive the For You feed), size profile.
10. **Brand dashboard (seller side).** Overview with sales, followers, views as rounded stat tiles; a "New post" composer; product manager table in rounded rows; orders list; a simple analytics chart. Same design language, dark teal sidebar.
11. **Onboarding.** Shopper: 3 glass steps to pick styles, sizes, and 5 brands to follow. Brand: apply, add logo and cover, add first product.
12. **Mobile.** Every screen above at 390px wide, plus a floating glass bottom tab bar (Home, Explore, Bag, Profile, with a raised center "+" for brands) exactly like the pill bar in the reference image.

## Components to define once and reuse

Glass nav, glass bottom tab bar, product card, brand card, post card, editorial hero card, chip row, filter drawer, size pill group, color swatch group, quantity stepper, price pill, follow button states, toast, modal, drawer, accordion, empty states, skeleton loaders, and a small "Verified brand" badge.

## Rules

- Rounded everywhere. If a corner is sharp, that's a bug.
- Glass only on things that float over content.
- White space is generous. Cards breathe.
- One accent color per card.
- No stock-photo lifestyle collage backgrounds, no gradients on text, no drop shadows darker than 12% opacity.
- Real-looking placeholder content: invented brand names like Studio Arva, Onda Studio, Form & Void, Neutral Ground, Core Theory, Nomad, with realistic prices.
- Deliver a design system page first (colors, type scale, radii, spacing, buttons, chips, glass spec), then the screens.
