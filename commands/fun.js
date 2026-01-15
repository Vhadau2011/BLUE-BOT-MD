const axios = require('axios');
const db = require('../lib/database');

module.exports = {
    name: 'fun',
    description: 'Fun and games',
    async execute(client, m, { command, text, args, pushname }) {
        switch (command) {
            case 'joke':
                const joke = await axios.get("https://official-joke-api.appspot.com/random_joke");
                m.reply(`${joke.data.setup}\n\n${joke.data.punchline}`);
                break;
            case 'fact':
                const fact = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
                m.reply(fact.data.text);
                break;
            case 'iq':
                const userIQ = db.get('iq');
                if (!userIQ[m.sender]) {
                    userIQ[m.sender] = Math.floor(Math.random() * 150) + 50;
                    db.set('iq', userIQ);
                }
                m.reply(`@${m.sender.split('@')[0]}, your IQ is: ${userIQ[m.sender]} 🧠`, m.chat, { mentions: [m.sender] });
                break;
            case 'ship':
                if (!m.mentionedJid[0]) return m.reply('Mention someone to ship with!');
                const love = Math.floor(Math.random() * 100);
                m.reply(`*Shipping Result:*\n\n@${m.sender.split('@')[0]} ❤️ @${m.mentionedJid[0].split('@')[0]}\n\n*Love Meter:* ${love}%`, m.chat, { mentions: [m.sender, m.mentionedJid[0]] });
                break;
        }
    }
};
