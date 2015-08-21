W2V_API = 'http://104.154.63.16:5000/api/'

$(document).ready(function() {

    /**
     * Calls the Lexicon API to asynchronously get an array of synonyms.
     * @param {string} word
     * @param {function} cb
     */
    function getLexiconSynonyms(word, cb) {
        queryURL = 'http://104.197.10.176/translate/lexicon?' +
                $.param({query: word, source: 'en', target: 'es', synonym: true});
        $.getJSON(queryURL, function(data) {
            synonyms = [];
            _.each(data.synonyms, function(elem) {
                _.each(elem.synonyms, function(synonym) {
                    synonyms.push(synonym);
                });
            });
            cb(synonyms);
        });
    }

    /**
     * Gets an array of [word, vector] pairs for similar words.
     * @param {string} word
     * @param {function} cb
     */
    function getWordsAndVectors(word, callback) {
        async.parallel([
            // Query word2vec for word's and similar words' vectors.
            function(cb) {
                $.getJSON(W2V_API + 'most_similar/' + word, function(data) {
                    cb(null, data.results);
                });
            },
            function(cb) {
                async.waterfall([
                    // Query Lexicon for more similar words.
                    function(cb) {
                        getLexiconSynonyms(word, function(words) {
                            cb(null, words);
                        });
                    },
                    // Get word2vec vectors for those words.
                    function(words, cb) {
                        $.getJSON(W2V_API + 'get_vectors/' + words.join(), function(data) {
                            cb(null, data.results);
                        });
                    }
                ], function (err, words_vectors) {
                    cb(null, words_vectors);
                });
            }
        ], function(err, results) {
            var words_vectors = results[0].concat(results[1]);
            callback(words_vectors);
        });
    }

    $('#input-word-submit').click(function() {
        var inputWord = $('#input-word').val();
        getWordsAndVectors(inputWord, function(words_vectors) {
            console.log(words_vectors);
            var vectors = _.pluck(words_vectors, 'vector');
            var tsne = new tsnejs.tSNE();
            tsne.initDataRaw(vectors);
            for (var i=0; i < 500; i++) {
                tsne.step();
            }
            var projs = tsne.getSolution();
            console.log(projs);
        });
    });
});
