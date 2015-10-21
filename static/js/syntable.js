!function() {
    window.syntable = {}
    syntable.renderWordsVectors = function(table, wordsVectors, lexiconSynonyms, renderCanvas) {
        tableBody = $(table).find("tbody");
        htmlstr = ""
        _.each(lexiconSynonyms, function(synGroup) {
            htmlstr += "<tr><td>" + synGroup.synonyms.join(", ") + "</td>";
            htmlstr += "<td>" + synGroup.dataSource +"</td></tr>";
        });
        tableBody.html(htmlstr);
        $(table).show();
    }
}()
