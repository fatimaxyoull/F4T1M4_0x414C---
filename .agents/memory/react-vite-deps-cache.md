---
name: Vite dependency cache after React upgrades
description: Diagnosing React and ReactDOM version mismatches in the lecture platform's Vite preview.
---

When React or ReactDOM versions change, Vite may retain optimized dependencies that still point to the prior versions. The source tree can typecheck and production-build successfully while the dev preview crashes on React's runtime version check.

**Why:** The managed preview did not invalidate its dependency optimizer cache after a package update, so browser imports came from mixed versions.

**How to apply:** Compare `artifacts/<web-app>/node_modules/.vite/deps/_metadata.json` with the package versions resolved in that app. If the cache is stale, remove only that app's generated `.vite` cache, restart its managed workflow, and verify the browser console and preview.
