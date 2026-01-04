Import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    // args-ൽ നിന്നാണ് ഫോൺ നമ്പർ എടുക്കേണ്ടത്
    const phoneNumber = args[0] ? args[0].replace(/[^0-9]/g, '') : null;

    if (!phoneNumber) {
        return sock.sendMessage(chat, { 
            text: "⚠️ Please provide a phone number with country code.\nExample: `.pair 919876543210`" 
        }, { quoted: msg });
    }

    try {
        // Pairing code request
        const code = await sock.requestPairingCode(phoneNumber);
        
        const imagePath = './media/thumb.jpg';
        const songPath = './media/song.ogg';
        
        const pairMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*        
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*

╭╌❲ *ᴄᴏᴘʏ ᴄᴏᴅᴇ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 :- Asura MD
╎ ⊙ 𝙿𝚊𝚒𝚛 𝚌𝚘𝚍𝚎 :- *`+ code +`*
╰╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        const userJid = phoneNumber + '@s.whatsapp.net';

        // 1. Send Image/Text to the target number
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(userJid, { image: fs.readFileSync(imagePath), caption: pairMsg });
        } else {
            await sock.sendMessage(userJid, { text: pairMsg });
        }

        // 2. Send Audio to the target number
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(userJid, { 
                audio: fs.readFileSync(songPath), 
                mimetype: 'audio/mpeg', 
                ptt: false 
            });
        }
        
        // Confirm to the requester
        await sock.sendMessage(chat, { text: `✅ Pairing code sent to ${phoneNumber}` }, { quoted: msg });

    } catch (err) {
        console.error("Pair Command Error:", err);
        await sock.sendMessage(chat, { text: "❌ Error generating pairing code. Make sure the number is correct." }, { quoted: msg });
    }
};
