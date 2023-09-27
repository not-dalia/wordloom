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

    /**
     * @type {SentenceMapItem[]}
     */
    this.sentenceMap = [];

    this._buildSentenceAndWordDictionaries();
  }

  _buildSentenceAndWordDictionaries () {
    // split the text into sentences and remove empty sentences.
    // split on ., !, and ? followed by a space, quotes, or end of line.
    // do not split on abbreviations like Mr. or Mrs.
    let splitRegex = /(?<=[.!?])(?=\s|['"]|$)(?<!\b(Mr|Mrs|Ms|Dr|Prof)\.)/;
    let sentences = this.text.split(splitRegex).filter(sentence => sentence?.trim().length > 0);
    sentences.forEach((sentence, sentenceIndex) => {
      let sentenceMapItem = new SentenceMapItem(sentence, sentenceIndex);
      sentence.split(/\s+/).forEach((word, indexInSentence) => {
        // remove punctuation from the word
        let sanitisedWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (sanitisedWord.length == 0) return;
        if (!this.wordDictionary[sanitisedWord]) {
          this.wordDictionary[sanitisedWord] = new WordDictionaryItem(sanitisedWord);
        }
        sentenceMapItem.addWord(word, sanitisedWord, this.wordDictionary[sanitisedWord].count);
        this.wordDictionary[sanitisedWord].addOccurance(sentenceIndex, sentenceMapItem.words.length - 1);
      });
      this.sentenceMap.push(sentenceMapItem);
    });
  }
}

class SentenceMapItem {
  /**
   * @param {string} sentence
   * @param {number} sentenceIndex
   */
  constructor (sentence, sentenceIndex) {
    this.sentence = sentence;
    this.sentenceIndex = sentenceIndex;

    /**
     * @type {{word: string, sanitisedWord: string, index: number}[]}
     */
    this.words = [];
  }

  /**
   * @param {string} word
   * @param {string} sanitisedWord
   * @param {number} index
   */
  addWord (word, sanitisedWord, index) {
    this.words.push({ word, sanitisedWord, index });
  }
}

class WordDictionaryItem {
  /**
   * @param {string} word
   */
  constructor (word) {
    this.word = word;

    /**
     * @type {{sentenceIndex: number, indexInSentence: number}[]}
     */
    this.occurances = []
  }

  /**
   * @param {number} sentenceIndex
   * @param {number} indexInSentence
   */
  addOccurance (sentenceIndex, indexInSentence) {
    this.occurances.push({ sentenceIndex, indexInSentence });
  }

  get count () {
    return this.occurances.length;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {{sentenceIndex: number, indexInSentence: number}[]}
   */
  getPreviousOccurances (index, maxCount) {
    if (index == 0) return [];
    let occurances = [];
    for (let i = index - 1; i >= 0; i--) {
      occurances.push(this.occurances[i]);
      if (occurances.length >= maxCount) {
        break;
      }
    }
    return occurances.reverse();
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {{sentenceIndex: number, indexInSentence: number}[]}
   */
  getNextOccurances (index, maxCount) {
    if (index == this.occurances.length - 1) return [];
    let occurances = [];
    for (let i = index + 1; i < this.occurances.length; i++) {
      occurances.push(this.occurances[i]);
      if (occurances.length >= maxCount) {
        break;
      }
    }
    return occurances;
  }

  /**
   * @param {number} index
   * @param {number} maxCount
   * @returns {{previous: {sentenceIndex: number, indexInSentence: number}[], next: {sentenceIndex: number, indexInSentence: number}[]}}
   */
  getSurroundingOccurances (index, maxCount = 5) {
    const previous = this.getPreviousOccurances(index, maxCount);
    const next = this.getNextOccurances(index, maxCount);
    return {
      previous,
      next
    }
  }
}

export default SentenceFinder;
