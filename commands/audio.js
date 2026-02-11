import axios from 'axios';
import ytSearch from 'yt-search';

const getAudioLink = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    
    return convertData.downloadURL; 
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ .audio name/link!" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 1. YouTube Search
        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Not Found");

        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 2. തംബ്നെയിൽ വിത്ത് ക്യാപ്ഷൻ അയക്കുന്നു
        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        // 3. സ്ട്രീമിംഗ് ലിങ്ക് എടുക്കുന്നു
        const audioUrl = await getAudioLink(video.url);
        
        // രീതി 1: Regular Audio File
        await sock.sendMessage(chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: msg });

        await sock.sendMessage(chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true 
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};
