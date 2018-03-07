var app = require('express');
const router = app.Router({ mergeParams: true });

var nodemailer = require('nodemailer');

router.post('/sendFeedback', function(req, res) {
    var format = function(data) {
        var output = '';

        Object.keys(data).sort().forEach(function(prop){
            if (!data.hasOwnProperty(prop)) return;

            var elem = data[prop];
            if (elem.type === 'rating') {
                output += elem.name + ': ' + (elem.data * 100).toFixed(0) + '%'
            } else {
                output += elem.name + '(' + elem.type + '): ' + elem.data;
            }
            output += '\n';
        });

        return output;
    }

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
        subject: 'Test 2',
        text:    format(req.body)
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