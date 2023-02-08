/**
 * Svelte Init
 * =====================
 * Create svelte app
 *
 * @contributors: Gaspard Culis
 *
 * @license: MIT License
 *
 */
import App from "@app/pages/index/index.svelte";

const app = new App({
	target: document.body,
});

export default app;
