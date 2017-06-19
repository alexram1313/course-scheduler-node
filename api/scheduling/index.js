var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval = require('../retrieval/retrieval');
var schedule  = require('./algorithms-courseformat/courseMatrixUsage')

router.get('/', function(req, res){
    if (!req.query.hasOwnProperty('courses')){
        res.status(400).json({message:"Make sure to include an courses GET parameter as JSON array"});
    }

    var courseSelection = JSON.parse(req.query.courses);
    var coursesLen = courseSelection.length;
    var courses = [];

    courseSelection.forEach(function(element) {
        retrieval.getSingleCourseByCode(element, function(course){
            if (course){
                courses.push(course);
            }
            else {
                --coursesLen;
            }
            if (courses.length == coursesLen){
                var sched = schedule.genScheds(courses);
                res.status(200).json({data:sched});
            }
        });
        
    }, this);
})

module.exports = router;