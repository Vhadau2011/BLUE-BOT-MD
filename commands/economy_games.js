const db = require('../lib/database');

module.exports = {
    name: 'economy_games',
    description: 'Economy and Games',
    async execute(client, m, { command, text, args }) {
        const eco = db.get('economy');
        const user = m.sender;
        if (!eco[user]) eco[user] = { balance: 100, bank: 0, lastDaily: 0 };

        switch (command) {
            case 'balance':
            case 'wallet':
                m.reply(`*🏦 BLUE-BOT BANK 🏦*\n\n*User:* @${user.split('@')[0]}\n*Wallet:* $${eco[user].balance}\n*Bank:* $${eco[user].bank}`, m.chat, { mentions: [user] });
                break;
            case 'daily':
                const now = Date.now();
                if (now - eco[user].lastDaily < 86400000) {
                    const remaining = 86400000 - (now - eco[user].lastDaily);
                    const hours = Math.floor(remaining / 3600000);
                    return m.reply(`You already claimed your daily reward! Come back in ${hours} hours.`);
                }
                eco[user].balance += 500;
                eco[user].lastDaily = now;
                db.set('economy', eco);
                m.reply('You claimed your daily $500! 💰');
                break;
            case 'gamble':
                if (!args[0] || isNaN(args[0])) return m.reply('Usage: .gamble [amount]');
                const amount = parseInt(args[0]);
                if (amount > eco[user].balance) return m.reply('Insufficient funds!');
                if (amount < 10) return m.reply('Minimum gamble is $10');
                
                const win = Math.random() > 0.5;
                if (win) {
                    eco[user].balance += amount;
                    m.reply(`🎉 You won $${amount}! New balance: $${eco[user].balance}`);
                } else {
                    eco[user].balance -= amount;
                    m.reply(`💀 You lost $${amount}. New balance: $${eco[user].balance}`);
                }
                db.set('economy', eco);
                break;
            case 'slot':
                if (eco[user].balance < 50) return m.reply('You need at least $50 to play slots!');
                eco[user].balance -= 50;
                const emojis = ['🍎', '🍋', '🍒', '💎', '🔔'];
                const r1 = emojis[Math.floor(Math.random() * emojis.length)];
                const r2 = emojis[Math.floor(Math.random() * emojis.length)];
                const r3 = emojis[Math.floor(Math.random() * emojis.length)];
                let msg = `[ ${r1} | ${r2} | ${r3} ]\n\n`;
                if (r1 === r2 && r2 === r3) {
                    eco[user].balance += 500;
                    msg += "JACKPOT! You won $500! 💎";
                } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                    eco[user].balance += 100;
                    msg += "Nice! You won $100! ✨";
                } else {
                    msg += "Better luck next time! 💸";
                }
                db.set('economy', eco);
                m.reply(msg);
                break;
        }
    }
};
