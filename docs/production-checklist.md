# Production readiness checklist

The current project is deliberately a static UI sample. Do not accept real orders until the relevant items below are implemented and reviewed.

## Product and catalogue

- [ ] Confirm the product's gem species, natural/synthetic status, cut, dimensions, weight, origin, treatment and any applicable certificate with a qualified source.
- [ ] Replace demonstration metadata and remove the page's `noindex, nofollow` directive only when accurate production content is ready to be indexed.
- [ ] Replace the placeholder title, characteristics, image captions and sample price with accurate catalogue data.
- [ ] Publish original product photos with honest color representation, image rights and useful, product-specific alternatives. The current views are crops/background treatments of one supplied photo, not independent angles.
- [ ] Define authoritative pricing, currency, availability and inventory rules on the server; do not trust client-side values.

## Transaction flow

- [ ] Add a server-backed cart and order API with validation, idempotency, fraud protections and sensible error/retry behavior.
- [ ] Integrate a PCI-compliant payment provider without handling raw card details in this application.
- [ ] Implement tax, shipping eligibility/rates, delivery estimates, returns/cancellation terms, order confirmation and customer support.
- [ ] Keep secrets, credentials and business rules out of client-side files.

## Privacy, legal and operations

- [ ] Confirm you have rights to use and distribute the source code, brand, product photography and other assets. The current repository license reserves all rights; obtain appropriate written permission or replace it only with the rights holder's authorization.
- [ ] Add jurisdiction-appropriate privacy, cookie, consumer, accessibility and terms notices; obtain legal review.
- [ ] Minimize and document personal data collection, retention and deletion. The demo currently collects none.
- [ ] Configure HTTPS, security headers, error reporting, backups/rollback and a deployment process.
- [ ] If analytics or third-party scripts are introduced, document their purpose, secure them, and obtain consent where required.
- [ ] Define supported browsers/devices and perform keyboard, screen-reader, touch and color-contrast reviews on the deployed site.

## Engineering and QA

- [ ] Add an application/backend test suite and browser integration tests; the included Node tests are only smoke/unit checks.
- [ ] Test unavailable images, storage denial, network/API errors, multi-tab cart changes and concurrent stock changes.
- [ ] Establish image byte budgets and verify responsive image delivery with `srcset`/modern formats if the catalogue grows.
- [ ] Load-test APIs and checkout, review third-party dependency updates, and record a security response/contact process.

## Ready-to-ship language

Remove the demo banner only after a real catalogue, cart and checkout exist. The current button deliberately adds to local browser state and the checkout remains disabled; changing only the label does not make this a store.
