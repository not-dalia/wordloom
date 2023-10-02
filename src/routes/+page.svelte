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
	let wordProgressPace = 1000;

  let maxSurroundingOcurrences = 3;
	let surroundingLines;
	$: {
		let { sanitisedWord, index } = flatSentenceMap[currentWordIndex];
		surroundingLines = sentenceFinder.wordDictionary[sanitisedWord].getSurroundingOccurances(index, maxSurroundingOcurrences);
	}

	/**
	 * @type number
	 */
	let seekLinePosition = 0;

	let sentenceFinder = new SentenceFinder(story[0]);
	// let sentenceFinder = new SentenceFinder(story[0]);
	// let sentenceFinder = new SentenceFinder(story[33]);

	/**
	 * @typedef {Object} WordInfo
	 * @property {number} i
	 * @property {string} word
	 * @property {string} sanitisedWord
	 * @property {number} index
	 */
	/**
	 * @type WordInfo[]
	 */
	let flatSentenceMap = sentenceFinder.sentenceMap.reduce((/** @type WordInfo[] */ acc, sentence, i) => {
		return acc.concat(
			sentence.words.map((word) => ({
				i,
				...word
			}))
		);
	}, []);
	console.log(flatSentenceMap);

	/**
	 * @param {string} sentence
	 * returns {string[]}
	 */
	function getSentenceWords(sentence) {
		return sentence.split(/\s+/).filter((word) => word.length > 0);
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
		mainTextXTranslate = diff;
		// mainTextXTranslate = - getSeekLinePosition() + getWordPositionInMainText(currentWordIndex, currentSentenceIndex);
		// mainTextXTranslate = getSeekLinePosition() - getWordPosition(currentWordIndex, currentSentenceIndex) + mainTextXTranslate;
	}

	function selectNextWord() {
		if (currentWordIndex >= flatSentenceMap.length - 1) {
			return;
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
			if (wordProgressTimeout) {
				clearTimeout(wordProgressTimeout);
				wordProgressTimeout = null;
			}
			selectNextWord();
			calculateTranslate();
			setSeekLineWidth(getWordWidth(currentWordIndex));
		} else if (e.key === 'ArrowLeft') {
			if (wordProgressTimeout) {
				clearTimeout(wordProgressTimeout);
				wordProgressTimeout = null;
			}
			selectPreviousWord();
			calculateTranslate();
			setSeekLineWidth(getWordWidth(currentWordIndex));
		} else if (e.key === 'p') {
			if (!wordProgressTimeout) {
				handleWordProgress();
			} else {
				clearTimeout(wordProgressTimeout);
				wordProgressTimeout = null;
			}
		}
	}

	function onRightButtonClick() {
		if (wordProgressTimeout) {
			clearTimeout(wordProgressTimeout);
			wordProgressTimeout = null;
		}
		selectNextWord();
		calculateTranslate();
		setSeekLineWidth(getWordWidth(currentWordIndex));
	}

	function onLeftButtonClick() {
		if (wordProgressTimeout) {
			clearTimeout(wordProgressTimeout);
			wordProgressTimeout = null;
		}
		selectPreviousWord();
		calculateTranslate();
		setSeekLineWidth(getWordWidth(currentWordIndex));
	}

	function handleWordProgress() {
		selectNextWord();
		calculateTranslate();
		setSeekLineWidth(getWordWidth(currentWordIndex));
		wordProgressTimeout = setTimeout(handleWordProgress, wordProgressPace);
	}

	onMount(() => {
		mainTextXTranslate = getSeekLinePosition() - getWordPosition(currentWordIndex);
		let { sanitisedWord, index } = flatSentenceMap[currentWordIndex];
		surroundingLines = sentenceFinder.wordDictionary[sanitisedWord].getSurroundingOccurances(index, maxSurroundingOcurrences);
		setSeekLineWidth(getWordWidth(currentWordIndex));

		// wordProgressTimeout = setTimeout(handleWordProgress, wordProgressPace);

		// wordProgressTimeout = setTimeout(handleWordProgress, wordProgressPace);
	});
</script>

<svelte:window on:keydown={onKeyPress} />

<div class="control">
	<div class="prev-word-btn">
		<button on:click={onLeftButtonClick}>
			<span
				class="icon material-symbols-outlined"
				style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}"
			>
				arrow_back
			</span>
		</button>
	</div>
	<div class="pause-play">
		{#if wordProgressTimeout}
			<button
				on:click={() => {
					clearTimeout(wordProgressTimeout);
					wordProgressTimeout = null;
				}}
			>
				<span
					class="icon material-symbols-outlined"
					style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}"
				>
					pause
				</span>
			</button>
		{:else}
			<button on:click={handleWordProgress}>
				<span
					class="icon material-symbols-outlined"
					style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}"
				>
					play_arrow
				</span>
			</button>
		{/if}
	</div>
	<div class="next-word-btn">
		<button on:click={onRightButtonClick}>
			<span
				class="icon material-symbols-outlined"
				style="padding: 2px; font-size: 20px; color: {$nightMode ? '#fff' : '#222'}"
			>
				arrow_forward
			</span>
		</button>
	</div>
</div>
<div class="control">
  <div class="pace-range">
    <label for="pace-range">Pace (ms):</label>
    <span>{wordProgressPace}</span>
    <input type="range" min="100" max="5000" step="100" bind:value={wordProgressPace} id="pace-range" />
  </div>
  <div class="pace-range">
    <label for="max-surrounding">Sentence count:</label>
    <span>{maxSurroundingOcurrences}</span>
    <input type="range" min="1" max="10" step="1" bind:value={maxSurroundingOcurrences} id="max-surrounding" />
  </div>
</div>

<div class="text-container">
	<div id="seek-line" bind:this={seekLine} />
	<div class="previous-container">
		{#if surroundingLines && surroundingLines.previous}
			{#each surroundingLines.previous as line, i (`${line.indexInSentence}-${i}`)}
				<SentenceLine
					words={sentenceFinder.sentenceMap[line.sentenceIndex].words}
					{getSeekLinePosition}
					indexInSentence={line.indexInSentence}
				/>
			{/each}
		{/if}
	</div>
	<div class="main-text-wrapper">
		<div
			class="main-text"
			bind:this={mainText}
			style="transform: translateX({mainTextXTranslate}px); color: {$nightMode ? '#fff' : '#222'}"
		>
			<!-- {#each sentenceWords as word, i (`${word}-${i}`)}
        <span class="word" data-index={i} bind:this={wordSpanRefs[i]}>{word}</span><span>&nbsp;</span>
      {/each} -->
			{#each flatSentenceMap as word, j (`${word.i}-${j}`)}
				{#if j > currentWordIndex - 20 && j < currentWordIndex + 20}
					<button
						class="word"
						data-index={j}
						data-sentence={word.i}
						bind:this={wordSpanRefs[j]}
						style="background-color_defunt: {j == currentWordIndex ? '#ccc' : 'transparent'}"
						on:click={() => selectWord(j)}>{word.word}</button
					><span>&nbsp;</span>
				{:else}
					<span>{word.word}</span><span>&nbsp;</span>
				{/if}
			{/each}
		</div>
	</div>
	<div class="next-container">
		{#if surroundingLines && surroundingLines.next}
			{#each surroundingLines.next as line, i (`${line.indexInSentence}-${i}`)}
				<SentenceLine
					words={sentenceFinder.sentenceMap[line.sentenceIndex].words}
					{getSeekLinePosition}
					indexInSentence={line.indexInSentence}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	.control {
		display: flex;
    flex-wrap: wrap;
		justify-content: center;
		align-items: center;
    padding: 10px 0;
	}

  .control:first-child {
    padding-top: 22px;
  }

	.control div {
		margin: 0 5px;
	}

	.control button {
		background-color: transparent;
		cursor: pointer;
    border: 2px solid black;
	}

  :global(.night-mode) .control button {
    border-color: white;
  }

  .control .pace-range {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 10px;
  }

  .control .pace-range input {
    margin-left: 10px;
  }

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
		background-image: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 1),
			rgba(255, 255, 255, 0) 30%,
			rgba(255, 255, 255, 0) 70%,
			rgba(255, 255, 255, 1)
		);
	}

	:global(.night-mode) .text-container:before {
		background-image: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 1),
			rgba(0, 0, 0, 0) 30%,
			rgba(0, 0, 0, 0) 70%,
			rgba(0, 0, 0, 1)
		);
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
		overflow: hidden;
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
		overflow: hidden;
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
		overflow: hidden;
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
		background-image: linear-gradient(
			to right,
			rgba(255, 255, 255, 1),
			rgba(255, 255, 255, 0) 5%,
			rgba(255, 255, 255, 0) 95%,
			rgba(255, 255, 255, 1)
		);
	}

	:global(.night-mode) .main-text-wrapper:before {
		background-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 1),
			rgba(0, 0, 0, 0) 5%,
			rgba(0, 0, 0, 0) 95%,
			rgba(0, 0, 0, 1)
		);
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

  @media (max-width: 600px) {
    .text-container {
      padding: 1rem;
      font-size: 1.5rem;
    }

    .next-container {
      top: calc(50% + 1.5rem);
      padding: 0 1rem;
    }

    .previous-container {
      bottom: calc(50% + 1.5rem);
      padding: 0 1rem;
    }

    .main-text button {
      font-size: 1.5rem;
    }
  }
</style>
