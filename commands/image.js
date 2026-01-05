import gis from 'g-i-s';
import { promisify } from 'util';

const gisPromise = promisify(gis);

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imageName = args.join(" ");
    const thumbPath = './media/thumb.jpg';

    if (!imageName) {
        return sock.sendMessage(chat, { text: "Please provide a name! (eg: .image Joker)" }, { quoted: msg });
    }

    try {
        // ഗൂഗിൾ ഇമേജ് സെർച്ച് ചെയ്യുന്നു
        const results = await gisPromise(imageName);

        if (results && results.length > 0) {
            // ആദ്യത്തെ 15 റിസൾട്ടിൽ നിന്ന് ഒരെണ്ണം എടുക്കുന്നു
            const randomImg = results[Math.floor(Math.random() * Math.min(results.length, 15))].url;

            const tagMsg = `*👺⃝⃘̉̉━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆* *⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────❂*
┃
┃╭╌❲ *ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ* ❳
┃⊙ *Result for:* ${imageName}
┃╰╌╌╌╌╌╌╌╌╌࿐
┃°☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━⛥❖⛥━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

            await sock.sendMessage(chat, { 
                image: { url: randomImg }, 
                caption: tagMsg 
            }, { quoted: msg });

        } else {
            await sock.sendMessage(chat, { text: "❌ No images found for: " + imageName });
        }
    } catch (err) {
        console.error("GIS Error:", err);
        await sock.sendMessage(chat, { text: "❌ Error fetching images." });
    }
};
