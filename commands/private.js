import fs from 'fs';

export default async (sock, msg, args) => {
  
    if (!msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    global.isPublic = false;

    // Modern Box Design Text
    const text = ` 
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭━〔 *BOT SETTINGS* 〕━┈⊷
┃
┃ 🔒 *STATUS:* PRIVATE MODE
┃ 👤 *USER:* OWNER ONLY
┃ 🛡️ *ACCESS:* RESTRICTED
┃
╰━━━━━━━━━━━━━━┈⊷
*Bot will only respond to your messages.*`;

    // Sending Audio with Thumbnail
    await sock.sendMessage(remoteJid, {
        audio: { url: './media/song.opus' },
        mimetype: 'audio/mp4',
        ptt: true, 
        contextInfo: {
            externalAdReply: {
                title: "ASURA BOT - PRIVATE",
                body: "Privacy Mode Activated",
                thumbnail: fs.readFileSync('./media/asura.jpg'),
                sourceUrl: "", 
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    // Sending the Status Message
    await sock.sendMessage(remoteJid, { text: text }, { quoted: msg });
};
