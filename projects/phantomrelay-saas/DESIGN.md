# DESIGN.md — PhantomRelay SaaS

## Design Systems

Generated with Google Stitch, implemented with shadcn/ui + Tailwind CSS 4.

| Theme | Stitch Name | Mode | Accent |
|---|---|---|---|
| Dark | Phantom Deep | `dark` class | #568dff (electric blue) |
| Light | Phantom Obsidian | default | #0056c6 (deep blue) |

## Typography

| Role | Font | Usage |
|---|---|---|
| Display & Headlines | **Manrope** 600-800 | Page titles, stat numbers, section headers |
| Body & UI | **Inter** 400-600 | Tables, labels, descriptions, inputs |

Tailwind: `font-display` for Manrope, `font-sans` for Inter.

## Color Tokens (CSS Variables)

All colors are mapped to shadcn/ui CSS variables in `globals.css`.
Use semantic names, never raw hex values in components.

### Core Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | #f8f9fb | #10131a | Page background |
| `--foreground` | #191c1e | #e1e2eb | Primary text |
| `--card` | #ffffff | #1d2026 | Card surfaces |
| `--primary` | #0056c6 | #568dff | CTAs, links, active states |
| `--secondary` | #f2f4f6 | #272a31 | Secondary surfaces |
| `--muted` | #edeef0 | #32353c | Disabled, subtle backgrounds |
| `--muted-foreground` | #424655 | #c2c6d8 | Secondary text |
| `--accent` | #e7e8ea | #363940 | Hover states |
| `--destructive` | #ba1a1a | #ffb4ab | Errors, failures |
| `--border` | rgba(194,198,216,0.2) | rgba(66,70,85,0.3) | Borders (ghost style) |

### Charts

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | #0056c6 | #568dff |
| `--chart-2` | #415d9b | #00e3fd |
| `--chart-3` | #a23900 | #f36420 |
| `--chart-4` | #006df8 | #b0c6ff |
| `--chart-5` | #9fbaff | #bdf4ff |

## Component Library

**shadcn/ui** as the base. Custom variants:

- **Button default**: Gradient from `primary` to `primary-container` (135°)
- **Card**: No visible borders. Depth via background color shift + ambient shadow in dark
- **Badge**: Status variants (success/warning/info) use 10% opacity fills
- **Inputs**: `surface_container_highest` bg, ghost border on focus
- **Sidebar**: `surface_container_low` bg with ghost borders

## Design Principles (from Stitch)

1. **No-Line Rule** — No 1px borders for layout. Use background shifts.
2. **Glass & Gradient** — Floating elements use backdrop blur. CTAs use gradients.
3. **Tonal Layering** — Depth via stacked surface colors, not shadows.
4. **Ghost Borders** — If borders needed, use `outline_variant` at 15-20% opacity.
5. **No pure black/white** — Always use `on_surface` / `surface` tokens.

## Spacing

4px scale: 4, 8, 12, 16, 24, 32, 48, 64.
Generous padding on cards (p-6 minimum).

## Breakpoints

| Name | Width | Target |
|---|---|---|
| mobile | 375px+ | Mobile first |
| tablet | 768px+ | Tablet |
| desktop | 1024px+ | Desktop |
| wide | 1440px+ | Wide screens |

## Design References

Screenshots from Stitch in `/design/`:
- `01-dashboard.png` — Dark mode dashboard
- `02-wizard-mode-selection.png` — Scraper wizard step 2
- `03-dashboard-light.png` — Light mode dashboard
