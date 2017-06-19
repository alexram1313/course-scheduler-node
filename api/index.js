var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval = require('./retrieval');
var scheduling = require('./scheduling');

router.use('/retrieval', retrieval);
router.use('/scheduling', scheduling);

module.exports = router;