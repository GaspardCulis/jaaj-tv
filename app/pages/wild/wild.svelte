<script lang="ts">
	/**
	 * Wild HTML
	 * =====================
	 * Svelte Page
	 *
	 * @contributors: Gaspard Culis
	 *
	 * @license: MIT License
	 *
	 */
	import Menu from "@components/common/menu/menu.svelte";
	import { translate } from "@app/translations/translate";

	export let params = { wild: "" };
</script>

<Menu />

<div id="container">
	<section class="hero is-medium is-primary is-bold">
		<div class="hero-body">
			<div class="container">
				<h1 class="title">{translate("wildcard_title")}</h1>
			</div>
		</div>
	</section>
	<div class="content has-text-centered">
		<p>
			{@html translate("wildcard_message")}
		</p>

		<p>{translate("wildcard_current", { param: params.wild })}</p>
	</div>
</div>

<style lang="scss">
	@import "./wild.scss";
</style>
