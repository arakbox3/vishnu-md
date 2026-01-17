export default async (sock, msg, args, { command }) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isOwner = botId.includes(sender.split('@')[0]);

    // Database Setup
    if (!global.db) global.db = { groups: {}, settings: { mode: 'public', typing: false, antispam: false } };
    if (!global.db.groups[chat]) global.db.groups[chat] = { antilink: false, welcome: false };

    // --- 1. MODES (Public/Private) ---
    if (command === 'public' && isOwner) {
        global.db.settings.mode = 'public';
        return await sock.sendMessage(chat, { text: "🌐 *BOT MODE: PUBLIC*" });
    }
    if (command === 'private' && isOwner) {
        global.db.settings.mode = 'private';
        return await sock.sendMessage(chat, { text: "🔒 *BOT MODE: PRIVATE*" });
    }

    // --- 2. ADMIN COMMANDS (Kick, Add, Tag) ---
    if (isGroup) {
        const groupMetadata = await sock.groupMetadata(chat);
        const participants = groupMetadata.participants;
        const isBotAdmin = participants.find(p => p.id === botId)?.admin;
        const isSenderAdmin = participants.find(p => p.id === sender)?.admin;

        // .kick
        if (command === 'kick' && isSenderAdmin) {
            let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message.extendedTextMessage?.contextInfo?.participant;
            if (!user) return sock.sendMessage(chat, { text: "Tag or reply to a user to kick." });
            await sock.groupParticipantsUpdate(chat, [user], "remove");
            return sock.sendMessage(chat, { text: "👋 User removed." });
        }

        // .add
        if (command === 'add' && isSenderAdmin) {
            let user = args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            if (!args[0]) return sock.sendMessage(chat, { text: "Provide a number to add." });
            await sock.groupParticipantsUpdate(chat, [user], "add");
            return sock.sendMessage(chat, { text: "✅ User added." });
        }

        // .tag
        if (command === 'tag' && isSenderAdmin) {
            let message = args.join(' ') || "Attention Everyone! 📢";
            let mentions = participants.map(p => p.id);
            return await sock.sendMessage(chat, { text: `⚡ *${message}*`, mentions });
        }
    }

    // --- 3. ON/OFF SETTINGS (Antilink, Welcome, Antispam) ---
    if (isOwner || (isGroup && command !== 'settings')) {
        const type = command.toLowerCase();
        const action = args[0]?.toLowerCase();

        if (['antilink', 'welcome', 'antispam'].includes(type)) {
            if (action === 'on') {
                if (type === 'antispam') global.db.settings.antispam = true;
                else global.db.groups[chat][type] = true;
                return sock.sendMessage(chat, { text: `✅ *${type.toUpperCase()}* is now ON` });
            }
            if (action === 'off') {
                if (type === 'antispam') global.db.settings.antispam = false;
                else global.db.groups[chat][type] = false;
                return sock.sendMessage(chat, { text: `❌ *${type.toUpperCase()}* is now OFF` });
            }
        }
    }

    // --- 4. MAIN SETTINGS MENU ---
    if (command === 'settings' || command === 'set') {
        const menu = `
👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰───────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╭━━━━━━━━━━┈⊷
┃
┃ ⚙️ *SYSTEM CONTROL*
┃
┃ 🔒 *MODE:* ${global.db.settings.mode.toUpperCase()}
┃ 🛡️ *ANTILINK:* ${global.db.groups[chat]?.antilink ? '✅' : '❌'}
┃ 👋 *WELCOME:* ${global.db.groups[chat]?.welcome ? '✅' : '❌'}
┃ ⚠️ *ANTISPAM:* ${global.db.settings.antispam ? '✅' : '❌'}
┃
┣━━━━━━━━━━┈⊷
┃ 💡 *COMMANDS:*
┃ ⊙ .public | .private
┃ ⊙ .antilink on/off
┃ ⊙ .welcome on/off
┃ ⊙ .antispam on/off
┃ ⊙ .kick | .add
┃ ⊙ .tag  | .tagall
╰━━━━━━━━━━┈⊷
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╚━━━⛥❖⛥━━━❥❥❥`;
        return await sock.sendMessage(chat, { text: menu });
    }

    // --- 5. BACKGROUND ENGINE (Antilink & Antispam logic) ---
    if (!global.asuraEngine) {
        global.asuraEngine = true;
        sock.ev.on('messages.upsert', async (upsert) => {
            const m = upsert.messages[0];
            if (!m.message || m.key.fromMe) return;
            const c = m.key.remoteJid;

            // Antilink Logic
            if (c.endsWith('@g.us') && global.db.groups[c]?.antilink) {
                const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
                if (body.match(/chat.whatsapp.com|http/gi)) {
                    await sock.sendMessage(c, { delete: m.key });
                }
            }
        });
    }
};
