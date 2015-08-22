!function() {
    W2V_API = 'http://104.154.63.16:5000/api/'
    /*
     * word2vec api functions pass an error value as the first argument
     * to the callback.
     */
    window.word2vec = {
        mostSimilar: function(word, cb) {
            $.getJSON(
                W2V_API + 'most_similar/' + word,
                function(wordsVectors) {
                    cb(null, wordsVectors.results);
                }
            );
        },
        getVectors: function(words, cb) {
            $.getJSON(
                W2V_API + 'get_vectors/' + words.join(),
                function(wordsVectors) {
                    cb(null, wordsVectors.results);
                }
            );
        },
    };
}()
