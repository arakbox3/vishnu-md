const listCommand = async (sock, msg, args) => {
    const { remoteJid } = msg.key;

    const sections = [
        {
            title: "🌟 Main Commands",
            rows: [
                { header: "Ping", title: "Bot Speed", id: ".ping", description: "Check bot latency" },
                { header: "Menu", title: "Show All Menu", id: ".menu", description: "View all commands" }
            ]
        },
        {
            title: "📥 Downloader & Tools",
            rows: [
                { header: "Video", title: "Video Downloader", id: ".video", description: "Download videos" },
                { header: "Audio", title: "Audio Downloader", id: ".audio", description: "Download songs" }
            ]
        }
    ];

    
    const listMessage = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2
                },
                interactiveMessage: {
                    body: { text: "🛡️ *ASURA MD LIST MENU*" },
                    footer: { text: "© Arun Cumar | Asura MD" },
                    header: {
                        title: "ASURA MD BOT",
                        hasMediaAttachment: false
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Select Commands",
                                    sections: sections
                                })
                            }
                        ],
                    }
                }
            }
        }
    };

    try {
        await sock.relayMessage(remoteJid, listMessage, { messageId: msg.key.id });
    } catch (err) {
        console.error("List Menu Error:", err);
        await sock.sendMessage(remoteJid, { text: "error." });
    }
};

export default listCommand;
