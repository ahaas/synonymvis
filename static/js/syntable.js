/* This file manages the displaying and functionality of the synonym
 * table below the canvas.
 * */

!function() {
    window.syntable = {}
    syntable.renderWordsVectors = function(table, wordsVectors, lexiconSynonyms, renderCanvas) {
        var tableBody = $(table).find('tbody');
        var htmlstr = ''

        // Build a map of: dataSource -> #synGroups
        var numSource = {}
        _.each(lexiconSynonyms, function(synGroup) {
            var src = synGroup.dataSource;
            numSource[src] = (numSource[src] || 0) + 1;
        });
        console.log(numSource); // TODO DELETE

        var prevSource = ""
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var inputId = 'toggle-group-' + idx;
            var isolateButtonId = 'isolate-source-' + idx;
            var enableButtonId = 'enable-source-' + idx;
            var disableButtonId = 'disable-source-' + idx;

            htmlstr += '<tr>';
            htmlstr += '<td><input id="' + inputId + '" type="checkbox" '
            if (synGroup.enabled) {
                htmlstr += 'checked';
            }
            htmlstr += '></td>'
            if (synGroup.enabled) {
                htmlstr += '<td><div class="color-legend-box" style="background-color:' + synGroup.color + '"></div></td>'
            } else {
                htmlstr += '<td></td>'
            }
            htmlstr += '<td>' + synGroup.synonyms.join(', ') + '</td>';

            var src = synGroup.dataSource;
            if (src != prevSource) {
                htmlstr += '<td rowspan=' + numSource[synGroup.dataSource] + '>' + synGroup.dataSource + '<br/>';
                htmlstr += ' <button id="' + isolateButtonId + '" class="btn btn-default btn-xs">Isolate</button>';
                htmlstr += ' <button id="' + enableButtonId + '" class="btn btn-default btn-xs">Enable</button>';
                htmlstr += ' <button id="' + disableButtonId + '" class="btn btn-default btn-xs">Disable</button>';
                htmlstr += '</td>';
                prevSource = src
            }
            htmlstr += '</tr>';
        });
        tableBody.html(htmlstr);
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var inputId = 'toggle-group-' + idx;
            $('#' + inputId).click(function () {
                synGroup.enabled = this.checked;
                renderCanvas();
            });

            var isolateButtonId = 'isolate-source-' + idx;
            var source = synGroup.dataSource;
            $('#' + isolateButtonId).click(function () {
                _.each(lexiconSynonyms, function(synGroup2, idx2) {
                    synGroup2.enabled = (synGroup2.dataSource == source);
                });
                renderCanvas();
            });

            var enableButtonId = 'enable-source-' + idx;
            $('#' + enableButtonId).click(function () {
                _.each(lexiconSynonyms, function(synGroup2, idx2) {
                    console.log(source, synGroup2.dataSource, source==synGroup2.dataSource);
                    if (synGroup2.dataSource == source) {
                        synGroup2.enabled = true;
                    }
                });
                renderCanvas();
            });

            var disableButtonId = 'disable-source-' + idx;
            $('#' + disableButtonId).click(function () {
                _.each(lexiconSynonyms, function(synGroup2, idx2) {
                    if (synGroup2.dataSource == source) {
                        synGroup2.enabled = false;
                    }
                });
                renderCanvas();
            });
        });
        $(table).show();
    }
}()
