/* eslint no-console: "off" */

'use strict';

var AWS = require('aws-sdk');
var SES = new AWS.SES({
    region: 'us-west-2',
});

var SOURCE = process.env.SOURCE;
var DESTINATION = process.env.DESTINATION;

var maxTipLength = 140;

function done(callback, error, result) {
    if (error) {
        console.log('Error: '+ error);
    } else {
        console.log('Success: '+ result);
    }

    callback(error, result);
}

exports.handler = function(event, context, callback) {
    console.log('Event: ', JSON.stringify(event));

    // context.callbackWaitsForEmptyEventLoop = false; 

    if (!event.tip) {
        done(callback, 'Bad Request: event.tip is missing', null);
        return;
    }
    if ('string' != typeof event.tip) {
        done(callback, 'Bad Request: typeof event.tip is not string: '+
            (typeof event.tip), null);
        return;
    }
    if (event.tip.length > maxTipLength) {
        done(callback, 'Bad Request: event.tip is longer than maxTipLength: '+
            maxTipLength, null);
        return;
    }

    var params = {
        Source: SOURCE,
        Destination: {
            ToAddresses: [DESTINATION],
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: 'Tip Jar: You have a new tip in the Tip Jar!',
            },
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: 'Tip: ' + event.tip,
                },
            },
        },
    };

    console.log('Send Mail');

    var email = SES.sendEmail(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);

            done(callback, 'Send Mail', null);
        } else {
            console.log('Data: ', data);
            console.log('Email: ', email);

            done(callback, null, 'Send Mail');
        }
    });
};
