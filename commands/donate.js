import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi"; 
    const name = "Asura MD Support";
    const thumbPath = './media/asura.jpg'; 

    // UPI Link
    const payUrl = `upi://pay?pa=${myUpi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    try {
        await sock.sendMessage(from, { react: { text: "🏦", key: msg.key } });

        const donateText = `
*🏦 Whatsapp Bank OFFICIAL NOTIFICATION*

*Transaction ID:* ${Math.floor(Math.random() * 1000000000)}
*Status:* PENDING REQUEST

Hello User,
Your support keeps *Asura MD* alive. Please complete the donation of *₹${amount}* to help us maintain our servers.

*DETAILS:*
⊙ *Receiver:* ${name}
⊙ *UPI ID:* ${myUpi}
⊙ *Amount:* ₹${amount}.00

_Click the button below to complete the payment via any UPI app (GPay, PhonePe, Paytm)._

> 🛡️ 100% Secure Transaction via NPCI.`;

        let buffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : Buffer.alloc(0);

        await sock.sendMessage(from, {
            text: donateText,
            contextInfo: {
                externalAdReply: {
                    title: `PAY ₹${amount}.00 NOW`,
                    body: "Click here to complete your donation 💳",
                    thumbnail: buffer,
                    sourceUrl: payUrl, 
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    mediaUrl: payUrl 
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Donate Error:', e);
    }
};
