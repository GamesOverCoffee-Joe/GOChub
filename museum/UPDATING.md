# How updates reach players

A quick reference for what happens when you change the museum and push it. Kept up to date as the game changes.

## The short version

Merge into **main** (the branch gamesover.coffee is served from). Returning players get the new version the next time they open or refresh the game, and their save is kept.

## What keeps it fresh

- **The engine (`museum-engine.js`).** The page loads it with the version in its address (`museum-engine.js?v=<version>`). A new version is a new address, so browsers can't reuse an old copy. If an old one slips through anyway, the page fetches it fresh once more.
- **The page (`museum.html`).** Browsers can keep an old copy of the page. To catch that, the game always asks `version.json` for the current version, skipping the cache. If that's newer than the page, it reloads once to get the new page.
- **The museum pack (`museum-pack.json`).** Your pieces, rooms, words, settings and any custom art. It's checked with the server on every load, and it wins over a pack saved in the player's browser, so new pieces and text edits show up. (With `?test` in the address, a pack you loaded by hand stays in charge instead.)
- **Saves.** Progress lives in each player's browser and isn't touched by updates. When a feature adds new save fields, old saves just get the defaults.

## Things to know

- **Four version strings.** The freshness checks only work when the version is bumped in all four places: `VERSION` in museum-engine.js, `GOQ_WANT` in museum.html and curator.html, and `version.json`. Claude bumps them with every code change.
- **It's not instant.** GitHub Pages caches files for up to about 10 minutes after a merge. Anyone with the game already open sees the update only after they refresh or come back.
- **Only main is live.** Work on `experiments-1` doesn't reach players until it's merged.
- **Name clip files in lowercase** (`seeing-double.webm`). GitHub Pages treats `Seeing-double.webm` as a different file. The game lowercases the name you type, so a file with capitals in its name won't be found.
- **Rename clips and images instead of overwriting them.** Files in `clips/` and `images/` don't carry a version in their address. If you swap in a new file under the same name, some players may see the old one for a while. A new name (like `acrobatic-car_2.webm`) shows up right away. Update the name in the curator to match.
- **Keep piece IDs stable.** Players' notes and "read" marks are tied to each piece's ID. Retitling a piece is fine, but deleting a piece and re-adding it means players lose their notes on it.

## Making everyone take the tutorial again

New players always start in the tutorial. After you change it, open the curator's **Staff** tab, **Tutorial**, and press **Require it again**. Export the pack and get it onto main: the next time each returning player loads the game, they're put into the tutorial once (they can still skip it). Players who haven't loaded since won't miss it; it waits for their next visit.

## Custom art from the curator (Art tab)

When you upload a PNG on a slot's own page (Joe, a wall, a prop) or through the Photoshop atlas, it's saved **inside your curator draft in that browser**, not as a separate file. Players don't see it until it's in the repo's pack:

1. In the curator, press **Export pack**. The PNG is embedded in the exported `museum-pack.json` (under `assets`).
2. Replace `museum/museum-pack.json` in the repo with the exported file, and merge it into main.

There's no separate PNG to upload. "Use built-in art" on a slot removes the custom art from the next export.

**Updating the curator itself is automatic** (no buttons). Every time you open or refresh it:
1. **The engine.** A "Getting the latest version" cover shows while it checks `version.json` and loads the matching engine, reloading itself (up to three times) if the device hands it an old copy. If the site still hasn't published the new version (right after a push), it says "Waiting for the new version" and retries every 20 seconds. Nothing in your draft can be opened, saved or exported until the right engine is running.
2. **The pack.** It compares your draft with the site's `museum-pack.json`:
   - **Same file:** nothing to do.
   - **The site's is newer and you haven't changed anything since:** it loads the site's pack by itself ("Loaded the newer museum-pack.json from the site").
   - **The site's is newer and you have changes too:** it asks. Pick **Back up my draft, then use the site's pack**: your draft goes to your downloads as `museum-pack-backup-<date>.json`, so nothing is lost. If those changes matter, redo them or give the backup to Claude to merge. **Keep my draft** keeps it, but then Export warns you that pushing it would undo the site's newer changes.
   - **Your draft is newer** (you exported and haven't pushed yet): it keeps your draft.

So the routine is: **open or refresh the curator, and do what it says, if it says anything.** More → Check version is still there if you want details.

**For Claude:** when changing `museum-pack.json` by hand, keep its `savedAt` (or set it to now), never earlier, so drafts treat it as the newer file.

## Text from the Writers' Room

The Writers' Room (`writers-room.html`) writes into the same curator draft in that browser. There's no separate update step: open or refresh the curator **in the same browser** and your lines are there (try them with Preview options → **Hear a line**). The same rule applies to getting them out: players see your lines only after you **Export pack** (from the Writers' Room or the curator) and the exported `museum-pack.json` is in the repo on main. The draft lives in one browser on one device. If you write on your phone, export from your phone.

If that browser's draft is older than the repo's pack (say, the curator was last opened on your phone weeks ago), the Writers' Room says "Your draft doesn't match this folder's museum-pack.json". Press **Update my draft** before writing or exporting. It keeps every line you saved in the Writers' Room and takes everything else (rooms, pieces, art, settings) from the folder. Exporting without updating would put the old rooms and settings back.
