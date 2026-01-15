module.exports = {
    name: 'media_dl',
    description: 'Media and Downloaders',
    async execute(client, m, { command, text, args }) {
        switch (command) {
            case 'sticker':
            case 's':
                m.reply('Feature coming soon: Converting image/video to sticker...');
                break;
            case 'ytmp3':
            case 'play':
                if (!text) return m.reply('Provide a YouTube link or song name!');
                m.reply(`Searching and downloading ${text} as MP3...`);
                break;
            case 'ytmp4':
            case 'video':
                if (!text) return m.reply('Provide a YouTube link!');
                m.reply(`Downloading video from ${text}...`);
                break;
            case 'tiktok':
                if (!text) return m.reply('Provide a TikTok link!');
                m.reply(`Fetching TikTok video from ${text}...`);
                break;
            case 'img':
            case 'image':
                if (!text) return m.reply('What image should I search for?');
                m.reply(`Searching for images of: ${text}...`);
                break;
        }
    }
};
