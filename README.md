# HP Engineering — complete multi-page website

A responsive, dependency-free **44-page** website built around the supplied HP 3D logo, designed to open immediately as static HTML or deploy to any static hosting platform.

## Quick preview

Open `index.html` in a browser, or run:

```bash
python -m http.server 8000
```

Visit http://localhost:8000. No npm install is required.

## Included

- Fully styled home page and desktop/mobile accessible navigation
- Three-column services mega menu
- Dedicated Services page + 18 individual service detail pages
- Six audience-specific pages
- Project categories and filterable portfolio, with honest demo/placeholder notices
- About, Service Areas, four resource articles, Contact, Privacy Policy and 404 page
- Search-friendly page titles and semantic markup
- Client-side form validation, dependent selection lists, email compose fallback
- Attached HP monogram logo (`assets/hp-mark.jpg`)

## IMPORTANT — Before public deployment

The website is a **working front-end**, not a deployed server-side business system. It is not connected to Supabase or Resend. Contact submission opens an email application with a drafted message; it does **not** transmit data in the background. File uploads are deliberately blocked until a secure upload workflow is installed. Do not promise visitors that documents were received.

To activate a secure production enquiry system, integrate a server endpoint for validation, rate limiting and spam protection, private storage for project files, transactional email to `peterhenry.engineering@gmail.com`, and a privacy-compliant data retention policy.

Replace external illustrative Unsplash images with appropriately licensed photos and approved real project photos. Portfolio entries deliberately do not claim that illustrative photos represent completed HP Engineering projects.

Before publishing credentials and regulated service claims, verify business identity, California license C 26348, actual authorization in each state, permitted services and any address or individual project claims. The present site intentionally does **not** display the unverified license number, professional history, or company address as established facts.

### Deployment

Upload the folder contents to Netlify, Cloudflare Pages, Vercel (static project), GitHub Pages or any HTML server. Paths are relative so pages also work from file:// on a desktop.

## Future production upgrades

A secure Supabase/Resend backend, authenticated content management, analytics (with consent where required), domain deployment, image optimization and automated accessibility tests are recommended before launch.
