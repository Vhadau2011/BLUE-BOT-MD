const config = require('../config');

module.exports = {
    name: 'owner',
    description: 'Owner only commands',
    async execute(client, m, { command, text, isOwner }) {
        if (!isOwner) return m.reply('Owner only!');
        
        switch (command) {
            case 'eval':
                try {
                    let evaled = await eval(text);
                    if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                    m.reply(evaled);
                } catch (err) {
                    m.reply(String(err));
                }
                break;
            case 'restart':
                await m.reply("Restarting...");
                process.exit();
                break;
        }
    }
};
