!function() {
    window.syntable = {}
    syntable.renderWordsVectors = function(table, wordsVectors, lexiconSynonyms, renderCanvas) {
        var tableBody = $(table).find('tbody');
        var htmlstr = ''
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

            htmlstr += '<td>' + synGroup.dataSource;
            htmlstr += ' <button id="' + isolateButtonId + '" class="btn btn-default btn-xs">Isolate</button>';
            //htmlstr += ' <button id="' + enableButtonId + '" class="btn btn-default btn-xs">Enable all</button>';
            //htmlstr += ' <button id="' + disableButtonId + '" class="btn btn-default btn-xs">Disable all</button>';
            htmlstr += '</td>';
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
