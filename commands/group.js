import fs from 'fs';

// Settings സൂക്ഷിക്കാൻ ഒരു ലോക്കൽ ഡാറ്റാബേസ് (ഫയൽ)
const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const command = args[0]?.toLowerCase();
    const imagePath = './media/asura.jpg';
    const songPath = './media/song.opus';

    // --- 1. Help Menu Design ---
    if (!command) {
        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *\`👺Asura MD\`* 」
*╰──────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ULTIMATE GROUP MASTER*
┃
┃🔹 .group id (Get current Chat ID)
┃🔹 .group add [number]
┃🔹 .group kick [tag/reply]
┃🔹 .group promot/demote [tag]
┃🔹 .group tagall [message]
┃🔹 .group welcome on/off
┃🔹 .group antilink on/off
┃🔹 .group antidelete on/off
┃🔹 .group lock/unlock
┃🔹 .group schedule [min] [text]
┃🔹 .group delete [reply]
┃🔹 .group name/bio [text]
┃🔹 .group join [link]
┃
┃💡 *Note:* DM-ൽ JID വെച്ചും ഉപയോഗിക്കാം
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;

        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: "audio/ogg; codecs=opus", ptt: true });
        }
        return sock.sendMessage(chat, { text: helpText });
    }

    try {
        // --- 2. Remote Control Logic (DM handling) ---
        let targetGroup = chat;
        let startIdx = 1;

        // ഒരു JID നൽകിയിട്ടുണ്ടെങ്കിൽ (ഉദാ: .group 1203xxx@g.us add) അത് ടാർഗറ്റ് ആക്കും
        if (args[1] && args[1].includes('@g.us')) {
            targetGroup = args[1];
            startIdx = 2;
        }

        const action = args[startIdx]?.toLowerCase();
        const value = args.slice(startIdx + 1).join(' ');
        const db = getDB();

        // Target User (Tag, Reply, or Number)
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let user = quoted?.participant || (quoted?.mentionedJid?.[0]) || (args[startIdx + 1] ? args[startIdx + 1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        // --- 3. Command Switch System ---
        switch (action) {
            case 'id':
                return sock.sendMessage(chat, { text: `📍 *Chat ID:* ${chat}` }, { quoted: msg });

            case 'welcome':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup].welcome = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `✅ Welcome is now *${value.toUpperCase()}* for this group.` });

            case 'antilink':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup].antilink = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `🛡️ Antilink is now *${value.toUpperCase()}*` });

            case 'antidelete':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup].antidelete = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `🗑️ Antidelete is now *${value.toUpperCase()}*` });

            case 'tagall':
                const metadata = await sock.groupMetadata(targetGroup);
                const participants = metadata.participants.map(p => p.id);
                return sock.sendMessage(targetGroup, { text: `📢 *TAGALL:* ${value || 'Attention!'}`, mentions: participants });

            case 'add':
                await sock.groupParticipantsUpdate(targetGroup, [user], "add");
                break;

            case 'kick':
            case 'remove':
                await sock.groupParticipantsUpdate(targetGroup, [user], "remove");
                break;

            case 'promot':
                await sock.groupParticipantsUpdate(targetGroup, [user], "promote");
                break;

            case 'demote':
                await sock.groupParticipantsUpdate(targetGroup, [user], "demote");
                break;

            case 'lock':
                await sock.groupSettingUpdate(targetGroup, 'announcement');
                break;

            case 'unlock':
                await sock.groupSettingUpdate(targetGroup, 'not_announcement');
                break;

            case 'delete':
                if (!quoted) return sock.sendMessage(chat, { text: "❌ സന്ദേശത്തിന് മറുപടി നൽകുക!" });
                await sock.sendMessage(targetGroup, { delete: { remoteJid: targetGroup, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'name':
                await sock.groupUpdateSubject(targetGroup, value);
                break;

            case 'bio':
                await sock.groupUpdateDescription(targetGroup, value);
                break;

            case 'schedule':
                const [time, ...messageArr] = value.split(' ');
                const scheduleMsg = messageArr.join(' ');
                sock.sendMessage(chat, { text: `🕒 Message set to send in ${time} minutes.` });
                setTimeout(() => {
                    sock.sendMessage(targetGroup, { text: `🕒 *SCHEDULED MESSAGE:*\n\n${scheduleMsg}` });
                }, parseInt(time) * 60000);
                break;

            case 'join':
                const inviteLink = args[startIdx + 1];
                if (!inviteLink) return sock.sendMessage(chat, { text: "❌ Link നൽകുക!" });
                const code = inviteLink.split('chat.whatsapp.com/')[1];
                await sock.groupAcceptInvite(code);
                return sock.sendMessage(chat, { text: "✅ Joined!" });

            default:
                return sock.sendMessage(chat, { text: "❌ അജ്ഞാതമായ കമാൻഡ്! .group എന്ന് ടൈപ്പ് ചെയ്യുക." });
        }

        // Action പൂർത്തിയായാൽ കൺഫർമേഷൻ അയക്കുന്നു
        await sock.sendMessage(chat, { text: `✅ *Executed:* ${action.toUpperCase()}` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Error:* ബോട്ട് അഡ്മിൻ ആണെന്നും JID ശരിയാണെന്നും ഉറപ്പുവരുത്തുക!" });
    }
};
