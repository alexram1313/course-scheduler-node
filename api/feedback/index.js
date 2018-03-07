var app = require('express');
const router = app.Router({ mergeParams: true });

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var feedback = require('./feedback');

router.post('/sendFeedback', function(req, res) {
    // var transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: "ZotSchedulerFeedback@gmail.com",
    //         pass: "osTKjTnFKzMKWqiHN1me6AaYPL0z7"
    //     }
    // });

    // var mailOptions = {
    //     from:    'ZotSchedulerFeedback@gmail.com',
    //     to:      'ZotSchedulerFeedback@gmail.com',
    //     subject: 'User Feedback',
    //     text:    feedback.format(req.body)
    // };

    // transporter.sendMail(mailOptions, function(error, info) {
    //     if (error) {
    //         res.status(500).json({error: 'Email could not be sent.'});
    //     } else {
    //         res.status(200).json({success: 'Email successfully sent.'});
    //     }
    // });

    // TODO: build a nicer format for this email, possibly with html.
    var text = feedback.format(req.body);
    console.log('text:', text); //DEBUG

    var msg = {
        to:      'ZotSchedulerFeedback@gmail.com',
        from:    'ZotSchedulerFeedback@gmail.com',
        subject: 'User Feedback',
        html:    text
    };

    //TODO: figure out hot to properly handle this promise.
    sgMail.send(msg)
        .then(function() {
            res.status(200).json({success: 'Email successfully sent.'});
        })
        .catch(function(error) {
            res.status(500).json({error: 'Email could not be sent.'});
        });
});

module.exports = router;