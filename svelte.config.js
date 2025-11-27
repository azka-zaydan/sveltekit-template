import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			// Components
			$components: 'src/lib/components',
			'$components/*': 'src/lib/components/*',
			$ui: 'src/lib/components/ui',
			'$ui/*': 'src/lib/components/ui/*',
			'$ui/layout': 'src/lib/components/ui/layout',
			'$ui/layout/*': 'src/lib/components/ui/layout/*',
			// API
			$api: 'src/lib/api',
			'$api/*': 'src/lib/api/*',
			// Types & Schemas
			$types: 'src/lib/types',
			'$types/*': 'src/lib/types/*',
			// Server
			$server: 'src/lib/server',
			'$server/*': 'src/lib/server/*',
			$db: 'src/lib/server/db',
			'$db/*': 'src/lib/server/db/*',
			$schema: 'src/lib/server/db/schema',
			'$schema/*': 'src/lib/server/db/schema/*',
			// Utils
			$utils: 'src/lib/utils',
			'$utils/*': 'src/lib/utils/*'
		}
	}
};

export default config;
