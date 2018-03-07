function formatFeedback(data) {
    var keyOrder = [
        'ease',
        'timeSaved',
        'preferenceMatch',
        'useAgain',
        'useful',
        'annoying',
        'misc'
    ];

    var bold = function(text) {
        return '<strong>' + text + '</strong>';
    }

    var par = function(text) {
        return '<p>' + text + '</p>';
    }

    var formatElement = function(elem) {
        var body = '';
        var boldName = bold(elem.name + ':');
        if (elem.type === 'rating') {
            body = boldName + ' ' + (elem.data * 100).toFixed(0) + '%'

        } else if (elem.type === 'free response') {
            body = boldName + '<br/>' + (elem.data ? elem.data : 'No response');

        } else if (elem.data) {
            body = (elem.name ? boldName + ' ' : '') +
                   (elem.type ? '(' + elem.type + ') ' : '') +
                    elem.data;

        } else {
            return '';
        }
        return par(body);
    }

    var output = keyOrder.map(function(k){ return formatElement(data[k]); })
                         .filter(function(x){return !(x === undefined || x === '');})
                         .join('');

    Object.keys(data).sort().forEach(function(prop){
        if (!data.hasOwnProperty(prop)) return;
        if (keyOrder.indexOf(prop) > -1) return;

        output += formatElement(data[prop]) + '\n';
    });

    return output;
}

module.exports = {
    format: formatFeedback
};