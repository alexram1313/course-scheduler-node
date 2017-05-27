var app = require('express');
const router = app.Router({ mergeParams: true });

const retrieval = require('../api/retrieval/retrieval');

//Web API Controller

router.get('/retrieval/courselistdrop/:term/:dept', function (req, res) {
    retrieval.getCourseListingByYearTermDept(req.params.term, req.params.dept, function (data) {
        res.send(data.data);
    });
});

router.get('/population/add/:code', function (req, res) {
    // console.log(req.cookies);
    var cookies = req.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, 'addedCourses')) {
        if (cookies.addedCourses.indexOf(req.params.code) === -1)
            cookies.addedCourses.push(req.params.code);

        functions.listAddedCourses(cookies.addedCourses, function(result){
                res.cookie('addedCourses', result.valid).
                    send(result.display);
            });
    }
    else {
        addedCourses = [];
        functions.listAddedCourses(addedCourses, function(result){
            res.cookie('addedCourses', addedCourses).
                send(result.display);
        });
    }
});

router.get('/population/del/:index', function (req, res) {
    // console.log(req.cookies);
    var cookies = req.cookies;
    if (Object.prototype.hasOwnProperty.call(cookies, 'addedCourses')) {
       
        if ((req.params.index < cookies.addedCourses) && (req.params.index >= 0))
        {
            cookies.addedCourses.splice(req.params.index,1);

            functions.listAddedCourses(cookies.addedCourses, function(result){
                res.cookie('addedCourses', result.valid).
                    send(result.display);
            });

            
        }
        else
        {
            functions.listAddedCourses(cookies.addedCourses, function(result){
                res.send(result.display);
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

        var output = '';

        var skips = 0;

        for (var i = 0; i<len; ++i){
            retrieval.getSingleCourseByCode(addedCourses[i], function (result) {
                if (result != false){
                    correct.push(addedCourses[i])
                    var code = result.code;
                    var name = result.name;
                    var temp = i - skips;
                    output += '<li id="' + result.code + '" style="color:#0039ad;">' + result.name +' <a onclick="delPopCourses(' + temp + ');" href="javascript:void(0)">[X]</a></li>';
                }
                else
                {
                    skips += 1;
                }
            })
        };

        if(!(typeof (callback) === 'function' && callback({
            display: (correct.length>0)?
                output+'<script>$("#genSched").prop("disabled", false);</script>':
                "<p>Select some courses first. Then they'll appear here.</p><script>$('#genSched').prop('disabled', true);</script>",
            valid: correct
        }))){

        return (correct.length>0)?
                output+'<script>$("#genSched").prop("disabled", false);</script>':
                "<p>Select some courses first. Then they'll appear here.</p><script>$('#genSched').prop('disabled', true);</script>";
        }
    }
}

module.exports = { router: router, utils: functions };