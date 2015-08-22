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
            cb(null, synonyms);
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
                word2vec.mostSimilar(word, cb);
            },
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
            }
        ], function(err, results) {
            var wordsVectors = results[0].concat(results[1]);
            wordsVectors = _.uniq(wordsVectors, function(wv) {
                return wv.word;
            });
            callback(wordsVectors);
        });
    }

    function renderWordsVectors(wordsVectors) {
        var canvas = document.getElementById('synonyms-canvas');
        var ctx = canvas.getContext('2d');
        var maxX = _.max(wordsVectors, function(wv) {
            return wv.proj[0];
        });
        var maxY = _.max(wordsVectors, function(wv) {
            return wv.proj[1];
        });
        var scale = _.min([
            canvas.height/(2*maxY.proj[1]) * 0.9,
            canvas.width/(2*maxX.proj[0]) * 0.9,
        ]);
        console.log(wordsVectors.length);
        ctx.font = "14px Sans-Serif";
        ctx.fillStyle = '#000'
        _.each(wordsVectors, function(wv) {
            ctx.fillText(
                wv.word,
                wv.proj[0]*scale+canvas.width/2,
                wv.proj[1]*scale+canvas.height/2
            );
        });
    }

    $('#input-word-submit').click(function() {
        var inputWord = $('#input-word').val();
        getWordsAndVectors(inputWord, function(wordsVectors) {
            var vectors = _.pluck(wordsVectors, 'vector');
            var tsne = new tsnejs.tSNE();
            tsne.initDataRaw(vectors);
            for (var i=0; i < 500; i++) {
                tsne.step();
            }
            _.each(tsne.getSolution(), function(proj, idx) {
                wordsVectors[idx].proj = proj;
            })
            renderWordsVectors(wordsVectors);
        });
    });
});
