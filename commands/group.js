import fs from 'fs';

// Database simulation to store settings locally
const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();
    const imagePath = './media/asura.jpg';
    const songPath = './media/song.opus';

    // --- 1. Help Menu Design (Updated with all commands) ---
    if (!args[0]) {
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
┃🔹 .group id (Get Chat ID)
┃🔹 .group add [number]
┃🔹 .group kick [tag/reply]
┃🔹 .group promot/demote [tag]
┃🔹 .group tagall [message]
┃🔹 .group lock/unlock
┃🔹 .group delete [reply]
┃🔹 .group schedule [min] [text]
┃🔹 .group name/bio [text]
┃🔹 .group join [link]
┃
┃✨ *SECURITY CONTROLS:*
┃🔹 .group welcome on/off
┃🔹 .group antilink on/off
┃🔹 .group antidelete on/off
┃🔹 .group antispam on/off
┃🔹 .group antiforeign on/off
┃🔹 .group anticall on/off
┃🔹 .group chatbot on/off
┃💡 .Help
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;

        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: "audio/ogg; codecs=opus", ptt: true });
        }
        return sock.sendMessage(chat, { text: helpText });
    }

    try {
        // --- 2. Target Logic (DM/Group Remote Control) ---
        let targetGroup = chat;
        let actionIdx = 0;

        if (args[0] && args[0].includes('@g.us')) {
            targetGroup = args[0];
            actionIdx = 1;
        }

        const action = args[actionIdx]?.toLowerCase();
        const value = args.slice(actionIdx + 1).join(' ');
        const db = getDB();

        // User target detection
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let user = quoted?.participant || (quoted?.mentionedJid?.[0]) || (args[actionIdx + 1] ? args[actionIdx + 1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        // --- 3. Command Switch System ---
        switch (action) {
            case 'id':
                return sock.sendMessage(chat, { text: `📍 *Chat ID:* ${chat}` }, { quoted: msg });

            case 'welcome':
            case 'antilink':
            case 'antidelete':
            case 'antispam':
            case 'antiforeign':
            case 'chatbot':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup][action] = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `✅ *${action.toUpperCase()}* is now *${value.toUpperCase()}*` });

            case 'anticall':
                if (!db['global']) db['global'] = {};
                db['global'].anticall = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `🛡️ *ANTI-CALL* is now *${value.toUpperCase()}* (Global)` });

            case 'tagall':
                const metadata = await sock.groupMetadata(targetGroup);
                const participants = metadata.participants.map(p => p.id);
                return sock.sendMessage(targetGroup, { text: `📢 *TAGALL:* ${value || 'Attention!'}`, mentions: participants });

            case 'add':
                await sock.groupParticipantsUpdate(targetGroup, [user], "add");
                break;

            case 'kick':
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
                if (quoted) await sock.sendMessage(targetGroup, { delete: { remoteJid: targetGroup, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'name':
                await sock.groupUpdateSubject(targetGroup, value);
                break;

            case 'bio':
                await sock.groupUpdateDescription(targetGroup, value);
                break;

            case 'schedule':
                const [time, ...msgArr] = value.split(' ');
                sock.sendMessage(chat, { text: `🕒 Scheduled in ${time} min.` });
                setTimeout(() => {
                    sock.sendMessage(targetGroup, { text: `🕒 *SCHEDULED:* ${msgArr.join(' ')}` });
                }, parseInt(time) * 60000);
                break;

            case 'join':
                const code = args[actionIdx + 1].split('.com/')[1];
                await sock.groupAcceptInvite(code);
                return sock.sendMessage(chat, { text: "✅ Joined!" });

            default:
                return sock.sendMessage(chat, { text: "❌ Invalid action." });
        }

        await sock.sendMessage(chat, { text: `✅ *Executed:* ${action.toUpperCase()}` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Failed:* Permisson Error or Invalid JID." });
    }
};
