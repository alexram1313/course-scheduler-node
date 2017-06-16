var app = require('express');
const router = app.Router({ mergeParams: true });

var retrieval = require('./retrieval');

router.use('/retrieval', retrieval);

module.exports = router;