<script lang="ts">
	import Menu from "@components/common/menu/menu.svelte";
	import { translate } from "@app/translations/translate";
</script>

<Menu />

<div id="container">
	<section id="recommended">
		<h1><strong> {translate("index_recommended_bold")}</strong> {translate("index_recommended_tail")}</h1>
	</section>
	<section id="popular">
		<h3>{translate("index_popular")}</h3>
	</section>
</div>

<style lang="scss">
	@import "./home.scss";
</style>
