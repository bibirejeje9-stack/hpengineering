# HP Engineering — production upgrade

A 44-page, dependency-free static website with Vercel serverless enquiries. The original HP monogram, navigation and URL paths are preserved.

## Deployment

Connect GitHub repository `bibirejeje9-stack/hpengineering` to Vercel. Select **Other** framework preset, root directory `/`, and **no build command**. The static HTML site is served directly; Vercel automatically creates the Node serverless function at `/api/inquiry`.

## Required environment variables

Copy the names from `.env.example` into Vercel Project Settings → Environment Variables. Never place secret values in GitHub.

- `RESEND_API_KEY`: Resend transactional email API key.
- `RESEND_FROM`: a sender address on a domain verified by Resend; e.g. `HP Engineering <enquiries@yourdomain.com>`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST credentials for rate limits and deduplication.
- `PUBLIC_SITE_ORIGIN`: exact public origin, currently `https://hp-engineering.vercel.app`.

Resend must authorize the sender domain before live enquiries can be accepted. `peterhenry.engineering@gmail.com` is the destination mailbox, not necessarily a valid Resend sender identity.

### Inquiry behavior

- Required fields are validated in the browser and on the server.
- Five requests per IP-derived hash per hour; duplicate project submissions blocked for 24 hours after acceptance.
- Honeypot and minimum completion time reduce scripted submissions.
- The form sends a project enquiry to the business mailbox and best-effort acknowledgement to the visitor.
- The form returns **503** without configured email/rate-limit credentials. It does not claim success or fall back to a visitor email app.
- Uploads are intentionally **disabled** until private object storage, security controls and malware scanning are configured. Do not accept project plans through a public file endpoint.

### Enable attachments later

Add private Supabase Storage or an equivalent protected storage system with access-controlled signed URLs and server-side content checks. Implement authentication, file size limits, malware scanning, deletion and retention policies before enabling the upload field.

## Content and credentials

The site serves U.S. contractors and residential development professionals. Drafting and coordination outside California are presented subject to applicable professional practice rules. State engineering authorizations and the C 26348 credential are **not claimed as verified** in this codebase. Check licensing with appropriate state boards and verify business identity before publication.

The portfolio displays capabilities rather than invented completed projects. Use `content/case-study-template.json` for approved case studies; do not publish it until verified work and permissions are available.

## QA checklist

- [x] All 44 existing HTML routes retained.
- [x] Relative internal navigation and asset paths checked locally.
- [x] 18 service pages enhanced with technical scope notes.
- [x] Homepage and service-area copy updated for U.S. contractor focus.
- [x] Sitemap, robots.txt, canonical and Open Graph metadata generated.
- [x] Server-side endpoint, validation, rate limiting and transactional mail integration implemented.
- [ ] Resend account/domain verified and live email delivery tested.
- [ ] Upstash credentials configured and live rate limiting tested.
- [ ] End-to-end Vercel form submission tested on published site.
- [ ] Secure document uploads implemented and security tested.
- [ ] Real project case studies and professional credentials verified.
- [ ] Lighthouse, screen-reader and multiple-browser audits completed.

## Privacy / safety

Only store secrets server-side. No client details are intentionally logged by the function. Upstash stores hashed IP-derived rate-limit and anonymous duplicate-check tokens; emails reach the configured transactional provider. The privacy page describes these mechanisms. Review retention requirements and legal disclosures before launch.