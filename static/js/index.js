$(document).ready(function() {
    function updateUrl(inputWord, randomSeed, synGroupIdxs) {
        var params = $.param({inputWord: inputWord, randomSeed: randomSeed});
        params += "&synGroupIdxs=" + synGroupIdxs.join(",");
        window.history.pushState("Hello", "Synonym Visualizer | " + inputWord, "/?" + params);
    }
    var l = Ladda.create($('#input-word-button').get(0));
    $('#input-form').submit(function(e) {
        e.preventDefault();
        l.start();
        var inputWord = $('#input-word').val();
        controller.update(inputWord, Math.floor(Math.random() * (1024)), null, updateUrl, l.stop);
    });

    function getParam(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    if (getParam("inputWord") !== "") {
        l.start();
        var synGroupIdxs = []
        _.each(getParam("synGroupIdxs").split(","), function(idx) {
            synGroupIdxs.push(parseInt(idx));
        });
        controller.update(getParam("inputWord"), parseInt(getParam("randomSeed")), synGroupIdxs, updateUrl, l.stop);
        $("#input-word").val(getParam("inputWord"));
    }
});
