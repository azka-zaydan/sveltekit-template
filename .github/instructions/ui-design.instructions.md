# UI Design & Components (Template)

> **See also**: [`/docs/UI_STYLE_GUIDE.md`](../../docs/UI_STYLE_GUIDE.md) and [`/docs/COMPONENTS.md`](../../docs/COMPONENTS.md)

**Note**: This template provides a basic UI design pattern. Customize according to your project needs.

## Design Philosophy

**Minimalism & Consistency** - Clean, functional design with consistent patterns.

### Core Principles

1. **Clean aesthetics**: Consistent shadows, borders, and spacing
2. **Simple borders**: Use `border-gray-300` for standard borders
3. **Readable links**: Use `text-blue-600 hover:underline` or project-specific colors
4. **Brand colors**: Define your primary brand color (e.g., `purple-700`)
5. **Appropriate text sizes**: Use Tailwind's text scale appropriately
6. **Consistent rounding**: Choose `rounded`, `rounded-md`, or `rounded-lg` and stick with it
7. **White or light backgrounds**: Clean, readable base

## Mandatory Styling Rules

### Links (Standard Pattern)

```html
<!-- ✅ RECOMMENDED -->
<a href="/path" class="text-blue-600 hover:underline">link text</a>

<!-- Or use your brand color -->
<a href="/path" class="text-purple-600 hover:text-purple-700">link text</a>
```

### Borders (ALWAYS)

```html
<!-- ✅ CORRECT -->
<div class="border border-gray-300">...</div>

<!-- ❌ WRONG -->
<div class="border border-gray-400">...</div>
<div class="border-2 border-purple-500">...</div>
<div class="rounded-lg shadow-md">...</div>
```

### Buttons

```html
<!-- ✅ PRIMARY -->
<button class="px-4 py-2 bg-purple-700 text-white hover:bg-purple-800 rounded text-sm">
	submit
</button>

<!-- ✅ SECONDARY -->
<button class="px-4 py-2 border border-gray-400 bg-white hover:bg-gray-100 text-gray-900 text-sm">
	cancel
</button>

<!-- ❌ WRONG -->
<button class="px-6 py-3 bg-gradient-to-r from-purple-500 rounded-xl shadow-lg">
	Fancy Button
</button>
```

### Form Inputs

```html
<!-- ✅ CORRECT -->
<input class="w-full px-3 py-1 border border-gray-300 text-sm" />

<!-- ❌ WRONG -->
<input class="rounded-lg focus:ring-4 focus:ring-purple-500 shadow-sm" />
```

### Text Sizes

```html
<!-- ✅ DEFAULT SIZES -->
text-3xl - Logo only text-2xl - Page titles text-xl - Section headers text-lg - Subsection headers
text-sm - DEFAULT for body text, buttons, inputs text-xs - Metadata, captions

<!-- ❌ WRONG -->
<p class="text-base">Normal paragraph</p>
<!-- Too large -->
<button class="text-lg">Submit</button>
<!-- Too large -->
```

## Component Usage

### ALWAYS Use These Components

Located in `src/lib/components/`:

**UI Components** (`ui/`):

- `Button.svelte` - All buttons
- `Input.svelte` - All form inputs
- `Card.svelte` - Bordered containers
- `Badge.svelte` - Status labels

**Layout Components** (`layout/`):

- `Navigation.svelte` - Site header
- `Container.svelte` - Max-width containers
- `PageHeader.svelte` - Page titles with breadcrumbs

### Button Component

```svelte
<script>
	import Button from '$lib/components/ui/Button.svelte';
</script>

<!-- Primary action -->
<Button variant="primary">Submit</Button>

<!-- Secondary action -->
<Button variant="secondary">Cancel</Button>

<!-- Dangerous action -->
<Button variant="danger">Delete</Button>

<!-- Link-style button -->
<Button variant="link">Learn More</Button>
```

**Variants**:

- `primary` - Purple background, main actions
- `secondary` - White with border, alternative actions
- `danger` - Red background, destructive actions
- `link` - Blue text with underline, tertiary actions

### Input Component

```svelte
<script>
	import Input from '$lib/components/ui/Input.svelte';

	let email = $state('');
</script>

<!-- With label -->
<Input label="Email address" type="email" bind:value={email} placeholder="you@example.com" />

<!-- With error -->
<Input label="Email address" type="email" bind:value={email} error="Please enter a valid email" />
```

### Card Component

```svelte
<script>
	import Card from '$lib/components/ui/Card.svelte';
</script>

<!-- Default (with border) -->
<Card>
	<h2>Content</h2>
</Card>

<!-- Without border -->
<Card border={false}>
	<p>Borderless</p>
</Card>

<!-- Custom padding -->
<Card padding="lg">
	<p>Large padding</p>
</Card>
```

### Navigation Component

```svelte
<script>
	import Navigation from '$lib/components/layout/Navigation.svelte';
</script>

<!-- Simple header with logo and links -->
<Navigation />
```

Auto-displays:

- Purple "craigslist" logo
- User greeting (if logged in)
- Login/signup links (if not logged in)
- "post to classifieds" link
- Logout button with loading state

## Common Patterns

### Page Layout

```svelte
<script>
	import Navigation from '$lib/components/layout/Navigation.svelte';
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<Navigation />

		<!-- Page content -->
		<main>
			<!-- Your content here -->
		</main>
	</div>
</div>
```

### Form Layout

```svelte
<script>
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let email = $state('');
	let password = $state('');
</script>

<div class="max-w-md mx-auto">
	<h1 class="text-2xl font-bold mb-6">Sign in to your account</h1>

	<form class="space-y-4">
		<Input label="Email address" type="email" bind:value={email} />

		<Input label="Password" type="password" bind:value={password} />

		<Button type="submit" class="w-full">Sign in</Button>
	</form>

	<p class="mt-4 text-sm text-gray-600">
		Don't have an account?
		<a href="/register" class="text-blue-600 hover:underline">Create one</a>
	</p>
</div>
```

### List Display

```svelte
<div class="space-y-2">
	{#each listings as listing (listing.id)}
		<div class="py-2 border-b border-gray-200">
			<a href="/listings/{listing.id}" class="text-blue-600 hover:underline">
				{listing.title}
			</a>
			<div class="text-sm text-gray-600">
				<span class="font-semibold">${listing.price}</span>
				<span class="mx-2">·</span>
				<span>{listing.location.city}</span>
				<span class="mx-2">·</span>
				<span>{formatDate(listing.createdAt)}</span>
			</div>
		</div>
	{/each}
</div>
```

### Breadcrumbs

```svelte
<nav class="mb-4 text-sm text-gray-600">
	<a href="/" class="text-blue-600 hover:underline">home</a>
	<span class="mx-2">›</span>
	<a href="/categories/electronics" class="text-blue-600 hover:underline"> electronics </a>
	<span class="mx-2">›</span>
	<span class="text-gray-900">smartphones</span>
</nav>
```

### Grid Layout

```svelte
<!-- Category grid (3 columns on desktop) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
	{#each categories as category (category.id)}
		<div>
			<h2 class="font-bold text-lg mb-2">{category.name}</h2>
			<ul class="space-y-1">
				{#each category.children as child (child.id)}
					<li>
						<a href="/categories/{child.slug}" class="text-sm text-blue-600 hover:underline">
							{child.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
```

## Anti-Patterns (NEVER DO THIS)

### ❌ Modern Styling

```html
<!-- NO rounded-lg or rounded-xl -->
<div class="rounded-lg shadow-xl">...</div>  ❌

<!-- NO shadows -->
<div class="shadow-md">...</div>  ❌

<!-- NO transitions/animations -->
<button class="transition-all duration-300 transform hover:scale-105">...</button>  ❌

<!-- NO gradients -->
<div class="bg-gradient-to-r from-purple-500 to-blue-500">...</div>  ❌

<!-- NO fancy focus rings -->
<input class="focus:ring-4 focus:ring-purple-500">...</input>  ❌
```

### ❌ Wrong Colors

```html
<!-- NO colored text except links/errors -->
<p class="text-purple-600">Regular text</p>
❌

<!-- NO colored borders except errors -->
<div class="border-purple-500">...</div>
❌

<!-- NO background colors -->
<div class="bg-purple-50">...</div>
❌
```

### ❌ Wrong Text Sizes

```html
<!-- NO large default text -->
<p class="text-lg">Body paragraph</p>
❌ <button class="text-base">Submit</button> ❌

<!-- NO excessive font weights -->
<span class="font-semibold">Normal text</span> ❌
```

## Writing Style

### Text Case

- **Lowercase preferred**: "post to classifieds", "my account", "log in"
- **Title Case rare**: Only for proper nouns or page titles
- **UPPERCASE never**: Don't use unless absolutely necessary

### Placeholders

```html
<!-- ✅ CORRECT -->
<input placeholder="search craigslist" />
<input placeholder="you@example.com" />
<input placeholder="enter your email..." />

<!-- ❌ WRONG -->
<input placeholder="Search for items, categories, locations..." />
<input placeholder="Please enter your email address" />
```

## Color Usage Guide

### When to Use Each Color

**Purple (`purple-700`)** - ONLY for:

- "craigslist" logo/brand
- Primary action buttons
- Active state indicators (rare)

**Blue (`blue-600`)** - ALWAYS for:

- ALL hyperlinks
- Link-style buttons
- Breadcrumb links

**Red (`red-600`, `red-500`)** - ONLY for:

- Error messages
- Error input borders
- Danger buttons (delete, remove)

**Gray** - Everything else:

- Borders: `gray-300`
- Text: `gray-900` (primary), `gray-700` (secondary), `gray-600` (metadata)
- Backgrounds: `gray-100` (very subtle)
- Separators: `gray-200`

## Spacing Guidelines

```css
/* Section spacing */
mb-8, mt-8  - Between major sections
mb-6, mt-6  - Between medium sections
mb-4, mt-4  - Between small sections
mb-2, mt-2  - Tight spacing

/* List spacing */
space-y-1  - Navigation links
space-y-2  - Listing items
space-y-4  - Form fields

/* Inline spacing */
gap-2      - Tight buttons
gap-3      - Normal elements
gap-4      - Form groups
gap-8      - Wide sections

/* Padding */
px-3 py-1  - Inputs, small buttons
px-4 py-2  - Normal buttons
p-4        - Card padding (default)
```

## Validation Checklist

Before committing UI changes, verify:

- [ ] All links are `text-blue-600 hover:underline`
- [ ] All borders are `border-gray-300`
- [ ] No shadows (`shadow-*`)
- [ ] No rounded-lg or rounded-xl
- [ ] No gradients
- [ ] No transitions or animations
- [ ] Text is `text-sm` (unless heading)
- [ ] Buttons use component variants
- [ ] Forms use Input component
- [ ] No colored backgrounds (except button states)
- [ ] Spacing is minimal and functional

## Examples

### ✅ GOOD - Retro Style

```svelte
<div class="max-w-6xl mx-auto px-4 py-6">
	<h1 class="text-2xl font-bold mb-6">My Listings</h1>

	<div class="space-y-2">
		{#each listings as listing (listing.id)}
			<div class="py-2 border-b border-gray-200">
				<a href="/listings/{listing.id}" class="text-blue-600 hover:underline">
					{listing.title}
				</a>
				<div class="text-sm text-gray-600">
					<span class="font-semibold">${listing.price}</span>
					<span class="mx-2">·</span>
					<span>{listing.location}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
```

### ❌ WRONG - Modern Style

```svelte
<div class="container mx-auto px-6 py-12">
	<h1
		class="text-4xl font-extrabold mb-8 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent"
	>
		My Listings
	</h1>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each listings as listing (listing.id)}
			<div
				class="rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105"
			>
				<a
					href="/listings/{listing.id}"
					class="text-lg font-semibold text-purple-600 hover:text-purple-700"
				>
					{listing.title}
				</a>
				<div class="text-base text-gray-500 mt-2">
					<span class="font-bold text-green-600">${listing.price}</span>
					<span class="mx-2">•</span>
					<span>{listing.location}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
```

## When in Doubt

**Ask yourself**:

1. "Does this look like it could be from 1999?" - If no, simplify it
2. "Would this look out of place on YourApp?" - If yes, remove it
3. "Can I remove this style and it still works?" - Then remove it

**Remember**: YourApp's design is legendary because it's timeless, functional, and gets out of the way. Embrace the minimalism.
