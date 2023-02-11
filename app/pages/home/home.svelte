<script lang="ts">
	import Menu from "@components/common/menu/menu.svelte";
	import { translate } from "@app/translations/translate";
	import Carrousel from "@components/common/carrousel/carrousel.svelte";
</script>

<Menu />

<div id="container">
	<section id="recommended" class="vbox">
		<h1><strong> {translate("index_recommended_bold")}</strong> {translate("index_recommended_tail")}</h1>
		<Carrousel />
	</section>
	<section id="popular" class="vbox">
		<h3>{translate("index_popular")}</h3>
	</section>
</div>

<style lang="scss">
	@import "./home.scss";
</style>
