class SentenceFinder {
  /**
   * @param {string} text
   */
  constructor (text) {
    this.text = text;

    /**
     * @type {Object.<string, WordDictionaryItem>}
     */
    this.wordDictionary = {};

    // split the text into sentences and remove empty sentences.
    // split on ., !, and ? followed by a space, quotes, or end of line.
    this.sentences = text.split(/(?<=[.!?])(?=\s|['"]|$)/).filter(sentence => sentence.trim().length > 0);

    this._buildWordDictionary();
  }

  _buildWordDictionary () {
    this.sentences.forEach((sentence, sentenceIndex) => {
      sentence.split(' ').forEach((word, indexInSentence) => {
        // remove punctuation from the word
        let sanitisedWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (sanitisedWord.length == 0) return;
        if (!this.wordDictionary) {
          this.wordDictionary = {};
        }
        if (!this.wordDictionary[sanitisedWord]) {
          this.wordDictionary[sanitisedWord] = new WordDictionaryItem(sanitisedWord);
        }
        this.wordDictionary[sanitisedWord].addSentenceIndex(sentenceIndex, indexInSentence);
      });
    });
  }
}

class WordDictionaryItem {
  /**
   *
   * @param {string} word
   */
  constructor (word) {
    this.word = word;
    /**
     * @type {Set.<number>}
     */
    this.sentenceIndeces = new Set();
    /**
     * @type {Object.<number, number[]>}
     */
    this.indexInSentence = {};
  }

  /**
   * @param {number} index
   * @param {number} indexInSentence
   */
  addSentenceIndex (index, indexInSentence) {
    this.sentenceIndeces.add(index);
    if (!this.indexInSentence[index]) this.indexInSentence[index] = [];
    this.indexInSentence[index].push(indexInSentence);
  }

  get sentenceCount () {
    return this.sentenceIndeces.size;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {Object.<number, number>[]}
   */

  getPreviousSentenceIndeces (index, maxCount = 5) {
    if (index == 0) return [];
    const indeces = [];
    const sentenceIndecesArray = Array.from(this.sentenceIndeces);
    for (let i = index - 1; i >= 0 && indeces.length < maxCount; i--) {
      indeces.push({
        sentenceIndex: sentenceIndecesArray[i],
        wordIndex: this.indexInSentence[sentenceIndecesArray[i]]
      });
    }
    return indeces;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {Object.<number, number>[]}
   */
  getNextSentenceIndeces (index, maxCount = 5) {
    if (index == this.sentenceCount - 1) return [];
    const indeces = [];
    for (let i = index + 1; i < this.sentenceCount && indeces.length < maxCount; i++) {
      indeces.push({
        sentenceIndex: this.sentenceIndeces[i],
        wordIndex: this.indexInSentence[this.sentenceIndeces[i]]
      });
    }
    return indeces;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {{previous: Object.<number, number>[], next: Object.<number, number>[]}}
   */
  getSurrondingSentenceIndeces (index, maxCount = 5) {
    const previous = this.getPreviousSentenceIndeces(index, maxCount);
    const next = this.getNextSentenceIndeces(index, maxCount);
    return {
      previous, next
    }
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {Object.<number, number>[]}
   */
  getPreviousWordOccurences (index, maxCount = 5) {
    if (index == 0) return [];
    const indeces = [];
    const sentenceIndecesArray = Array.from(this.sentenceIndeces);
    for (let i = index - 1; i >= 0 && indeces.length < maxCount; i--) {
      for (let j = this.indexInSentence[sentenceIndecesArray[i]].length - 1; j >= 0 && indeces.length < maxCount; j--) {
        indeces.push({
          sentenceIndex: sentenceIndecesArray[i],
          wordIndex: this.indexInSentence[sentenceIndecesArray[i]][j]
        });
      }
    }
    return indeces;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {Object.<number, number>[]}
   */
  getNextWordOccurences (index, maxCount = 5) {
    if (index == this.sentenceCount - 1) return [];
    const indeces = [];
    const sentenceIndecesArray = Array.from(this.sentenceIndeces);

    for (let i = index + 1; i < this.sentenceCount && indeces.length < maxCount; i++) {
      for (let j = 0; j < this.indexInSentence[sentenceIndecesArray[i]].length && indeces.length < maxCount; j++) {
        indeces.push({
          sentenceIndex: sentenceIndecesArray[i],
          wordIndex: this.indexInSentence[sentenceIndecesArray[i]][j]
        });
      }
    }
    return indeces;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {{previous: Object.<number, number>[], next: Object.<number, number>[]}}
   */
  getSurrondingWordOccurences (index, maxCount = 5) {
    const previous = this.getPreviousWordOccurences(index, maxCount);
    const next = this.getNextWordOccurences(index, maxCount);
    return {
      previous, next
    }
  }
}

export default SentenceFinder;
