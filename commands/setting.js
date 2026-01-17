import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isOwner = botId.includes(sender.split('@')[0]);

    // തമ്പ്നെയിൽ ചിത്രത്തിന്റെ പാത്ത്
    const imagePath = './media/thumb.jpg'; 
    const body = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();
    
    // ഡാറ്റാബേസ് സെറ്റപ്പ്
    if (!global.db) global.db = { settings: { mode: 'public' } };

    // കമാൻഡ് ചെക്കിംഗ്
    if (body === '.public' && isOwner) {
        global.db.settings.mode = 'public';
        return await sendStatus(sock, chat, "🌐 PUBLIC MODE ENABLED", imagePath);
    }

    if (body === '.private' && isOwner) {
        global.db.settings.mode = 'private';
        return await sendStatus(sock, chat, "🔒 PRIVATE MODE ENABLED", imagePath);
    }
};


async function sendStatus(sock, chat, statusText, imagePath) {
    const design = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
┃  ${statusText}
╚━━━━⛥❖⛥━━━❥❥❥

> *✅ Select a command from the list above and type it with a dot.*

© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ
𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { 
            image: { url: imagePath }, 
            caption: design 
        });
    } else {
        await sock.sendMessage(chat, { text: design });
    }
}
