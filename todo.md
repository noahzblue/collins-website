# TODO

- [ ] **Contact form backend** — the quote form in
      `src/components/sections/ContactCTA.astro` has no server endpoint. Its
      submit handler calls `preventDefault()` and opens `wa.me` with the request
      pre-filled. Fields already carry real `name` attributes (`first_name`,
      `last_name`, `email`, `phone`, `category`, `mode`, `duration`, `message`),
      so a real endpoint can be wired without touching the markup. Pick one: - **Hosted form service** — Formspree / Web3Forms (or Netlify Forms if
      deploying there). Set `action` + `method="post"` and drop the JS handler,
      or keep it as a fallback. Keeps the current static build as-is. - **Astro endpoint** (`src/pages/api/quote.ts`) — needs an SSR adapter and
      `output: "server"`/hybrid in `astro.config.mjs` (currently plain static,
      no adapter), plus a mail sender (Resend/SendGrid) and an env var for the
      API key.
      Either route still needs: honeypot or captcha for spam, inline
      success/error states (the form has none today), and delivery to
      `info@collinscouae.com`. Decide whether the WhatsApp prefill stays on as a
      secondary path.
- [ ] **Hero video optimization** — `public/videos/hero-yard.mp4` is ~15 MB
      (Seedance 1080p / 10 s, standard bitrate). Re-encode to ~3–4 MB before any
      deploy: ffmpeg `-crf 28 -preset slow -movflags +faststart` (no ffmpeg on
      host or devbox yet — install in devbox), or regenerate at 720p as a
      fallback. Consider a WebM (VP9/AV1) source alongside the MP4.
- [ ] Remove superseded hero assets once the hero is signed off:
      `public/images/hero-industrial.jpg`, `public/images/hero-bg.jpg`.
- [ ] **Equipment slice, remaining steps** — the content collection, the twelve
      category pages, the hub and their components are in
      (`src/content.config.ts`, `src/content/equipment/categories.json`,
      `src/lib/equipment.ts`, `src/components/equipment/`,
      `src/pages/equipment/index.astro`, `src/pages/equipment/[slug].astro`).
      The homepage grid and the quote-form dropdown read the same collection.
      Still open: - **Hero imagery** — all twelve are in place at 1200x896 JPEG. Six were
      generated 2026-08-20 via Higgsfield (Nano Banana 2, except
      crawler-cranes and skid-steer-loaders which only completed on Seedream
      4.5) and downscaled with `sips -Z 1200 --setProperty format jpeg`.
      The house grade is "slate-blue dawn haze": single unbranded machine,
      three-quarter front, damp concrete yard, flat overcast light, chain-link
      fence and low sheds dissolving into fog, no people or text. - **Buy/hire toggle + quote links.** Static build has no request-time
      `?mode=`, so render both panels and swap client-side; `RangeTable` and
      `IncludedList` already take `mode` and emit `data-mode-panel`. - **Duty guide copy** — `dutyGuide` is populated for generators only. Each
      category's block appears the moment its array stops being empty.

## Known design drift (surfaced by the structure sweep, 2026-08-20)

Near-duplicate values that survived the token migration because collapsing them
changes pixels. Each needs a look in the browser, not a find-and-replace — worth
doing as one pass next time the design is reviewed.

- [ ] **Card headings sit at four sizes for one role** — 19px
      (`industries/[slug]`), 20px (`equipment/[slug]`), 21px (`CategoryCard`),
      22px (`equipment/index` closing card). Pick one, add it to the scale in
      `global.css` as `--text-card-title`, and delete the arbitrary values.
- [ ] **Eight one-off heading `clamp()`s** remain inline in `TrustStrip`,
      `CategoryRow`, `AboutTeaser`, `IncludedList`, `Testimonials` and the stat
      band. Several are within ~2px of `--text-h2` / `--text-h3`; fold in the
      ones that are genuinely the same level.
- [ ] `Hero.astro` still carries a lone `text-[10.5px]` for the eyebrow on the
      smallest breakpoint — either `text-micro` (11px) or a new bottom rung.

Already unified in the sweep (no action, recorded so the changes aren't a
mystery later):

- Category and industry banners now share `PageBanner`: one `min-h` (460px),
  one scrim (`.scrim-banner`), one `h1` size (`--text-h1`). Previously each page
  had its own.
- All rounded chips now render through `ui/Pill.astro`; two call sites moved
  from 12.5px to 12px label text.
- The About block's office rows moved to `ui/ContactRows.astro`; row spacing
  went from 10px to 12px.
