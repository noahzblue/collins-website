# TODO

- [ ] **Contact form backend** — the quote form in
      `src/components/sections/ContactCTA.astro` has no server endpoint. Its
      submit handler calls `preventDefault()` and opens `wa.me` with the request
      pre-filled. Fields already carry real `name` attributes (`first_name`,
      `last_name`, `email`, `phone`, `category`, `mode`, `duration`, `message`),
      so a real endpoint can be wired without touching the markup. Pick one:
      - **Hosted form service** — Formspree / Web3Forms (or Netlify Forms if
        deploying there). Set `action` + `method="post"` and drop the JS handler,
        or keep it as a fallback. Keeps the current static build as-is.
      - **Astro endpoint** (`src/pages/api/quote.ts`) — needs an SSR adapter and
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
