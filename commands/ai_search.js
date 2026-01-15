const axios = require('axios');

module.exports = {
    name: 'ai_search',
    description: 'AI and Search commands',
    async execute(client, m, { command, text, args }) {
        switch (command) {
            case 'ai':
            case 'gpt':
                if (!text) return m.reply('Ask me something!');
                m.reply('Thinking...');
                try {
                    // Using a public free AI API for demonstration
                    const res = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=en`);
                    m.reply(res.data.success || "I'm not sure how to answer that.");
                } catch {
                    m.reply('AI service is currently busy.');
                }
                break;
            case 'google':
                if (!text) return m.reply('What do you want to search?');
                m.reply(`Searching Google for: ${text}\n\nhttps://www.google.com/search?q=${encodeURIComponent(text)}`);
                break;
            case 'lyrics':
                if (!text) return m.reply('Provide a song name!');
                m.reply(`Searching lyrics for ${text}...`);
                try {
                    const res = await axios.get(`https://api.lyrics.ovh/v1/${text.split('|')[0]}/${text.split('|')[1] || ''}`);
                    m.reply(res.data.lyrics || "Lyrics not found.");
                } catch {
                    m.reply("Could not find lyrics. Use format: .lyrics Artist | Song");
                }
                break;
        }
    }
};
