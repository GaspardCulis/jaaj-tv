<script lang="ts">
	import "./movie";

	export let src: string;
	export let alt: string;
	export let hidden: boolean;
</script>

<div class="movie_carrousel_item" class:hidden>
	<img {src} {alt} />

	<a href="lol">
		<svg
			width="30px"
			height="30px"
			version="1.1"
			viewBox="0 0 400 400"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
		>
			<g>
				<path
					d="m70 390c-5.6016 0-11.199-1.6797-16.801-4.4805-10.641-6.1602-16.801-17.359-16.801-29.121v-314.72c0-12.32 6.7188-23.52 16.801-29.121 10.641-6.1602 23.52-5.6016 33.602 0.55859l262.08 157.36c10.078 6.1602 16.238 16.801 16.238 28.559 0 11.762-6.1602 22.398-16.238 28.559l-261.52 157.37c-5.0391 3.3594-11.199 5.0391-17.359 5.0391z"
				/>
			</g>
		</svg>
		<span>Watch now</span>
	</a>
</div>

<style lang="scss">
	@import "./movie.scss";
</style>
