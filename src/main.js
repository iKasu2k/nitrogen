global.__basedir = __dirname;

/**
 * Include utils and logger
 */
const { randomString, initErrorHandler } = require('./utils/utils');
const logger = require('./utils/logger');

/**
 * Include exec to start/stop Tor Nodes
 */
const exec = require('child_process').exec;

/**
 * Include socks5 proxy agent
 */
const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');

/**
 * Connect to local TOR Gateway
 */
const maxNodes = process.env.TOR_COUNT || 0;
var startedNodes = 0;

const agents = [];

async function startTor() {

    /**
     * TOR_COUNT specifies the amount of TOR Nodes used for scraping
     */
    if(maxNodes == 0){
        logger.error('No TOR Nodes set. Use TOR_COUNT=x');
        process.exit(0);
    }

    logger.info('Initialising [' + maxNodes + '] TOR Nodes. This will take a Moment!');
    const startTor = exec('sh startTorNodes.sh ' + maxNodes);
    startTor.stdout.on('data', (data)=>{
        if(data.includes('Bootstrapped 100% (done): Done')){
            startedNodes++;
        }
    });
    startTor.stderr.on('data', (data)=>{
        logger.info(data);
    });

    while(startedNodes < maxNodes){
        await sleep(1000);
    }

    
    logger.info('TOR Nodes Initialised. Connecting & Start scraping!');

    for(var i = 0; i < maxNodes; i++) {
        agents.push(new SocksProxyAgent('socks5h://127.0.0.1:' + (9062 + i)))
    }
}

/**
 * Helper function to sleep for aa short moment.
 * @param {int} ms 
 */
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

/**
 * Init Function, while true sends request to Discord Entitlement API and checks
 * if given code is valid.
 */
async function test() {
    while(true){

        for(var i = 0; i < agents.length; i++) {
            let code = randomString(24);
            let url = 'https://discordapp.com/api/v6/entitlements/gift-codes/' + code;

            await axios({
                url: url,
                httpsAgent: agents[i],
            })
            .then(function (response) {
                if(response.status == 200) {
                    logger.info(code + "          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                }
            }).catch(function (error) {
                if(error.response.status == 404) {
                    logger.info('Invalid Code: ' + code);
                    sleep(500);
                } else if(error.response.status == 429) {
                    sleep(250);
                }
            });
        }

        await sleep(250);
    }
}

var isKilling = false;
function torCleanUp() {
    if(!isKilling) {
        logger.info('Killing all Tor Nodes...');
        const killTor = exec('sh killTorNodes.sh');
        killTor.stdout.on('data', (data)=>{
            logger.info(data);
            process.exit(0);
        });
        killTor.stderr.on('data', (data)=>{
            logger.error('Error while starting TOR Nodes.');
            console.log(data);
        });

        isKilling = true;
    }
};

// Start Bot
initErrorHandler(torCleanUp);
startTor();
test();