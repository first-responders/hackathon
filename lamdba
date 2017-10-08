"use strict";

const AWS = require("aws-sdk");

const sns = new AWS.SNS({ apiVersion: "2010-03-31" });

var params = {
	Message: "Unknown user is alerting you" /* required */,
	TopicArn: "arn:aws:sns:us-east-1:179183100440:TestGD"
};

exports.handler = (event, context, callback) => {
    console.log(event);
    console.log(event.body);
    
    var serialNumber = event.serialNumber
    var latitude = 40.7628380
    var longitude = -73.9824649
    if (event.body !== undefined) {
        console.log("using body serialNumber")
        var data = JSON.parse(event.body)
        serialNumber = data.serialNumber
        latitude = data.latitude
        longitude = data.longitude
    }
    var uri = "https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent(latitude)
    +"%2C"+encodeURIComponent(longitude)
    console.log(serialNumber);
    
    switch(serialNumber) {
    case "G030JF057167EF4S":
        params.Message = "Gary health condition is good and location: "+uri
        params.TopicArn = "arn:aws:sns:us-east-1:179183100440:GaryTopic"
        break;
    case "G030JF056136X7W8":
        params.Message = "Omkar health condition is good and location: "+uri;
        params.TopicArn = "arn:aws:sns:us-east-1:179183100440:OmkarTopic"
        break;
    default:
        
    }
    
	sns.publish(params, function(err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
			callback(null, { statusCode: 500, body: JSON.stringify(err) });
		}
		else{
    		console.log(data); // successful response  
    	    callback(null, { statusCode: 200, body: JSON.stringify(params) });
		} 
	});
};

