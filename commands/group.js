const db = require('../lib/database');

module.exports = {
    name: 'group',
    description: 'Group management',
    async execute(client, m, { command, text, args, isGroup, isAdmins }) {
        if (!isGroup) return m.reply('This command is for groups only!');
        
        switch (command) {
            case 'hidetag':
                const groupMetadata = await client.groupMetadata(m.chat);
                const participants = groupMetadata.participants;
                client.sendMessage(m.chat, { text: text ? text : "Hello everyone!", mentions: participants.map(a => a.id) });
                break;
            case 'setwelcome':
                if (!isAdmins) return m.reply('Admins only!');
                if (!text) return m.reply('Provide a welcome message!');
                const welcomes = db.get('welcome');
                welcomes[m.chat] = text;
                db.set('welcome', welcomes);
                m.reply('Welcome message updated for this group!');
                break;
            case 'getwelcome':
                const currentWelcome = db.get('welcome')[m.chat] || 'No welcome message set.';
                m.reply(`*Current Welcome:*\n${currentWelcome}`);
                break;
        }
    }
};
