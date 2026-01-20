import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();
    const isGroup = chat.endsWith('@g.us');
    const imagePath = './media/asura.jpg'; 
    const songPath = './media/song.opus'; 

    // --- Help Menu (Your Design Preserved) ---
    if (!command) {
        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *\`👺Asura MD\`* 」
*╰──────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ASURA ULTIMATE GROUP*
┃      *MANAGER*
┃
┃📜 *COMMANDS:* 
┃🔹 .group add [+91xxx]
┃🔹 .group kick [reply/tag]
┃🔹 .group promot [reply/tag]
┃🔹 .group demote [reply/tag]
┃🔹 .group delete [reply]
┃🔹 .group lock (Only admins)
┃🔹 .group unlock (Everyone)
┃🔹 .group link (Invite link)
┃🔹 .group revoke (Reset link)
┃🔹 .group name [text]
┃🔹 .group bio [text]
┃🔹 .group tag [text]
┃🔹 .group join [link]
┃🔹 .group id (Get Chat ID)
┃
┃💡 *Note:* Only for admins 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // Sending help menu with a thumbnail if it exists
        return sock.sendMessage(chat, { 
            text: helpText,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD GROUP MANAGER",
                    body: "Ultimate Admin Tools",
                    thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
        // 4. Send Opus Audio 
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: { url: songPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: 'Asura MD 👺',
                        body: 'Playing Menu Theme...',
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
                    }
                }
            }, { quoted: msg });
        }
    
    try {
        // --- Join Command (DM & Group) ---
        if (command === 'join') {
            const link = args[1];
            if (!link || !link.includes('chat.whatsapp.com')) return sock.sendMessage(chat, { text: "❌ Please provide a valid group link." });
            const code = link.split('chat.whatsapp.com/')[1];
            await sock.groupAcceptInvite(code);
            return sock.sendMessage(chat, { text: "✅ Successfully joined the group!" });
        }

        if (!isGroup) return sock.sendMessage(chat, { text: "❌ This command can only be used in groups!" });

        // --- Target Logic ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let target = quoted?.participant || (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (command) {
            case 'id':
                await sock.sendMessage(chat, { text: `📍 *Group ID:* ${chat}` });
                break;

            case 'add':
                if (!target) return sock.sendMessage(chat, { text: "👤 Please provide a number or reply to a user!" });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                await sock.sendMessage(chat, { text: "✅ User added successfully." });
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 Please tag or reply to a user to kick." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                await sock.sendMessage(chat, { text: "✅ User removed successfully." });
                break;

            case 'promot':
                if (!target) return sock.sendMessage(chat, { text: "👤 User not found." });
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                await sock.sendMessage(chat, { text: "✅ Admin power granted." });
                break;

            case 'demote':
                if (!target) return sock.sendMessage(chat, { text: "👤 User not found." });
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                await sock.sendMessage(chat, { text: "✅ Admin power revoked." });
                break;

            case 'delete':
                if (!quoted) return sock.sendMessage(chat, { text: "🗑️ Please reply to a message to delete it." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 Group locked. Only admins can send messages." });
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                await sock.sendMessage(chat, { text: "🔓 Group unlocked. Everyone can send messages." });
                break;

            case 'link':
                const inviteCode = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 *Group Link:* https://chat.whatsapp.com/${inviteCode}` });
                break;

            case 'revoke':
                await sock.groupRevokeInvite(chat);
                await sock.sendMessage(chat, { text: "🔄 Group link has been reset." });
                break;

            case 'name':
                const newName = args.slice(1).join(' ');
                if (!newName) return sock.sendMessage(chat, { text: "📝 Please provide a new name." });
                await sock.groupUpdateSubject(chat, newName);
                break;

            case 'bio':
                const newBio = args.slice(1).join(' ');
                if (!newBio) return sock.sendMessage(chat, { text: "📝 Please provide a new description." });
                await sock.groupUpdateDescription(chat, newBio);
                break;

            case 'tag':
                const metadata = await sock.groupMetadata(chat);
                const participants = metadata.participants.map(p => p.id);
                const tagMsg = args.slice(1).join(' ') || 'Attention everyone! 👋';
                await sock.sendMessage(chat, { text: `📢 *${tagMsg}*`, mentions: participants });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ Unknown command! Type `.group` for help." });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Error:* Make sure the bot is an Admin!" });
    }
};
