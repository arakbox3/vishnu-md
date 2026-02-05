import axios from 'axios';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const movieName = args.join(" ");

    if (!movieName) {
        return sock.sendMessage(chat, { text: "❌ *Movies/TV shows* \n\n*Usage:* `.tv Leo`" }, { quoted: msg });
    }

    try {
        // API Key ഇല്ലാതെ ഡാറ്റ എടുക്കാൻ ഒരു ഫ്രീ പ്രോക്സി വഴി ശ്രമിക്കുന്നു
        const res = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=6510f214`);
        const data = res.data;

        if (data.Response === "False") {
            return sock.sendMessage(chat, { text: "not found!" });
        }

        const movieInfo = `
🎬 *M O V I E  I N F O* 🎭
╭━❐━━━━━━━━━━━⪼
├⊙ 🎥 *Title:* ${data.Title}
├⊙ 📅 *Year:* ${data.Year}
├⊙ 🔞 *Rated:* ${data.Rated}
├⊙ ⏳ *Runtime:* ${data.Runtime}
├⊙ 🎭 *Genre:* ${data.Genre}
├⊙ 🌟 *IMDb Rating:* ⭐ ${data.imdbRating}/10
├⊙ 🗳️ *Votes:* ${data.imdbVotes}
├⊙ 🏆 *Awards:* ${data.Awards}
├⊙ 🎬 *Director:* ${data.Director}
├⊙ ✍️ *Writers:* ${data.Writer}
├⊙ 👥 *Cast:* ${data.Actors}
├⊙ 📖 *Plot:* ${data.Plot}
├⊙ 🌐 *Language:* ${data.Language}
├⊙ 🚩 *Country:* ${data.Country}
├⊙ 💰 *Box Office:* ${data.BoxOffice || 'N/A'}
├⊙ 🏢 *Production:* ${data.Production || 'N/A'}
├⊙ 🔗 *Watch Online:* https://vidsrc.to/embed/movie/${data.imdbID}
╰━❐━━━━━━━━━━━⪼
© ASURA-MD 👺`;

        // 1. സിനിമയുടെ പോസ്റ്റർ അയക്കുന്നു
        await sock.sendMessage(chat, { 
            image: { url: data.Poster !== "N/A" ? data.Poster : 'https://i.imgur.com/8Nf9Xp0.jpeg' }, 
            caption: movieInfo 
        }, { quoted: msg });

        if (fs.existsSync('./Media/song.opus')) {
            await sock.sendMessage(chat, { 
                audio: { url: './media/song.opus' }, 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Error." });
    }
};

