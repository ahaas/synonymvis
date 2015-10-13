$(document).ready(function() {

    /**
     * Calls the Lexicon API to asynchronously get an array of synonyms.
     * @param {string} word
     * @param {function} cb
     */
    function getLexiconSynonyms_(word, cb) {
        queryURL = 'http://104.197.10.176/translate/lexicon?' +
                $.param({query: word, source: 'en', target: 'es', synonym: true});
        getLexiconData(word, function(err, data) {
            synonyms = [];
            _.each(data.synonyms, function(elem) {
                _.each(elem.synonyms, function(synonym) {
                    synonyms.push(synonym);
                });
            });
            cb(null, synonyms);
        });
    }
    var getLexiconSynonyms = async.memoize(getLexiconSynonyms_);

    function getLexiconData_(word, cb) {
        queryURL = 'http://104.197.10.176/translate/lexicon?' +
                $.param({query: word, source: 'en', target: 'es', synonym: true});
        $.getJSON(queryURL, function(data) {
            cb(null, data);
        });
    }
    var getLexiconData = async.memoize(getLexiconData_);

    /**
     * Gets an array of [word, vector] pairs for similar words.
     * @param {string} word
     * @param {function} cb
     */
    function getWordsAndVectors(word, callback) {
        async.parallel([
            // Query word2vec for word's and similar words' vectors.
            /*function(cb) {
                word2vec.mostSimilar(word, cb);
            },*/
            function(cb) {
                async.waterfall([
                    // Query Lexicon for more similar words.
                    function(cb) {
                        getLexiconSynonyms(word, cb);
                    },
                    // Get word2vec vectors for those words.
                    word2vec.getVectors,
                ], function (err, wordsVectors) {
                    cb(null, wordsVectors);
                });
            },
            function(cb) {
                word2vec.getVectors([word], function(err, wordData) {
                    if (wordData.length === 0) {
                        cb('Query word not found.');
                        return
                    }
                    wordData[0].isQuery = true;
                    cb(err, wordData);
                });
            }
        ], function(err, results) {
            if (err) {
                console.log('ASYNC ERROR: ' + err);
                callback(err);
                return
            }
            var wordData = [].concat.apply([], results);
            wordData = _.uniq(wordData, function(w) {
                return w.word + "|" + w.isQuery;
            });
            callback(null, wordData);
        });
    }

    $('#input-form').submit(function(e) {
        e.preventDefault();
        var l = Ladda.create($('#input-word-button').get(0));
        l.start();
        var inputWord = $('#input-word').val();
        getWordsAndVectors(inputWord, function(err, wordsVectors) {
            if (err) {
                l.stop();
                return
            }
            var vectors = _.pluck(wordsVectors, 'vector');
            var tsne = new tsnejs.tSNE();
            tsne.initDataRaw(vectors);
            for (var i=0; i < 1000; i++) {
                tsne.step();
            }
            _.each(tsne.getSolution(), function(proj, idx) {
                wordsVectors[idx].proj = proj;
            })
            getLexiconData(inputWord, function(err, data) {
                renderer.renderWordsVectors(
                    document.getElementById('synonyms-canvas'),
                    wordsVectors,
                    data.synonyms
                );
                l.stop();
            });
        });
    });
});
