# Publish — the ONE auth step left

This package is built, type-checked (`tsc` clean), runtime-loaded, and
`npm pack --dry-run` verified. It was **not** published from the Muse VM
because that VM is not logged into npm or GitHub:

- `npm whoami` → ENEEDAUTH ("You need to authorize this machine using `npm adduser`") — **this is the blocker**
- `gh auth status` → "You are not logged into any GitHub hosts" (gh CLI has no token; however Git SSH *does* verify as `Spacemandomains` — `ssh -T git@github.com` → "Hi Spacemandomains!" — so git push works, but repo creation / the CLI's registry-PR flow still needs a GitHub token Wilfred supplies at publish time)
- `@elizaos/cli` could not be run on this VM: a global `npm install -g @elizaos/cli` did not finish within 120s and was terminated, so `elizaos publish --test/--dry-run` validation was substituted with tsc + runtime-load + `npm pack --dry-run` checks (all passing, below). Run the CLI test step on the Mac as listed.

No passwords were asked for or used. Do the auth + publish on Wilfred's Mac
(where his GitHub `Spacemandomains` is already signed in in Chrome), or in any
terminal where he controls the login:

```bash
# 1. Get the package
git clone <this folder's repo once pushed>  # or copy this folder from the VM workspace

# 2. Auth (one time, interactive — Wilfred does this himself)
npm login                      # npm account that will own @thewinnerscircle/plugin-token-verdict
                               # NOTE: publishing under the @elizaos scope requires
                               # membership of the elizaos npm org. If npm rejects the
                               # scope, rename to @spacemandomains/plugin-token-verdict
                               # (plugin name inside stays "plugin-token-verdict") —
                               # the registry accepts npm packages with the plugin- prefix.
gh auth login                  # or have the elizaos CLI prompt for a scoped GitHub token

# 3. Install the ElizaOS CLI and test first (validates structure/images/description)
npm install -g @elizaos/cli
cd elizaos-plugin-token-verdict
elizaos publish --test         # dry validation, makes no changes
elizaos publish --dry-run      # generates registry files locally in packages/registry/

# 4. Real publish
elizaos publish
# → npm package live immediately
# → GitHub repo created
# → registry PR opened at elizaos-plugins/registry
# → core-team review, typically 1–3 business days
# → once approved: appears in registry, installable via `elizaos plugins list / add`
```

Fallback if `elizaos publish` balks at the scope or CLI version: plain
`npm publish --access public` after `npm run build`, then open the registry
PR manually against elizaos-plugins/registry with the generated registry entry.

## Verified before handoff (2026-11-25, Muse VM, nothing paid)

- Live endpoint dry-run: POST returned HTTP 402; decoded `PAYMENT-REQUIRED`
  header: amount 20000 atomic USDC = **$0.02**, network **eip155:8453 (Base)**,
  asset USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
  payTo `0xea8B7221507d1A0549e1ab96000a54401A7fDaC1`. Nothing was paid.
- `npm run build` (tsc) — clean, exit 0.
- Runtime load of `dist/index.js` — plugin `plugin-token-verdict`, actions `[CHECK_TOKEN]`.
- `CHECK_TOKEN.validate()` — true with a 0x address in the message, false without.
- `npm pack --dry-run` — 8 files, 61.0 kB tarball (dist, images, README, package.json).
- Images: `images/logo.jpg` 400×400, 13,102 B (<500 KB); `images/banner.jpg`
  1280×640, 59,323 B (<1 MB) — both meet registry sizes.
