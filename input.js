const chalk       = require('chalk');
const clear       = require('clear');
const figlet      = require('figlet');
var inquirer      = require('inquirer');
var awsIot = require('aws-iot-device-sdk');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('AlexaArm', { horizontalLayout: 'full'})
  )
);


var SerialPort = require('serialport');

function filterPorts(data) {
  let usb = data.filter((element)=> {
    return true;//element.comName.includes("usb");
  });
  return Promise.resolve(usb);
}

function portSelect(ports){

  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'port',
        message: 'On what port is the arm?',
        choices: ports.map((port)=>{ return port.comName; })
      }
    ]);

}


let connectToArm = answer => {

  const Readline = SerialPort.parsers.Readline;
  const parser = new Readline();

  var port = new SerialPort(answer.port, {
    baudRate: 9600,
    autoOpen: false
  });

  port.pipe(parser);
  parser.on('data', console.log);

  return new Promise((resolve, reject)=> {
    port.on('open', (err)=> {
        console.log('Connected to Arm');
        resolve(port);
      })
      .on('error', function(error){
        reject(error)
      }).open();
  });

}

let connectToBroker = (port) => {
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
  }

SerialPort
  .list()
  .then(filterPorts)
  .then(portSelect)
  .then(connectToArm)
  .then(connectToBroker)
  .catch((e)=> {
    console.log(chalk.red(e));
  });
