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

    var formatElement = function(elem) {
        if (elem.type === 'rating') {
            return elem.name + ': ' + (elem.data * 100).toFixed(0) + '%'

        } else if (elem.type === 'free response') {
            return elem.name + ':\n' + (elem.data ? elem.data : 'No response') + '\n';

        } else if (elem.data) {
            if (elem.type) {
                return (elem.name ? elem.name + ' ' : '') + '(' + elem.type + '): ' + elem.data;
            } else {
                return (elem.name ? elem.name + ': ' : '') + elem.data;
            }
        } else {
            return '';
        }
    }

    var output = keyOrder.map(function(k){ return formatElement(data[k]); })
                         .filter(function(x){return !(x === undefined || x === '');})
                         .join('\n');

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