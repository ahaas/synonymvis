!function() {

    function getWordColor(word, lexiconSynonyms) {
        /*var count = 0
        _.each(lexiconSynonyms, function(synGroup) {
            if ($.inArray(word, synGroup.synonyms) != -1) {
                count++;
            }
        });
        if (count == 0) return "#CCC";
        if (count == 1) return "#444";
        if (count == 2) return "#333";
        if (count == 3) return "#222";
        if (count == 4) return "#111";*/
        return "#000"
    }

    function getGroupStartAng_(groupIdx, wordsVectors, lexiconSynonyms) {
        var words = lexiconSynonyms[groupIdx].synonyms;
        var totalVec = {x: 0, y: 0};
        var magnitude, vec;
        var wvQuery = wordsVectors[0];
        _.each(wordsVectors, function(wv) {
            if ($.inArray(wv.word, words) != -1) {
                vec = {
                    x: wv.canvasPos.x - wvQuery.canvasPos.x,
                    y: wv.canvasPos.y - wvQuery.canvasPos.y
                }
                magnitude = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
                if (magnitude > 0) {
                    totalVec.x += vec.x / magnitude;
                    totalVec.y += vec.y / magnitude;
                }
            }
        });
        return Math.atan2(totalVec.y, totalVec.x);
    }
    var getGroupStartAng = _.memoize(getGroupStartAng_);

    function getGroupIdxColorMap_(lexiconSynonyms) {
        var colorList = [
            '#FF6961', // red
            '#779ECB', // blue
            '#77DD77', // green
            '#FFB347', // orange
            '#CB99C9', // violet
            '#F49AC2', // magenta
            '#E4E487', // yellow
            '#CFCFC4', // gray
        ]
        var descendingSizeGroups = _.sortBy(lexiconSynonyms, function(group) {
            return -group.synonyms.length-group.enabled*9999;
        })
        var out = [];
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var groupRank = _.indexOf(descendingSizeGroups, synGroup);
            if (groupRank < colorList.length) {
                out[idx] = colorList[groupRank];
            } else {
                var ml = 140;
                var new_light_color = 'rgb(' + (Math.floor((255-ml)*Math.random()) + ml) + ',' +
                    (Math.floor((255-ml)*Math.random()) + ml) + ',' +
                    (Math.floor((256-ml)*Math.random()) + ml) + ')';
                out[idx] = new_light_color;
            }
            synGroup.color = out[idx];
        });
        return out;
    }
    var getGroupIdxColorMap = _.memoize(getGroupIdxColorMap_);

    function drawBezierCurves(wv, wordsVectors, lexiconSynonyms, ctx, centerPos) {
        var RADIUS = 35;
        var BASE_CONTROL_RADIUS = 100;
        var wordGroupIdxs = [];
        _.each(lexiconSynonyms, function(synGroup, idx) {
            if ($.inArray(wv.word, synGroup.synonyms) != -1 && synGroup.enabled) {
                wordGroupIdxs.push(idx);
            }
        });
        _.each(wordGroupIdxs, function(groupIdx) {
            var startAng = getGroupStartAng(groupIdx, wordsVectors, lexiconSynonyms);
            var start = {
                x: centerPos.x + RADIUS * Math.cos(startAng),
                y: centerPos.y + RADIUS * Math.sin(startAng)
            };
            var angDiff = Math.abs(startAng - Math.atan2(wv.canvasPos.y, wv.canvasPos.x));
            console.log("angDiff: " + angDiff);
            var dist = Math.sqrt(Math.pow(start.x - wv.canvasPos.x, 2) + Math.pow(start.y - wv.canvasPos.y, 2));
            var controlRadius = BASE_CONTROL_RADIUS
            if (angDiff < Math.PI) {
                controlRadius += dist * 0.9 * Math.pow((Math.PI - angDiff)/Math.PI, 0.9)
            }
            console.log("ctrlRad: " + controlRadius);
            var control = {
                x: centerPos.x + controlRadius * Math.cos(startAng),
                y: centerPos.y + controlRadius * Math.sin(startAng)
            };
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.quadraticCurveTo(control.x, control.y, wv.canvasPos.x, wv.canvasPos.y);
            ctx.strokeStyle = getGroupIdxColorMap(lexiconSynonyms)[groupIdx];
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // TODO: Use ctx.measureText()
    function decluster(wordsVectors) {
        var MINDIST_X = 50;
        var MINDIST_Y = 14
        var QUERY_MINDIST = 200;
        var CONSEC = 100000;
        var wv1, wv2;
        function randomWV() {
            return wordsVectors[Math.floor(Math.random()*wordsVectors.length)];
        }
        function tooCloseX(wv1, wv2) {
            return Math.abs(wv1.canvasPos.x - wv2.canvasPos.x) <
                   Math.abs(wv1.wordWidth/2 + wv2.wordWidth/2);
        }
        function tooCloseY(wv1, wv2) {
            return Math.abs(wv1.canvasPos.y - wv2.canvasPos.y) < MINDIST_Y + 3;
        }
        function distWV(wv1, wv2) {
            return Math.sqrt(Math.pow(wv1.canvasPos.x - wv2.canvasPos.x, 2) +
                             Math.pow((wv1.canvasPos.y - wv2.canvasPos.y)*3, 2));
        }
        var wvQuery = wordsVectors[0];
        for (var i=1; i < wordsVectors.length; i++) {
            wv1 = wordsVectors[i];
            while (distWV(wvQuery, wv1) < QUERY_MINDIST) {
                wv1.canvasPos.x += (Math.random()-0.5)*QUERY_MINDIST*0.2;
                wv1.canvasPos.y += (Math.random()-0.5)*QUERY_MINDIST*0.2;
            }
        }
        var i = CONSEC;
        while (i > 0) {
            i--;
            wv1 = randomWV();
            wv2 = randomWV();
            if (wv1 == wv2) {
                continue;
            }
            while (tooCloseX(wv1, wv2) && tooCloseY(wv1, wv2)) {
                i = CONSEC;
                wv1.canvasPos.x += (Math.random()-0.5)*MINDIST_X*0.2;
                wv1.canvasPos.y += (Math.random()-0.5)*MINDIST_Y*0.2;
            }
        }
    }

    var chkpt_time = (new Date()).getTime()
    function chkpt(msg) {
        var t = chkpt_time;
        chkpt_time = (new Date()).getTime();
        console.log((chkpt_time - t)/1000 + "s: " + msg);
    }

    function wvInEnabledGroup(wv, lexiconSynonyms) {
        for (var i=0; i<lexiconSynonyms.length; i++) {
            var synGroup = lexiconSynonyms[i];
            if (synGroup.enabled && (_.indexOf(synGroup.synonyms, wv.word)) != -1) {
                return true;
            }
        }
        return false;
    }

    window.renderer = {}
    renderer.renderWordsVectors = function(canvas, wordsVectors, lexiconSynonyms, cb) {
        chkpt("starting render");
        wordsVectors = _.filter(wordsVectors, function(wv) {
            return wvInEnabledGroup(wv, lexiconSynonyms) ||
                   wv.isQuery;
        })
        getGroupStartAng.cache = {};
        getGroupIdxColorMap.cache = {};

        var ctx = canvas.getContext('2d');
        _.each(wordsVectors, function(wv) {
            wv.prettyWord = wv.word.replace('_', ' ').replace('_', ' ');
            ctx.font = "14px Sans-Serif";
            wv.wordWidth = ctx.measureText(wv.prettyWord).width;
        });

        // Find bounds of TSNE projections
        var minX = _.min(wordsVectors, function(wv) { return wv.proj[0]; }).proj[0];
        var maxX = _.max(wordsVectors, function(wv) { return wv.proj[0]; }).proj[0];
        var minY = _.min(wordsVectors, function(wv) { return wv.proj[1]; }).proj[1];
        var maxY = _.max(wordsVectors, function(wv) { return wv.proj[1]; }).proj[1];

        // Compute transformation parameters
        var scaleY = canvas.height/(maxY - minY) * 0.90
        var scaleX = canvas.width/(maxX - minX) * 0.80

        var translateX = -(minX + maxX)/2
        var translateY = -(minY + maxY)/2
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        var wvQuery;
        // Place query wv at the front
        _.all(wordsVectors, function(wv, idx) {
            if (wv.isQuery) {
                wvQuery = wv;
                wordsVectors.splice(idx, 1);
                wordsVectors.splice(0, 0, wv);
                return false;
            }
            return true;
        });
        // Compute canvas positions for each word
        _.each(wordsVectors, function(wv) {
            wv.canvasPos = {
                x: (wv.proj[0]+translateX)*scaleX+canvas.width/2,
                y: (wv.proj[1]+translateY)*scaleY+canvas.height/2
            };
        });
        chkpt("generated canvasPos");
        // Spacially separate words that are too close together.
        decluster(wordsVectors);
        chkpt("declustered");
        // Draw bezier curves first
        _.each(wordsVectors, function(wv) {
            drawBezierCurves(wv, wordsVectors, lexiconSynonyms, ctx,
                {x: wvQuery.canvasPos.x,
                 y: wvQuery.canvasPos.y});
        });
        chkpt("drew curves");
        // Draw words
        function renderWV(wv) {
            if (wv.isQuery) {
                ctx.font = "bold 16px Sans-Serif";
                ctx.fillStyle = '#0000FF';
            } else {
                ctx.font = "14px Sans-Serif";
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.strokeText(
                    wv.prettyWord,
                    wv.canvasPos.x - wv.wordWidth/2,
                    wv.canvasPos.y + 7
                );
                ctx.fillStyle = getWordColor(wv.word, lexiconSynonyms);
            }
            ctx.fillText(
                wv.prettyWord,
                wv.canvasPos.x - wv.wordWidth/2,
                wv.canvasPos.y + 7
            );
        }
        // Redraw query word so it's on top.
        _.each(wordsVectors, function(wv) {
            renderWV(wv);
        });
        chkpt("drew words");
        renderWV(wvQuery);
        cb();
    }
}()
