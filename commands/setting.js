export default async (sock, m, args) => {
    try {
        const chat = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const isGroup = chat.endsWith('@g.us');
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // മെസ്സേജിൽ നിന്ന് കമാൻഡ് വേർതിരിച്ചെടുക്കുന്നു
        const prefix = "."; 
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || "";
        if (!body.startsWith(prefix)) return;
        
        const command = body.slice(prefix.length).trim().split(/\s+/).shift().toLowerCase();
        const fullArgs = body.replace(prefix + command, "").trim();

        // Database Initialization
        if (!global.db) global.db = { groups: {}, settings: { mode: 'public', antispam: false } };
        if (isGroup && !global.db.groups[chat]) global.db.groups[chat] = { antilink: false, welcome: false };

        // 1. PUBLIC / PRIVATE MODE (Owner Only)
        if (command === 'public') {
            global.db.settings.mode = 'public';
            return sock.sendMessage(chat, { text: "🌐 *BOT MODE: PUBLIC*" });
        }
        if (command === 'private') {
            global.db.settings.mode = 'private';
            return sock.sendMessage(chat, { text: "🔒 *BOT MODE: PRIVATE*" });
        }

        // 2. SETTINGS MENU
        if (command === 'setting' || command === 'settings' || command === 'set') {
            const antilinkStatus = global.db.groups[chat]?.antilink ? "🟢 ON" : "🔴 OFF";
            const welcomeStatus = global.db.groups[chat]?.welcome ? "🟢 ON" : "🔴 OFF";
            const spamStatus = global.db.settings.antispam ? "🟢 ON" : "🔴 OFF";
            const modeStatus = global.db.settings.mode.toUpperCase();

            const menu = `
╭━━〔 𓆩 👺 *ASURA MD* 𓆪 〕━━┈⊷
┃
┃ ⚙️ *SYSTEM SETTINGS*
┃
┃ 🔒 *MODE:* ${modeStatus}
┃ 🛡️ *ANTILINK:* ${antilinkStatus}
┃ 👋 *WELCOME:* ${welcomeStatus}
┃ ⚠️ *ANTISPAM:* ${spamStatus}
┃
┣━━━━━━━━━━━━━━━┈⊷
┃ 💡 *AVAILABLE COMMANDS:*
┃ ⊙ .public | .private
┃ ⊙ .antilink on/off
┃ ⊙ .welcome on/off
┃ ⊙ .antispam on/off
┃ ⊙ .kick | .add | .tag
╰━━━━━━━━━━━━━━━┈⊷`;
            return sock.sendMessage(chat, { text: menu });
        }

        // 3. ADMIN TOOLS (Kick, Add, Tag)
        if (isGroup) {
            const groupMetadata = await sock.groupMetadata(chat);
            const participants = groupMetadata.participants;
            const isBotAdmin = participants.find(p => p.id === botId)?.admin;
            const isSenderAdmin = participants.find(p => p.id === sender)?.admin;

            if (command === 'tag' && isSenderAdmin) {
                const mentions = participants.map(p => p.id);
                return sock.sendMessage(chat, { text: `📢 *${fullArgs || 'Attention Everyone!'}*`, mentions });
            }

            if (command === 'kick' && isSenderAdmin && isBotAdmin) {
                let user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message.extendedTextMessage?.contextInfo?.participant;
                if (!user) return sock.sendMessage(chat, { text: "Reply to a message or tag someone." });
                await sock.groupParticipantsUpdate(chat, [user], "remove");
                return sock.sendMessage(chat, { text: "✅ Removed successfully." });
            }

            if (command === 'add' && isSenderAdmin && isBotAdmin) {
                if (!fullArgs) return sock.sendMessage(chat, { text: "Enter number: .add 9199xxxx" });
                const user = fullArgs.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
                await sock.groupParticipantsUpdate(chat, [user], "add");
                return sock.sendMessage(chat, { text: "✅ Added successfully." });
            }

            // 4. ON/OFF TOGGLES
            if (command === 'antilink') {
                global.db.groups[chat].antilink = (fullArgs === 'on');
                return sock.sendMessage(chat, { text: `🛡️ Antilink: ${fullArgs.toUpperCase()}` });
            }
            if (command === 'welcome') {
                global.db.groups[chat].welcome = (fullArgs === 'on');
                return sock.sendMessage(chat, { text: `👋 Welcome: ${fullArgs.toUpperCase()}` });
            }
            if (command === 'antispam') {
                global.db.settings.antispam = (fullArgs === 'on');
                return sock.sendMessage(chat, { text: `⚠️ Antispam: ${fullArgs.toUpperCase()}` });
            }
        }

    } catch (e) {
        console.error("Error in settings.js:", e);
    }
};
