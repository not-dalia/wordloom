<script>
    import { nightMode } from '$lib/stores.js';

    /**
     * @type string
     */
    export let icon;
</script>

<button on:click>
    <span
        class="icon material-symbols-outlined"
        style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}"
    >
        {icon}
    </span>
</button>

<style>
    button {
		background-color: transparent;
		cursor: pointer;
		border: 2px solid black;
	}

	:global(.night-mode) button {
		border-color: white;
	}
</style>