---
version: 1
slug: "src-components-appshell-tsx"
primary_target: "src/components/AppShell.tsx"
related_targets: ["src/pages/NotesPage.tsx","src/pages/LoginPage.tsx","src/components/NoteCard.tsx","src/components/NoteEditor.tsx","src/components/NoteComposer.tsx"]
---

# Surface brief: NoteApp app shell (notes, archive, trash, editor, login)

Scope: the whole working app — shell (rail + top bar), note grid, composer, editor, login. Mode: Operate.
Audience/job: general public capturing and finding everyday notes on phone, tablet, desktop equally.
Constraints: must not resemble Google Keep; own palette, own style, animation-rich. Standard controls, Turkish copy, reduced-motion fallback.
History: v1 (cobalt covers + white label stickers, Rubik) was rejected by the user for its colours; they kept the notebook idea and asked for more vivid colours, new type, new motion and a new layout. Comparison canvas of six other directions was rejected too.

## Direction contract

THESIS: Every note is a vivid spiral-bound notebook on a desk; the words are printed straight onto a duotone cover. Refuses white sticky cards on grey and refuses v1's white-label-on-flat-cover look.

OWN-WORLD: Eight saturated covers, each paired with a dark ink of its own hue (Limon/deep violet, Fuşya/plum, Elektrik/white, Nane/forest, Mandalina/brown, Gökyüzü/navy, Mor/white, Mercan/maroon). Silver spiral wire across every cover top; pinned notes wear a contrasting elastic band. Deep violet-ink rail, lavender-white desk. Bricolage Grotesque throughout, heavy display titles, hierarchy by size/weight.

STORY: The visitor sees a desk of bright notebooks, spots one by colour, it tilts toward the pointer, opens with cover and pages riffling, they write, it saves itself.

FIRST VIEWPORT: Dark violet rail with spiral-notebook logo and nav where the active item carries a hanging bookmark ribbon; top bar with white search; composer as a white spiral page with colour dots; below, pinned notebooks (elastic bands) then the rest in a masonry grid.

FORM: Okul Defteri continued (candidate 1 of 7 on the first ordered list, user-chosen pick; seed key 01b543d3), rebuilt per user steer. Signature move: open = View Transition card→editor plus cover and two pages riffling open on a left hinge. Motion grammar: spring drop-in with ring bounce, pointer-following 3D tilt with moving sheen, elastic band snaps on when pinned, tossed-away delete, ribbon bookmark slides between nav items.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
