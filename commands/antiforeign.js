import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const DB_PATH = './media/asura_db.json';

    try {
        // 1. ഫയൽ ഉണ്ടോ എന്ന് നോക്കി റീഡ് ചെയ്യുന്നു
        let db = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};

        // 2. ഇൻപുട്ട് ചെക്ക് ചെയ്യുന്നു (on/off ഉണ്ടോ എന്ന്)
        if (!args[0]) {
            return sock.sendMessage(chat, { text: "❓ how to use: *.antiforeign on* or *off*" });
        }

        const status = args[0].toLowerCase();
        if (status !== 'on' && status !== 'off') {
            return sock.sendMessage(chat, { text: "❌ *on* or *off*." });
        }

        // 3. ഡാറ്റാബേസ് അപ്‌ഡേറ്റ്
        if (!db[chat]) db[chat] = {};
        db[chat].antiforeign = (status === 'on');
        
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        // 4. മറുപടി നൽകുന്നു
        await sock.sendMessage(chat, { text: `✅ *Antiforeign*  *${status.toUpperCase()}*📳.` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "⚠️ ഡാറ്റാബേസ് അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ ചെറിയൊരു പിശക് സംഭവിച്ചു." });
    }
};
