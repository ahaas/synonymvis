!function() {
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
        queryURL = 'http://104.154.63.16:8090/translate/lexicon?' +
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
                ], cb);
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
            console.log("d")
            callback(null, wordData);
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
        getWordsAndVectors(inputWord, function(err, wordsVectors) {
            if (err) {
                console.log("getWordsAndVectors ERROR: " + err);
                cb();
                return
            }
            getLexiconData(inputWord, function(err, data) {
                var lexiconSynonyms = data.synonyms;
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
        });
    }
}();
