// 2016 MIT licence. Nick Malcolm.
// Based on https://gist.github.com/stevebowman/7cff9dd80b227c899728

// Makes a call using Twilio's API.
// Expects the following Lambda environment variables:
//   TWILIO_ACCOUNT_SID - 'AC8ceab6e484b87ceda30d2e7b323c1c39'
//   TWILIO_AUTH_TOKEN  - 'c510a4035b8f7bce831028d14795d5a6'
//   TWILIO_FROM_NUMBER - '+12408028891'

// We'll call this number
var toNumber = '+15713298350';

var https = require('https');
var queryString = require('querystring');

// Lambda function:
exports.handler = function (event, context) {
  console.log('Running event');

  // Tells Twilio to make a voice call to the number provided in the event data.
  // End the lambda function when the send function completes.
  MakeCall(toNumber, function (status) { context.done(null, status); });
};

// Triggers a voice call using the Twilio API
// to: Phone number to send to
// completedCallback(status) : Callback with status message when the function completes.
function MakeCall(to, completedCallback) {

  // Options and headers for the HTTP request
  var options = {
    host: 'api.twilio.com',
    port: 443,
    path: '/2010-04-01/Accounts/' + process.env.TWILIO_ACCOUNT_SID + '/Calls.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + new Buffer(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64')
    }
  };

  // Setup the HTTP request and our response
  var req = https.request(options, function (res) {
    res.setEncoding('utf-8');
    // Collect response data as it comes back.
    var responseString = '';
    res.on('data', function (data) {
      responseString += data;
    });

    // Log the responce received from Twilio.
    // Or could use JSON.parse(responseString) here to get at individual properties.
    res.on('end', function () {
      console.log('Twilio Response: ' + responseString);
      completedCallback('API request sent successfully.');
    });
  });

  // Handler for HTTP request errors.
  req.on('error', function (e) {
    console.error('HTTP error: ' + e.message);
    completedCallback('API request completed with error(s).');
  });

  // Use twimlets to generate our TwiML on the fly.
  // Twilio expects a URL it can POST at, so we can't host the TwiML on S3 :(
  // This says "ThisData Alarm", then plays a great wee barbershop song by the PagerDuty team
  //    source: https://support.pagerduty.com/hc/en-us/articles/219534828)
  twiml = {
    Twiml:  '<Response>\n' +
              '<Say voice="alice">ThisData Alarm!</Say>\n' +
              '<Play>\n' +
                'http://thisdata-public-misc.s3-website-us-west-2.amazonaws.com/servers-on-fire.mp3\n' +
              '</Play>' +
            '</Response>'
  };
  url = "http://twimlets.com/echo?" + queryString.stringify(twiml);

  // Create the payload we want to send, including the Twiml location, from
  //   which Twilio will fetch instructions when the call connects
  var body = {
    To: to,
    From: process.env.TWILIO_FROM_NUMBER,
    Url: url,
  };
  var bodyString = queryString.stringify(body);

  // Send the HTTP request to the Twilio API.
  // Log the message we are sending to Twilio.
  req.write(bodyString);
  req.end();
}
