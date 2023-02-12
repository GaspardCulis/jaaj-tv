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
	let fastTransition = false;

	function updateSelected(index: number) {
		selected += Math.sign(index - selected);
		if (index - selected) {
			setTimeout(() => {
				fastTransition = true;
				updateSelected(index);
			}, 100);
		} else {
			setTimeout(() => {
				fastTransition = false;
			}, 50);
		}
	}
</script>

<div class="carrousel vbox">
	<div class="carrousel_container">
		{#each items as item, i}
			<Movie
				src={item.src}
				alt={item.alt}
				hidden={selected !== i}
				place={selected - i}
				fast_transition={fastTransition}
			/>
		{/each}
	</div>
	<div class="carrousel_controls hbox">
		{#each items as _, i}
			<span
				class="carrousel_control"
				class:fast_transition={fastTransition}
				class:selected={selected === i}
				on:click={() => updateSelected(i)}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	@import "./carrousel.scss";
</style>
