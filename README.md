# Shir — UX/UI Portfolio

A personal portfolio for Shir, a psychology student moving into UX/UI design.
Plain HTML + CSS + a tiny bit of JavaScript: no build step, no dependencies, nothing to install.

**Positioning:** *"I design for how people actually think."* Her psychology background is the differentiator, shown in the dark "Psychology → Design" band and in a "The psychology behind it" callout inside every case study.

## What's in here

```
index.html            Homepage: hero, Psychology → Design, Selected work, About, Contact
work/steady.html      Case study 01 (SAMPLE)
work/pantry.html      Case study 02 (SAMPLE)
work/glass.html       Case study 03 (REAL CLIENT, in progress: glass engraving studio)
work/glass-studio/    The glass studio's website itself (Hebrew, RTL): home, booking flow, groups page
css/styles.css        The whole design system (colors, type, layout)
js/main.js            Dark-mode toggle, fade-in on scroll, footer year
favicon.svg           Browser tab icon
design-lab/           The typography/color exploration used to choose the design (not linked from the site)
```

## Before publishing: replace the placeholders

Every spot that needs real content is marked with an `<!-- EDIT: ... -->` comment in the HTML.

- [ ] **Name.** Add Shir's last name in `<title>`, the meta description and the footer (all pages).
- [ ] **Photo.** Replace the "S." monogram in `index.html` with a portrait (black & white works best).
- [ ] **About.** Fill in `[University]`, `[Year]` and `[UX bootcamp / course name]`.
- [ ] **Contact.** Replace `hello@example.com` and the LinkedIn URL.
- [ ] **Glass engraving studio (real client, case study 03).** The designs live on a Claude Design canvas (home desktop + mobile, a clickable booking prototype, groups page, wireframes, brand board). Still to do in `work/glass.html`: fill every `[bracketed]` placeholder with the studio's real details and Shir's real research and test results, export screens from the canvas into `images/` to replace the dashed placeholders, and delete the "In progress" note. The live demo site in `work/glass-studio/` has the same `[placeholders]` (marked with `EDIT:` comments) and a `noindex` tag to remove once the details are real.
- [ ] **Case studies.** Steady and Pantry are **fictional samples** that show *how* to tell a strong UX story. Replace them with her real bootcamp projects:
  - rewrite the text and the numbers (the sample test results are invented for illustration);
  - swap the dashed image placeholders for real Figma exports;
  - delete the orange "Sample case study" note at the top of each page.
- [ ] **Homepage cards.** Update the titles and one-line descriptions in the "Selected work" section of `index.html` to match.

### Adding a real image

Put images in an `images/` folder and replace a placeholder block like this:

```html
<!-- before -->
<div class="placeholder"><div><strong>Low-fidelity wireframes</strong>…</div></div>

<!-- after -->
<img src="../images/steady-wireframes.png" alt="Wireframes of the new onboarding flow">
```

Always write a meaningful `alt` text. Hiring managers notice accessibility on a UX designer's own site.

## Design system

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#F8F6F1` warm paper | `#111110` | page background |
| `--ink` | `#1C1C1F` | `#F1EFEA` | main text |
| `--muted` | `#6B6A66` | `#A19F99` | body copy, secondary text |
| `--accent` | `#C2562F` terracotta | `#E0714A` | one or two italic words per heading, tiny details |

- **Headlines:** Instrument Serif. Wrap one or two words in `<em>` to get the italic terracotta accent, e.g. `Let's <em>talk</em>.`
- **Body:** Geist. **Labels:** Geist Mono, small uppercase (`<p class="label">02 / Selected work</p>`).
- **Shapes:** hairline dividers, 8px corners; pills only for the "open to roles" status badge.
- **Accessibility:** text colors meet WCAG AA contrast, visible keyboard focus, skip link, `prefers-reduced-motion` respected, light/dark follows the system with a manual toggle.

Change a color once in the `:root` block at the top of `css/styles.css` and the whole site follows.

## Preview locally

Double-click `index.html` to open it in a browser. That's it.

## Deploy (free)

**Vercel** (recommended): go to vercel.com → *Add New Project* → import this GitHub repo → leave all settings as they are (Framework: *Other*, no build command) → *Deploy*. Every merge to `main` then updates the live site automatically. A custom domain (e.g. `shir.design`) can be added under *Settings → Domains*.

**GitHub Pages** (alternative): repo *Settings → Pages* → *Deploy from a branch* → `main` / root.
