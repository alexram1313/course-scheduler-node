var low = require('lowdb');
var moment = require('moment');

var db = low('./coursecache.json', {
    storage: require('lowdb/lib/storages/file-async')
});

db.defaults({
    updatetime: moment().add(1, 'day').format(),
    depts:{},
    courses: {}
}).write()

function resetCache(now) {
    now.add(1, 'day');
    db.set('updatetime', now.format()).set('depts',{}).set('courses', {}).write();
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
            try {
                if (db.has('courses.' + course_code))
                    result = db.get('courses.' + course_code).value();

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
                // console.log(db.has('courses.' + term + '.' + dept).value())
                if (db.has('depts.' + term + ':' + dept).value()) {
                    result = {};
                    courseList = db.get('depts.' + term + ':' + dept).value()
                    courseLen  = courseLen.length;

                    for (var i = 0; i<courseLen; ++i){
                        var code = term + ':' + dept+':'+courseList[i];
                        result[code] = db.get('courses.'+code);
                    }
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
            db.set('courses.' + code, course).write();
            callback("OK");

        } catch (err) {
            callback(err);
        }

    },
    addDeptToCache: function(term, dept, courses, callback){
        var deptPtrs = [];

        var deptCode = term+":"+dept;

        var courseLen = courses.length;
        for (var i = 0; i<courseLen; ++i){
            deptPtrs.push(courses[i].code.split(':')[2]);
            module.exports.addCourseToCache(courses[i], function(derp){});
        }

        db.set('depts.'+deptCode, deptPtrs).write();
        callback("OK");
    }

}


