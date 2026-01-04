import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg';
    
    const ownerMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙ Name:* Arun Cumar
┃ *⊙ Role:* Main Developer
┃ *⊙ Bio:* Creating bots for fun!
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' + 
                'FN:Arun Cumar\n' + 
                'ORG:Asura MD;\n' + 
                'TEL;type=CELL;type=VOICE;waid=919048044745:+91 90480 44745\n' + 
                'END:VCARD';

    if (fs.existsSync(thumbPath)) {
        await sock.sendMessage(chat, { 
            image: fs.readFileSync(thumbPath), 
            caption: ownerMsg 
        }, { quoted: msg });
    }
    
    await sock.sendMessage(chat, { 
        contacts: { displayName: 'Arun Cumar', contacts: [{ vcard }] } 
    }, { quoted: msg });
};
