'use strict';

var AWS = require('aws-sdk');
var SES = new AWS.SES();

var SOURCE = process.env.SOURCE;
var DESTINATION = process.env.DESTINATION;

exports.handler = function (event, context) {
    sendEmail(event, function (e, data) {
        context.done(e, null);
    });
};
 
function sendEmail (event, done) {
    var params = {
        Source: SOURCE,
        Destination: {
            ToAddresses: [ DESTINATION ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: 'Tip: ' + event.tip
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Tip Jar: You have a new tip in the Tip Jar!'
            }
        }
    };
    
    SES.sendEmail(params, done);
}
