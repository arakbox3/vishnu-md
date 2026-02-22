import fs from 'fs';

export default async (sock, msg, args) => {
    if (!msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    global.isPublic = true;

    const text = `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭━〔 *BOT SETTINGS* 〕━┈⊷
├⊙ 🔓 *STATUS:* PUBLIC MODE
╰━━━━━━━━━━━┈⊷
├⊙ 👥 *USER:* EVERYONE
╰━━━━━━━━━━━┈⊷
├⊙ 🌎 *ACCESS:* UNRESTRICTED
╰━━━━━━━━━━━┈⊷
*Bot will now respond to everyone.*`;

    // Sending Audio with Thumbnail
    await sock.sendMessage(remoteJid, {
        audio: { url: './media/song.opus' },
        mimetype: 'audio/mp4',
        ptt: true,
        contextInfo: {
            externalAdReply: {
                title: "ASURA BOT - PUBLIC",
                body: "Public Mode Activated",
                thumbnail: fs.readFileSync('./media/asura.jpg'),
                sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    await sock.sendMessage(remoteJid, { text: text }, { quoted: msg });
};
