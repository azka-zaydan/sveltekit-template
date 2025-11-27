<script lang="ts">
	// Svelte 5 runes API
	// No props currently used
</script>

<div class="min-h-screen bg-white">
	<div class="max-w-6xl mx-auto px-4 py-6">
		<header class="mb-6 pb-4 border-b border-gray-300">
			<div class="flex items-center justify-between">
				<a href="/" class="text-3xl font-bold text-purple-700">sveltekit-template</a>
				<nav class="text-sm">
					<a href="/components-demo" class="text-blue-600 hover:underline">components demo</a>
					<span class="mx-2">|</span>
					<a href="/demo" class="text-blue-600 hover:underline">demo</a>
				</nav>
			</div>
		</header>

		<main>
			<h1 class="text-2xl font-bold mb-4 text-gray-900">welcome</h1>
			<p class="text-sm text-gray-700 mb-6">
				This starter includes SvelteKit 2 + Svelte 5 runes, Tailwind via Vite plugin, Drizzle ORM,
				and a retro Craigslist-inspired UI kit. Use the links above to explore demos.
			</p>

			<section class="border border-gray-300 bg-white p-4">
				<h2 class="text-xl font-bold mb-2 text-gray-900">quick links</h2>
				<ul class="space-y-1 text-sm">
					<li>
						<a href="/components-demo" class="text-blue-600 hover:underline">components demo page</a
						>
						<span class="text-gray-600"> – see Buttons, Inputs, Cards, Badges</span>
					</li>
					<li>
						<a href="/demo" class="text-blue-600 hover:underline">demo landing</a>
						<span class="text-gray-600"> – sample flows and pages</span>
					</li>
				</ul>
			</section>
		</main>
	</div>
</div>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
