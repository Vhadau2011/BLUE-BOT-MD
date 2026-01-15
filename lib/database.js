const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../database.json');

const loadDB = () => {
    if (!fs.existsSync(dbPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {
        return {};
    }
};

const saveDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
    get: (key) => {
        const db = loadDB();
        return db[key] || {};
    },
    set: (key, value) => {
        const db = loadDB();
        db[key] = value;
        saveDB(db);
    },
    all: () => loadDB()
};
