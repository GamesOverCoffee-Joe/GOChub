# Quiz question format

How to write quiz questions for the GOQ Museum so they can be imported in one go. Pair this with `DEV-INTENTIONS.md`, which has every game's developer answers.

## What to send

- **A plain text file: `.txt` (best) or `.md`.** A `.json` file also works (see the end).
- One file can hold questions for any number of games.
- To bring it in: open the curator's **Quizzes** tab, then **Import and export**. Paste the text or use **Choose File**, pick **Add to each game's pool** (or **Replace**), and press **Import**. You can also just send the file to Claude.

## The format

```
=== Comets Have Feathers | piece-g3at9r2
Q: What did the developer do before working in games?
+ Flew helicopters
- Drove race cars
- Taught music
- Built theme park rides
> I used to fly Helicopters - I came to work in the game industry much later in life than most I think.

Q: Who did the character animations?
+ The developer's daughter
- A big outsourcing studio
- The developer's old VR team
- An AI tool
> My daughter is an animator... she's done the animations for the characters.
```

| Line starts with | Means | Rules |
| --- | --- | --- |
| `===` | A new game | The title, then `\|`, then its piece ID. The ID is what matches; the title is for humans. Use the exact lines in the list below. |
| `Q:` | A new question | Up to 300 characters. |
| `+` | The right answer | Exactly one. Up to 160 characters. |
| `-` | A wrong answer | Exactly three. Up to 160 characters each. |
| `>` | From the developer | The developer's own words the question came from, shown after the player answers. Copy them from `DEV-INTENTIONS.md`; trimming with `...` is fine. Up to 600 characters. Optional, but please include it. |

- Leave a blank line between questions.
- Each game can have as many questions as you like (up to 60). The game picks a few at random each round (3 by default; the Quizzes tab changes it) and shuffles the four answers every time, so order doesn't matter.
- Don't write the letters A, B, C, D. The game adds them.

## Tips for good questions

- **Ask about the developer's answers, not the game's trivia.** The quiz rewards reading the placard.
- **Keep the four answers about the same length and style.** If the right one is always the longest or most detailed, players can guess it without reading.
- **Make wrong answers believable** for that kind of game, but clearly wrong to someone who read the placard.
- **Avoid "all of the above", "none of the above" and trick wording.**
- **One idea per question.** Short questions read better on the quiz page.

## Prompt you can give an AI

> Using DEV-INTENTIONS.md, write 10 quiz questions for each game below. Each question must be answerable from that game's developer answers. Use exactly this format: a `===` line per game (copy it exactly), then for each question a `Q:` line, one `+` line (the right answer), three `-` lines (believable wrong answers of similar length to the right one), and a `>` line quoting the developer's words the answer comes from (copied, may be trimmed with ...). Blank line between questions. No numbering, no letters, no extra text.

## Every game, with its line

Copy these exactly as the `===` lines.

```
=== Cave Escape | piece-um9vhkk
=== Stella Incus | piece-fv1px6m
=== Survivor TD | piece-8e4ay05
=== AI'm Domingo | piece-4wnzood
=== Seeing Double | piece-7oesrvl
=== Orion Wars | piece-50vrtaq
=== Minicraft TD | piece-xc2ez00
=== Hope Timbre | piece-0x8bbhf
=== Diecast | piece-ct78svp
=== Warlord's Penance | piece-uw8z1nn
=== Spring Escape Deep Down | piece-vx7436f
=== Monster Freaks! | piece-dpq1d5y
=== Tangled Crisis | piece-v4zp9gn
=== Ominoflux | piece-p0gsjux
=== Enemies Within | piece-wpusqmb
=== Credit Farm/Debtician | piece-6akkzg9
=== Hovershot | piece-hvr5h0t
=== Spacecat Solitaire | piece-sp4cec4t
=== Acrobatic Car | piece-wn546o7
=== Cyber Volley | piece-qql6aew
=== Depth Complaint | piece-wd37bxb
=== Polariball | piece-okfuqok
=== Near The Fear | piece-ngafqv9
=== ESiON | piece-34ub7ui
=== Zenomatrix | piece-110bezd
=== Manboobs The Mini Game | piece-iewg971
=== Sneaky - The Game | piece-3qn8otm
=== Zeroth | piece-e6304vj
=== Sonak | piece-wr2s44o
=== Club Soko | piece-rn49jj6
=== Hyperbaric | piece-8ybe96c
=== Absorber | piece-45lxgqh
=== Comets Have Feathers | piece-g3at9r2
=== Cognitanks | piece-yttv7ax
```

## JSON (if you'd rather)

```json
{
  "piece-g3at9r2": [
    { "q": "What did the developer do before working in games?", "right": "Flew helicopters",
      "wrong": ["Drove race cars", "Taught music", "Built theme park rides"],
      "from": "I used to fly Helicopters..." }
  ]
}
```
