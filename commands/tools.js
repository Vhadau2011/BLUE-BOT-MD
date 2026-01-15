module.exports = {
    name: 'tools',
    description: 'Useful tools',
    async execute(client, m, { command, text, args }) {
        switch (command) {
            case 'calculate':
                if (!text) return m.reply("Provide a math expression!");
                try {
                    const result = eval(text);
                    m.reply(`Result: ${result}`);
                } catch {
                    m.reply("Invalid expression!");
                }
                break;
            case 'ping':
                const start = Date.now();
                await m.reply("Pinging...");
                const end = Date.now();
                m.reply(`Pong! Speed: ${end - start}ms`);
                break;
        }
    }
};
