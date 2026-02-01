import fs from 'fs';

const runtime = async (sock, msg, args) => {
    // --- RUNTIME CALCULATION ---
    const uptime = process.uptime();
    const days = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);

    const uptimeString = `
╭━━━〔 **ASURA MD** 〕━━┈⊷
┃ 👤 **Owner:** Asura
┃ 👺 **Bot:** Asura MD
┃ ⏳ **Uptime:** ${days}d ${hours}h ${mins}m ${secs}s
┃ ⚙️ **Status:** Active
╰━━━━━━━━━━━━━━━┈⊷`.trim();

    // --- MEDIA PATHS ---
    const thumbPath = './media/thumb.jpg';
    const audioPath = './media/song.opus';

    try {
        // 1. ഫോട്ടോയും ബോക്സ് മെസ്സേജും അയക്കുന്നു
        if (fs.existsSync(thumbPath)) {
            await sock.sendMessage(msg.key.remoteJid, { 
                image: fs.readFileSync(thumbPath), 
                caption: uptimeString 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: uptimeString }, { quoted: msg });
        }

        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(msg.key.remoteJid, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }
    } catch (e) {
        console.error("Runtime Error:", e);
        await sock.sendMessage(msg.key.remoteJid, { text: uptimeString });
    }
};

export default runtime;
