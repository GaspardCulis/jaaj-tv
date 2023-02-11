<script lang="ts">
	import "./carrousel";

	let selected = 0;
</script>

<div class="carrousel vbox">
	<div class="carrousel_container" />
	<div class="carrousel_controls hbox">
		{#each [0, 1, 2, 3, 4] as _, i}
			<span class="carrousel_control" class:selected={selected === i} on:click={() => (selected = i)} />
		{/each}
	</div>
</div>

<style lang="scss">
	@import "./carrousel.scss";
</style>
