# Component Documentation

> **See also**: [`UI_STYLE_GUIDE.md`](UI_STYLE_GUIDE.md) for design principles and patterns

Complete reference for all reusable UI and layout components in the project.

## Component Philosophy

All components follow the project's **design aesthetic**:

- Minimal styling
- Functional design
- No modern flourishes
- Classic web patterns

## Component Organization

Components are organized hierarchically:

- **`ui/common/`**: Base/reusable components (forms, display, actions)
- **`ui/layout/`**: Layout components

## Common UI Components (`src/lib/components/ui/common/`)

### Button.svelte (`ui/common/actions/Button.svelte`)

Simple, functional button component with variant support.

**Props**:

```typescript
interface ButtonProps {
	variant?: 'primary' | 'secondary' | 'danger' | 'link';
	size?: 'sm' | 'md' | 'lg';
	class?: string;
	disabled?: boolean;
	type?: 'button' | 'submit' | 'reset';
	onclick?: (event: MouseEvent) => void;
}
```

**Usage**:

```svelte
<script>
	import Button from '$ui/common/actions/Button.svelte';
	// Or use index export:
	// import { Button } from '$components';
</script>

<!-- Primary button -->
<Button variant="primary">Submit</Button>

<!-- Secondary button -->
<Button variant="secondary">Cancel</Button>

<!-- Danger button -->
<Button variant="danger">Delete</Button>

<!-- Link-style button -->
<Button variant="link">Learn More</Button>

<!-- With click handler -->
<Button onclick={() => console.log('clicked')}>Click Me</Button>

<!-- Disabled -->
<Button disabled>Can't Click</Button>
```

**Styling**:

- `primary`: Purple background (`bg-purple-700`), white text
- `secondary`: White background with border, gray text
- `danger`: Red background (`bg-red-700`), white text
- `link`: Blue text with underline on hover (no background)

---

### Select.svelte (`ui/common/forms/Select.svelte`)

Generic select dropdown with error support and flexible options.

**Props**:

```typescript
interface SelectProps {
	label?: string;
	error?: string;
	required?: boolean;
	class?: string;
	name?: string;
	id?: string;
	value?: string;
	options?: Array<{ value: string; label: string }>;
	disabled?: boolean;
}
```

**Usage**:

```svelte
<script>
	import { Select } from '$lib/components';

	let selectedValue = $state('');
</script>

<!-- With options array -->
<Select
	label="Choose an option"
	bind:value={selectedValue}
	options={[
		{ value: 'opt1', label: 'Option 1' },
		{ value: 'opt2', label: 'Option 2' }
	]}
	required
/>

<!-- With error -->
<Select label="Location" bind:value={selectedValue} error="Please select a location" />
```

---

### Textarea.svelte (`ui/common/forms/Textarea.svelte`)

Multiline text input with label, validation error support, and character counting.

**Props**:

```typescript
interface TextareaProps {
	label?: string;
	error?: string;
	required?: boolean;
	name?: string;
	value?: string;
	placeholder?: string;
	rows?: number;
	maxlength?: number;
}
```

**Usage**:

```svelte
<script>
	import { Textarea } from '$lib/components';

	let description = $state('');
</script>

<Textarea label="Description" bind:value={description} required maxlength={500} rows={8} />
```

**Features**:

- Character counter if `maxlength` is set
- Shows validation errors below field
- Auto-resizes based on `rows` prop

---

### FormError.svelte (`ui/common/forms/FormError.svelte`)

Simple, consistent error message display for forms.

**Props**:

```typescript
interface FormErrorProps {
	error?: string;
}
```

**Usage**:

```svelte
<script>
	import { FormError } from '$lib/components';
</script>

<FormError error={errors?.fieldName} />
```

---

### Input.svelte (`ui/common/forms/Input.svelte`)

Simple form input with optional label and error support.

**Props**:

```typescript
interface InputProps {
	label?: string;
	error?: string;
	fullWidth?: boolean;
	class?: string;
	type?: string;
	value?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	name?: string;
	autocomplete?: string;
}
```

**Usage**:

```svelte
<script>
	import Input from '$ui/common/forms/Input.svelte';
	// Or use index export:
	// import { Input } from '$components';

	let email = $state('');
</script>

<!-- Basic input -->
<Input type="email" placeholder="you@example.com" bind:value={email} />

<!-- With label -->
<Input label="Email Address" type="email" placeholder="you@example.com" bind:value={email} />

<!-- With error -->
<Input label="Email Address" type="email" bind:value={email} error="Please enter a valid email" />

<!-- Not full width -->
<Input type="text" placeholder="Search..." fullWidth={false} />
```

**Styling**:

- Simple border (`border-gray-300`)
- Red border on error (`border-red-500`)
- Minimal padding (`px-3 py-1`)
- Small text (`text-sm`)

---

### Card.svelte (`ui/common/display/Card.svelte`)

Simple container with optional border and padding.

**Props**:

```typescript
interface CardProps {
	padding?: 'none' | 'sm' | 'md' | 'lg';
	border?: boolean;
	class?: string;
}
```

**Usage**:

```svelte
<script>
	import Card from '$ui/common/display/Card.svelte';
	// Or use index export:
	// import { Card } from '$components';
</script>

<!-- Default card (medium padding, with border) -->
<Card>
	<h2>Title</h2>
	<p>Content here</p>
</Card>

<!-- Borderless card -->
<Card border={false}>
	<p>No border</p>
</Card>

<!-- Different padding -->
<Card padding="lg">
	<p>Large padding</p>
</Card>

<!-- No padding (for custom layouts) -->
<Card padding="none">
	<img src="/image.jpg" alt="Full width image" />
</Card>
```

**Styling**:

- White background
- Optional border (`border-gray-300`)
- No rounded corners
- No shadows

---

### Badge.svelte (`ui/common/display/Badge.svelte`)

Small label/tag component for status or categories.

**Props**:

```typescript
interface BadgeProps {
	variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
	class?: string;
}
```

**Usage**:

```svelte
<script>
	import Badge from '$ui/common/display/Badge.svelte';
	// Or use index export:
	// import { Badge } from '$components';
</script>

<!-- Default badge -->
<Badge>Active</Badge>

<!-- Success badge -->
<Badge variant="success">Verified</Badge>

<!-- Warning badge -->
<Badge variant="warning">Pending</Badge>

<!-- Danger badge -->
<Badge variant="danger">Flagged</Badge>

<!-- Info badge -->
<Badge variant="info">Featured</Badge>
```

**Styling**:

- Small text (`text-xs`)
- Bordered rectangles (no rounded pills)
- Colored borders and backgrounds
- Minimal padding (`px-2 py-0.5`)

---

## Layout Components (`src/lib/components/ui/layout/`)

### Navigation.svelte

Site-wide header with logo and navigation links.

**Props**: None (uses page store for user data)

**Usage**:

```svelte
<script>
	import Navigation from '$ui/layout/Navigation.svelte';
	// Or use index export:
	// import { Navigation } from '$components';
</script>

<Navigation />
```

**Features**:

- Displays logo as link to home
- Shows user greeting if logged in
- Login/signup links for guests
- Action link (e.g., "post")
- Logout button with loading state

**Styling**:

- Simple border-bottom separator
- Purple logo text
- Blue links with underline on hover
- No navigation bar background

---

### Container.svelte

Responsive max-width container with consistent padding.

**Props**:

```typescript
interface ContainerProps {
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

**Usage**:

```svelte
<script>
	import Container from '$ui/layout/Container.svelte';
	// Or use index export:
	// import { Container } from '$components';
</script>

<!-- Default (lg) -->
<Container>
	<h1>Page Content</h1>
</Container>

<!-- Narrow container -->
<Container maxWidth="sm">
	<form>Login form</form>
</Container>

<!-- Wide container -->
<Container maxWidth="xl">
	<div>Full dashboard</div>
</Container>

<!-- Full width -->
<Container maxWidth="full">
	<div>Edge-to-edge</div>
</Container>
```

**Max Widths**:

- `sm`: 672px (2xl) - Forms, narrow content
- `md`: 896px (4xl) - Articles
- `lg`: 1152px (6xl) - Default
- `xl`: 1280px (7xl) - Wide layouts
- `full`: No max-width

---

### PageHeader.svelte

Page title with optional breadcrumb navigation.

**Props**:

```typescript
interface PageHeaderProps {
	title: string;
	breadcrumbs?: Array<{ href?: string; label: string }>;
}
```

**Usage**:

```svelte
<script>
	import PageHeader from '$ui/layout/PageHeader.svelte';
	// Or use index export:
	// import { PageHeader } from '$components';
</script>

<!-- Simple header -->
<PageHeader title="My Dashboard" />

<!-- With breadcrumbs -->
<PageHeader
	title="iPhone 13 Pro"
	breadcrumbs={[
		{ href: '/', label: 'home' },
		{ href: '/items', label: 'items' },
		{ label: 'detail' }
	]}
/>

<!-- With action button (using snippet) -->
<PageHeader title="My Items">
	{#snippet children()}
		<Button href="/items/new">Create Item</Button>
	{/snippet}
</PageHeader>
```

**Styling**:

- Simple text-based breadcrumbs
- Blue links with underline
- Breadcrumb separator: `›`
- Title in `text-2xl font-bold`

---

## Component Composition Examples

### Login Form

```svelte
<script>
	import Input from '$ui/common/forms/Input.svelte';
	import Button from '$ui/common/actions/Button.svelte';
	import Container from '$ui/layout/Container.svelte';
	// Or use index exports:
	// import { Input, Button, Container } from '$components';

	let email = $state('');
	let password = $state('');
</script>

<Container maxWidth="sm">
	<h1 class="text-2xl font-bold mb-6">Sign in to your account</h1>

	<form class="space-y-4">
		<Input
			label="Email address"
			type="email"
			bind:value={email}
			placeholder="you@example.com"
			required
		/>

		<Input label="Password" type="password" bind:value={password} placeholder="••••••••" required />

		<Button type="submit" class="w-full">Sign in</Button>
	</form>

	<p class="mt-4 text-sm text-gray-600">
		Don't have an account?
		<a href="/register" class="text-blue-600 hover:underline">Create one</a>
	</p>
</Container>
```

### Dashboard Layout

```svelte
<script>
	import Navigation from '$ui/layout/Navigation.svelte';
	import PageHeader from '$ui/layout/PageHeader.svelte';
	import Container from '$ui/layout/Container.svelte';
	import Button from '$ui/common/actions/Button.svelte';
	// Or use index exports:
	// import { Navigation, PageHeader, Container, Button } from '$components';
</script>

<Navigation />

<Container>
	<PageHeader title="My Dashboard">
		{#snippet children()}
			<Button href="/items/new">Create Item</Button>
		{/snippet}
	</PageHeader>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
		<!-- Dashboard content -->
	</div>
</Container>
```

## Common Patterns

### Form Layout

```svelte
<form class="space-y-4">
	<Input label="Field 1" type="text" />
	<Input label="Field 2" type="text" />
	<Input label="Field 3" type="text" />

	<div class="flex gap-2">
		<Button type="submit">Submit</Button>
		<Button variant="secondary">Cancel</Button>
	</div>
</form>
```

### List Display

```svelte
<div class="space-y-2">
	{#each items as item (item.id)}
		<div class="py-2 border-b border-gray-200">
			<a href="/items/{item.id}" class="text-blue-600 hover:underline">
				{item.title}
			</a>
			<div class="text-sm text-gray-600">
				{item.description}
			</div>
		</div>
	{/each}
</div>
```

### Action Buttons

```svelte
<div class="flex gap-2">
	<Button variant="primary">Save</Button>
	<Button variant="secondary">Cancel</Button>
	<Button variant="danger">Delete</Button>
</div>
```

### Status Badges

```svelte
<div class="flex gap-2">
	<Badge variant="success">Active</Badge>
	<Badge variant="warning">Pending Review</Badge>
	<Badge variant="info">Featured</Badge>
</div>
```

## Svelte 5 Patterns

All components use Svelte 5 runes:

### Props

```svelte
<script lang="ts">
	let { variant = 'primary', size = 'md', children } = $props();
</script>
```

### Children

```svelte
<button>
	{@render children?.()}
</button>
```

### Reactive State (in parent components)

```svelte
<script lang="ts">
	let value = $state('');
	let isValid = $derived(value.length > 0);
</script>

<Input bind:value />
{#if !isValid}
	<p class="text-red-600">Field is required</p>
{/if}
```

## Accessibility

All components follow basic accessibility practices:

1. **Semantic HTML**: Proper button/input elements
2. **Labels**: Form inputs have associated labels
3. **ARIA**: Where needed (aria-label, aria-disabled)
4. **Keyboard**: All interactive elements are keyboard accessible
5. **Focus**: Browser default focus states (no custom styling)

## Best Practices

### DO ✅

- Use components consistently across the app
- Leverage variant props for different use cases
- Compose components together for complex layouts
- Pass custom classes when needed for spacing
- Use proper semantic HTML structure

### DON'T ❌

- Override component styles inline
- Create duplicate components for slight variations
- Add fancy animations or transitions
- Use shadows or gradients
- Create rounded pill shapes

## Migration Guide

If updating from old components:

1. **Remove shadow props** - `Card` no longer has `shadow` prop, use `border` instead
2. **Update Button variants** - `ghost` → `link`, styling changed
3. **Simplify Input** - No focus rings, simpler borders
4. **Update Badge** - No rounded-full, now bordered rectangles
5. **Navigation** - Now simpler header, not full nav bar

## See Also

- **[UI Style Guide](UI_STYLE_GUIDE.md)** - Design principles and patterns
- **[Development Guide](DEVELOPMENT.md)** - Svelte 5 usage patterns
- **[Svelte 5 Instructions](.github/instructions/svelte5.instructions.md)** - Component patterns for AI agents