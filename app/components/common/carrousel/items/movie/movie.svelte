<script lang="ts">
	import "./movie";

	export let src: string;
	export let alt: string;
	export let hidden: boolean;
</script>

<div class="movie_carrousel_item" class:hidden>
	<img {src} {alt} />
	<button> Watch now </button>
</div>

<style lang="scss">
	@import "./movie.scss";
</style>
