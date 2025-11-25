# UI Style Guide - YourApp Retro Aesthetic

> **Philosophy**: Embrace the legendary retro old-school YourApp vibe - functional, minimal, and timeless. No modern flourishes, just classic web design that works.

## Design Principles

### 1. **Radical Minimalism**

- No gradients, no shadows (except when absolutely necessary)
- No fancy animations or transitions
- Function over form, always
- If it doesn't serve a purpose, remove it

### 2. **Classic Typography**

- Small, readable text (`text-sm` is default)
- Black text on white background
- Classic blue links (`text-blue-600 hover:underline`)
- Purple accents for branding (`purple-700`)

### 3. **Simple Borders**

- Use `border-gray-300` for everything
- No rounded corners on most elements
- Minimal `rounded` (not `rounded-lg`) when needed
- Tables and grids with basic border separators

### 4. **Utilitarian Layout**

- Dense information display
- Multi-column layouts on desktop
- Simple stacked layout on mobile
- Maximum content, minimum chrome

## Color Palette

### Primary Colors

```css
/* Purple - Brand color */
purple-700  (#7e22ce)  - Primary brand color, main headings
purple-800  (#6b21a8)  - Hover states on purple buttons
purple-600  (#9333ea)  - Lighter purple accents
purple-50   (#faf5ff)  - Very light purple backgrounds

/* Blue - Links */
blue-600    (#2563eb)  - All hyperlinks
blue-700    (#1d4ed8)  - Visited/active links (optional)

/* Red - Errors & Warnings */
red-600     (#dc2626)  - Error text
red-700     (#b91c1c)  - Error button hover
red-50      (#fef2f2)  - Error backgrounds
red-500     (#ef4444)  - Error borders

/* Gray - Structure */
gray-900    (#111827)  - Primary text
gray-700    (#374151)  - Secondary text
gray-600    (#4b5563)  - Tertiary text
gray-400    (#9ca3af)  - Borders (secondary)
gray-300    (#d1d5db)  - Borders (primary)
gray-200    (#e5e7eb)  - List separators
gray-100    (#f3f4f6)  - Subtle backgrounds
```

### Usage Rules

- **Links**: ALWAYS `text-blue-600 hover:underline`
- **Borders**: ALWAYS `border-gray-300`
- **Primary actions**: `bg-purple-700 text-white hover:bg-purple-800`
- **Errors**: `text-red-600` or `border-red-500`
- **Body text**: Default black or `text-gray-900`

## Typography

### Text Sizes

```css
text-3xl    - Main page title (craigslist logo)
text-2xl    - Page headings
text-xl     - Section headings
text-lg     - Subsection headings
text-base   - Large body text (rare)
text-sm     - DEFAULT - All body text, inputs, buttons
text-xs     - Captions, metadata, tiny labels
```

### Font Weights

```css
font-bold      - Page titles, section headers
font-semibold  - Links, important actions
font-medium    - Labels, form fields (rare)
font-normal    - DEFAULT - Everything else
```

### Text Colors

```css
text-gray-900  - Primary content
text-gray-700  - User greetings, secondary content
text-gray-600  - Metadata, timestamps, view counts
text-blue-600  - Links (with hover:underline)
text-purple-700 - Brand elements
text-red-600   - Error messages
```

## Component Patterns

### Buttons

**Primary Button** (main actions):

```html
<button class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 rounded text-sm">
	submit
</button>
```

**Secondary Button** (alternative actions):

```html
<button class="px-4 py-2 border border-gray-400 bg-white hover:bg-gray-100 text-gray-900 text-sm">
	cancel
</button>
```

**Danger Button** (destructive actions):

```html
<button class="px-4 py-2 bg-red-700 text-white hover:bg-red-800 rounded text-sm">delete</button>
```

**Link Button** (tertiary actions):

```html
<button class="text-blue-600 hover:underline text-sm">learn more</button>
```

### Form Inputs

**Text Input**:

```html
<input
	type="text"
	class="w-full px-3 py-1 border border-gray-300 text-sm"
	placeholder="enter text..."
/>
```

**Input with Label**:

```html
<label class="block mb-4">
	<span class="block text-sm font-medium mb-1">Email address</span>
	<input type="email" class="w-full px-3 py-1 border border-gray-300 text-sm" />
</label>
```

**Input with Error**:

```html
<input type="text" class="w-full px-3 py-1 border border-red-500 text-sm" />
<span class="block text-sm text-red-600 mt-1">This field is required</span>
```

**Select Dropdown**:

```html
<select class="px-3 py-1 border border-gray-300 text-sm">
	<option value="">select location...</option>
	<option value="sf">San Francisco</option>
</select>
```

### Cards & Containers

**Simple Card** (with border):

```html
<div class="border border-gray-300 bg-white p-4">Content here</div>
```

**Borderless Section**:

```html
<div class="bg-white p-4">Content here</div>
```

**Section Separator**:

```html
<div class="border-t border-gray-300 pt-4 mt-4">New section</div>
```

### Lists & Navigation

**Link List** (categories):

```html
<ul class="space-y-1">
	<li>
		<a href="/categories/electronics" class="text-sm text-blue-600 hover:underline">
			electronics
		</a>
	</li>
	<li>
		<a href="/categories/furniture" class="text-sm text-blue-600 hover:underline"> furniture </a>
	</li>
</ul>
```

**Data List** (listings):

```html
<div class="space-y-2">
	<div class="py-2 border-b border-gray-200">
		<a href="/listings/1" class="text-blue-600 hover:underline">Item Title</a>
		<div class="text-sm text-gray-600">
			<span class="font-semibold">$50</span>
			<span class="mx-2">·</span>
			<span>San Francisco</span>
		</div>
	</div>
</div>
```

**Breadcrumbs**:

```html
<nav class="text-sm text-gray-600 mb-4">
	<a href="/" class="text-blue-600 hover:underline">home</a>
	<span class="mx-2">›</span>
	<a href="/categories/electronics" class="text-blue-600 hover:underline">electronics</a>
	<span class="mx-2">›</span>
	<span class="text-gray-900">smartphones</span>
</nav>
```

### Header & Navigation

**Page Header** (craigslist style):

```html
<header class="mb-6 pb-4 border-b border-gray-300">
	<div class="flex items-center justify-between">
		<a href="/" class="text-3xl font-bold text-purple-700">craigslist</a>
		<div class="text-sm">
			<a href="/login" class="text-blue-600 hover:underline">log in</a>
			<span class="mx-2">|</span>
			<a href="/register" class="text-blue-600 hover:underline">sign up</a>
			<span class="mx-2">|</span>
			<a href="/listings/new" class="text-blue-600 hover:underline font-semibold">
				post to classifieds
			</a>
		</div>
	</div>
</header>
```

**Section Header**:

```html
<h2 class="font-bold text-xl mb-4 text-gray-900">recent posts</h2>
```

**Subsection Header**:

```html
<h3 class="font-bold text-lg mb-2 text-gray-900">Electronics</h3>
```

### Badges & Labels

**Status Badge**:

```html
<span class="inline-block px-2 py-0.5 text-xs border border-gray-400 bg-gray-100 text-gray-800">
	active
</span>
```

**Success Badge**:

```html
<span class="inline-block px-2 py-0.5 text-xs border border-green-600 bg-green-50 text-green-800">
	verified
</span>
```

**Warning Badge**:

```html
<span
	class="inline-block px-2 py-0.5 text-xs border border-yellow-600 bg-yellow-50 text-yellow-800"
>
	pending
</span>
```

## Layout Guidelines

### Page Structure

```html
<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<!-- Header with logo and navigation -->
		<header class="mb-6 pb-4 border-b border-gray-300">
			<!-- Header content -->
		</header>

		<!-- Main content -->
		<main>
			<!-- Page content -->
		</main>
	</div>
</div>
```

### Grid Layouts

```html
<!-- Category grid (3 columns on desktop) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
	<div>Column 1</div>
	<div>Column 2</div>
	<div>Column 3</div>
</div>

<!-- Listing detail (2/3 - 1/3 split) -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
	<div class="lg:col-span-2">Main content</div>
	<div>Sidebar</div>
</div>
```

### Spacing

```css
/* Vertical spacing between sections */
mb-8, mt-8, py-8  - Major sections
mb-6, mt-6, py-6  - Medium sections
mb-4, mt-4, py-4  - Small sections
mb-2, mt-2, py-2  - Tight spacing

/* List spacing */
space-y-1  - Tight lists (navigation links)
space-y-2  - Normal lists (listing items)
space-y-4  - Loose lists (form fields)

/* Horizontal spacing */
gap-2   - Tight inline elements
gap-3   - Normal inline elements
gap-4   - Form inputs
gap-6   - Major sections
gap-8   - Wide sections
```

## Anti-Patterns (DON'T DO THIS)

### ❌ Modern Flourishes

```html
<!-- NO rounded-lg or rounded-xl -->
<div class="rounded-lg shadow-xl">
	❌

	<!-- NO shadows unless critical -->
	<div class="shadow-md">
		❌

		<!-- NO transitions or animations -->
		<button class="transition-all duration-300">
			❌

			<!-- NO gradient backgrounds -->
			<div class="bg-gradient-to-r from-purple-500">❌</div>
		</button>
	</div>
</div>
```

### ❌ Fancy Typography

```html
<!-- NO large default text -->
<p class="text-lg">Body text</p>
❌

<!-- NO fancy font weights everywhere -->
<span class="font-semibold">Normal text</span> ❌

<!-- NO colored text except links/errors -->
<p class="text-purple-600">Normal paragraph</p>
❌
```

### ❌ Over-styled Components

```html
<!-- NO fancy hover states -->
<a class="transform hover:scale-105">
	❌

	<!-- NO complex focus rings -->
	<input class="focus:ring-4 focus:ring-purple-500" /> ❌

	<!-- NO pill-shaped badges -->
	<span class="rounded-full px-4 py-2"> ❌</span></a
>
```

## Accessibility

While maintaining the retro aesthetic, ensure:

1. **Color Contrast**: All text meets WCAG AA standards
2. **Focus States**: Keyboard navigation works (browser defaults are fine)
3. **Labels**: All form inputs have proper labels
4. **Alt Text**: All images have descriptive alt attributes
5. **Semantic HTML**: Use proper heading hierarchy (h1 → h2 → h3)

## Mobile Responsive

### Breakpoints

```css
sm:   640px   - Small tablets
md:   768px   - Medium tablets
lg:   1024px  - Laptops
xl:   1280px  - Desktops
```

### Mobile-First Approach

```html
<!-- Stack on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
	<!-- Hide on mobile, show on desktop -->
	<div class="hidden lg:block">Desktop only</div>

	<!-- Full width on mobile, fixed on desktop -->
	<div class="w-full lg:max-w-md"></div>
</div>
```

## Example Pages

### Homepage

- Large logo
- Location selector + search bar
- 3-column category grid
- Recent listings list at bottom
- Minimal header with login/signup links

### Listing Detail

- Simple breadcrumb navigation
- Title and price (big and bold)
- Category, location, date metadata
- Image gallery (simple prev/next)
- Description in plain text
- Contact info (revealed on click)
- Sidebar with user actions

### Form Pages (Login/Register)

- Centered narrow form (max-w-md)
- Simple input fields
- Error messages in red below fields
- Single submit button
- Link to alternative action

## Component Library

### Button.svelte

- Variants: `primary`, `secondary`, `danger`, `link`
- Sizes: `sm`, `md`, `lg`
- NO fancy styling, just functional

### Input.svelte

- Optional label
- Error state support
- Full-width by default
- Simple border, no focus ring

### Card.svelte

- Border or borderless
- Padding options: `none`, `sm`, `md`, `lg`
- NO shadows

### Badge.svelte

- Variants: `default`, `success`, `warning`, `danger`, `info`
- Small bordered rectangles
- NO rounded pills

### Navigation.svelte

- Simple header with logo + links
- Pipe-separated navigation
- Blue hyperlinks
- NO navigation bar background

### Container.svelte

- Max-width containers
- Responsive padding
- NO extra styling

### PageHeader.svelte

- Breadcrumb support
- Simple text title
- Optional action slot

## Writing Style

### Text Case

- **Lowercase preferred**: "post to classifieds", "my account", "sign in"
- **Title Case exceptions**: Page titles, proper nouns
- **UPPERCASE rare**: Maybe for emphasis in rare cases

### Wording

- Direct and functional: "log in" not "Sign In To Your Account"
- Concise: "post" not "Create New Listing"
- User-focused: "my account" not "User Dashboard"

### Placeholders

- Lowercase, helpful: `"enter your email..."`
- Concise: `"search craigslist"` not `"Search for items, categories, locations..."`

## Summary

**Remember**: If it looks like it could be from 1999, you're on the right track. YourApp's design is legendary precisely because it doesn't try to be modern - it's timeless, functional, and gets out of the way.

**Key Mantras**:

1. "Does this serve a function?" - If no, remove it
2. "Would this look out of place in 1999?" - If yes, simplify it
3. "Can I remove a style and it still works?" - Then remove it
4. "Blue links, purple branding, white background" - Always

When in doubt, look at the actual YourApp website and match that energy.
