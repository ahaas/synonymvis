!function() {
    /**
     * Calls the Lexicon API to asynchronously get an array of synonyms.
     * @param {string} word
     * @param {function} cb
     */
    function getLexiconSynonyms(word, cb) {
        queryURL = 'http://104.197.10.176/translate/lexicon?' +
                $.param({query: word, source: 'en', target: 'es', synonym: true});
        getLexiconData(word, function(err, data) {
            synonyms = [];
            _.each(data.synonyms, function(elem) {
                _.each(elem.synonyms, function(synonym) {
                    synonyms.push(synonym);
                });
            });
            cb(null, synonyms, data);
        });
    }

    function getLexiconData(word, cb) {
        queryURL = 'http://104.154.63.16:8090/translate/lexicon?' +
                $.param({query: word, source: 'en', target: 'es', synonym: true});
        $.getJSON(queryURL, function(data) {
            cb(null, data);
        });
    }

    /**
     * Gets an array of [word, vector] pairs for similar words.
     * @param {string} word
     * @param {function} cb
     */
    function getWordsAndVectors(word, callback) {
        getLexiconSynonyms(word, function(err, words, lexiconData) {
            word2vec.getVectors(words, function(err, wvResults1) {
                word2vec.getVectors([word], function(err, wvResults2) {
                    if (wvResults2.length === 0) {
                        callback('Query word not found.'); // TODO HANDLE PROPERLY
                        return
                    }
                    wvResults2[0].isQuery = true;
                    wvResults = [].concat.apply([], [wvResults1, wvResults2]);
                    wvResults = _.uniq(wvResults, function(wv) {
                        return wv.word + "|" + wv.isQuery;
                    });
                    callback(null, wvResults, lexiconData);
                });
            });
        });
    }

    function whollyContained(arr1, arr2) {
        //console.log(arr1, arr2);
        for (var i=0; i<arr1.length; i++) {
            if (!_.contains(arr2, arr1[i])) {
                return false;
            }
        }
        return true;
    }

    window.controller = {}
    controller.update = function(inputWord, randomSeed, synGroupIdxs, updateUrl, cb) {
        getWordsAndVectors(inputWord, function(err, wordsVectors, lexiconData) {
            if (err) {
                console.log("getWordsAndVectors ERROR: " + err);
                cb();
                return
            }
            var lexiconSynonyms = lexiconData.synonyms;
            lexiconSynonyms = _.sortBy(lexiconSynonyms, function(synGroup) {
                return synGroup.dataSource;
            });
            _.each(lexiconSynonyms, function(synGroup, idx) {
                if (synGroupIdxs != null) {
                    synGroup.enabled = _.contains(synGroupIdxs, idx);
                } else {
                    synGroup.enabled = true;

                    /* Filter out groups entirely contained in another. */
                    _.each(lexiconSynonyms, function(synGroup2) {
                        if (synGroup != synGroup2 &&
                            whollyContained(synGroup.synonyms, synGroup2.synonyms)) {
                                synGroup.enabled = false;
                        }
                    });

                    /* Filter out groups with too few elements. */
                    if (synGroup.synonyms.length < 2) {
                        synGroup.enabled = false;
                    }
                }
            });
            function updateSynTable() {
                syntable.renderWordsVectors(
                    document.getElementById('syntable'),
                    wordsVectors,
                    lexiconSynonyms,
                    renderCanvas
                );
            }
            function renderCanvas() {
                Math.seedrandom(randomSeed);

                // Get the synGroupIdxs that are enabled
                var synGroupIdxs = [];
                _.each(lexiconSynonyms, function(synGroup, idx) {
                    if (synGroup.enabled) {
                        synGroupIdxs.push(idx);
                    }
                });
                updateUrl(inputWord, randomSeed, synGroupIdxs);

                var vectors = _.pluck(wordsVectors, 'vector');
                var tsne = new tsnejs.tSNE();
                tsne.initDataRaw(vectors);
                for (var i=0; i < 1000; i++) {
                    tsne.step();
                }
                _.each(tsne.getSolution(), function(proj, idx) {
                    wordsVectors[idx].proj = proj;
                })
                renderer.renderWordsVectors(
                    document.getElementById('synonyms-canvas'),
                    wordsVectors,
                    lexiconSynonyms,
                    updateSynTable
                );
            }
            renderCanvas();
            cb()
        });
    }
}();
