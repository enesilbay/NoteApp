# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

PWA (React + Vite), later wrapped with Capacitor for Android/iOS store releases. Design language is the app's own, not per-OS native.

## Users

General public (store release planned). People who keep everyday notes — lists, ideas, meeting notes, sketches — and want the same notes on phone, tablet and computer under one account. Phone, tablet (finger or pen) and desktop are used roughly equally; no single device is primary.

## Product Purpose

A note app meant to replace Google Keep: capture text, checklist and handwritten notes quickly, organise them (pin, archive, labels, folders), find them again (search + filters), and have them synced across every device. Success: a note written on the phone shows up on the tablet and web without thinking about it.

## Positioning

Keep-level speed with things Keep lacks in one place: per-note password locking with on-device encryption (server cannot read locked notes), first-class handwriting/drawing with pen and palm rejection, project folders, and a built-in calculator whose results drop into a note. It must not look or feel like a Keep clone; it has its own identity.

## Operating Context

- Quick capture throughout the day on phone; longer writing and organising on desktop; pen-based notes on tablet.
- Works offline and syncs later (planned, Phase 6). Realtime sync between open devices.
- Account via email + password or Google.

## Capabilities and Constraints

- Built: account (Supabase Auth), create/edit/autosave notes, pin, archive, trash with undo and restore, grid/list view, search by title and content, PWA install.
- Planned (ROADMAP.md): checklists, labels, folders, note colours, drag-to-reorder, images, handwriting/drawing, locked notes, calculator, offline mode, dark theme, TR/EN.
- Stack: React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), Supabase (Postgres, Auth, Realtime, Storage).
- UI language: Turkish first; English planned.

## Brand Commitments

- Name: **NoteA+**.
- Must have its own colour palette and style, clearly distinct from Google Keep; the user explicitly asked for a lively, animation-rich feel.

## Evidence on Hand

No testimonials, user numbers, logos or press exist. Do not fabricate any.

## Product Principles

1. Capture first: getting a thought down is never more than one tap or keystroke away.
2. Same notes everywhere: every surface works equally well on phone, tablet and desktop.
3. Private by default: locked notes are encrypted on the device; nothing claims more security than is built.
4. Personality without friction: motion and character delight, but never slow down writing or finding a note.

## Accessibility & Inclusion

Public release: aim for WCAG 2.2 AA (contrast, keyboard access, focus visibility, touch targets). Honour `prefers-reduced-motion` given the animation-heavy direction.
