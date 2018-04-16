var awsIot = require('aws-iot-device-sdk');
var SerialPort = require('serialport');


var port = new SerialPort(process.env.PORT, {
  baudRate: 9600
});

port
  .on('open', function (err) {
    console.log('Connected to Arm');
    setTimeout(()=> {
      port.write("c");
    }, 1500);
  })
  .on('data', function(data) {
    console.log("A:", data.toString())
  })
  .on('error', function(error){
    console.log(error);
  });



var broker = awsIot.device({
   keyPath: './certs/MacbookPro.private.key',
  certPath: './certs/MacbookPro.cert.pem',
    caPath: './certs/root-CA.crt',
  clientId: process.env.CLIENT,
      host: process.env.HOST
});


broker
  .on('connect', function() {
    console.log('Connected to Broker');
    broker.subscribe('/arm');
  })
  .on('message', function(topic, payload) {
    const data = JSON.parse(payload.toString());
    switch(data.instruction){
      case "wake":
        port.write("w");
        break;
      case "sleep":
        port.write("s");
        break;
      case "raiseArm":
        port.write("u");
        break;
      case "phone":
        port.write("x");
        break;
      case "lowerArm":
        port.write("d");
        break;

      case "rotateArm":
        port.write(`a${data.data}`);
        break;

      case "rotateHand":
        port.write(`h${data.data}`);
        break;

      case "pickup":
        port.write("p");
        break;

      case "putDown":
        port.write("o");
        break;

      default:
        console.log("unknown instruction", data);
        break;
    }
  });
