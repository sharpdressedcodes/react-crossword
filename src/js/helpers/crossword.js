/**
 * Get the letter position in the word from a given position on the grid.
 *
 * @param position An object containing x and y positions.
 * @param word The subject
 * @returns {number} The index of the letter or -1 if it fails
 */
const getIndexFromPositionInWord = (position, word) => {
    let index = -1;

    switch (word.horizontal) {
        case true:
            if (word.startY === position.y) {
                for (let x = word.startX; x <= word.endX; x++) {
                    if (x === position.x) {
                        index = x - word.startX;
                        break;
                    }
                }
            }
            break;

        default:
            if (word.startX === position.x) {
                for (let y = word.startY; y <= word.endY; y++) {
                    if (y === position.y) {
                        index = y - word.startY;
                        break;
                    }
                }
            }
    }
    return index;
};

/**
 * Get letter information from a given position (x, y) on the grid.
 *
 * @param x The x position
 * @param y The y position
 * @param words The questions and answer data
 * @param wordCount Used to prevent useless array length counts inside loops
 * @param force (Optional) Force the check, even if the letter has already been rendered.
 * @returns {{index: null, letter: null, wordIndex: null, parentWords: null}}
 */

const getLetterFromPosition = (x, y, words, wordCount, force = false) => {
    let result = {
        index: null,
        letter: null,
        wordIndex: null,
        parentWords: null
    };
    let index = null;

    for (let i = 0; i < wordCount && index === null; i++) {
        const word = words[i];

        // Only check words that haven't yet been checked.
        if (!word.rendered || force) {
            switch (word.horizontal) {
                case true:
                    if (word.startY === y && x > word.startX - 1 && x < word.endX + 1) {
                        index = x - word.startX;
                        result = {
                            index,
                            letter: word.answer.substr(index, 1),
                            wordIndex: i,
                            parentWords: [word]
                        };
                        if (x === word.endX) {
                            word.rendered = true;
                        }
                    }
                    break;

                default:
                    if (word.startX === x && y > word.startY - 1 && y < word.endY + 1) {
                        index = y - word.startY;
                        result = {
                            index,
                            letter: word.answer.substr(index, 1),
                            wordIndex: i,
                            parentWords: [word]
                        };
                        if (y === word.endY) {
                            word.rendered = true;
                        }
                    }
            }
        }
    }

    if (index !== null) {
        // Does this letter belong to more than 1 word?
        for (let i = 0; i < wordCount; i++) {
            const word = words[i];
            const letterIndex = getIndexFromPositionInWord({ x, y }, word);
            if (letterIndex > -1 && !result.parentWords.includes(word)) {
                result.parentWords.push(word);
            }
        }
    }

    return result;
};

export { getLetterFromPosition, getIndexFromPositionInWord };
