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

**Before you export:** if the repo's `museum-pack.json` has changed since your draft started (for example, Claude moved props or added settings), the curator shows "Heads up: this folder's museum-pack.json has changed since your draft started." Exporting then would undo those changes. Press **More → Check version** to see what's different. There are two safe ways out:
- **You've only made a small change** (like one PNG): load the folder's pack from Check version, redo the change, then export.
- **You've made a lot of changes:** export anyway, but don't replace the repo file yourself. Give the export to Claude to merge the two.

## Text from the Writers' Room

The Writers' Room (`writers-room.html`) writes into the same curator draft in that browser, so the same rule applies: players see your lines only after you **Export pack** (from the Writers' Room or the curator) and the exported `museum-pack.json` is in the repo on main. The draft lives in one browser on one device. If you write on your phone, export from your phone.

If that browser's draft is older than the repo's pack (say, the curator was last opened on your phone weeks ago), the Writers' Room says "Your draft doesn't match this folder's museum-pack.json". Press **Update my draft** before writing or exporting. It keeps every line you saved in the Writers' Room and takes everything else (rooms, pieces, art, settings) from the folder. Exporting without updating would put the old rooms and settings back.
