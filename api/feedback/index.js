var app = require('express');
const router = app.Router({ mergeParams: true });

var nodemailer = require('nodemailer');

var feedback = require('./feedback');

router.post('/sendFeedback', function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "ZotSchedulerFeedback@gmail.com",
            pass: "osTKjTnFKzMKWqiHN1me6AaYPL0z7"
        }
    });

    var mailOptions = {
        from:    'ZotSchedulerFeedback@gmail.com',
        to:      'ZotSchedulerFeedback@gmail.com',
        subject: 'User Feedback',
        text:    feedback.format(req.body)
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            res.status(500).json({error: 'Email could not be sent.'});
        } else {
            res.status(200).json({success: 'Email successfully sent.'});
        }
    });
});

module.exports = router;