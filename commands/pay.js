import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi"; 
    const name = "Asura MD Support";
    const thumbPath = './media/thumb.jpg'; 

    // UPI Link & QR API
    const payUrl = `upi://pay?pa=${myUpi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(payUrl)}`;

    try {
        await sock.sendMessage(from, { react: { text: "💳", key: msg.key } });

        const donateText = `
*─『 💳 QUICK CHECKOUT 』─*

*Hello,* @${msg.pushName || 'User'}
*Support the development of Asura MD.*

*PAYMENT SUMMARY*
━━━━━━━━━━━━━━━━━
⊙ *Payee:* ${name}
⊙ *Amount:* ₹${amount}.00
⊙ *Status:* Pending
━━━━━━━━━━━━━━━━━

*HOW TO PAY?*
1. *Click the Card:* Tap the banner above to pay via GPay/PhonePe/Paytm.
2. *Scan QR:* Use the QR code attached for manual scanning.
3. *Manual:* Copy UPI ID: \`${myUpi}\`

> 🛡️ _Encrypted & Secure Transaction_
*© ᴀsᴜʀᴀ ᴍᴅ | ᴀʀᴜɴ*`;

        // Thumbnail ഫയൽ ചെക്ക് ചെയ്യുന്നു
        let buffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: qrUrl };

        await sock.sendMessage(from, {
            image: { url: qrUrl },
            caption: donateText,
            contextInfo: {
                mentionedJid: [msg.sender],
                externalAdReply: {
                    title: `PAY ₹${amount}.00 NOW ⚡`,
                    body: "Tap here to complete your payment",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null, 
                    sourceUrl: payUrl, 
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: false 
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Donate Error:', e);
    }
};
