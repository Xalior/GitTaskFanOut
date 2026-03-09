# NBN24 Theme

A Bootstrap 5 theme based on the Bootswatch "Pulse" colour scheme. Purple primary (`#593196`), with rounded corners disabled and custom component styling. Supports Bootstrap 5's built-in light and dark modes.

This theme serves as both a usable theme and a reference for creating your own.

## How Themes Work

GitTaskFanOut does **not** compile Bootstrap at build time. Instead, the app loads a single CSS file from `/api/theme.css` at runtime:

- If `data/theme.css` exists, it's served as the theme
- If not, stock `bootstrap.min.css` is served as a fallback

A theme is a **complete Bootstrap CSS bundle** — it replaces Bootstrap entirely, it doesn't layer on top. This means any Sass variable (colours, border-radius, spacing, fonts, etc.) works correctly.

## Prerequisites

- Node.js (any recent version)
- npm (or pnpm/yarn)

No Docker required — this is a standalone SCSS build.

## Quick Start

```bash
cd themes/nbn24
npm install
npm run build
npm run deploy    # copies to data/theme.css
```

## Scripts

| Command              | Description                                                  |
|----------------------|--------------------------------------------------------------|
| `npm run build`      | Compile compressed CSS (no source map) to `dist/nbn24.css`   |
| `npm run build:expanded` | Compile expanded CSS with source map                    |
| `npm run watch`      | Watch for changes and recompile automatically                |
| `npm run deploy`     | Build + copy `dist/nbn24.css` to `data/theme.css`            |

## File Structure

```
themes/nbn24/
├── package.json            # Build dependencies & scripts
├── README.md               # This file
├── .gitignore              # Ignores node_modules/ and dist/
└── scss/
    ├── nbn24.scss          # Entry point: variables -> Bootstrap -> bootswatch
    ├── _variables.scss     # Bootstrap variable overrides (Pulse palette)
    └── _bootswatch.scss    # Component-level style overrides (after Bootstrap)
```

### How the SCSS Pipeline Works

The entry point (`nbn24.scss`) imports in this order:

1. **`_variables.scss`** — overrides Bootstrap's default SCSS variables (colours, border-radius, spacing, etc.) *before* Bootstrap is compiled
2. **`bootstrap/scss/bootstrap`** — the full Bootstrap 5 framework, compiled with the overridden variables
3. **`_bootswatch.scss`** — component-level style tweaks applied *after* Bootstrap (button focus states, table headers, form focus, nav tabs, etc.)

This produces a single self-contained CSS file that includes all of Bootstrap with the theme baked in.

## Creating Your Own Theme

Copy this directory as a starting point:

```bash
cp -r themes/nbn24 themes/mytheme
cd themes/mytheme
```

### 1. Override Variables

Edit `scss/_variables.scss` to change any [Bootstrap SCSS variable](https://github.com/twbs/bootstrap/blob/main/scss/_variables.scss). Common overrides:

```scss
$primary:        #0d6efd;       // Primary brand colour
$secondary:      #6c757d;       // Secondary colour
$enable-rounded: true;          // Border radius on components
$border-radius:  0.375rem;      // Default border radius
$body-bg:        #fff;          // Page background
$body-color:     #212529;       // Default text colour
$font-family-sans-serif: "Inter", system-ui, sans-serif;
```

### 2. Override Components

Edit `scss/_bootswatch.scss` to add style rules that are applied after Bootstrap compiles. This is the place for things that can't be done with variables alone — custom focus states, shadows, transitions, etc.

### 3. Add New Partials (Optional)

For additional custom styles, create a new file (e.g. `scss/_custom.scss`) and add an `@import` at the end of the entry point SCSS file.

### 4. Rename and Update Scripts

If you rename the entry point (e.g. `scss/mytheme.scss`), update the `scripts` in `package.json` to match.

### 5. Build and Deploy

```bash
npm install
npm run build
cp dist/mytheme.css ../../data/theme.css
```

### Alternative Approaches

You don't have to use Sass. Any tool that produces a CSS file works:

- **Download a [Bootswatch](https://bootswatch.com) theme** — drop the `bootstrap.min.css` directly into `data/theme.css`
- **Use PostCSS or Tailwind** — as long as the output includes Bootstrap's classes
- **Write plain CSS** — start from Bootstrap's compiled CSS and override what you need

The only requirement is that the CSS file includes Bootstrap (or a compatible set of classes), since the app's UI is built with React-Bootstrap components.
