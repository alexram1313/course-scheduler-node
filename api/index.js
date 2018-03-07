var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval  = require('./retrieval');
var scheduling = require('./scheduling');
var feedback   = require('./feedback');

router.use('/retrieval',  retrieval);
router.use('/scheduling', scheduling);
router.use('/feedback',   feedback);

module.exports = router;