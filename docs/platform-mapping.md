# Cicrus Design System — Platform Mapping

Output conventions for the three most common targets. The tokens and components are the same; only the syntax changes.

---

## 1. HTML / CSS / WEB

Load fonts via Google Fonts `<link>` in `<head>`. Use CSS custom properties. Mode via `body.light` class toggle.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your app</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=Space+Mono:wght@400;700&family=Doto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="path/to/src/cicrus.css">
</head>
<body><!-- add class="light" for light mode -->
  ...
</body>
</html>
```

Full token block is in `tokens.md` §9. Drop it in `cicrus.css` unchanged.

**Mode toggle JS:**

```js
document.getElementById('mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  document.querySelector('.mode-toggle-label').textContent = isLight ? 'LIGHT' : 'DARK';
});
```

**Conventions:**
- Units: `px` for spacing, borders, small type. `rem` acceptable for body type scale if supporting user font-size preferences.
- `prefers-color-scheme`: optional starting mode, but always let the user override via the toggle.
- `-webkit-font-smoothing: antialiased` on `body`.

---

## 2. REACT / TAILWIND

Configure Tailwind to expose the tokens as theme values. Use `dark:` modifiers or a `data-mode` attribute.

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Doto', 'Space Mono', 'monospace'],
      },
      colors: {
        // dark mode values; light overrides via CSS vars
        black: 'var(--cicrus-black)',
        surface: 'var(--cicrus-surface)',
        'surface-raised': 'var(--cicrus-surface-raised)',
        border: {
          DEFAULT: 'var(--cicrus-border)',
          visible: 'var(--cicrus-border-visible)',
        },
        text: {
          disabled: 'var(--cicrus-text-disabled)',
          secondary: 'var(--cicrus-text-secondary)',
          primary: 'var(--cicrus-text-primary)',
          display: 'var(--cicrus-text-display)',
        },
        accent: 'var(--cicrus-accent)',
        success: 'var(--cicrus-success)',
        warning: 'var(--cicrus-warning)',
        interactive: 'var(--cicrus-interactive)',
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px',
        xl: '32px', '2xl': '48px', '3xl': '64px', '4xl': '96px',
      },
      letterSpacing: {
        label: '0.08em',
        caption: '0.04em',
        tight: '-0.02em',
      },
      borderRadius: {
        pill: '999px',
        card: '8px',
        technical: '4px',
      },
      transitionTimingFunction: {
        cicrus: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
};
```

### Global CSS (imported once)

Copy the `:root` / `body` / `body.light` blocks from `tokens.md` §9 but **rename the variables** with a `--cicrus-` prefix (e.g. `--cicrus-black`, `--cicrus-text-primary`) so they don't collide with Tailwind internals.

### Component example

```tsx
export function Badge({ variant = 'type', children }: { variant?: 'process'|'resource'|'monitor'|'system'|'recurring'|'steps'|'type'; children: React.ReactNode }) {
  const variantClass = {
    process:   'text-text-primary   border-text-secondary',
    resource:  'text-interactive    border-interactive/30',
    monitor:   'text-warning        border-warning/30',
    system:    'text-text-disabled  border-border-visible',
    recurring: 'text-text-disabled  border-border',
    steps:     'text-success        border-success/30',
    type:      'text-text-secondary border-border-visible',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-[3px] rounded-pill border font-mono text-[10px] tracking-[0.06em] uppercase whitespace-nowrap ${variantClass}`}>
      {children}
    </span>
  );
}
```

**Convention:** component files are thin — layout + Tailwind classes. Don't recreate tokens in TypeScript; reference them via Tailwind theme values only.

---

## 3. SWIFTUI / iOS

Register fonts in `Info.plist` (key `UIAppFonts`) and bundle `.ttf` files from Google Fonts. Use `@Environment(\.colorScheme)` or a custom `ColorSchemeManager` for mode switching.

### Colors

```swift
import SwiftUI

extension Color {
    init(hex: String) {
        let s = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var v: UInt64 = 0; Scanner(string: s).scanHexInt64(&v)
        self.init(
            .sRGB,
            red:   Double((v >> 16) & 0xFF) / 255,
            green: Double((v >> 8)  & 0xFF) / 255,
            blue:  Double( v        & 0xFF) / 255,
            opacity: 1
        )
    }
}

enum CicrusColor {
    // Dark
    static let blackDark           = Color(hex: "000000")
    static let surfaceDark         = Color(hex: "111111")
    static let surfaceRaisedDark   = Color(hex: "1A1A1A")
    static let borderDark          = Color(hex: "2E2E2E")
    static let borderVisibleDark   = Color(hex: "555555")
    static let textDisabledDark    = Color(hex: "8F8F8F")
    static let textSecondaryDark   = Color(hex: "B8B8B8")
    static let textPrimaryDark     = Color(hex: "E8E8E8")
    static let textDisplayDark     = Color.white
    static let interactiveDark     = Color(hex: "5B9BF6")

    // Light
    static let blackLight          = Color(hex: "F5F5F5")
    static let surfaceLight        = Color(hex: "FFFFFF")
    static let surfaceRaisedLight  = Color(hex: "F0F0F0")
    static let borderLight         = Color(hex: "D9D9D9")
    static let borderVisibleLight  = Color(hex: "9E9E9E")
    static let textDisabledLight   = Color(hex: "737373")
    static let textSecondaryLight  = Color(hex: "595959")
    static let textPrimaryLight    = Color(hex: "1A1A1A")
    static let textDisplayLight    = Color.black
    static let interactiveLight    = Color(hex: "007AFF")

    // Shared
    static let accent  = Color(hex: "D71921")
    static let success = Color(hex: "4A9E5C")
    static let warning = Color(hex: "D4A843")
}
```

Use an adaptive wrapper:

```swift
extension Color {
    static func cicrusText(primary mode: ColorScheme) -> Color {
        mode == .dark ? CicrusColor.textPrimaryDark : CicrusColor.textPrimaryLight
    }
    // ...or better: use Asset catalog with "Any Appearance" + "Dark Appearance" per color.
}
```

Prefer **Asset Catalog colors** with light/dark variants — they adapt automatically with the system appearance.

### Fonts

```swift
extension Font {
    static func cicrusBody(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("SpaceGrotesk-\(weight.rawString)", size: size)
    }
    static func cicrusMono(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(weight == .bold ? "SpaceMono-Bold" : "SpaceMono-Regular", size: size)
    }
    static func cicrusDisplay(_ size: CGFloat) -> Font {
        .custom("Doto-Regular", size: size)
    }
}
```

(Add a small `Font.Weight.rawString` helper to map `.light → "Light"`, etc.)

### Example badge

```swift
struct CicrusBadge: View {
    let text: String
    let variant: Variant

    enum Variant { case process, resource, monitor, system, recurring, steps, type }

    var body: some View {
        Text(text.uppercased())
            .font(.cicrusMono(10))
            .tracking(0.06 * 10) // 0.06em at 10pt
            .foregroundColor(fg)
            .padding(.horizontal, 10)
            .padding(.vertical, 3)
            .overlay(Capsule().stroke(border, lineWidth: 1))
    }

    // fg / border switch on variant — see components.md §7
}
```

### Conventions

- Corner radii: 8pt cards, `.capsule` for pills, 4pt technical.
- Spacing uses an enum mirror of `--space-*` — `.sm = 8`, `.md = 16`, etc.
- No drop shadows in dark mode. Light mode cards can use `.shadow(color: .black.opacity(0.04), radius: 4, y: 1)`.
- Motion: `.animation(.easeOut(duration: 0.2), value: someState)` — never `.spring()`.

---

## 4. NATIVE macOS SHELL — LIQUID MODE

Liquid glass only reaches its reference look when the OS supplies the backdrop. Shipping
the web UI inside a native macOS shell (learned in production, Icarus v2.7 integration):

### Window + vibrancy

```swift
window.isOpaque = false
window.backgroundColor = .clear
window.titlebarAppearsTransparent = true
window.styleMask.insert(.fullSizeContentView)   // material runs edge to edge

let vibrancy = NSVisualEffectView()
vibrancy.material = .hudWindow                  // NOT .underWindowBackground —
vibrancy.blendingMode = .behindWindow           // that one renders near-opaque
vibrancy.state = .active
```

Layer order: vibrancy view at the back, a **non-drawing webview** on top
(`webview.setValue(false, forKey: "drawsBackground")`). The page adds
`class="liquid native"` to `<body>` — in that context it paints only the faint dark veil
(`rgba(10, 10, 20, 0.15)`); the blurred desktop supplies all the color.

### Chrome details

- **Traffic lights** float over the glass — give top-bar content ~**92px left clearance**.
- Add a **28px drag strip** above the webview: the webview otherwise swallows window drags.

---

## 5. FIGMA

- Create two variable collections: `Mode = Dark / Light`. Token variables per `tokens.md` §2 table. Every usage binds to the variable, never a raw hex.
- Use a 4px base grid (8px primary). Auto-layout with gaps from the spacing scale only.
- Corner radii as tokens (`radius-card = 8`, `radius-pill = 999`, `radius-technical = 4`).
- Text styles mirror the type scale (`display/xl`, `display/lg`, ..., `label`, `label/xs`). One style per row of the type scale table.
- Component variants: badges, buttons, cards. No "hover" variants in Figma — encode via interactive component states if needed, not duplicated frames.

---

## 6. GENERAL OUTPUT CONVENTIONS

- **One source of tokens per project.** Don't duplicate hex values in components — always reference the token.
- **Always ship dark AND light together.** Never merge a "dark-only" feature; the light equivalent must exist or the PR is incomplete.
- **Contrast CI:** add an automated check (axe-core, pa11y, Stark) for text/background contrast on every screenshot. Below-threshold = failing build, not a design review discussion.
- **No inline styles.** Use the token system. The exception is layout-specific grid templates (`grid-template-columns`) which are fine inline for one-off views.
