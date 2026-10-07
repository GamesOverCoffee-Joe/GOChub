# GOQ Museum: Supabase setup, step by step

> **[UPDATE, October 2026] WHAT YOU NEED TO DO**
>
> You already set Supabase up, so you don't need to redo the steps below. Just do this once:
>
> 1. Open your project on supabase.com, then **SQL Editor**, then **New query**.
> 2. Paste the whole updated `supabase-setup.sql` (from the `references` folder) and click **Run**. If it warns about "destructive operations", click **Run this query**. It's safe to run again: your badges, keys and points stay as they are.
> 3. That's it. Closing up the museum now counts toward the leaderboard. Until you run it, closing only counts in the player's own browser.
>
> **For visitor notes (also October 2026),** after step 2, run this one line in a new query, with your own badge number. It lets that badge approve notes in the curator:
>
> ```sql
> select goq.set_curator('0001', true);
> ```
>
> Then open the curator's **Notes** tab and sign in with that badge number and key. Notes visitors leave wait there until you approve them. Until you run the updated file, the museum still offers notes, but they won't send.
>
> **For the curator's office (also October 2026),** paste and run the updated `supabase-setup.sql` once more (step 2). Then a badge you've made a curator with the line above also opens the curator's office in the game and starts you there, with Recording mode on the office computer. Badges clocked in before you run it need to clock in again.
>
> Everything marked **[UPDATE, October 2026]** below is new or changed.

This connects the museum's staff door to a free Supabase database. Real badges get checked, chores done on shift count toward points, and Employee of the Month picks itself. It takes about 20 minutes, and it all works from `http://localhost:8000`, so you don't need a website yet.

You'll need two files from this update: `supabase-setup.sql`, and the new `museum-pack.json` (or your own pack, re-imported in the curator).

## What you're making, in plain words

- **The database** keeps three lists: badges, logins, and chores. They sit in a private area that the website can't see.
- **The website** can only do three things: clock in, log a chore, and read names and points for the leaderboard.
- **Keys are scrambled** before they're stored. Not even you can read them back, which is why each key is shown only once, when it's made.

## Step 1. Make a Supabase account and project

1. Go to **supabase.com** and click **Start your project**. Signing in with GitHub is easiest, and you'll want GitHub later for the website anyway.
2. Click **New project**.
   - **Name:** `goq-museum`.
   - **Database password:** click **Generate a password** and save it in your password manager. The museum never uses it, but Supabase may ask for it someday.
   - **Region:** pick the one closest to most of your viewers.
   - **Plan:** Free.
3. Click **Create new project** and wait a minute or two while it sets up.

## Step 2. Run the setup script

1. In the left sidebar, click **SQL Editor**, then **New query**.
2. Open `supabase-setup.sql` in a plain text editor (Notepad or TextEdit), select everything, copy it, and paste it into the query box.
3. Click **Run**.
   - Supabase may warn that the query has "destructive operations". That's the part that locks things down. Click **Run this query**.
   - You should see **Success. No rows returned.**

The script is safe to run again later, for example after an update.

## Step 3. Make the badges

> **[UPDATE, October 2026]** Badge numbers matter a little more now: two or three Patreon members are on shift in the staff room each day, and the one who's clocked in is never also in the room. The game matches people by the badge number in the curator's Staff tab, so keep those numbers the same as the ones here.

1. Click **New query** again and paste this. It makes a badge for every Patreon member in your Staff tab, plus one for you to test with.

```sql
select b.badge, b.name, b.key
from (values
  ('0002', 'Wower'),
  ('0003', 'Johnyy B'),
  ('0004', 'A B'),
  ('0005', 'Rob Lang'),
  ('0006', 'Harry (Cytochrome) Young-Jones'),
  ('0007', 'Eldiran'),
  ('0008', 'Loick Sery'),
  ('0009', 'Darla Jane'),
  ('0010', 'peartree'),
  ('0099', 'Curator (testing)')
) as m(badge, name), lateral goq.add_badge(m.badge, m.name) as b;
```

2. Click **Run**. You'll get a table of badge numbers, names, and keys like `NWA-9N6`.
3. **Copy that table somewhere private right away** (your password manager, or a private note). The keys are shown this one time only. If one gets lost, see "Everyday admin" below.

The names here are the ones shown on the leaderboard and in the Employee of the Month frame.

## Step 4. Connect the curator

1. In Supabase, click **Connect** at the top of the project page, or go to **Project Settings** (the gear icon), then **API Keys**. You need two things:
   - **Project URL.** It looks like `https://abcdefgh.supabase.co`. It's also under **Project Settings → Data API**.
   - **Publishable key.** It starts with `sb_publishable_`. If there isn't one, click **Create new API keys**. Older projects show an **anon** key instead (a long code starting with `eyJ`), which also works.
   - **Don't use the secret key** (`sb_secret_` or `service_role`). It must never go in the museum.
2. Start your local server as usual and open `http://localhost:8000/curator.html`.
3. If you haven't since this update, click **Import pack** and choose the new `museum-pack.json`. This brings in the staff room's new leaderboard board.
4. Go to the **Staff** tab, find **Online staff (Supabase)**, and paste the address and the publishable key.
5. Click **Test connection**. You should see something like **"Connected. October 2026: no points yet."**
6. Click **Export pack** and put the exported `museum-pack.json` next to `museum.html`, replacing the old one.

## Step 5. Test a login

Open `http://localhost:8000/museum.html` and check each of these:

- [ ] Walk to the **staff door** in the lobby (top right). Enter badge **0099** and its key. You should be clocked in as "Curator (testing)" and walk into the staff room.
- [ ] The **ON SHIFT** tag in the corner shows points.
- [ ] Go dust a frame, then come back to the staff room. Read the new **leaderboard** (the green chalkboard next to the lockers). It may take up to 5 minutes to update; reloading the page updates it right away.
- [ ] In the lobby, the **Employee of the Month** frame should say you're "leading October so far".
- [ ] In Supabase's SQL Editor, run `select * from goq.badge_list;`. Your badge should show points.
- [ ] Clock out at the time clock, then try the staff door with a **wrong key**. You should see "That badge didn't work."

When you're done testing, run `select goq.set_active('0099', false);` so the test badge drops off the leaderboard.

If something doesn't match, tell me what you saw, ideally with a screenshot.

## Everyday admin

Run these in the SQL Editor whenever you need them.

| To do this | Run this |
| --- | --- |
| Add a new patron | `select * from goq.add_badge('0011', 'Their Name');` |
| Give someone a new key (lost key) | `select * from goq.new_key('0002');` |
| Turn a badge off (someone left) | `select goq.set_active('0002', false);` |
| Turn it back on | `select goq.set_active('0002', true);` |
| Change a leaderboard name | `select goq.rename_badge('0002', 'New Name');` |
| See everyone's points | `select * from goq.badge_list;` |

Making a new key or turning a badge off also logs that person out on every device.

**Sending keys to patrons:** message each one privately, for example through Patreon. Never post keys anywhere public, and never put them in the museum files.

**Employee of the Month** is last month's top patron. Until a month has finished with points in it, it's this month's leader "so far". To pick someone yourself, type their name in the curator's Staff tab. Clear the name to go back to automatic.

## How points work

- **1 point each:** dusting, straightening, watering, finding the mug, wiping a case.
- **3 points:** a curious visitor comes back and loved the game you recommended. **[UPDATE, October 2026]** This replaces helping a lost visitor, which is gone from the game. It uses the same chore name in the database (`helped`), so you don't need to change anything for it. The point counts when the visitor comes back (usually the next day), for whoever is clocked in then.
- **3 points:** closing up the museum (making the announcement and turning off every light). **[UPDATE, October 2026]** New. This needs the updated `supabase-setup.sql` (see the top of this guide).
- **Fair limits:** each frame, case or plant counts once a day per person. There's also a daily cap per chore (for example, 10 loved recommendations, 1 mug and 1 closing a day). The day changes at midnight UTC. **[UPDATE, October 2026]** Closing added here: reopening and closing again still earns tokens in the game, but only the first closing each day counts on the leaderboard.
- **Wrong keys:** after 8 wrong tries, a badge is locked for 15 minutes.
- **The offline test badge** (0001 / QQQ-QQQ) still works on your own computer, but its points stay in that browser and never reach Supabase.

## Good to know

- **The weekly pause.** On the Free plan, a project with no activity for a week pauses. The museum keeps working, but logins and points stop until you open the Supabase dashboard and click **Restore**. Normal visiting counts as activity.
- **If Supabase can't be reached,** the game says once that chores won't count right now, and everything else keeps working.
- **If Test connection says the functions can't be found** right after running the script, wait a minute and try again. Or run `notify pgrst, 'reload schema';` in the SQL Editor.
- **The publishable key is meant to be public.** It's visible to anyone who opens the pack, and that's fine: it only allows the three things the museum does.
