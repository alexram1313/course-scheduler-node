const router = require('express').Router( {mergeParams: true });
const retrieval = require('../api/retrieval/retrieval');

//Web API Controller

router.get('/retrieval/courselistdrop/:term/:dept', function(req, res){
  retrieval.getCourseListingByYearTermDept(req.params.term, req.params.dept, function(data){
    res.send(data.data);
  });
});

//Useful functions

functions = {
  listAddedCourses:function(first = true){
    //if cookie non-existent or empty
    return "<p>Select some courses first. Then they'll appear here.</p><script>$('#genSched').prop('disabled', true);</script>";
  }
}

module.exports = {router:router, utils:functions};