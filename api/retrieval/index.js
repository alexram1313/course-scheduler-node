var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval = require('./retrieval');

router.get('/YearTermDept', function(req, res){
    retrieval.getSOCYearTermDept(function(result){
        if (result!=false){
            res.status(200).json(result);
        }
        else{
            res.status(200).json({message:"An error has occured"});
        }
    }, false);
});

router.get('/Courses/:term/:dept', function(req, res){
    retrieval.getCourseListingByYearTermDept(req.params.term, req.params.dept, 
        function(result){
            if (result!=false){
                res.status(200).json(result);
            }
            else{
                res.status(200).json({message:"An error has occured"});
            }
        }
    , false);
});

router.get('/Course/:code', function(req, res){
    retrieval.getSingleCourseByCode(req.params.code, function(result){
            if (result!=false){
                res.status(200).json(result);
            }
            else{
                res.status(200).json({message:"An error has occured"});
            }
        }
    );
});


module.exports = router;