const {Builder, By, Key, until} = require('selenium-webdriver');
const fs = require('fs')
const readline = require('readline');
const exec = require('child_process').execFile;

const launchpadUrl = 'https://lpj.daybreakgames.com/h1z1/test/';
const launcherArguments = '&campaignID=1065726&promoID=155&launch_args=STEAM_ENABLED%3D1&launchPoint=steam&tPartyCmdLine=Updates%3Aenable%3D0%20Updates%3APatchSelf%3D1%20campaignID%3D1065726%20promoID%3D155%20launchPoint%3Dsteam%20launchArgs%3DSTEAM_ENABLED%3D1%20Updates%3Aenable%3D0%20Updates%3APatchSelf%3D0%20campaignID%3D1065726%20promoID%3D155%20launchPoint%3Dsteam%20launchArgs%3DSTEAM_ENABLED%3D'
const exeFile = 'AdminClient.exe'
//const filepath = 'F:\\Games\\steamapps\\common\\H1Z1 Test\\';
const filepath = 'F:\\JS\\depots\\295111\\3052008 - Copy\\';
const GET_SESSION = 'get_play_session'
let fingerprint = '';

const H1Z1servers = require("h1z1-server");

init();

async function init() {
    await getUserFingerpint()
    loginBrowser();     
}

async function loginBrowser() {

    let driver = await new Builder().forBrowser('chrome').build();
    const timestamp = + new Date();
    await driver.get(launchpadUrl + '?ts' + timestamp + launcherArguments);


    // Lets wait for the user to login
    await driver.wait(until.elementLocated(
        By.className('logged-in')
    ))

    // Get JSON response = session
    await driver.get(launchpadUrl + GET_SESSION +  '?ts' + timestamp + launcherArguments);
    let response = await driver.findElement(By.css('pre')).getText();
    response = JSON.parse(response);

    let args = '';
    args = args += response.launchArgs
    args = args.replace('LaunchPad:Ufp={fingerprint}', 'LaunchPad:Ufp=' + fingerprint)
    args = args.replace('LaunchPad:SessionId=0', 'LaunchPad:SessionId=' + timestamp) // Timestamp or Sessionid?
    args = args.split(' ')


    console.log(args)
    // Launch the game
    exec(exeFile, args, { cwd: filepath }, (err, data) => {
        if (err) console.log(err);
        else console.log(data);
    });
}

async function getUserFingerpint() {
    const viewLog = fs.createReadStream( filepath + '\\LaunchPad.libs\\Logs\\ExternalLogging.log')
    
    const rl = readline.createInterface({
        input: viewLog,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        if(line.includes(' uf=')) {
            a = line.split(' ')
            for await (const w of a) {
                if(w.includes('uf')) {
                    fingerprint = w.replace('uf=', '').replace(',','')
                    return
                }
            }
        }
    }

}

