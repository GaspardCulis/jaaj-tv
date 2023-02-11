<script lang="ts">
	import translate from "@translations/translate";
	import "./menu.ts";

	let links = [
		{ name: translate("navbar_all"), href: "?category=all" },
		{ name: translate("navbar_movies"), href: "?category=movies" },
		{ name: translate("navbar_series"), href: "?category=series" },
		{ name: translate("navbar_tv_shows"), href: "?category=tv_shows" },
		{ name: translate("navbar_cartoons"), href: "?category=cartoons" },
	];

	let selected_name = new URLSearchParams(window.location.search).get("category") || "all";
	let selected = links.findIndex((link) => link.name === translate(`navbar_${selected_name}`));
</script>

<!-- svelte-ignore a11y-no-redundant-roles -->
<nav class="navbar" role="navigation" aria-label="main navigation">
	<div class="navbar-start">
		<a href="#/" role="button" class="navbar-home" aria-label="menu" data-target="navbar-basic">
			<span class="navbar-home-circle" />
			<span class="navbar-home-circle" />
			<span class="navbar-home-circle" />
			<span class="navbar-home-circle" />
		</a>
	</div>
	<div class="navbar-center">
		{#each links as link, i}
			<a href={link.href} class="navbar-item" class:selected={selected === i} on:click={() => (selected = i)}>
				{link.name}
			</a>
		{/each}
	</div>

	<div class="navbar-end">
		<img src="icons/search.svg" alt="search" class="navbar-search" />
	</div>
</nav>

<style lang="scss">
	@import "./menu.scss";
</style>
