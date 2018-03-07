var app = require('express');
const router = app.Router({ mergeParams: true });

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var feedback = require('./feedback');

router.post('/sendFeedback', function(req, res) {
    var text = feedback.format(req.body);

    var msg = {
        to:      'ZotSchedulerFeedback@gmail.com',
        from:    'ZotSchedulerFeedback@gmail.com',
        subject: 'User Feedback',
        html:    text
    };

    sgMail.send(msg)
        .then(function() {
            res.status(200).json({success: 'Email successfully sent.'});
        })
        .catch(function(error) {
            res.status(500).json({error: 'Email could not be sent.'});
        });
});

module.exports = router;