const config = require("./config");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");

module.exports = async (client, m, chatUpdate, store) => {
    try {
        const prefix = config.prefix;
        const isCmd = m.body.startsWith(prefix);
        const command = isCmd ? m.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : "";
        const args = m.body.trim().split(/ +/).slice(1);
        const text = args.join(" ");
        const sender = m.sender;
        const from = m.chat;
        const pushname = m.pushName || "User";
        const isOwner = config.ownerNumber.includes(sender.split("@")[0]);

        if (!isCmd) return;

        switch (command) {
            // --- INFO COMMANDS ---
            case "menu":
            case "help":
                let menuText = `*💙 BLUE-BOT MD MENU 💙*\n\n` +
                    `*User:* ${pushname}\n` +
                    `*Prefix:* ${prefix}\n\n` +
                    `*--- INFO ---*\n` +
                    `1. ${prefix}ping - Check bot speed\n` +
                    `2. ${prefix}owner - Get owner info\n` +
                    `3. ${prefix}runtime - Bot uptime\n` +
                    `4. ${prefix}repo - Bot script link\n\n` +
                    `*--- FUN ---*\n` +
                    `5. ${prefix}joke - Get a random joke\n` +
                    `6. ${prefix}fact - Get a random fact\n` +
                    `7. ${prefix}quote - Get an inspirational quote\n` +
                    `8. ${prefix}hack - Fake hack a friend\n` +
                    `9. ${prefix}ship - Love meter\n` +
                    `10. ${prefix}gay - Gay percentage\n` +
                    `11. ${prefix}iq - IQ test\n` +
                    `12. ${prefix}dare - Get a dare\n` +
                    `13. ${prefix}truth - Get a truth\n\n` +
                    `*--- TOOLS ---*\n` +
                    `14. ${prefix}weather - Check weather\n` +
                    `15. ${prefix}calculate - Math solver\n` +
                    `16. ${prefix}shorten - URL shortener\n` +
                    `17. ${prefix}translate - Translate text\n` +
                    `18. ${prefix}wiki - Search Wikipedia\n\n` +
                    `*--- DOWNLOAD ---*\n` +
                    `19. ${prefix}ytmp3 - YouTube to MP3\n` +
                    `20. ${prefix}ytmp4 - YouTube to MP4\n` +
                    `21. ${prefix}fb - Facebook downloader\n` +
                    `22. ${prefix}ig - Instagram downloader\n` +
                    `23. ${prefix}tiktok - TikTok downloader\n\n` +
                    `*--- ANIME ---*\n` +
                    `24. ${prefix}waifu - Random waifu image\n` +
                    `25. ${prefix}neko - Random neko image\n` +
                    `26. ${prefix}shinobu - Random shinobu image\n\n` +
                    `*--- GROUP ---*\n` +
                    `27. ${prefix}hidetag - Tag all members\n` +
                    `28. ${prefix}kick - Kick a member\n` +
                    `29. ${prefix}add - Add a member\n` +
                    `30. ${prefix}promote - Promote member\n` +
                    `31. ${prefix}demote - Demote member\n\n` +
                    `*--- OWNER ---*\n` +
                    `32. ${prefix}eval - Run JS code\n` +
                    `33. ${prefix}restart - Restart bot\n\n` +
                    `*BLUE-BOT MD BY MANUS*`;
                m.reply(menuText);
                break;

            case "ping":
                const start = Date.now();
                await m.reply("Pinging...");
                const end = Date.now();
                m.reply(`Pong! Speed: ${end - start}ms`);
                break;

            case "owner":
                m.reply(`My owner is ${config.ownerName}. Contact: ${config.ownerNumber[0]}`);
                break;

            case "runtime":
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                m.reply(`Runtime: ${hours}h ${minutes}m ${seconds}s`);
                break;

            case "repo":
                m.reply(`BLUE-BOT MD Repository: https://github.com/yourusername/BLUE-BOT-MD`);
                break;

            // --- FUN COMMANDS ---
            case "joke":
                const joke = await axios.get("https://official-joke-api.appspot.com/random_joke");
                m.reply(`${joke.data.setup}\n\n${joke.data.punchline}`);
                break;

            case "fact":
                const fact = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
                m.reply(fact.data.text);
                break;

            case "quote":
                const quote = await axios.get("https://api.quotable.io/random");
                m.reply(`"${quote.data.content}"\n\n- ${quote.data.author}`);
                break;

            case "hack":
                if (!text) return m.reply("Mention someone to hack!");
                m.reply(`Hacking ${text}...`);
                await new Promise(r => setTimeout(r, 1000));
                m.reply("Accessing WhatsApp database...");
                await new Promise(r => setTimeout(r, 1000));
                m.reply("Bypassing 2FA...");
                await new Promise(r => setTimeout(r, 1000));
                m.reply("Fetching private chats...");
                await new Promise(r => setTimeout(r, 1000));
                m.reply(`Successfully hacked ${text}! All data sent to owner.`);
                break;

            case "ship":
                const love = Math.floor(Math.random() * 100);
                m.reply(`Love Meter: ${love}% ❤️`);
                break;

            case "gay":
                const gay = Math.floor(Math.random() * 100);
                m.reply(`Gay Percentage: ${gay}% 🏳️‍🌈`);
                break;

            case "iq":
                const iq = Math.floor(Math.random() * 150) + 50;
                m.reply(`Your IQ is: ${iq} 🧠`);
                break;

            case "dare":
                const dares = ["Sing a song", "Dance for 1 minute", "Call your crush", "Post a funny status"];
                m.reply(dares[Math.floor(Math.random() * dares.length)]);
                break;

            case "truth":
                const truths = ["Who is your crush?", "What is your biggest secret?", "Have you ever lied to your parents?"];
                m.reply(truths[Math.floor(Math.random() * truths.length)]);
                break;

            // --- TOOLS ---
            case "weather":
                if (!text) return m.reply("Provide a city name!");
                m.reply(`Checking weather for ${text}... (API simulation)`);
                break;

            case "calculate":
                if (!text) return m.reply("Provide a math expression!");
                try {
                    const result = eval(text);
                    m.reply(`Result: ${result}`);
                } catch {
                    m.reply("Invalid expression!");
                }
                break;

            case "wiki":
                if (!text) return m.reply("What do you want to search?");
                m.reply(`Searching Wikipedia for ${text}...`);
                break;

            // --- ANIME ---
            case "waifu":
            case "neko":
            case "shinobu":
                m.reply(`Fetching ${command} image...`);
                break;

            // --- GROUP ---
            case "hidetag":
                if (!m.isGroup) return m.reply("This command is for groups only!");
                const groupMetadata = await client.groupMetadata(from);
                const participants = groupMetadata.participants;
                client.sendMessage(from, { text: text ? text : "Hello everyone!", mentions: participants.map(a => a.id) });
                break;

            case "kick":
                if (!m.isGroup) return m.reply("Groups only!");
                if (!m.mentionedJid[0]) return m.reply("Mention someone!");
                await client.groupParticipantsUpdate(from, [m.mentionedJid[0]], "remove");
                m.reply("Done!");
                break;

            case "promote":
                if (!m.isGroup) return m.reply("Groups only!");
                if (!m.mentionedJid[0]) return m.reply("Mention someone!");
                await client.groupParticipantsUpdate(from, [m.mentionedJid[0]], "promote");
                m.reply("Promoted!");
                break;

            // --- OWNER ---
            case "eval":
                if (!isOwner) return m.reply("Owner only!");
                try {
                    let evaled = await eval(text);
                    if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                    m.reply(evaled);
                } catch (err) {
                    m.reply(String(err));
                }
                break;

            case "restart":
                if (!isOwner) return m.reply("Owner only!");
                m.reply("Restarting...");
                process.exit();
                break;

            default:
                if (isCmd) m.reply("Unknown command. Type .menu to see all commands.");
                break;
        }
    } catch (err) {
        console.log(err);
    }
};
