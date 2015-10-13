!function() {

    function getWordColor(word, lexiconSynonyms) {
        var count = 0
        _.each(lexiconSynonyms, function(synGroup) {
            if ($.inArray(word, synGroup.synonyms) != -1) {
                count++;
            }
        });
        if (count == 0) return "#CCC";
        if (count == 1) return "#444";
        if (count == 2) return "#333";
        if (count == 3) return "#222";
        if (count == 4) return "#111";
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
        out = [];
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var ml = 140;
            var new_light_color = 'rgb(' + (Math.floor((255-ml)*Math.random()) + ml) + ',' +
                (Math.floor((255-ml)*Math.random()) + ml) + ',' +
                (Math.floor((256-ml)*Math.random()) + ml) + ')';
            out[idx] = new_light_color;
        });
        return out;
    }
    var getGroupIdxColorMap = _.memoize(getGroupIdxColorMap_);

    function drawBezierCurves(wv, wordsVectors, lexiconSynonyms, ctx, centerPos) {
        var RADIUS = 35;
        var CONTROL_RADIUS = 100;
        var wordGroupIdxs = [];
        _.each(lexiconSynonyms, function(synGroup, idx) {
            if ($.inArray(wv.word, synGroup.synonyms) != -1) {
                wordGroupIdxs.push(idx);
            }
        });
        _.each(wordGroupIdxs, function(groupIdx) {
            var startAng = getGroupStartAng(groupIdx, wordsVectors, lexiconSynonyms);
            var start = {
                x: centerPos.x + RADIUS * Math.cos(startAng),
                y: centerPos.y + RADIUS * Math.sin(startAng)
            };
            var control = {
                x: centerPos.x + CONTROL_RADIUS * Math.cos(startAng),
                y: centerPos.y + CONTROL_RADIUS * Math.sin(startAng)
            };
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.quadraticCurveTo(control.x, control.y, wv.canvasPos.x+15, wv.canvasPos.y);
            ctx.strokeStyle = getGroupIdxColorMap(lexiconSynonyms)[groupIdx];
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // TODO: Use ctx.measureText()
    function decluster(wordsVectors) {
        var MINDIST = 50;
        var QUERY_MINDIST = 100;
        var CONSEC = 100000;
        var wv1, wv2;
        function randomWV() {
            return wordsVectors[Math.floor(Math.random()*wordsVectors.length)];
        }
        function distWV(wv1, wv2) {
            return Math.sqrt(Math.pow(wv1.canvasPos.x - wv2.canvasPos.x, 2) +
                             Math.pow((wv1.canvasPos.y - wv2.canvasPos.y)*3, 2));
        }
        var i = CONSEC;
        while (i > 0) {
            i--;
            wv1 = randomWV();
            wv2 = randomWV();
            if (wv1 == wv2) {
                continue;
            }
            while (distWV(wv1, wv2) < MINDIST) {
                i = CONSEC;
                wv1.canvasPos.x += (Math.random()-0.5)*MINDIST*0.5;
                wv1.canvasPos.y += (Math.random()-0.5)*MINDIST*0.2;
            }
        }
        var wvQuery = wordsVectors[0];
        for (var i=1; i < wordsVectors.length; i++) {
            wv1 = wordsVectors[i];
            while (distWV(wvQuery, wv1) < QUERY_MINDIST) {
                wv1.canvasPos.x += (Math.random()-0.5)*MINDIST;
                wv1.canvasPos.y += (Math.random()-0.5)*MINDIST;
            }
        }
    }

    var chkpt_time = (new Date()).getTime()
    function chkpt(msg) {
        var t = chkpt_time;
        chkpt_time = (new Date()).getTime();
        console.log((chkpt_time - t)/1000 + "s: " + msg);
    }

    window.renderer = {}
    renderer.renderWordsVectors = function(canvas, wordsVectors, lexiconSynonyms) {
        chkpt("starting render");
        getGroupStartAng.cache = {};
        getGroupIdxColorMap.cache = {};
        var ctx = canvas.getContext('2d');
        var maxX = _.max(wordsVectors, function(wv) {
            return wv.proj[0];
        });
        var maxY = _.max(wordsVectors, function(wv) {
            return wv.proj[1];
        });
        var scale = _.min([
            canvas.height/(2*maxY.proj[1]) * 0.8,
            canvas.width/(2*maxX.proj[0]) * 0.8,
        ]);
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.fill();
        ctx.fill(); // Inexplicably, sometimes the first wipe does not cover everything.
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
                x: wv.proj[0]*scale+canvas.width/2,
                y: wv.proj[1]*scale+canvas.height/2
            };
        });
        chkpt("generated canvasPos");
        // Spacially separate words that are too close together.
        decluster(wordsVectors);
        chkpt("declustered");
        // Draw bezier curves first
        _.each(wordsVectors, function(wv) {
            drawBezierCurves(wv, wordsVectors, lexiconSynonyms, ctx,
                {x: wvQuery.canvasPos.x + 15,
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
                ctx.fillStyle = getWordColor(wv.word, lexiconSynonyms);
            }
            ctx.fillText(
                wv.word.replace('_', ' ').replace('_', ' '),
                wv.canvasPos.x,
                wv.canvasPos.y
            );
        }
        // Redraw query word so it's on top.
        _.each(wordsVectors, function(wv) {
            renderWV(wv);
        });
        chkpt("drew words");
        renderWV(wvQuery);
    }
}()
