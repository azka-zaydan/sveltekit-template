# UI Style Guide

> **See also**: [`COMPONENTS.md`](COMPONENTS.md) for reusable component documentation

This document outlines the design system and styling guidelines for the project.

## Core Philosophy

**Radical Minimalism**

- If it doesn't serve a function, remove it
- Information density over white space
- Speed and utility over aesthetics
- "Ugly" is better than "Slow" or "Confusing"

## Colors

### Brand Colors

- **Primary Purple**: `#4b0082` (Tailwind `purple-700`) - Used for branding, primary actions, and active states.
- **Link Blue**: `#2563eb` (Tailwind `blue-600`) - Used for ALL hyperlinks.

### Semantic Colors

- **Success**: `green-700` - Verified, active, success messages
- **Warning**: `yellow-600` - Pending, caution messages
- **Danger**: `red-700` - Delete actions, error messages, flagged content
- **Info**: `blue-700` - Informational badges

### Neutrals

- **Text**: `gray-900` (primary), `gray-600` (secondary/metadata)
- **Borders**: `gray-300` (default), `gray-200` (subtle)
- **Backgrounds**: `white` (default), `gray-100` (hover states/subtle backgrounds)

## Typography

### Font Stack

Default system sans-serif stack: `ui-sans-serif, system-ui, sans-serif`.

### Scale

- **Logo**: `text-3xl` (only used once in header)
- **Page Titles**: `text-2xl font-bold`
- **Section Headers**: `text-xl font-bold`
- **Subsection Headers**: `text-lg font-bold`
- **Body Text**: `text-sm` (DEFAULT)
- **Metadata/Captions**: `text-xs text-gray-500`

### Links

- **Style**: Blue text (`text-blue-600`)
- **Hover**: Underline (`hover:underline`)
- **Visited**: Standard browser behavior (optional `visited:text-purple-800`)

## Components

### Buttons

- **Primary**: `bg-purple-700 text-white hover:bg-purple-800 rounded px-4 py-2`
- **Secondary**: `bg-white text-gray-900 border border-gray-400 hover:bg-gray-100 rounded px-4 py-2`
- **Danger**: `bg-red-700 text-white hover:bg-red-800 rounded px-4 py-2`
- **Link**: `text-blue-600 hover:underline bg-transparent p-0`

### Inputs

- **Base**: `w-full border border-gray-300 px-3 py-1 text-sm`
- **Focus**: `outline-none ring-1 ring-purple-700 border-purple-700`
- **Error**: `border-red-500 focus:ring-red-500`

### Cards/Containers

- **Border**: `border border-gray-300`
- **Background**: `bg-white`
- **Padding**: `p-4` (default)
- **Shadow**: NONE

### Badges

- **Base**: `border px-2 py-0.5 text-xs font-medium`
- **Variants**:
  - Default: `border-gray-300 text-gray-600 bg-gray-50`
  - Success: `border-green-300 text-green-700 bg-green-50`
  - Warning: `border-yellow-300 text-yellow-700 bg-yellow-50`
  - Danger: `border-red-300 text-red-700 bg-red-50`

## Layout Patterns

### Page Container

Max-width container centered on the page.

```html
<div class="max-w-6xl mx-auto px-4 py-6">
  <!-- Content -->
</div>
```

### Header

Simple top bar with logo and auth links.

```html
<header class="border-b border-gray-300 bg-white">
  <div class="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="text-purple-700 font-bold text-xl">logo</a>
    <!-- Nav -->
    <nav class="flex gap-4 text-sm">
      <a href="/post" class="text-blue-600 hover:underline">post</a>
      <a href="/account" class="text-blue-600 hover:underline">account</a>
    </nav>
  </div>
</header>
```

### Data Grids/Lists

Lists of items should use simple borders separators.

```html
<div class="space-y-2">
  <div class="border-b border-gray-200 py-2">Item 1</div>
  <div class="border-b border-gray-200 py-2">Item 2</div>
</div>
```

## Anti-Patterns (What NOT to do)

1. **No Drop Shadows**: Use borders (`border-gray-300`) to define depth/separation.
2. **No Large Border Radius**: Use standard `rounded` (0.25rem) or none. Avoid `rounded-xl`.
3. **No Gradients**: Use solid colors.
4. **No Animations**: UI should be instant and static.
5. **No "Modern" Whitespace**: Keep density high. `gap-2` or `gap-4` is usually enough.

## CSS Utilities (Tailwind)

We use Tailwind CSS v4.

### config

```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Standard Tailwind palette is sufficient
      }
    }
  }
}
```

### Custom Classes

Avoid `@apply`. Use utility classes directly in markup or extract components.

## Accessibility

- **Contrast**: Ensure text meets WCAG AA (gray-600+ on white).
- **Focus**: Always provide visible focus states (default browser ring or `ring-purple-700`).
- **Semantic HTML**: Use `<button>`, `<a>`, `<input>`, `<label>` correctly.
- **Keyboard Nav**: Ensure all interactive elements are tab-accessible.