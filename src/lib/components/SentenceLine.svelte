<script>
	import { onMount } from "svelte";

  /**
   * @type {function(number): void}
   */
  export let onClick;

  /**
   * @type {{word: string, sanitisedWord: string, index: number}[]}
   */
  export let words;

  /**
   * @type {function(): number}
   */
  export let getSeekLinePosition;

  /**
   * @type {number}
   */
  export let indexInSentence;

  /**
   * @type Object.<string, HTMLSpanElement>
   */
  let wordSpanRefs = {};

  /**
   * @type number
   */
   let mainTextXTranslate = 0;

  /**
   * @param {number} index
   * @returns {number}
   */
   function getWordPosition(index) {
    if (!wordSpanRefs[index]) return;
    const wordRect = wordSpanRefs[index].getBoundingClientRect();
    return wordRect.left + wordRect.width / 2;
  }

  function calculateTranslate() {
    mainTextXTranslate = getSeekLinePosition() - getWordPosition(indexInSentence) + mainTextXTranslate;
  }

  onMount(() => {
    calculateTranslate();
  });

</script>

<div class="main-text-wrapper light-text" data-index={indexInSentence} on:click={() => onClick(indexInSentence)} role="button" tabindex="0" on:keydown={e => e.key == 'Enter' && onClick(indexInSentence)}>
  <div class="main-text"style="transform: translateX({mainTextXTranslate}px);">
  {#each words as word, j (word)}
    <span class="word" data-index={j} bind:this={wordSpanRefs[j]} style="background-color_defunt: {j == indexInSentence ? '#e4e4e4' : 'transparent'}"
    >{word.word}</span><span>&nbsp;</span>
  {/each}
  </div>
</div>


<style>
  .main-text-wrapper {
    position: relative;
    overflow: hidden;
    width: 100%;
    margin: 1rem 0;
    white-space: nowrap;
    cursor: pointer;
  }

  .main-text-wrapper:hover, .main-text-wrapper:focus {
    background-color: rgba(34, 183, 188, 0.2);
  }

  .light-text {
    color: #777;
  }

  .main-text-wrapper:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
  }

  @media (max-width: 600px) {
    .main-text-wrapper {
      margin: 0.5rem 0;
    }
  }

  :global(.day-mode) .main-text-wrapper:before {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0) 5%, rgba(255, 255, 255, 0) 95%, rgba(255, 255, 255, 1));
  }

  :global(.night-mode) .main-text-wrapper:before {
    background-image: linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 5%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 1));
  }

  .main-text {
    /* transition: transform 0.2s linear; */
    position: relative;
    left: 50%;
    white-space: nowrap;
  }

</style>
