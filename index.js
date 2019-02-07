var awsIot = require('aws-iot-device-sdk');
var SerialPort = require('serialport');


var arm = new SerialPort(process.env.PORT, {
  baudRate: 9600
});


function handleMessage(topic, payload){
  const data = JSON.parse(payload.toString());
  switch(data.instruction){
    case "wake":
      arm.write("w");
      break;
    case "sleep":
      arm.write("s");
      break;
    case "raiseArm":
      arm.write("u");
      break;
    case "phone":
      arm.write("x");
      break;
    case "lowerArm":
      arm.write("d");
      break;

    case "rotateArm":
      arm.write(`a${data.data}`);
      break;

    case "rotateHand":
      arm.write(`h${data.data}`);
      break;

    case "pickup":
      arm.write("p");
      break;

    case "putDown":
      arm.write("o");
      break;

    default:
      console.log("unknown instruction", data);
      break;
}


const device = awsIot.device({
   keyPath: "./certs/MacBookSemiPro.private.key",
  certPath: "./certs/MacBookSemiPro.cert.pem",
    caPath: "./certs/root-CA.crt",
  clientId: "robot-arm",
      host: "a2hsm6d1kkjcod-ats.iot.us-east-1.amazonaws.com"
});

device
  .on('connect', function() {
    device.subscribe('arm');
  });

device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });

device
   .on('close', function() {
      console.log('close');
   });
device
   .on('reconnect', function() {
      console.log('reconnect');
   });
device
   .on('offline', function() {
      console.log('offline');
   });
device
   .on('error', function(error) {
      console.log('error', error);
   });
