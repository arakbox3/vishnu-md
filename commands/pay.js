import fs from "fs";

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.sender;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi";
    const name = "Arun Cumar";
    const transactionID = `ASURA-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    
    const thumbPath = './media/thumb.jpg';

    try {
        // Professional Reaction
        await sock.sendMessage(from, { react: { text: "💰", key: msg.key } });

        const donateText = `
*〔 ASURA-MD INFRASTRUCTURE 〕*

*SYSTEM STATUS:* 🟢 Operational
*REQUEST TYPE:* Donation / Maintenance Support
*REFERENCE:* \`${transactionID}\`

Hello @${sender.split('@')[0]},
To maintain our high-speed servers and keep development free, consider a contribution.

*─── PAYMENT GATEWAY ───*

┌── 👤 *RECIPIENT*
│ Name: ${name}
└── UPI: \`${myUpi}\`

┌── 💰 *BILLING*
│ Amount: ₹${amount}.00
└── Currency: INR

*─── QUICK ACTIONS ───*

🔗 *DIRECT PAY:*
https://pay.upilink.in/pay/${myUpi}?am=${amount}&pn=${encodeURIComponent(name)}

> *Instructions:* Click the link above to pay via any UPI app. Please forward the transaction receipt for our records.

*© ASURA MD*`;

        await sock.sendMessage(from, {
            image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://files.catbox.moe/9e4b39.jpg' },
            caption: donateText,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "ASURA-MD PREMIUM SUPPORT",
                    body: "Support Open Source Development",
                    mediaType: 1,
                    previewType: "PHOTO",
                    thumbnailUrl: 'https://files.catbox.moe/9e4b39.jpg', 
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                    showAdAttribution: false,
                    renderLargerThumbnail: false 
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Professional Donate Error:', e);
        await sock.sendMessage(from, { text: "System encountered an error processing the payment request." });
    }
};
