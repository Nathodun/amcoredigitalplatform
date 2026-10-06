# Amcore Renewable Energy Website — Commercial Architecture Build

This package is a static, responsive prototype designed to become Amcore's lead-generation website.

## Added in this build

- `ac-quote.html`: indicative AC quotation engine with postcode, room heat-load questionnaire, nominal kW sizing and budget ranges.
- `areas.html`: core North East + nationwide project-routing model.
- `config.js`: one place for company, pricing assumptions, CRM endpoint, tracking IDs, finance gate and verified accreditations.
- `tracking.js`: consent-controlled Google/Meta architecture with default-denied Google Consent Mode signals and conversion events.
- `api/lead.js`: example server-side CRM webhook handler; keep CRM secrets server-side.
- SEO landing pages for commercial AC, air-to-air heat pumps, air-to-water heat pumps, summer heat/heatwaves, air conditioning installation, solar panels, solar installation, EV charging and battery storage.
- `case-studies.html`: evidence-first case-study templates.
- `accreditations.html`: verified-company section with trade badges gated until register verification.
- `finance.html`: finance journey intentionally disabled until relevant authorisation/AR arrangements and approved promotions are confirmed.
- `privacy.html`, `sitemap.xml`, `robots.txt`.

## Production configuration

1. Set `AMCORE_CONFIG.crm.endpoint` to a server-side lead endpoint such as `/api/lead`.
2. Set the server environment variable `CRM_WEBHOOK_URL` to the chosen CRM automation/webhook. Do not put private API keys in `config.js`.
3. Add the Google tag ID and Meta Pixel ID only after the privacy/cookie implementation has been reviewed.
4. Add verified accreditations only after checking the issuing register/certificate and logo-use rules.
5. Leave `finance.enabled=false` unless/until Amcore's regulatory position and lender-approved wording have been verified.
6. Replace draft case-study cards only with approved project evidence.

## Quote-engine assumptions

The AC calculator is indicative, not a heat-load design tool or binding quotation. It uses simplified W/m² factors adjusted for room type, glazing, insulation, orientation, occupancy, equipment, ceiling height, pipe run, access and electrical work. Final capacity and price require engineering validation.

Current pricing was deliberately calibrated as a market-style range rather than a promise of a fixed national price. Review product/labour assumptions regularly in `config.js` and `script.js`.

## CRM lead fields

The architecture supports name, phone, email, postcode, project type, building type, message, quote reference, quote range, estimated kW, source, UTM fields, GCLID, FBCLID and marketing consent.

## Tracking events

Examples: `postcode_checked`, `quote_start`, `ac_quote_complete`, `lead_capture_open`, `lead_submit`, `click_phone`, `click_email`, `energy_fit_complete`.

## Important launch checks

- Verify all company/trade credentials.
- Finalise privacy notice and storage/cookie inventory.
- Test mobile, accessibility, forms, spam protection and CRM failure handling.
- Validate calculator pricing and VAT treatment with Amcore's commercial policy.
- Add genuine photography and approved case-study evidence.
- Configure Search Console, Analytics/Ads/Meta only after consent implementation is accepted.
