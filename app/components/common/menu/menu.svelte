<script lang="ts">
	import "./menu.ts";

	let selected = 0;
	let links = [
		{ name: "All", href: "/" },
		{ name: "Movies", href: "/" },
		{ name: "Series", href: "/" },
		{ name: "TV Shows", href: "/" },
		{ name: "Cartoons", href: "/" },
	];
</script>

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
		<img src="/icons/search.svg" alt="search" class="navbar-search" />
	</div>
</nav>

<style lang="scss">
	@import "./menu.scss";
</style>
