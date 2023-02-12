<script lang="ts">
	import Movie from "./items/movie/movie.svelte";
	import "./carrousel";

	let selected = 0;
	let items = [
		{ src: "test/fight-club-backdrop-w780.jpg", alt: "Fight Club" },
		{ src: "test/iron-man-backdrop-w780.jpg", alt: "Iron Man" },
		{ src: "test/luca-backdrop-w780.jpg", alt: "Luca" },
		{ src: "test/time-out-backdrop-w780.jpg", alt: "Time Out" },
		{ src: "test/upgrade-backdrop-w780.jpg", alt: "Upgrade" },
	];

	function updateSelected(index: number) {
		selected = index;
	}
</script>

<div class="carrousel vbox">
	<div class="carrousel_container">
		{#each items as item, i}
			<Movie src={item.src} alt={item.alt} hidden={selected !== i} />
		{/each}
	</div>
	<div class="carrousel_controls hbox">
		{#each items as _, i}
			<span class="carrousel_control" class:selected={selected === i} on:click={() => updateSelected(i)} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import "./carrousel.scss";
</style>
