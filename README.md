# dhronas.com

The organization site for Dhronas. It is a static page (HTML, CSS and vanilla JS) with no build step.

- `index.html`: the page content (vision, problems, products, use cases, contact, footer)
- `styles.css`: the glass UI, aurora background, animations and responsive layout
- `script.js`: scroll reveals, 3D tilt, parallax, magnetic buttons, use-case filter and the contact form (which opens `mailto:`)
- `CNAME`: the custom domain for GitHub Pages

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Deploy (GitHub Pages + Squarespace domain)

1. Push this repo to GitHub, then go to **Settings → Pages → Deploy from branch → `main` / root**.
2. In **Squarespace → Domains → dhronas.com → DNS settings**, add these records:
   - `A` records for host `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`
   - a `CNAME` record for host `www` pointing to `<your-github-username>.github.io`
3. Remove any Squarespace default records that conflict with them. Once DNS resolves, turn on **Enforce HTTPS** in the Pages settings.

The site also works on Netlify, Vercel, Cloudflare Pages or Railway as a static site.
