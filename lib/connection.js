const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    delay 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const config = require("../config");

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName || "session");
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: !config.usePairingCode,
        auth: state,
        browser: ["BLUE-BOT MD", "Safari", "1.0.0"]
    });

    // Handle Pairing Code
    if (config.usePairingCode && !client.authState.creds.registered) {
        if (!config.phoneNumber) {
            console.log(chalk.red.bold("\n[!] ERROR: Phone number is missing in config.js for pairing code."));
            process.exit(1);
        }
        
        console.log(chalk.cyan.bold("\n[*] Requesting pairing code for: ") + chalk.white(config.phoneNumber));
        
        try {
            await delay(3000);
            let code = await client.requestPairingCode(config.phoneNumber.replace(/[^0-9]/g, ''));
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black.bgGreen.bold("\n YOUR PAIRING CODE: ") + " " + chalk.white.bold(code) + " \n");
        } catch (error) {
            console.log(chalk.red("\n[!] Failed to request pairing code: "), error);
        }
    }

    return { client, saveCreds };
}

module.exports = { connectToWhatsApp };
