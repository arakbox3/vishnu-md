import fs from 'fs';
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const db = JSON.parse(fs.readFileSync('./media/asura_db.json'));
    if (!db[chat]) db[chat] = {};
    db[chat].antiforeign = (args[0] === 'on');
    fs.writeFileSync('./media/asura_db.json', JSON.stringify(db, null, 2));
    await sock.sendMessage(chat, { text: `✅ Antiforeign is now *${args[0].toUpperCase()}*` });
};
