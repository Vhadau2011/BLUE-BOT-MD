const config = require("./config");
const fs = require("fs");
const path = require("path");

// Load all commands from the commands folder
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const cmdModule = require(`./commands/${file}`);
    commands.set(cmdModule.name, cmdModule);
}

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
        const isGroup = m.isGroup;
        
        let isAdmins = false;
        if (isGroup) {
            const groupMetadata = await client.groupMetadata(from);
            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin !== null).map(p => p.id);
            isAdmins = admins.includes(sender);
        }

        if (!isCmd) return;

        // Special case for menu
        if (command === 'menu' || command === 'help') {
            let menuText = `*💙 BLUE-BOT MD MODULAR 💙*\n\n` +
                `*User:* ${pushname}\n` +
                `*Prefix:* ${prefix}\n\n`;
            
            for (const [name, cmd] of commands) {
                menuText += `*--- ${name.toUpperCase()} ---*\n`;
                // Note: In a real bot, you'd list sub-commands here. 
                // For this demo, we'll just show the category.
                menuText += `Category: ${cmd.description}\n\n`;
            }
            menuText += `*Type ${prefix}[command] to use.*\n*BLUE-BOT MD BY MANUS*`;
            return m.reply(menuText);
        }

        // Route to modular commands
        for (const [name, cmdModule] of commands) {
            // This is a simple routing. In a more complex bot, 
            // you'd map individual commands to their modules.
            // For now, we'll let each module check if it handles the command.
            await cmdModule.execute(client, m, { command, text, args, pushname, isOwner, isGroup, isAdmins });
        }

    } catch (err) {
        console.log(err);
    }
};
