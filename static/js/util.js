!function() {

window.util = {}
util.convertHex = function(hex){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgb('+r+','+g+','+b+')';
    return result;
}

util.rgbToRgba = function(rgb, alpha) {
    return rgb.replace(')', ', '+alpha+')').replace('rgb', 'rgba');
}

util.shadeRGBColor_ = function(color, percent) {
    var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
    return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
}
util.shadeRGBColor = _.memoize(util.shadeRGBColor_, function(color, percent) {
    return color+percent;
});

}();
