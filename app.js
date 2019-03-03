const ns = require('node-schedule');
const fetch = require('node-fetch');
const log4js = require('log4js');
const lp = require('./local_property');

log4js.configure({
  appenders: {
      system: {type: 'file', filename: 'connection.log'}
  },
  categories: {
      default: {appenders:['system'], level: 'debug'}
  }
});

let Logger = log4js.getLogger();

function mainProc(){
  return new Promise((res, rej) => {
    console.log(lp)
    fetch(`${lp.arm_ip}/power?state=true`)
      .then(() => { return fetch(`${lp.arm_ip}/hand?percentage=30`) })
      .then(() => { return fetch(`${lp.arm_ip}/wrist?percentage=0`) })
      .then(() => { return fetch(`${lp.arm_ip}/arm?percentage=0`) })
      .then(() => { return fetch(`${lp.arm_ip}/arm?percentage=100`) })
      .then(() => { return fetch(`${lp.arm_ip}/power?state=false`) })
      .then(() => {
         Logger.debug('Success!');
	 res();
      })
      .catch((err) => {
        Logger.debug(`Failed by Error: ${err}`);
        rej(err);
      });
  })
}

var switchOn = ns.scheduleJob('30 7 * * 0,1,2,4,5,6', function () {
  mainProc()
   .catch((err) => { console.log(err) });
});

var switchOff1 = ns.scheduleJob('0 18 * * 0,1,5,6', function () {
  mainProc()
   .catch((err) => { console.log(err) });
});

var switchOff2 = ns.scheduleJob('0 21 * * 2,4', function () {
  mainProc()
   .catch((err) => { console.log(err) });
});


 mainProc()
   .then(() => { console.log('fin') })
   .catch((err) => { console.log(err) });
