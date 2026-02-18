import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, { text: "❌ Example: .insta <link>" }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        const res = await axios.post('https://reelsvideo.io/api/ajaxSearch', 
            new URLSearchParams({ q: query, t: 'media', lang: 'en' }), 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                    'origin': 'https://reelsvideo.io/',
                    'referer': 'https://reelsvideo.io/'
                }
            }
        );

        // Regex - എല്ലാ ഡൗൺലോഡ് ലിങ്കുകളും പിടിച്ചെടുക്കുന്നു
        const allLinks = res.data.data.match(/href=\\"(https:\/\/.*?)\\"/g);
        if (!allLinks || allLinks.length === 0) throw new Error("Private account or Invalid Link");

        // ഡിസൈൻ ക്യാപ്‌ഷൻ (ലൂപ്പിന് മുൻപ് ഡിക്ലയർ ചെയ്യണം)
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Instagram Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* Insta Media
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Instagram
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* Multiple Media
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success ✅
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // ലിങ്കുകൾ ലൂപ്പ് ചെയ്ത് ഓരോന്നായി അയക്കുന്നു
        for (let match of allLinks) {
            let dlUrl = match.replace(/href=\\"/, '').replace(/\\"/, '').replace(/\\/g, '');
            
            // ലിങ്ക് ക്ലീൻ ചെയ്യുന്നു
            if (dlUrl.includes('https://dl.fdownloader.net')) {
                 // ചിലപ്പോൾ ഹെഡറിൽ റീഡയറക്ട് ഉണ്ടാകും, അത് ഒഴിവാക്കാൻ
            }

            const mediaRes = await axios.get(dlUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(mediaRes.data);
            const contentType = mediaRes.headers['content-type'];

            if (contentType.includes('video')) {
                await sock.sendMessage(chat, { 
                    video: buffer, 
                    caption: caption,
                    mimetype: 'video/mp4'
                }, { quoted: msg });
            } else if (contentType.includes('image')) {
                await sock.sendMessage(chat, { 
                    image: buffer, 
                    caption: caption 
                }, { quoted: msg });
            }
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Error: ." }, { quoted: msg });
    }
};
