var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval = require('../retrieval/retrieval');
var schedule  = require('./algorithms-courseformat/courseMatrixUsage')

// .../api/scheduling?courses=["course1","course2",...,"courseN"]
//         &prefs={"mornings":x,"evenings":x,"mondays":x,"fridays":x,"balanced":x,"gaps":x,"openings":x}
router.get('/', function(req, res){
    if (!req.query.hasOwnProperty('courses')){
        res.status(400).json({message:"Make sure to include an courses GET parameter as JSON array"});
    }

    var prefs = {mornings:50,evenings:50,mondays:50,fridays:50,balanced:50,gaps:50,openings:50};


    if (req.query.hasOwnProperty('prefs')){
        prefs = JSON.parse(req.query.prefs);
    }

    var courseSelection = JSON.parse(req.query.courses);
    var coursesLen = courseSelection.length;
    var courses = [];
    var currLen = 0;

    courseSelection.forEach(function(element) {
        retrieval.getSingleCourseByCode(element, function(course){
            
            if (course){
                courses.push(course);
                ++currLen;
            }
            else {
                --coursesLen;
            }
            if (currLen == coursesLen){
                var sched = schedule.genScheds(courses, prefs);
                res.status(200).json({data:sched});
            }
        });
        
    }, this);
})

module.exports = router;