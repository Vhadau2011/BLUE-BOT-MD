const {
    DisconnectReason,
    makeInMemoryStore,
    jidDecode,
    proto,
    getContentType
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const chalk = require("chalk");
const config = require("./config");
const db = require("./lib/database");
const { connectToWhatsApp } = require("./lib/connection");

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

async function startBot() {
    console.log(chalk.blue.bold("\n--- BLUE-BOT MD STARTING ---"));
    
    const { client, saveCreds } = await connectToWhatsApp();

    // Initialize database keys
    if (!db.get('welcome')) db.set('welcome', {});
    if (!db.get('iq')) db.set('iq', {});
    if (!db.get('economy')) db.set('economy', {});
    if (!db.get('leveling')) db.set('leveling', {});

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

    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.yellow(`\n[!] Connection closed. Reason: ${reason}`));
            
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red("Device Logged Out, Please Scan Again."));
                process.exit();
            } else {
                console.log(chalk.cyan("Reconnecting..."));
                startBot();
            }
        } else if (connection === "open") {
            console.log(chalk.green.bold("\n[+] BLUE-BOT MD Connected Successfully!"));
            console.log(chalk.white(`Connected as: ${client.user.name || 'Bot'} (${client.user.id.split(':')[0]})`));
        }
    });

    client.ev.on("creds.update", saveCreds);

    client.ev.on("group-participants.update", async (anu) => {
        try {
            let metadata = await client.groupMetadata(anu.id);
            let participants = anu.participants;
            for (let num of participants) {
                if (anu.action == 'add') {
                    let welcomeMsg = db.get('welcome')[anu.id] || `Welcome @${num.split('@')[0]} to ${metadata.subject}!`;
                    client.sendMessage(anu.id, { text: welcomeMsg, mentions: [num] });
                } else if (anu.action == 'remove') {
                    client.sendMessage(anu.id, { text: `Goodbye @${num.split('@')[0]}, we will miss you!`, mentions: [num] });
                }
            }
        } catch (err) {
            console.log(err);
        }
    });

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
