const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const OpenAI = require('openai');
const config = require('./config');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.send('Bot is running');
});

app.post('/hook/messages', handleNewMessages);

const port = process.env.PORT;

app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
});
app.get('/api/chats', async (req, res) => {
    try {
        const response = await fetch('https://gate.whapi.cloud/chats', {
            headers: { 'Authorization': 'Bearer '+config.token } // Replace YOUR_API_TOKEN_HERE with your actual token
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/api/messages/text', async (req, res) => {
    const { chatId, message } = req.body;
    try {
        const response = await fetch(`https://gate.whapi.cloud/messages/text`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + config.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ to:chatId,body: message })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// Example: Fetching messages for a specific chat ID
app.get('/api/messages/:chatId', async (req, res) => {
    const chatId = req.params.chatId;
    try {
        const response = await fetch(`https://gate.whapi.cloud/messages/list/${chatId}?count=500`, {
            headers: { 'Authorization':  'Bearer '+config.token } // Replace YOUR_API_TOKEN_HERE with your actual token
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function validateNameWithNameAPI(name, apiKey) {
    const response = await fetch('https://api.nameapi.org/rest/v5.3/parser/personnameparser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            inputPerson: {
                name: name
            }
        })
    });

    if (!response.ok) {
    throw new Error('API call to NameAPI failed');
    }

    const data = await response.json();
    // Assuming the API returns a boolean isValidName or similar. You'll need to adjust this based on actual API response
    return data.isValidName;
}

const keywords = {
    'makan': ['makan'],
    'nama': ['nama', 'siapa'],
    'hujan': ['hujan'],
    'asal': ['asal', 'dari'],
    'kerja': ['kerja', 'apa'],
    'buat': ['buat', 'apa'],
    'ok': ['ok', 'tak', 'hari'],
    'adik': ['adik', 'beradik'],
    'suka warna': ['suka', 'warna'],
    'suka makan': ['suka', 'makan'],
    'block UV': ['block', 'UV'],
    'warranty': ['warranty', 'berapa'],
    'pilih warna': ['pilih', 'warna'],
    'harga': ['harga', 'macam', 'mana'],
    'pasang cepat': ['pasang', 'cepat'],
    'bayar ansuran': ['bayar', 'ansuran'],
    'jenama': ['jenama'],
    'reflective film': ['reflective', 'film'],
    'frosted sticker': ['frosted', 'sticker'],
    'carbon film': ['carbon', 'film'],
    'ceramic film': ['ceramic', 'film'],
    'minum apa': ['minum', 'apa'],
    'hobi': ['hobi'],
    'pergi cuti-cuti': ['pergi', 'cuti-cuti'],
    'bangun pukul': ['bangun', 'pukul'],
    'suka muzik': ['suka', 'muzik'],
    'pandai masak': ['pandai', 'masak'],
    'suka buku': ['suka', 'buku'],
    'suka': ['suka'],
    'travel': ['travel'],
    'kopi atau teh': ['kopi', 'teh'],
    'manis ke pedas': ['manis', 'pedas'],
    'laut ke gunung': ['laut', 'gunung'],
    'masakan barat ke timur': ['masakan', 'barat', 'timur'],
    'baca berita': ['baca', 'berita'],
    'main game': ['main', 'game'],
    'suka warna': ['suka', 'warna'],
    'prefer nasi atau roti': ['prefer', 'nasi', 'roti'],
    'suka tengok TV': ['suka', 'TV'],
    'suka musim': ['suka', 'musim'],
    'suka makan di luar ke masak sendiri': ['suka', 'makan', 'di', 'luar', 'masak', 'sendiri'],
    'suka buat kerja berpasukan ke sorang-sorang': ['suka', 'buat', 'kerja', 'berpasukan', 'sorang-sorang'],
    'keluar negara': ['keluar', 'negara'],
    'cita-cita': ['cita-cita'],
    'suka pizza ke burger': ['suka', 'pizza', 'burger'],
    'suka masak apa': ['suka', 'masak', 'apa'],
    'minat fotografi': ['minat', 'fotografi'],
    'suka gym ke jogging': ['suka', 'gym', 'jogging'],
    'suka pantai ke hutan': ['suka', 'pantai', 'hutan'],
    'suka musim hujan': ['suka', 'musim', 'hujan'],
    'prefer movie kat rumah ke pawagam': ['prefer', 'movie', 'rumah', 'pawagam'],
    'suka jalan-jalan di mall': ['suka', 'jalan-jalan', 'mall'],
    'suka online shopping': ['suka', 'online', 'shopping'],
    'suka berkemah': ['suka', 'berkemah'],
    'suka main alat muzik': ['suka', 'main', 'alat', 'muzik'],
    'suka makanan laut': ['suka', 'makanan', 'laut'],
    'suka masakan pedas': ['suka', 'masakan', 'pedas'],
    'suka teh o ais limau': ['suka', 'teh', 'o', 'ais', 'limau'],
    'alergi': ['alergi'],
    'nak buat temujanji macam mana': ['nak', 'buat', 'temujanji'],
    'macam mana nak order produk': ['macam', 'mana', 'nak', 'order', 'produk'],
    'lepas bayar apa proses seterusnya': ['lepas', 'bayar', 'proses', 'seterusnya'],
    'temujanji boleh ubah tak': ['temujanji', 'boleh', 'ubah'],
    'PHANTOM X4 harga berapa': ['PHANTOM', 'X4', 'harga'],
    'PHANTOM X3 lebih murah dari X4': ['PHANTOM', 'X3', 'murah', 'X4'],
    'Ada apa best dengan PHANTOM X2': ['best', 'PHANTOM', 'X2'],
    'PHANTOM X1 mahal sangat ke': ['PHANTOM', 'X1', 'mahal'],
    'Warranty berapa lama': ['Warranty', 'berapa', 'lama'],
    'Ada free installation': ['free', 'installation'],
    'Ada diskaun kalau beli banyak tak': ['diskaun', 'beli', 'banyak'],
    'Bila sampai lepas order': ['Bila', 'sampai', 'lepas', 'order'],
    'Ada bonus barang tak': ['bonus', 'barang'],
    'Boleh pilih warna tak': ['pilih', 'warna'],
    'Lepas beli, ada service tak': ['service', 'lepas', 'beli'],
    'PHANTOM X4 ada discount tak': ['PHANTOM', 'X4', 'discount'],
    'PHANTOM X3 punya warranty berapa lama': ['PHANTOM', 'X3', 'warranty', 'berapa', 'lama'],
    'PHANTOM X2 lebih canggih daripada X3': ['PHANTOM', 'X2', 'canggih', 'X3'],
    'Ada guarantee untuk kualiti tak': ['guarantee', 'kualiti'],
    'Boleh bayar ansuran tak': ['bayar', 'ansuran'],
    'Ada servis pemasangan percuma tak': ['servis', 'pemasangan', 'percuma'],
    'Boleh buat custom order tak': ['buat', 'custom', 'order'],
    'Ada warranty international tak': ['warranty', 'international'],
    'Apa beza utama antara X1 dan X2': ['beza', 'utama', 'X1', 'X2'],
    'Ada harga khas untuk pelanggan lama tak': ['harga', 'khas', 'pelanggan', 'lama'],
    'Bolehkah saya menukar produk jika tidak puas hati': ['menukar', 'produk', 'tidak', 'puas', 'hati'],
    'Adakah pembelian secara dalam talian selamat': ['pembelian', 'dalam', 'talian', 'selamat'],
    'Berapa lama tempoh penghantaran untuk kawasan luar bandar': ['berapa', 'lama', 'tempoh', 'penghantaran', 'kawasan', 'luar', 'bandar'],
    'Apakah jenis kenderaan yang sesuai untuk produk ini': ['jenis', 'kenderaan', 'sesuai', 'produk'],
};

async function checkKeywords(message, category) {
    return keywords[category].every(keyword => message.includes(keyword));
}

async function handleNewMessages(req, res) {
    console.log('This message appears 5 seconds after the start');
    try {
        const receivedMessages = req.body.messages;
        //console.log('Handling new messages...',receivedMessages);
        for (const message of receivedMessages) {
            if (message.from_me) break;
               
            if(!message.chat_id.includes("whatsapp")){
                break;
            }
            console.log(message)
  
            const sender = {
                to: message.chat_id,
                name: message.from_name
            };

            if (message.type == "text" ) {
                if (checkKeywords(message.text.body.toLowerCase(), 'makan')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Belum ni, kenyang lagi' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'nama')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya Atira, penolong anda hari ini.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'hujan')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tak pasti ni, tapi kalau tinted dengan kami, hujan atau panas tak masalah!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'asal')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Dari team tinting yang terbaik di bandar!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'kerja')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya bantu orang pilih tint terbaik untuk kereta mereka.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'buat')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya tengah sibuk kira harga tint ni, nak quote best untuk customer.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'ok')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ok je, lagi ok kalau dapat bantu awak pilih tint!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'adik')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, semua film tint kami macam adik beradik, setiap satu ada kelebihannya.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka warna')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka warna yang boleh reflect haba, macam cermin film kami ni.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka makan')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya suka semua, asalkan tak panas macam haba yang tint kami tolak.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'block UV')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ha\'ah, block UV 99%.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'warranty')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada warranty 1 tahun sampai 3 tahun, bergantung pada jenis filem yang kau pilih.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'pilih warna')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Boleh, ada pelbagai pilihan warna.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'harga')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Harga start dari RM5.50 untuk setiap kaki persegi.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'pasang cepat')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Cepat, tak lama.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'bayar ansuran')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, boleh guna atome untuk bayar ansuran 3 kali.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'jenama')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Jenama SUNz!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'reflective film')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Reflective film tu macam cermin satu hala, privasi terjaga.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'frosted sticker')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Frosted sticker tu untuk privacy, tak nampak dalam dari luar.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'carbon film') && checkKeywords(message.text.body.toLowerCase(), 'ceramic film')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Carbon film guna partikel carbon, ceramic film guna teknologi nano-ceramic, dua-dua bagus untuk block haba.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'minum apa')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya selalu start hari dengan kopi, bantu fokus pada kerja tinting.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'hobi')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Hobi saya adalah memastikan setiap tingkap dan kereta dilindungi dengan baik.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'cuti-cuti')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya suka explore tempat baru, tapi ingat, tingkap rumah kena tint dulu sebelum pergi!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'bangun pukul')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Awal, sekitar pukul 6. Mula hari dengan semangat untuk tinting.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka muzik')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya suka dengar jazz, santai macam tingkap yang dah tinted.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'pandai masak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Bukan chef, tapi pandai pilih tint terbaik!' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka buku')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya suka baca buku pasal inovasi, macam teknologi tint kami yang terkini.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka lari, kejar kepuasan pelanggan kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'travel')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka, tapi saya lebih suka pastikan pelanggan dapat tint terbaik.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'kopi atau teh')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kopi, bantu saya kekal aktif.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'manis ke pedas')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya lebih ke manis, macam manisnya deal tint kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'laut ke gunung')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Laut, tapi pastikan kereta anda tint dulu untuk perlindungan UV.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'masakan barat ke timur')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka kedua-duanya, macam versatiliti tint kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'baca berita')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Baca sikit, kebanyakkan masa saya fokus pada kerja tinting.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'main game')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Jarang, kebanyakan masa saya dedicated untuk improve servis tinting.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka warna')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Saya suka semua warna, asal sesuai dengan pilihan tint pelanggan.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'prefer nasi atau roti')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Nasi, kuatkan tenaga untuk kerja tinting.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka tengok tv')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kadang-kadang, tapi lebih fokus pada kerja tinting kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka musim')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Sejuk, macam sejuknya dalam kereta yang dah tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka makan di luar ke masak sendiri')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Prefer masak, tapi kadang makan luar, macam fleksibiliti servis kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka kerja berpasukan ke sorang-sorang')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Berpasukan, macam teamwork kuat kami dalam pasang tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'keluar negara')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Pernah, tapi selalu balik untuk pastikan tinting servis terbaik.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'cita-cita')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tinting dah jadi minat utama, nak jadi yang terbaik dalam bidang ni.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka pizza ke burger')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Pizza, macam pelbagai pilihan tint kami.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka masak apa')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka masak simple, fokus lebih pada kerja tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'minat fotografi')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tak sangat, tapi minat tengok hasil kerja tint yang cantik.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka gym ke jogging')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Jogging, bantu saya refresh dan fikir ide baru untuk tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka pantai ke hutan')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Pantai, relax sambil fikir pasal inovasi tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka musim hujan')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ok saja, kerja tint tetap jalan.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'prefer movie kat rumah ke pawagam')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Rumah, lebih selesa macam rumah yang dah tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka jalan-jalan di mall')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kadang, tapi kebanyakan masa di workshop tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka online shopping')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Sikit-sikit, tapi lebih suka tengok barang tint secara langsung.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka berkemah')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Jarang, lebih banyak masa saya di workshop tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka main alat muzik')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tidak, fokus saya lebih pada kerja tint.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka makanan laut')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Suka, macam saya suka lihat kereta bersinar dengan tint baru.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka masakan pedas')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ya, macam kepuasan pelanggan kami bila dapat tint yang mereka nak.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'suka teh o ais limau')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ya, refreshing macam feeling lepas pasang tint baru.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'alergi')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tidak, tapi kami pastikan tint kami hypoallergenic.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'nak buat temujanji macam mana')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Guna je chatbot kami, ikut step dia untuk pilih servis dan masa, lepas tu chatbot akan confirmkan temujanji tu.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'macam mana nak order produk')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Pilih je produk yang korang nak dalam chatbot, pastu ikut link pembayaran. Lepas bayar, team kami akan contact korang.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'lepas bayar apa proses seterusnya')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kami akan contact untuk confirmkan, pastu chatbot akan hantar notification dan invois.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'notification dan invois')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Boleh, chatbot kita akan hantar semua tu untuk keep track.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'temujanji boleh ubah tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Boleh, chat dengan support kami dalam chatbot untuk ubah apa yang perlu.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X4 harga berapa')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'PHANTOM X4 RM399 saja. Ada 3 tahun warranty lagi!' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X3 lebih murah dari X4')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Betul, X3 RM599, X4 murah sikit. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada apa best dengan PHANTOM X2')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'X2 canggih, harga RM899 je. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X1 mahal sangat ke')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'X1 paling top, RM999 tapi worth it. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Warranty berapa lama')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Setahun punya warranty. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada free installation')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, kita pasang sekali. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada diskaun kalau beli banyak tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, beli banyak dapat murah. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Bila sampai lepas order')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Dalam 3-5 hari bekerja. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada bonus barang tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, setiap beli dapat ______ (nyatakan bonus). Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Boleh pilih warna tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Boleh, ikut suka hati. Ada juga 3 tahun warranty tambahan.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'Lepas beli, ada service tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, kalau ada masalah boleh contact kita. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X4 ada discount tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'X4 RM399 saja, harga dah murah. Ada 3 tahun warranty lagi! Ada juga bayaran atome 3 ansuran.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X3 punya warranty berapa lama')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Sama, setahun punya. Ada juga 3 tahun warranty tambahan. Ada juga bayaran atome 3 ansuran.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'PHANTOM X2 lebih canggih daripada X3')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada beberapa ciri tambahan, tapi harga okay. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada guarantee untuk kualiti tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, kita jamin produk berkualiti. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Boleh bayar ansuran tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kita ada plan ansuran yang fleksibel. Ada juga bayaran atome 3 ansuran bayaran.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada servis pemasangan percuma tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ada, kita uruskan pemasangan untuk anda. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Boleh buat custom order tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Boleh, kita boleh buat custom mengikut keperluan anda. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada warranty international tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Kita hanya ada warranty tempatan sahaja. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Apa beza utama antara X1 dan X2')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'X2 ada ciri-ciri tambahan yang lebih canggih berbanding X1. Ada juga 3 tahun warranty tambahan.' });
                    break;
                }
                else if (checkKeywords(message.text.body.toLowerCase(), 'Ada harga khas untuk pelanggan lama tak')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ya, kami berikan diskaun istimewa untuk pelanggan setia. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Bolehkah saya menukar produk jika tidak puas hati')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ya, kami mempunyai polisi pertukaran produk. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Adakah pembelian secara dalam talian selamat')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Ya, kami mempunyai laman web yang selamat untuk pembelian dalam talian. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Berapa lama tempoh penghantaran untuk kawasan luar bandar')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Tempoh penghantaran mungkin mengambil masa sedikit lebih lama untuk kawasan luar bandar. Ada juga 3 tahun warranty tambahan.' });
                    break;
                } 
                else if (checkKeywords(message.text.body.toLowerCase(), 'Apakah jenis kenderaan yang sesuai untuk produk ini')) {
                    await sendWhapiRequest('messages/text', { to: sender.to, body: 'Produk kami sesuai untuk pelbagai jenis kenderaan termasuk kereta, van, dan truk. Ada juga 3 tahun warranty tambahan.' });
                    break;
                }                                                
                else{
                    const webhookResponse = await callWebhook('https://hook.us1.make.com/4b4hbjdcr95yw9bl3hr8mrk251h1olq8',message.text.body,sender.to,sender.name);
                    if (webhookResponse) {
                        await sendWhapiRequest('messages/text', { to: sender.to, body: webhookResponse });
                        console.log('Response sent.');
                    } else {
                        console.error('No valid response from webhook.');
                    }
                    break;
                }    
            }
        }
        res.send('All messages processed');
    } catch (e) {
        console.error('Error:', e.message);
        res.status(500).send('Internal Server Error');
    }
}

async function callWebhook(webhook,senderText,senderNumber,senderName) {
    console.log('Calling webhook...');
    const webhookUrl = webhook;
    const body = JSON.stringify({ senderText,senderNumber,senderName }); // Include sender's text in the request body
    
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    });
    let responseData =""
    if(response.status === 200){
        responseData= await response.text(); // Dapatkan respons sebagai teks
    }else{
        responseData = 'stop'
    }
    console.log('Webhook response:', responseData); // Log raw response
 return responseData;
}

async function sendWhapiRequest(endpoint, params = {}, method = 'POST') {
    console.log('Sending request to Whapi.Cloud...');
    const options = {
        method: method,
        headers: {
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    };
    const url = `${config.apiUrl}/${endpoint}`;
    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    console.log('Whapi response:', JSON.stringify(jsonResponse, null, 2));
    return jsonResponse;
}

