var app = require('express');
const router = app.Router({ mergeParams: true });

const retrieval = require('../api/retrieval/retrieval');

//Web API Controller
router.get('/population', function(req, res){
    var cookies = req.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, 'addedCourses')) {
        functions.listAddedCourses(cookies.addedCourses, function(result){
                res.cookie('addedCourses', result.valid).
                    json(result.display);
        });
    } else {
        addedCourses = [];
        functions.listAddedCourses(addedCourses, function(result){
            res.cookie('addedCourses', addedCourses).
                json(result.display);
        });
    }
});


router.post('/population/:code', function (req, res) {
    // console.log(req.cookies);
    var cookies = req.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, 'addedCourses')) {
        // console.log(cookies.addedCourses);
        if (cookies.addedCourses.indexOf(req.params.code) === -1)
            cookies.addedCourses.push(req.params.code);

        functions.listAddedCourses(cookies.addedCourses, function(result){
                res.cookie('addedCourses', result.valid).
                    json(result.display);
            });
    }
    else {
        addedCourses = [req.params.code];
        functions.listAddedCourses(addedCourses, function(result){
            res.cookie('addedCourses', addedCourses).
                json(result.display);
        });
    }
});

router.delete('/population/:index', function (req, res) {
    // console.log(req.cookies);
    var cookies = req.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, 'addedCourses')) {
       
        if ((req.params.index < cookies.addedCourses) && (req.params.index >= 0))
        {
            cookies.addedCourses.splice(req.params.index,1);

            functions.listAddedCourses(cookies.addedCourses, function(result){
                res.cookie('addedCourses', result.valid).
                    json(result.display);
            });

            
        }
        else
        {
            functions.listAddedCourses(cookies.addedCourses, function(result){
                json(result.display);
            });
        }
    }
    else {
        addedCourses = [];
        functions.listAddedCourses(addedCourses, function(result){
            res.cookie('addedCourses', addedCourses).
                send(result.display);
        });
    }
});

//Useful functions

functions = {
    listAddedCourses: function (addedCourses, callback = null) {
        var len = addedCourses.length;
        var correct = [];
        var display = [];

        var output = '';

        var skips = 0;

        for (var i = 0; i<len; ++i){
            retrieval.getSingleCourseByCode(addedCourses[i], function (result) {
                if (result != false){
                    correct.push(addedCourses[i])
                    var code = result.code;
                    var name = result.name;

                    display.push({id:code, name:name});
                }
            })
        };

        if(!(typeof (callback) === 'function' && callback({
            display:display,
            valid: correct
        })))
        {
            return display;
        }
    }
}

module.exports = { router: router, utils: functions };