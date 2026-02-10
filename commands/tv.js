import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { Readable } from "stream";

// ========= CONFIG =========
const apiId = 12938494; 
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247"; 
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A"; 
const channelId = -1001891724070; 
// ==========================

const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
});

let channelEntity;
const userCache = new Map();

// ---------- TELEGRAM INIT ----------
async function initTelegram() {
    if (!client.connected) {
        await client.start({ botAuthToken: botToken });
        channelEntity = await client.getEntity(channelId);
        console.log("✅ Telegram Bot Connected");
    }
}

// ---------- FILENAME HELPER ----------
function getFileName(media) {
    if (media?.document) {
        const attr = media.document.attributes.find(a => a instanceof Api.DocumentAttributeFilename);
        return attr?.fileName || "Large_File";
    }
    return "Video_File";
}

// ---------- MAIN FUNCTION ----------
export default async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();

    try {
        await initTelegram();

        // --- .tv കമാൻഡ് (List കാണിക്കാൻ) ---
        if (text === ".tv" || text.startsWith(".tv ")) {
            const query = text.replace(".tv ", "").toLowerCase();
            await sock.sendMessage(from, { text: "🔍 Searching files..." }, { quoted: msg });

            const history = await client.getMessages(channelEntity, { limit: 100 });
            let mediaMsgs = history.filter(m => m.media);

            if (text.startsWith(".tv ")) {
                mediaMsgs = mediaMsgs.filter(m => getFileName(m.media).toLowerCase().includes(query));
            }

            if (!mediaMsgs.length) return sock.sendMessage(from, { text: "❌ No files found!" });

            const selected = mediaMsgs.slice(0, 20);
            userCache.set(sender, selected);

            let list = `╭─〔 👺 ASURA TV 〕─\n\n`;
            selected.forEach((m, i) => {
                list += `${i + 1} 📁 ${getFileName(m.media)}\n\n`;
            });
            list += "Reply with a number to stream this file.";

            return sock.sendMessage(from, { text: list }, { quoted: msg });
        }

        // --- Reply വഴി നമ്പർ കൊടുക്കുമ്പോൾ ഉള്ള പ്രവർത്തനം ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (quoted && !isNaN(text)) {
            const files = userCache.get(sender);
            const index = parseInt(text) - 1;

            if (!files || !files[index]) return;

            const media = files[index].media;
            const fileName = getFileName(media);
            const fileSize = media.document?.size || 0;
            const mimeType = media.document?.mimeType || "video/mp4";

            await sock.sendMessage(from, { text: `🚀 Starting stream: ${fileName}\nSize: ${(fileSize / (1024 * 1024)).toFixed(2)} MB` }, { quoted: msg });

            // Streaming starts here
            const iterator = client.iterDownload(media, {
                offset: 0,
                requestSize: 1024 * 1024, // 1MB chunks for speed
            });

            const stream = Readable.from(iterator);

            await sock.sendMessage(from, {
                document: stream, // Large files are safer as document
                mimetype: mimeType,
                fileName: fileName,
                caption: `✅ Successfully Streamed: ${fileName}`
            }, { quoted: msg });
        }

    } catch (err) {
        console.error(err);
        await sock.sendMessage(from, { text: "Error: " + err.message });
    }
};
