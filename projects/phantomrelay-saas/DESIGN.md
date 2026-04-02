# DESIGN.md — PhantomRelay SaaS

## Design System: "PhantomRelay Notion"

Notion-inspired. Clean, minimal, content-first. Typography-driven.
Sophistication from restraint, not decoration.

### Principles

1. **Content-first** — No decorative elements. Content IS the design.
2. **Flat & clean** — No gradients, no glassmorphism, no heavy shadows.
3. **Subtle borders** — Thin solid borders define sections. Never invisible, never heavy.
4. **Typography hierarchy** — Size and weight create structure, not color.
5. **Generous whitespace** — Let content breathe. 8px base grid.

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Page title | Inter | 2.25rem (36px) | 700 |
| Section title | Inter | 1.5rem (24px) | 600 |
| Subsection | Inter | 1.125rem (18px) | 600 |
| Body | Inter | 0.875rem (14px) | 400 |
| Small/caption | Inter | 0.75rem (12px) | 400-500 |

Single font family: **Inter**. No display font.
Tailwind: `font-sans` only.

## Color Tokens

All mapped to shadcn/ui CSS variables in `globals.css`.

### Core

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | #ffffff | #0b0e15 | Page bg |
| `--foreground` | #37352f | #e3e3e0 | Primary text |
| `--card` | #ffffff | #141720 | Card/panel bg |
| `--primary` | #2383e2 | #529cca | CTA, links, active |
| `--secondary` | #f1f1ef | #1e2230 | Secondary surfaces |
| `--muted` | #f7f7f5 | #1a1d28 | Subtle bg, disabled |
| `--muted-foreground` | #787774 | #9b9a97 | Secondary text |
| `--accent` | #f1f1ef | #252836 | Hover state |
| `--border` | #e9e9e7 | #2a2d3a | All borders |
| `--destructive` | #eb5757 | #e06c75 | Errors |
| `--success` | #0f7b6c | #4ec9b0 | Success states |
| `--warning` | #d9730d | #e5a05b | Warnings |

### Sidebar

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | #f7f7f5 | #0f1218 |
| `--sidebar-accent` | #ebebea | #1a1d28 |
| `--sidebar-border` | #e9e9e7 | #1e2230 |

### Charts

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | #2383e2 | #529cca |
| `--chart-2` | #0f7b6c | #4ec9b0 |
| `--chart-3` | #d9730d | #e5a05b |
| `--chart-4` | #9065b0 | #b893d6 |
| `--chart-5` | #d44c47 | #e06c75 |

## Component Library: shadcn/ui

### Button
- Flat solid colors, NO gradients
- Sizes: sm (28px), default (32px), lg (36px), xl (40px)
- Radius: 6px (rounded-md)
- Variants: default, outline, secondary, ghost, link, destructive

### Card
- Thin solid border (`border-border`)
- No shadow in any mode
- Padding: 20px (p-5)
- Radius: 8px (rounded-lg)

### Badge
- No border, uses 10% opacity bg fills
- Variants: default (primary), success, warning, destructive, secondary
- Small: px-1.5 py-0.5, text-xs, rounded (4px)

### Input
- Height: 32px (h-8)
- Thin border, transparent bg
- Focus: ring-1 with ring color
- Radius: 6px

### Table (Notion-style)
- No outer border on table
- Thin row dividers
- Text-left headers in text-xs, muted-foreground, font-medium
- Hover: bg-muted/50 transition
- Status: colored dots (2x2px circles)

## Spacing

8px base grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Card padding: 20px
- Section gap: 32px
- Page padding: 32px horizontal, 32px vertical

## Layout

### Sidebar
- Width: 240px (collapsible to 56px)
- Nav items: 32px height, 8px left padding, 2.5px gap icon-to-text
- Active: bg-sidebar-accent, font-medium, colored text
- Inactive: muted-foreground, hover bg-sidebar-accent

### Dashboard content
- Max width: 1152px (max-w-6xl), centered
- Padding: 32px (px-8 py-8)

## Breakpoints

| Name | Width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
