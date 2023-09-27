<script>
	import { nightMode } from '../stores.js';
  import { onMount } from 'svelte';

  /**
   * @type HTMLBodyElement | null
   */
  let body;
  onMount(() => {
    body = document.querySelector('body');
  });

  $: if($nightMode && body) {
    body.classList.add('night-mode');
    body.classList.remove('day-mode');
  } else if (body) {
    body.classList.remove('night-mode');
    body.classList.add('day-mode');
  }
</script>

<div id="header">
	<div id="night-mode-toggle">
		<input type="checkbox" id="night-mode-toggle-input" bind:checked={$nightMode} />
		<label for="night-mode-toggle-input" style="background-color: {$nightMode ? '#222' : '#fff'}; border-color: {$nightMode ? '#fff' : '#222'}">
			<span class="icon material-symbols-outlined" style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}">
        clear_day
        </span>
			<span class="icon material-symbols-outlined" style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}">
        dark_mode
      </span>
			<span class="toggle-circle" style="background-color: {$nightMode ? '#fff' : '#222'}"></span>
		</label>
	</div>
</div>
<div id="body-container">
  <slot />
</div>

<style>
  #header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 20px;
    margin-bottom: 20px;
    position: absolute;
    top: 0;
    right: 0;
  }

	#night-mode-toggle input[type='checkbox'] {
		opacity: 0;
    padding: 0;
	}

  #night-mode-toggle .icon {
    transition: color 0.2s linear;
  }

	#night-mode-toggle label {
		width: 50px;
		height: 26px;
		border-radius: 50px;
		position: relative;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
    padding: 0;
    transition: background-color 0.2s linear;
    border: 1px solid #222;
	}

	#night-mode-toggle .toggle-circle {
		width: 20px;
		height: 20px;
		position: absolute;
		left: 2px;
		top: 2px;
		border-radius: 50%;
		transition: all 0.2s linear;
	}

  #night-mode-toggle input[type='checkbox']:checked + label .toggle-circle {
    transform: translateX(24px);
  }

  #body-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex: 1;
  }
</style>
