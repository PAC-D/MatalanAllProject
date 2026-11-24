# Matalan Transit Packaging UI Guidelines

This document defines the permanent visual language for the registration and administration interfaces. New programme pages should reuse these rules instead of introducing a separate theme.

## Design direction

The interface is an operational industrial system, not a marketing site. Pages should feel precise, restrained, and suitable for daily supplier and factory workflows.

- Use off-white work surfaces with deep navy structural areas.
- Use crimson only for actions, focus, selection, and important emphasis.
- Prefer square geometry, fine rules, clear alignment, and generous whitespace.
- Avoid taglines, decorative copy, excessive badges, gradients on work surfaces, and rounded consumer-app styling.
- Keep the Matalan and PAC-D brands visually separate and correctly proportioned.

## Colour tokens

| Token | Value | Usage |
| --- | --- | --- |
| Navy | `#0a203b` | Primary structural colour |
| Deep navy | `#06182e` | Sidebars and visual panels |
| Crimson | `#bd1235` | Primary action and active state |
| Bright crimson | `#d52246` | Small accents and focus details |
| Off-white | `#f3f0e9` | Main application background |
| Ink | `#102238` | Primary text |
| Border | `#d9d6cf` | Dividers and field borders |
| Muted text | `#6f7881` | Secondary information |
| Cyan | `#77cfe8` | Phase and technical illustration accent |

Do not add new brand colours unless a functional state requires one. Status colours must remain muted and accessible.

## Typography

The project uses two Google font families:

- `Manrope`: page titles, section titles, key totals, and brand-programme headings.
- `DM Sans`: body copy, form labels, fields, tables, navigation, metadata, and buttons.

Guidelines:

- Use natural font proportions. Never horizontally scale, stretch, or compress text.
- Page titles use Manrope 700 or 800 with tight but readable tracking.
- Body text and data use DM Sans 400 to 700.
- Regular operational text should be at least `14px`; primary body text should be `16px`.
- Uppercase metadata may use `11px` to `12px` with `0.12em` to `0.18em` tracking.
- Keep headings short and use deliberate line breaks instead of forced scaling.

## Layout

### Registration

- Desktop split: 40% technical visual, 60% form.
- Left panel remains deep navy and may be sticky on large screens.
- Right panel uses the off-white work surface.
- At tablet and mobile sizes, stack the visual above the form.

### Administration

- Use a persistent navy navigation rail on desktop.
- Keep operational data on an off-white background.
- Summary totals precede the primary data table.
- The selected record may appear in a dedicated detail panel.
- Collapse to a single-column flow on narrow screens without hiding data.

## Form controls

- Standard control height: `52px`.
- Borders: `1px solid #cbc9c3`.
- Corners remain square.
- Labels sit above controls and use DM Sans 700.
- Focus uses a crimson border and a subtle crimson focus ring.
- Select arrows must be custom, inset, vertically centred, and stationary during focus.
- Required fields use native validation until backend validation is introduced.

## Tables and data

- Table headers use uppercase DM Sans with tracked lettering.
- Use horizontal rules instead of card borders around every row.
- Selected rows use a restrained crimson inset marker and a lightly tinted surface.
- Align quantities consistently and pad single-digit operational counts when useful.
- Show a clear empty state when filters return no records.

## Motion

- Motion is functional and restrained.
- Use slow, low-amplitude animation for technical illustrations only.
- Do not animate tables, form fields, or essential operational data.
- Respect `prefers-reduced-motion`.

## Responsive and accessibility rules

- Maintain visible keyboard focus.
- Use semantic headings, labels, tables, and navigation landmarks.
- Do not rely on colour alone to communicate status.
- Preserve readable contrast across navy and off-white surfaces.
- Avoid horizontal page scrolling. Data tables may scroll inside their own container when necessary.

## Change control

The registration design is locked. Future changes should be limited to requested fields, data sources, validation, and backend behaviour unless a visual redesign is explicitly approved. Admin extensions should reuse the tokens and component patterns documented here.
