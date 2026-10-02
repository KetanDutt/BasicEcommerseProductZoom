# Running and deploying

## Local preview

From the repository root:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Visit `http://localhost:8000`. Any static server works. Use HTTPS on public hosts. Opening the HTML via `file://` may limit `localStorage` and is not the recommended way to test the sample bag.

## Static hosting

Publish the repository root as a static site. Keep the relative paths and case of `assets/`, `css/` and `js/` unchanged; case-sensitive hosts will not resolve misspelled or differently cased paths. The site does not need URL rewrites, a build step or a server-side runtime.

The page contains no third-party scripts, external stylesheets, remote fonts, trackers or network-backed forms, and is marked `noindex, nofollow` while it contains demonstration content. This makes a restrictive Content Security Policy practical. A host can add headers such as a policy allowing only same-origin scripts/styles/images and `frame-ancestors 'none'`; adapt it to any hosting platform's requirements, and test it before enforcement. The zoom interaction writes pointer-position CSS properties at runtime, so verify those DOM style updates under the exact `style-src` / `style-src-attr` policy you deploy. Do not copy a policy blindly if you later add a payment provider or other trusted integration.

## Release checks

1. Run the automated checks from [testing.md](testing.md).
2. Preview the actual deployed build and confirm all local assets resolve with correct letter case.
3. Check the generated image sizes, responsive layout, keyboard path, dialogs and mobile touch behavior.
4. Confirm the visible “sample/demo” language is retained until the storefront is genuinely connected to a commerce backend.

A static host cannot safely process orders, validate stock, calculate final tax/shipping, protect customer data or charge payments. See [production readiness](production-checklist.md) before enabling sales.
