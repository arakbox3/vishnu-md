import yts from "yt-search";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const searchText = args.join(" ");

    if (!searchText) return sock.sendMessage(chat, { text: "Usage: .video <name>" });

    try {
        const search = await yts(searchText);
        const video = search.videos[0];
        if (!video) return sock.sendMessage(chat, { text: "Video Not Found 😢" });

        // നിങ്ങളുടെ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText }, { quoted: msg });

        let streamUrl = null;

        // --- IP Rotation Logic (Multiple Invidious Instances) ---
        // ഒരെണ്ണം ബ്ലോക്ക് ആയാൽ അടുത്ത ഐപി സെർവർ തനിയെ എടുക്കും
        const instances = [
            'https://invidious.projectsegfau.lt',
            'https://inv.tux.rs',
            'https://invidious.nerdvpn.de',
            'https://inv.riverside.rocks'
        ];

        // തനിയെ ഐപി മാറാനുള്ള ലൂപ്പ്
        for (let instance of instances) {
            try {
                const videoId = video.url.split('v=')[1] || video.url.split('/').pop();
                const res = await axios.get(`${instance}/api/v1/videos/${videoId}?fields=formatStreams`, { timeout: 8000 });
                
                if (res.data && res.data.formatStreams) {
                    // ഏറ്റവും അനുയോജ്യമായ ലിങ്ക് തിരഞ്ഞെടുക്കുന്നു
                    const stream = res.data.formatStreams.find(f => f.qualityLabel === '360p' || f.qualityLabel === '480p');
                    streamUrl = stream ? stream.url : res.data.formatStreams[0].url;
                    if (streamUrl) break;
                }
            } catch (e) {
                console.log(`IP from ${instance} blocked, trying next...`);
                continue; 
            }
        }

        // ഫൈനൽ ബാക്കപ്പ്: yt-dlp (Mobile Agent വഴി)
        if (!streamUrl) {
            try {
                const cmd = `yt-dlp -g -f "best[ext=mp4][height<=480]" --user-agent "Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36" ${video.url}`;
                const { stdout } = await execPromise(cmd);
                streamUrl = stdout.trim();
            } catch (e) { console.log("Direct yt-dlp also failed"); }
        }

        if (!streamUrl) throw new Error("All IPs are blocked");

        // വീഡിയോ അയക്കുന്നു
        await sock.sendMessage(chat, {
            video: { url: streamUrl },
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`,
            caption: `*🎬 ${video.title}*\n\n*👺Asura MD*`,
            contextInfo: { isForwarded: true, forwardingScore: 999 }
        }, { quoted: msg });

    } catch (err) {
        await sock.sendMessage(chat, { text: "⏳ Loading" });
    }
};
