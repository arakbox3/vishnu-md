import * as googleTTS from 'google-tts-api';
import { exec } from 'child_process';
import { Readable } from 'stream';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    if (args.length < 2) {
        return sock.sendMessage(chat, { 
            text: "*Usage:* .voice [type] [text]\n\n*Types:* male, female, baby, devil\n*Example:* .voice devil സുഖമാണോ" 
        }, { quoted: msg });
    }

    const type = args[0].toLowerCase();
    const text = args.slice(1).join(' ');
    
    // മലയാളം ആണോ എന്ന് നോക്കുന്നു, അല്ലെങ്കിൽ ഇംഗ്ലീഷ് (Auto Detection)
    const isMalayalam = /[അ-ഹ]/.test(text);
    const lang = isMalayalam ? 'ml' : 'en';

    try {
        // Google TTS URL (Direct Stream URL)
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // ശബ്ദം മാറ്റാനുള്ള FFmpeg ഫിൽട്ടറുകൾ
        let filter = '';
        switch (type) {
            case 'male':
                filter = 'asetrate=44100*0.8,atempo=1.25,bass=g=15'; // കട്ടി കൂടിയ വോയ്‌സ്
                break;
            case 'female':
                filter = 'asetrate=44100*1.2,atempo=0.85'; // സ്ത്രീ ശബ്ദം
                break;
            case 'baby':
                filter = 'asetrate=44100*1.6,atempo=0.6'; // കുട്ടി ശബ്ദം
                break;
            case 'devil':
                filter = 'asetrate=44100*0.5,atempo=2.0,aecho=0.8:0.88:60:0.4'; // പേടിപ്പെടുത്തുന്ന ശബ്ദം
                break;
            default:
                filter = 'atempo=1.0'; // നോർമൽ
        }

        const cmd = `ffmpeg -i "${url}" -af "${filter}" -f oppus -acodec libopus -vbr on -compression_level 10 -f ogg -`;

        exec(cmd, { encoding: 'buffer' }, async (error, stdout) => {
            if (error) {
                console.error(error);
                return sock.sendMessage(chat, { text: "Voice conversion failed!" });
            }

            await sock.sendMessage(chat, { 
                audio: stdout, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });
        });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "Error in generating voice!" });
    }
};
