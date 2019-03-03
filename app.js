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

async function tryFetch(url, times){
  for(var i = 0; i < times; i++){
    try{
      await asyncFetch(url)
      Logger.debug(`Success to access: ${url}`)
      break;
    }catch(err){
      console.log(`Failed by Error: ${err}`);
    }
  }
}

async function asyncFetch(url){
  return new Promise((res, rej) => {
    fetch(url)
      .then(() => { res() })
      .catch(() => { rej() });
  });
}

async function mainProc(){
  await tryFetch(`${lp.arm_ip}/power?state=true`, 5);
  await tryFetch(`${lp.arm_ip}/hand?percentage=30`, 5);
  await tryFetch(`${lp.arm_ip}/wrist?percentage=0`, 5);
  await tryFetch(`${lp.arm_ip}/arm?percentage=0`, 5);
  await tryFetch(`${lp.arm_ip}/arm?percentage=100`, 5);
  await tryFetch(`${lp.arm_ip}/power?state=false`, 5);
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

// mainProc();
