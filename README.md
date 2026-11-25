# Aashish & Arushi — Wedding Invitation

A mobile-first, animated React wedding invitation inspired by the supplied Reel: a sage envelope and wax seal opening into a long-form botanical stationery experience. Built with Vite, React, TypeScript, Framer Motion and EmailJS. No database or custom backend is used.

## Included

- Animated envelope / invitation reveal
- Couple and both parents' names
- Wedding date and live countdown (India timezone)
- Heritage Haveli venue and Google Maps link
- Our Story photo carousel
- Responsive gallery with fullscreen lightbox
- RSVP form with Groom's Side / Bride's Side routing
- No Shagun / No Gifts section
- Punjabi humour section
- Replay invitation interaction

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## Configure RSVP email with EmailJS

This is a frontend-only integration. There is no database, server, API route or private email credential in this project. EmailJS sends the form notification to the recipient configured in each EmailJS template.

1. Create an account at [EmailJS](https://www.emailjs.com/).
2. Add an email service and connect the sender mailbox/service.
3. Create **two separate templates**. Set the recipient address inside each template in the EmailJS dashboard (not in the browser code):
   - Groom template recipient: `aashish.khullar92@gmail.com`
   - Bride template recipient: `arushikhullar91@gmail.com`
4. Use these template variables in both templates:
   - `{{guest_name}}`
   - `{{guest_phone}}`
   - `{{family_side}}`
   - `{{attendance}}`
   - `{{guest_count}}`
   - `{{personal_message}}`
   - `{{wedding_couple}}`
   - `{{wedding_date}}`
   - `{{submitted_at}}`
5. Suggested subject: `Wedding RSVP | Aashish & Arushi | {{guest_name}}`.
6. Copy the EmailJS Service ID, Public Key and the two template IDs into `.env`:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_GROOM_TEMPLATE_ID=your_groom_template_id
VITE_EMAILJS_BRIDE_TEMPLATE_ID=your_bride_template_id
```

7. In EmailJS, restrict allowed origins to your deployed website domain and localhost for development. Enable any available anti-abuse controls / CAPTCHA and monitor the plan's sending quota.
8. Restart the Vite dev server after editing `.env`.

**Important:** EmailJS public keys and template IDs are visible in a frontend app by design. The recipient is fixed inside the corresponding EmailJS template; the app only selects between the two fixed template IDs. This is not equivalent to a server-side secret. Restrict origins and configure anti-abuse controls in EmailJS. A static frontend cannot provide strong server-enforced rate limiting or guarantee that a determined attacker cannot invoke a public email template.

### RSVP template example

Set the template's **To Email** field directly to the appropriate fixed recipient. Example body:

```text
A new wedding RSVP has arrived.

Guest: {{guest_name}}
Mobile: {{guest_phone}}
Family side: {{family_side}}
Attendance: {{attendance}}
Number of guests: {{guest_count}}
Message: {{personal_message}}
Couple: {{wedding_couple}}
Wedding date: {{wedding_date}}
Submitted: {{submitted_at}}
```

## Replace sample gallery photos

The images currently configured in `src/data/wedding.ts` are generic Unsplash sample photos, not photographs of Aashish and Arushi. Replace the `src` values with your own photos (ideally add optimized `.webp` files under `public/images/couple/` and use paths such as `/images/couple/photo-01.webp`). Update the `alt` text to describe each actual photo.

## Update wedding details

Edit `src/data/wedding.ts` to change names, parents, date, venue, map link and gallery photos. Ceremony / guest arrival times are intentionally not invented; add them once confirmed.

## Build for production

```bash
npm run build
npm run preview
```

Deploy the project to Vercel as a Vite application. Add the four `VITE_EMAILJS_*` environment variables in Vercel Project Settings → Environment Variables, then redeploy.

## Notes

- No RSVP records are stored in a database or browser storage. Email inboxes are the RSVP record.
- Successful form feedback is shown only after EmailJS reports success.
- Email delivery depends on your EmailJS service, template configuration, account limits and sender setup.
- The countdown uses the wedding date with the `+05:30` India timezone offset.
