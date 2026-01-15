const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType,
    delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const NodeCache = require("node-cache");
const config = require("./config");
const db = require("./lib/database");

const msgRetryCounterCache = new NodeCache();
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: !config.usePairingCode,
        auth: state,
        msgRetryCounterCache,
        browser: ["BLUE-BOT MD", "Safari", "1.0.0"]
    });

    if (config.usePairingCode && !client.authState.creds.registered) {
        if (!config.phoneNumber) {
            console.log(chalk.red("Phone number is required for pairing code. Please set it in config.js"));
            process.exit(1);
        }
        setTimeout(async () => {
            let code = await client.requestPairingCode(config.phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.yellow(`Your Pairing Code: `), chalk.bold.white(code));
        }, 3000);
    }

    store.bind(client.ev);

    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = (getContentType(mek.message) === 'viewOnceMessage') ? mek.message.viewOnceMessage.message : mek.message;
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return;
            const m = smsg(client, mek, store);
            require("./command_handler")(client, m, chatUpdate, store);
        } catch (err) {
            console.log(err);
        }
    });

    // Initialize database keys if they don't exist
    if (!db.get('welcome')) db.set('welcome', {});
    if (!db.get('iq')) db.set('iq', {});

    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && !config.usePairingCode) {
            console.log(chalk.yellow("Scan the QR code above to connect."));
        }
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("Device Logged Out, Please Scan Again And Run.");
                process.exit();
            } else {
                startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.green("BLUE-BOT MD Connected Successfully!"));
        }
    });

    client.ev.on("creds.update", saveCreds);

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };

    return client;
}

function smsg(client, m, store) {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith("@g.us");
        m.sender = client.decodeJid((m.fromMe && client.user.id) || m.participant || m.key.participant || m.chat || "");
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == "viewOnceMessage" ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        m.body = (m.mtype === "conversation") ? m.message.conversation : (m.mtype == "imageMessage") ? m.message.imageMessage.caption : (m.mtype == "videoMessage") ? m.message.videoMessage.caption : (m.mtype == "extendedTextMessage") ? m.message.extendedTextMessage.text : (m.mtype == "buttonsResponseMessage") ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == "listResponseMessage") ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == "templateButtonReplyMessage") ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === "messageContextInfo") ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : "";
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
        if (m.quoted) {
            let type = getContentType(quoted);
            m.quoted = m.quoted[type];
            if (["productMessage"].includes(type)) {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === "string") m.quoted = { text: m.quoted };
            m.quoted.mtype = type;
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.sender = client.decodeJid(m.msg.contextInfo.participant);
            m.quoted.fromMe = m.quoted.sender === client.decodeJid(client.user.id);
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || "";
        }
    }
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || "";
    m.reply = (text, chatId = m.chat, options = {}) => client.sendMessage(chatId, { text: text, ...options }, { quoted: m });

    return m;
}

startBot();
