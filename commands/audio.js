import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 12938494; 
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247";
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A";
const channelId = "-1001891724070";

const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
let isStarted = false;
let audioCache = new Map();

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

    try {
        if (!isStarted) {
            await client.start({ botAuthToken: botToken });
            isStarted = true;
        }

        if (text === '.tv' || text === '.music') {
            await sock.sendMessage(from, { text: "🔊 *Asura MD Database...*" });

            const randomOffset = Math.floor(Math.random() * 500); 

            const result = await client.invoke(
                new Api.messages.GetHistory({
                    peer: channelId,
                    limit: 100, // 100 മെസേജുകൾ എടുക്കുന്നു
                    addOffset: randomOffset 
                })
            );

            // എല്ലാ ഓഡിയോ ഫയലുകളും (Music & Voice) ഫിൽട്ടർ ചെയ്യുന്നു
            const allAudios = result.messages.filter(m => 
                m.media && (m.media instanceof Api.MessageMediaDocument) && 
                m.media.document.mimeType.includes('audio')
            );

            if (allAudios.length === 0) {
                return sock.sendMessage(from, { text: "❌ *error!*" });
            }

            // വീണ്ടും ഒരു ഷഫിൾ കൂടി നടത്തുന്നു
            const shuffled = allAudios.sort(() => 0.5 - Math.random()).slice(0, 15);
            audioCache.set(sender, shuffled);

            let listMsg = `╭〔 *👺 ASURA MD* 〕─\n`;
            listMsg += `│ 🎧 *Status:* Old & New Hits\n`;
            listMsg += `│ 🎵 *Total:* ${shuffled.length} Tracks\n`;
            listMsg += `╰──────────────\n\n`;

            shuffled.forEach((m, index) => {
                const attr = m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const title = attr?.title || m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeFilename)?.fileName || "Unknown Track";
                listMsg += `*${index + 1}* ➠ ${title}\n\n`;
            });

            listMsg += `> *Reply with number to play!*`;
            return await sock.sendMessage(from, { text: listMsg }, { quoted: msg });
        }

        // --- ഡൗൺലോഡ് ലോജിക് ---
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.quotedMessage && !isNaN(text)) {
            const quotedText = quotedMsg.quotedMessage.conversation || quotedMsg.quotedMessage.extendedTextMessage?.text || "";
            
            if (quotedText.includes("ASURA MD Audio")) {
                const index = parseInt(text) - 1;
                const userFiles = audioCache.get(sender);

                if (!userFiles || !userFiles[index]) return;

                const selected = userFiles[index];
                const doc = selected.media.document;
                
                const audioAttr = doc.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const fileName = `${audioAttr?.title || 'Asura_Music'}.mp3`;

                await sock.sendMessage(from, { text: `⚡ *Streaming from DB...*` }, { quoted: msg });

                const buffer = await client.downloadMedia(selected.media, { workers: 16 });

                await sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    fileName: fileName,
                    ptt: false,
                    contextInfo: {
                        externalAdReply: {
                            title: audioAttr?.title || "Asura MD Audio",
                            body: "👺 Streaming from Private DB",
                            mediaType: 1,
                            showAdAttribution: true
                        }
                    }
                }, { quoted: msg });
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
};
