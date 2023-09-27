<script>
  import { onMount } from 'svelte';
	import { nightMode } from '../stores.js';
  import SentenceFinder from '$lib/sentenceFinder.js';
	import SentenceLine from '$lib/components/SentenceLine.svelte';
  import { story } from '$lib/pap.js';
  import { tick } from 'svelte';
  /**
   * @type HTMLDivElement | null
   */
  let mainText;

  /**
   * @type HTMLDivElement | null
   */
  let seekLine;

  /**
   * @type number
   */
  let mainTextXTranslate = 0;

  /**
   * @type Object.<string, HTMLSpanElement>
   */
  let wordSpanRefs = {};

  /**
   * @type number
   */
  let currentWordIndex = 0;

  /**
   * @type number
   */
  let currentSentenceIndex = 0;

  /**
   * @type number | null
   */
  let wordProgressTimeout;

  /**
   * @type number
   */
  let wordProgressPace = 2000;

  let surroundingLines;
  $: {
    let {sanitisedWord, index} = flatSentenceMap[currentWordIndex];
    surroundingLines = sentenceFinder.wordDictionary[sanitisedWord].getSurroundingOccurances(index);
  };

  /**
   * @type number
   */
  let seekLinePosition = 0;

  const sentence = `It is a truth universally acknowledged, that a single man in possession
of a good fortune must be in want of a wife.

However little known the feelings or views of such a man may be on his
first entering a neighbourhood, this truth is so well fixed in the minds
of the surrounding families, that he is considered as the rightful
property of some one or other of their daughters.

“My dear Mr. Bennet,” said his lady to him one day, “have you heard that
Netherfield Park is let at last?”

Mr. Bennet replied that he had not.

“But it is,” returned she; “for Mrs. Long has just been here, and she
told me all about it.”

Mr. Bennet made no answer.

“Do not you want to know who has taken it?” cried his wife, impatiently.

“_You_ want to tell me, and I have no objection to hearing it.”`;
  // let sentenceWords = getSentenceWords(sentence);

  let sentenceFinder = new SentenceFinder(story[0]);
  // let sentenceFinder = new SentenceFinder(story[0]);
  // let sentenceFinder = new SentenceFinder(story[33]);

  let flatSentenceMap = sentenceFinder.sentenceMap.reduce((acc, sentence, i) => {
    return acc.concat(sentence.words.map(word => ({
      i,
      ...word
    })));
  }, []);
  console.log(flatSentenceMap);

  /**
   * @param {string} sentence
   * returns {string[]}
   */
  function getSentenceWords(sentence) {
    return sentence.split(/\s+/).filter(word => word.length > 0);
  }

  /**
   * @returns {number} | null
   */
  function getSeekLinePosition() {
    if (!seekLine) return;
    const seekLineRect = seekLine.getBoundingClientRect();
    seekLinePosition = seekLineRect.left + seekLineRect.width / 2;
    return seekLinePosition;
  }

  /**
   * @param {number} index
   * @returns {number}
   */
  function getWordPosition(index) {
    if (!wordSpanRefs[index]) return;
    const wordRect = wordSpanRefs[index].getBoundingClientRect();
    return wordRect.left + wordRect.width / 2;
  }

  /**
   *
   * @param {number} index
   * @returns {number}
   */
  function getWordWidth(index) {
    if (!wordSpanRefs[index]) return;
    const wordRect = wordSpanRefs[index].getBoundingClientRect();
    return wordRect.width;
  }

  /**
   * @param {number} width
   */
  function setSeekLineWidth(width) {
    if (!seekLine) return;
    seekLine.style.width = `${width + 10}px`;
  }

  async function calculateTranslate() {
    await tick();
    const seekLinePosition = getSeekLinePosition();
    const wordPosition = getWordPosition(currentWordIndex) - mainTextXTranslate;
    const diff = seekLinePosition - wordPosition;
    mainTextXTranslate = diff
    console.log(`word position: ${wordPosition}`);
    console.log(`seek line position: ${seekLinePosition}`);
    console.log(`diff: ${diff}`);
    console.log(`mainTextXTranslate: ${mainTextXTranslate}` )

    // mainTextXTranslate = - getSeekLinePosition() + getWordPositionInMainText(currentWordIndex, currentSentenceIndex);
    // mainTextXTranslate = getSeekLinePosition() - getWordPosition(currentWordIndex, currentSentenceIndex) + mainTextXTranslate;
  }

  function selectNextWord() {
    if (currentWordIndex >= flatSentenceMap.length - 1) {
      return
    } else {
      currentWordIndex++;
    }
  }

  function selectPreviousWord() {
    if (currentWordIndex <= 0) {
        return;
    } else {
      currentWordIndex--;
    }
  }

  function selectWord(index) {
    currentWordIndex = index;
    calculateTranslate();
    setSeekLineWidth(getWordWidth(currentWordIndex));
  }

  function onKeyPress(e) {
    console.log(e.key);
    if (e.key === 'ArrowRight') {
      selectNextWord();
      calculateTranslate();
      setSeekLineWidth(getWordWidth(currentWordIndex));
    } else if (e.key === 'ArrowLeft') {
      selectPreviousWord();
      calculateTranslate();
      setSeekLineWidth(getWordWidth(currentWordIndex));
    }
  }

  onMount(() => {
    mainTextXTranslate = getSeekLinePosition() - getWordPosition(currentWordIndex);
    let {sanitisedWord, index} = flatSentenceMap[currentWordIndex];
    surroundingLines = sentenceFinder.wordDictionary[sanitisedWord].getSurroundingOccurances(index);
    setSeekLineWidth(getWordWidth(currentWordIndex));

    // wordProgressTimeout = setTimeout(handleWordProgress, wordProgressPace);
  });

</script>

<svelte:window
    on:keydown={onKeyPress}
/>

<div class="text-container">

  <div id="seek-line" bind:this={seekLine}></div>
  <div class="previous-container">
    {#if surroundingLines && surroundingLines.previous}
      {#each surroundingLines.previous as line, i (`${line.indexInSentence}-${i}`)}
        <SentenceLine words={sentenceFinder.sentenceMap[line.sentenceIndex].words} getSeekLinePosition={getSeekLinePosition} indexInSentence={line.indexInSentence} />
      {/each}
    {/if}
  </div>
  <div class="main-text-wrapper">
    <div class="main-text" bind:this={mainText} style="transform: translateX({mainTextXTranslate}px); color: {$nightMode ? '#fff' : '#222'}">
      <!-- {#each sentenceWords as word, i (`${word}-${i}`)}
        <span class="word" data-index={i} bind:this={wordSpanRefs[i]}>{word}</span><span>&nbsp;</span>
      {/each} -->
        {#each flatSentenceMap as word, j (`${word.i}-${j}`)}
          {#if (j > currentWordIndex - 10 && j < currentWordIndex + 10)}
            <button class="word" data-index={j} data-sentence={word.i} bind:this={wordSpanRefs[j]} style="background-color_defunt: {j == currentWordIndex ? '#ccc' : 'transparent'}"
            on:click={() => selectWord(j)}
            >{word.word}</button><span>&nbsp;</span>
          {:else}
            <span>{word.word}</span><span>&nbsp;</span>
          {/if}
        {/each}
    </div>
  </div>
  <div class="next-container">
    {#if surroundingLines && surroundingLines.next}
      {#each surroundingLines.next as line, i (`${line.indexInSentence}-${i}`)}
        <SentenceLine words={sentenceFinder.sentenceMap[line.sentenceIndex].words} getSeekLinePosition={getSeekLinePosition} indexInSentence={line.indexInSentence} />
      {/each}
    {/if}
  </div>

</div>

<style>
  .text-container {
    position: relative;
    font-size: 2rem;
    flex: 1;
    flex-direction: column;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    width: 100%;
  }

  .text-container:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
  }

  :global(.day-mode) .text-container:before {
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 1));
  }

  :global(.night-mode) .text-container:before {
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 1));
  }

  .next-container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: calc(50% + 2rem);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-x: hidden;
    padding: 0 2rem;
  }

  .previous-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: calc(50% + 2rem);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    overflow-x: hidden;
    padding: 0 2rem;
  }

  #seek-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    bottom: 2rem;
    /* background-color: #e4e4e4; */
    /* background-color: #93e3ee; */
    /* background-color: rgba(255, 0, 0, 0.4); */
    transition: all 0.2s linear;
    /* z-index: 1; */
    /* border: 3px solid #ddd; */
  }

  :global(.day-mode) #seek-line {
    background-color: #e4e4e4;
    border-color: #ddd;
  }

  :global(.night-mode) #seek-line {
    background-color: #222;
    border-color: #262626;
  }

  .main-text-wrapper {
    position: relative;
    overflow-x: hidden;
    width: 100%;
    margin: 1rem 0;
    white-space: nowrap;
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

  :global(.day-mode) .main-text-wrapper:before {
    background-image: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0) 5%, rgba(255, 255, 255, 0) 95%, rgba(255, 255, 255, 1));
  }

  :global(.night-mode) .main-text-wrapper:before {
    background-image: linear-gradient(to right, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0) 5%, rgba(0, 0, 0, 0) 95%, rgba(0, 0, 0, 1));
  }

  .main-text {
    transition: transform 0.2s linear;
    position: relative;
    left: 50%;
    white-space: nowrap;
  }

  .main-text button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin: 0;
    font-size: 2rem;
    color: inherit;
    font-family: 'Gentium Book Plus', serif;
  }

</style>
