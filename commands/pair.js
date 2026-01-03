import fs from 'fs';

export default async (sock, msg, query) => {
    // query-ലൂടെ ഫോൺ നമ്പർ ലഭിക്കുന്നുണ്ടോ എന്ന് നോക്കുക (ഉദാ: .pair 919876543210)
    const phoneNumber = query.replace(/[^0-9]/g, '');
    const chat = msg.key.remoteJid;

    if (!phoneNumber) {
        return sock.sendMessage(chat, { text: "⚠️ Please provide a phone number with country code.\nExample: `.pair 91xxxxxxxxx`" });
    }

    try {
        // പെയറിംഗ് കോഡ് ജനറേറ്റ് ചെയ്യുന്നു
        const code = await sock.requestPairingCode(phoneNumber);
        
        const imagePath = './media/thumb.jpg';
        const songPath = './media/song.ogg';
        
        const pairMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD✨*

╭╌❲ *ᴄᴏᴘʏ ᴄᴏᴅᴇ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 :- Asura MD
╎ ⊙ 𝙿𝚊𝚒𝚛 𝚌𝚘𝚍𝚎 :- *${code}*
╰╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        const userJid = phoneNumber + '@s.whatsapp.net';

        // 1. ഫോട്ടോയും കോഡും അയക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(userJid, { image: fs.readFileSync(imagePath), caption: pairMsg });
        } else {
            await sock.sendMessage(userJid, { text: pairMsg });
        }

        // 2. ഓഡിയോ അയക്കുന്നു
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(userJid, { 
                audio: fs.readFileSync(songPath), 
                mimetype: 'audio/mp4', 
                ptt: true 
            });
        }
        
        await sock.sendMessage(chat, { text: `✅ Pairing code sent to ${phoneNumber}` });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(chat, { text: "❌ Error generating pairing code." });
    }
};
