import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// --- CONFIGURATION ---
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

        // --- 1. RANDOM AUDIO LIST (.tv അല്ലെങ്കിൽ .music) ---
        if (text === '.audio') {
            await sock.sendMessage(from, { text: "🔊 *Fetching random tracks from Asura DB...*" });

            // ചാനലിലെ ഓഡിയോ ഫയലുകൾ മാത്രം ഫിൽട്ടർ ചെയ്ത് എടുക്കുന്നു
            const result = await client.invoke(
                new Api.messages.Search({
                    peer: channelId,
                    q: "", // പേര് വേണ്ട, എല്ലാം വരണം
                    filter: new Api.InputMessagesFilterMusic(), 
                    limit: 100,
                })
            );

            if (!result || result.messages.length === 0) {
                return sock.sendMessage(from, { text: "❌ *No Audio Files Found!*" });
            }

            // Shuffle (റാൻഡം ആക്കുന്നു)
            const shuffled = result.messages.sort(() => 0.5 - Math.random()).slice(0, 15);
            audioCache.set(sender, shuffled);

            let listMsg = `╭〔 *👺 ASURA MD MUSIC* 〕─\n`;
            listMsg += `│ 🔊 *Mode:* Random Audio Shuffle\n`;
            listMsg += `│ 📁 *Total:* ${shuffled.length} Tracks\n`;
            listMsg += `╰──────────────\n\n`;

            shuffled.forEach((m, index) => {
                const attr = m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const title = attr?.title || "Unknown Track";
                const performer = attr?.performer || "Asura Artist";
                listMsg += `*${index + 1}* ➠ ${title}\n   └ 🎙️ ${performer}\n\n`;
            });

            listMsg += `> *Reply with number to play audio!*`;
            return await sock.sendMessage(from, { text: listMsg }, { quoted: msg });
        }

        // --- 2. AUDIO STREAMING & SENDING (Reply Handler) ---
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.quotedMessage && !isNaN(text)) {
            const quotedText = quotedMsg.quotedMessage.conversation || quotedMsg.quotedMessage.extendedTextMessage?.text || "";
            
            if (quotedText.includes("ASURA MD MUSIC")) {
                const index = parseInt(text) - 1;
                const userFiles = audioCache.get(sender);

                if (!userFiles || !userFiles[index]) return;

                const selected = userFiles[index];
                const doc = selected.media.document;
                
                // ഓഡിയോ ഇൻഫോ എടുക്കുന്നു
                const audioAttr = doc.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const fileName = `${audioAttr?.title || 'Asura_Music'}.mp3`;

                await sock.sendMessage(from, { text: `🎶 *Streaming:* ${audioAttr?.title || 'Audio'}...` }, { quoted: msg });

                // Streaming Download
                const buffer = await client.downloadMedia(selected.media, { workers: 12 });

                // WhatsApp ഓഡിയോ ആയി അയക്കുന്നു
                await sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    fileName: fileName,
                    ptt: false, // true ആക്കിയാൽ വോയിസ് നോട്ട് ആയി പോകും
                    contextInfo: {
                        externalAdReply: {
                            title: audioAttr?.title || "Asura MD Music",
                            body: audioAttr?.performer || "👺 Asura Database",
                            mediaType: 1,
                            showAdAttribution: true,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: msg });
            }
        }

    } catch (error) {
        console.error("Music Error:", error);
    }
};
