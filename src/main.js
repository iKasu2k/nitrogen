global.__basedir = __dirname;

/**
 * Include utils and logger
 */
const { randomString, initErrorHandler, ensureExists } = require('./utils/utils');
const logger = require('./utils/logger');

/**
 * Include exec to start/stop Tor Nodes
 */
const exec = require('child_process').exec;
const replace = require('replace-in-file');
const fs = require('fs');
const rimraf = require('rimraf');

/**
 * Include socks5 proxy agent
 */
const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');
const { URLSearchParams } = require('url');

/**
 * Connect to local TOR Gateway
 */
const maxNodes = process.env.TOR_COUNT || 0;
const nodeList = [];
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
    for(var numNode = 0; numNode < maxNodes; numNode++) {

        /** /src/res/.tor/{numNode}  */
        let dataPath = __basedir + '/res/.tor/' + numNode;
        /** /src/res/torrc.2  */
        let configSrcPath = __basedir + '/res/torrc.2';
        /** /src/res/.tor/{numNode}/torrc.2  */
        let configDestPath = dataPath + '/torrc.2';

        logger.debug('Creating Data Directory for Node [' + numNode + ']@' + dataPath);
        /** Create Data Directory at /src/res/.tor/{numNode} */
        ensureExists(dataPath, function(err) {
            if (err) {
                logger.error('Unable to create TOR Data Directory at ' + dataPath);
                logger.error(err);
                process.exit(0);
            }

            logger.debug('Data Directory created!');
        });

        /** Copy config to data directory */
        fs.copyFileSync(configSrcPath, configDestPath);
        logger.debug('Config copied for TOR Node ' + numNode);
       
        
        /** Time to replace SocksPort and DataDir */
        var options = {
            files: configDestPath,
            from: /SocksPort 9060/g,
            to: 'SocksPort ' + (9062 + numNode),
        };
        let changedFiles = replace.sync(options);
        logger.debug('Changed socks port in:' + JSON.stringify(changedFiles));

        options = {
            files: configDestPath,
            from: /DataDirectory \/var\/lib\/tor2/g,
            to: 'DataDirectory ' + dataPath,
        };
        changedFiles = replace.sync(options);  
        logger.debug('Changed DataDirectory in:' + JSON.stringify(changedFiles));
        
        /** Now we're ready to start TOR */
        let nodeProc = exec('tor -f ' + configDestPath);
        nodeProc.stdout.on('data', (data)=>{
            if(data.includes('Bootstrapped 100% (done): Done')){
                startedNodes++;
            }
        });
        nodeProc.stderr.on('data', (data)=>{
            logger.error(data);
        });
          
        nodeList.push(nodeProc);
    }

    /** Wait till all nodes are started & ready to connect. */
    while(startedNodes < maxNodes){
        await sleep(1000);
    }
    logger.info('TOR Nodes Initialised. Connecting, verifying & start scraping!');

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

function cleanUpTor() {
    rimraf.sync(__basedir + '/res/.tor');
}

async function verifyTOR() {
   
    let url = 'https://ifconfig.me';
    var myIP = '';
    await axios({
        url: url
    })
    .then(function (response) {
        if(response.status == 200) {
            myIP = response.data;
        }
    }).catch(function (error) {
        logger.error('Error while testing TOR Node!', error);
    });

    logger.warn('Your original IP: ' + myIP);

    for(var i = 0; i < agents.length; i++) {
        let url = 'https://ifconfig.me';

        await axios({
            url: url,
            httpsAgent: agents[i],
        })
        .then(function (response) {
            if(response.status == 200) {
                if(myIP == response.data) {
                    logger.error('IP LEAK DETECTED!');
                }
                logger.warn('Spoofed IP: ' + response.data);
            }
        }).catch(function (error) {
            logger.error('Error while testing TOR Node!', error);
        });
    }
}

/**
 * Scrape Function, while true sends request to Discord Entitlement API and checks
 * if given code is valid.
 */
async function scrapeCodes() {
    while(true){

        for(var i = 0; i < agents.length; i++) {
            let code = randomString(24);
            let url = 'https://discordapp.com/api/v6/entitlements/gift-codes/' + code;

            axios({
                url: url,
                httpsAgent: agents[i],
            })
            .then(function (response) {
                if(response.status == 200) {
                    logger.info(code + "          <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
                    
                    fs.appendFile('../codes.log', '\n' + code, (err) => {
                        if (err) throw err;
                    });
                }
            }).catch(function (error) {
                if(error.response.status == 404) {
                    logger.info('Invalid Code: ' + code);
                } else if(error.response.status == 429) {
                    sleep(250);
                }
            });
        }

        await sleep(250);
    }
}

var isKilling = false;
function torCleanUp(reason, eventType, p) {
    if(!isKilling) {
        logger.info('Kill Signal received [' + eventType + ']: ' + reason);

        for(var i = 0; i < nodeList; i++) {
            nodeList[i].kill();
        }

        cleanUpTor();
        isKilling = true;
    }
};

// Start Bot
initErrorHandler(torCleanUp);
startTor().then(verifyTOR).then(scrapeCodes);