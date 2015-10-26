!function() {
    window.syntable = {}
    syntable.renderWordsVectors = function(table, wordsVectors, lexiconSynonyms, renderCanvas) {
        var tableBody = $(table).find('tbody');
        var htmlstr = ''
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var inputId = 'toggle-group-' + idx;
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

            htmlstr += '<td>' + synGroup.dataSource +'</td>';
            htmlstr += '</tr>';
        });
        tableBody.html(htmlstr);
        _.each(lexiconSynonyms, function(synGroup, idx) {
            var inputId = 'toggle-group-' + idx;
            $('#' + inputId).click(function () {
                lexiconSynonyms[idx].enabled = this.checked;
                renderCanvas();
            });
        });
        $(table).show();
    }
}()
