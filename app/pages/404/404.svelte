<script lang="ts">
	/**
	 * Error404 HTML
	 * =====================
	 *
	 * @contributors: Gaspard Culis
	 *
	 * @license: MIT License
	 *
	 */
	import Menu from "@components/common/menu/menu.svelte";
	import { translate } from "@app/translations/translate";
</script>

<Menu />

<div id="container">
	<section class="hero is-medium is-primary is-bold">
		<div class="hero-body">
			<div class="container">
				<h1 class="title">{translate("error404_notfound")}</h1>
			</div>
		</div>
	</section>
	<div class="content has-text-centered">
		<p>{translate("error404_message")}</p>
	</div>
</div>

<style lang="scss">
	@import "./404.scss";
</style>
