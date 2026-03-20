# Design System Document

## 1. Overview & Creative North Star: "The Neon Luminary"

This design system is built to transcend the standard "dark mode" template. The Creative North Star is **"The Neon Luminary"**—an editorial-first approach to the cyberpunk aesthetic. Instead of cluttered interfaces, we prioritize high-contrast typography and cosmic depth to create an experience that feels like a high-end digital gallery.

We break the "template" look through:
*   **Intentional Asymmetry:** Off-center hero layouts and staggered grid placements that guide the eye naturally rather than strictly.
*   **Luminous Depth:** Using background blurs and tonal shifts to simulate physical layers of light and glass.
*   **Atmospheric Interaction:** Hover states aren't just color changes; they are "activations" where elements glow and pulse as if powered by the user's presence.

---

## 2. Colors

The color palette is rooted in the void of deep space, punctuated by high-energy neon signals.

### Core Palette
*   **Background (`#0a0e14`):** The foundational void. All depth is built on top of this.
*   **Primary (`#df8eff`):** Neon Purple. Used for key headlines and "active" energy states.
*   **Secondary (`#00eefc`):** Electric Cyan. Used for data points, secondary actions, and high-visibility accents.
*   **Tertiary (`#ff6b98`):** Hot Pink. Reserved for high-contrast "pop" elements and subtle highlights.

### The "No-Line" Rule
To maintain a premium feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries between content blocks must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a clear but sophisticated transition without the "boxed-in" feel of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked sheets of frosted obsidian. 
*   **Nesting:** Place a `surface-container-highest` card inside a `surface-container-low` section to create a natural "lift."
*   **The Glass & Gradient Rule:** For floating elements, use `surface-container` with a `backdrop-blur` of 12px-20px. Use subtle linear gradients (e.g., `primary` to `primary-container` at 15% opacity) to give containers a "soul" rather than a flat fill.

---

## 3. Typography

The typography system is a dialogue between the bold structure of **Plus Jakarta Sans** and the technical precision of **Space Grotesk**.

*   **Display & Headlines (Plus Jakarta Sans):** These are the "hero" elements. Use `display-lg` (3.5rem) with bold weights to command attention. Letter spacing should be tight (-0.02em) to feel editorial and modern.
*   **Titles & Body (Manrope):** Chosen for its exceptional readability on dark backgrounds. `body-lg` (1rem) provides a comfortable reading experience for technical blog content.
*   **Labels (Space Grotesk):** This font brings the "Tech" aesthetic. Use it for tags, metadata, and micro-copy. It should feel like a readout on a high-tech console.

---

## 4. Elevation & Depth

In this design system, light is the primary architect of space.

*   **The Layering Principle:** Depth is achieved by "stacking" surface tiers. Higher importance elements use `surface-bright` or `surface-container-highest` to physically appear closer to the user.
*   **Ambient Shadows:** Traditional black shadows are forbidden. Use extra-diffused shadows (blur: 24px+) with low-opacity colors derived from the surface (e.g., a 6% opacity purple shadow on a purple-themed card) to mimic ambient neon glow.
*   **The "Ghost Border" Fallback:** For interactive containment (like input fields), use the `outline-variant` token at 15% opacity. It should be felt more than seen.
*   **Glassmorphism:** Use `backdrop-filter: blur(10px)` on all floating components to allow the "Cosmic Grid" background to bleed through, integrating the UI into the environment.

---

## 5. Components

### Buttons
*   **Primary:** A gradient from `primary` to `secondary` with a 0.5rem (`DEFAULT`) corner radius. On hover, apply a `primary-dim` outer glow.
*   **Secondary (Outlined):** A "Ghost Border" using `secondary` at 40% opacity. Text uses `on-surface`.

### Glassmorphism Cards
*   **Base:** `surface-container-low` with 1rem (`lg`) roundedness.
*   **Detail:** A subtle 1px "inner-glow" stroke on the top and left edges using `outline-variant` to simulate light catching the edge of the glass.
*   **Interaction:** On hover, the background-blur increases and the card scales by 1.02x.

### Glowing Tags (Chips)
*   **Style:** Using `Space Grotesk` (`label-md`). 
*   **Visual:** Semi-transparent background of the accent color (e.g., `secondary` at 10% opacity) with a 1px `Ghost Border` of the same color. 
*   **Glow:** A 4px blur shadow of the accent color to make it appear self-illuminated.

### Navigation
*   **Global Header:** Fixed at the top with a `surface` background and `backdrop-filter: blur(20px)`. 
*   **Active State:** The active link uses a `secondary` (Cyan) underline or glow effect, matching the "Inicio" style in the reference.

### Input Fields
*   **Field:** `surface-container-lowest` background with a subtle `outline-variant` border.
*   **Focus State:** The border transitions to `secondary` with a soft cyan outer glow.

---

## 6. Do's and Don'ts

### Do
*   **DO** use ample vertical whitespace (`spacing-16` and `spacing-20`) to let the "Cosmic" background breathe.
*   **DO** utilize the "Grid" background element as a structural guide for text alignment to reinforce the tech theme.
*   **DO** ensure all text on neon backgrounds meets WCAG AA contrast ratios using the `on-primary` and `on-secondary` tokens.

### Don't
*   **DON'T** use 100% opaque borders. They break the "frosted glass" immersion.
*   **DON'T** use standard grey shadows. Shadows must always be tinted with the surrounding accent colors.
*   **DON'T** overcrowd the UI. If a section feels heavy, increase the spacing rather than adding more divider lines.