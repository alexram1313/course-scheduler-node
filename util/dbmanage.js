var low = require('lowdb');
var moment = require('moment');

var db = low('./coursecache.json', {
    storage: require('lowdb/lib/storages/file-async')
});

db.defaults({
    updatetime: moment().add(1, 'day').format(),
    courses: {}
}).write()

function resetCache(now) {
    now.add(1, 'day');
    db.set('updatetime', now.format()).set('courses', {}).write();
}

module.exports = {

    courseInCache: function (course_code, callback) {
        var result = false;
        var updatetime = db.get('updatetime').value();
        var now = moment();

        if (now.diff(moment(updatetime, moment.ISO_8601)) >= 0) {
            resetCache(now);
            callback(false);
        } else {
            var tokens = course_code.split(':');

            try {
                var term = tokens[0];
                var dept = tokens[1];
                var num = tokens[2];

                if (db.has('courses.' + term + '.' + dept + '.' + num))
                    result = db.get('courses.' + term + '.' + dept + '.' + num).value();

                callback(result);

            } catch (err) {
                callback(false);
            }
        }
    },

    deptInCache: function (term, dept, callback) {
        var result = false;
        var updatetime = db.get('updatetime').value();
        var now = moment();

        if (now.diff(moment(updatetime, moment.ISO_8601)) >= 0) {
            resetCache(now);
            callback(false);
        } else {
            try {
                console.log(db.has('courses.' + term + '.' + dept).value())
                if (db.has('courses.' + term + '.' + dept).value()) {
                    result = db.get('courses.' + term + '.' + dept).value();
                }
                callback(result);

            } catch (err) {
                console.log(err);
                callback(false);
            }
        }
    },
    addCourseToCache: function (course, callback) {
        var code = course.code;

        try {
            var tokens = code.split(':');
            var term = tokens[0];
            var dept = tokens[1];
            var num = tokens[2];

            db.set('courses.' + term + '.' + dept + '.' + num, course).write();
            callback("OK");

        } catch (err) {
            callback(err);
        }

    }

}


