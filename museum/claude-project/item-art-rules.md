# GOQ Museum shop item art: the rules

## What the item is

Each week's gift is a new shop item for the gift shop. It belongs to the newest exhibit and goes on sale the day that exhibit is unveiled on the show. The game shows every shop item as a 16 by 16 icon: in the shop's list, in the shop's detail panel, and in the player's collection.

## The rules

| What | Rule |
|---|---|
| Size | Exactly 16 by 16 pixels. Never bigger: the game shrinks bigger pictures and they go blurry. |
| Background | Transparent. No box or color behind the item. |
| Edges | Hard pixels only: no anti-aliasing, gradients or soft shadows. |
| Outline | A 1-pixel outline all the way round, in #181820. Inner lines between parts may use the outline color or a part's darkest shade. |
| Colors | 4 to 7 colors in all, counting the outline. Each part gets 2 or 3 shades of its color: light, mid and dark. |
| Highlight | #f8f4ec, never pure white. One or two pixels is plenty. |
| Light | From the top left: lighter on top and left, darker on the bottom and right. |
| View | A slight three-quarter view, a little from above and from the side, like items and furniture in Pokémon Red and Blue. |
| Fit | Centered, filling most of the square, with about a pixel of room at the edges. Wide things sit a little low; tall things are centered. |
| Readability | It must be recognizable at real size. Exaggerate the one thing that makes it this item and skip fine detail. |

## The GOQ ART text format

This is how the art is written as text so it can be pasted into the Paint Room. One picture is:

1. A header line: GOQ ART, the item's name, and its size, for example "GOQ ART Toy tank 16x16".
2. A line ". transparent" (the dot is always see-through).
3. One line per color: a single letter, a space, and the color as #rrggbb, for example "A #181820". Use capital letters. Don't use O (it looks like 0), and don't use "." for a color.
4. Exactly 16 rows of exactly 16 characters, one character per pixel, using only "." and the letters listed above.

When there are several versions, write one picture after another, each with its own header and colors, all in the same code block. Nothing else goes between the rows: no quotes, commas, numbers or spaces.

An example, the plain toy tank (also in item-style-reference.txt):

GOQ ART Toy tank 16x16
. transparent
A #181820
B #4a4a58
C #9cc46a
D #5f8f3e
E #a8aeb8
F #3a5a2a
G #f8f4ec
................
................
................
......AAAA......
.....AGCCDA.....
....ACCCDDDAAAAA
....ADDDDFFCCCFA
..AAAAAAAAAAAAAA
.ACCGCCCCCCCCCA.
.ADDDDDDDDDDDFA.
ABBBBBBBBBBBBBBA
ABEBEBEBEBEBEBEA
.ABBBBBBBBBBBBA.
..AAAAAAAAAAAA..
................
................

## Before you answer

Check each picture: 16 rows, 16 characters in every row, every letter listed in its colors, an outline all the way round, and no more than 7 colors. Fix anything that's off before you send it.
