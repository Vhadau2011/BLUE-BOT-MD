# BLUE-BOT MD 💙

A fully functional WhatsApp Multi-Device bot with 30+ fun and useful commands.

## 🚀 Features
- QR Code & Pairing Code Authentication
- 30+ Commands (Fun, Tools, Anime, Group, Owner)
- Easy to deploy on Heroku, Replit, or VPS
- Multi-Device support

## 🛠 Setup
1. Clone this repository.
2. Edit `config.js` with your details:
   - `ownerNumber`: Your WhatsApp number.
   - `usePairingCode`: Set to `true` for pairing code or `false` for QR code.
   - `phoneNumber`: Required if using pairing code.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start the bot.

## 📱 Connection Methods
### 1. Pairing Code (Recommended for Panels)
- Set `usePairingCode: true` in `config.js`.
- Enter your phone number in `phoneNumber`.
- When you run the bot, a code will appear in the terminal.
- Open WhatsApp > Linked Devices > Link with Phone Number and enter the code.

### 2. QR Code
- Set `usePairingCode: false` in `config.js`.
- Scan the QR code that appears in the terminal using WhatsApp.

## 📝 Commands
Type `.menu` to see the full list of commands.

## ⚙️ Configuration
In `config.js`:
- `usePairingCode`: Set to `true` for pairing code, `false` for QR code.
- `phoneNumber`: Your WhatsApp number with country code (e.g., `2348123456789`).
- `ownerNumber`: Array of owner numbers.

## 🛡 License
This project is licensed under the MIT License.
