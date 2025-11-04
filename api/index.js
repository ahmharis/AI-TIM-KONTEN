const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Izinkan permintaan dari domain lain (frontend Anda)
app.use(express.json({ limit: '10mb' })); // Middleware untuk parsing JSON

// Kunci API akan diambil dari Environment Variable di Vercel
const apiKey = process.env.GEMINI_API_KEY; 

/**
 * Fungsi helper terpusat untuk memanggil Gemini API dengan retry
 * @param {string} model - Nama model (misal: 'gemini-2.5-flash-preview-09-2025')
 * @param {object} payload - Payload yang akan dikirim ke API
 * @param {number} retries - Jumlah percobaan
 * @returns {Promise<object>} - Objek 'candidate' dari respons API
 */
const callGeminiAPI = async (model, payload, retries = 3) => {
  // Validasi API Key saat fungsi dipanggil
  if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in Vercel Environment Variables.");
    // Jangan lempar error di sini agar server tidak crash, tapi kembalikan error yang bisa ditangani
    throw new Error("Server configuration error: API Key is missing.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if ((response.status >= 500 || response.status === 429) && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          console.warn(`Retrying API call for ${model} after ${delay}ms... (Attempt ${i + 1})`);
          await new Promise(res => setTimeout(res, delay));
          continue; 
        }
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0]) {
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw new Error("No candidate returned from API.");
      }

      return data.candidates[0]; 
      
    } catch (error) {
      console.error(`Error calling ${model}:`, error);
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Retrying API call for ${model} after network error... (${delay}ms)`);
        await new Promise(res => setTimeout(res, delay));
        continue; 
      }
      throw error; 
    }
  }
};

// === ENDPOINTS APP 2: ANALISIS VALUE ===

// 1. /api/analyze (Analisis Utama)
app.post('/api/analyze', async (req, res) => {
  console.log('HIT: /api/analyze');
  try {
    const { userQuery } = req.body;
    const model = 'gemini-2.5-flash-preview-09-2025';
    
    const systemPrompt = `
Anda adalah seorang Ahli Analis Nilai Produk (Product Value Analyst) elit.
Tugas Anda adalah menganalisis data mentah produk dari pengguna dan mengubahnya menjadi Analisis Nilai Produk yang terstruktur dengan tajam.

PENTING: Respons Anda HARUS terdiri dari DUA bagian, dipisahkan oleh '---VISUAL_BREAK---'.

Bagian 1 (Visual): Teks Markdown yang ramah dibaca, menyoroti:
- USP (Unique Selling Proposition)
- Target Audiens (Primer & Sekunder)
- Fitur Kunci
- Manfaat Emosional
- Manfaat Fungsional
- Nilai Inti (Core Value)

Bagian 2 (YAML): Ringkasan YAML yang bersih dari data di atas, HANYA data, untuk digunakan oleh alat lain.
Format YAML:
product_name: [Nama Produk]
usp: [USP]
audience:
  primary: [Target Primer]
  secondary: [Target Sekunder]
value_map:
  customer_jobs:
    - [Job 1]
    - [Job 2]
  customer_pains:
    - [Pain 1]
    - [Pain 2]
  customer_gains:
    - [Gain 1]
    - [Gain 2]
product_features:
  - [Fitur 1]
  - [Fitur 2]
benefits:
  functional:
    - [Manfaat 1]
    - [Manfaat 2]
  emotional:
    - [Manfaat 1]
    - [Manfaat 2]

PASTIKAN Anda HANYA mengembalikan teks dalam format yang diminta.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    // Kirim sebagai teks biasa, frontend akan memisahkannya
    res.status(200).send(text); 

  } catch (error) {
    console.error("Error in /api/analyze:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 2. /api/ai-help (Bantuan Form App 2)
app.post('/api/ai-help', async (req, res) => {
  console.log('HIT: /api/ai-help');
  try {
    const { userQuery } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah asisten AI yang membantu mengisi formulir data produk.
Seorang pengguna akan memberikan nama produk. 
Tugas Anda adalah membuat draf hipotesis untuk 4 bidang: 
- jenisProduk
- lokasiPenjualan
- deskripsiProduk (deskripsi singkat, 1-2 kalimat)
- targetKonsumen (deskripsi singkat, 1-2 kalimat)

PENTING: Kembalikan HANYA objek JSON yang valid.
    `;
    
    const schema = {
      type: "OBJECT",
      properties: {
        "jenisProduk": { "type": "STRING" },
        "lokasiPenjualan": { "type": "STRING" },
        "deskripsiProduk": { "type": "STRING" },
        "targetKonsumen": { "type": "STRING" }
      },
      required: ["jenisProduk", "lokasiPenjualan", "deskripsiProduk", "targetKonsumen"]
    };

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    const candidate = await callGeminiAPI(model, payload);
    const jsonResult = JSON.parse(candidate.content.parts[0].text);
    
    res.status(200).json(jsonResult);

  } catch (error) {
    console.error("Error in /api/ai-help:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 3. /api/summarize (Ringkasan App 2)
// Catatan: Frontend Anda memanggil /api/psikologis-hooks untuk ini.
// Saya akan membuat /api/summarize yang sebenarnya untuk memperbaiki itu.
// (Frontend Anda harus diubah untuk memanggil /api/summarize)
app.post('/api/summarize', async (req, res) => {
  console.log('HIT: /api/summarize');
   try {
    const { prompt } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang ahli pembuat ringkasan eksekutif.
Pengguna akan memberikan teks analisis produk yang panjang.
Tugas Anda adalah membuat 1 paragraf ringkasan eksekutif (maksimal 3-4 kalimat) dalam Bahasa Indonesia.
Soroti USP utama, target, dan manfaat kunci.

PENTING: Kembalikan HANYA teks ringkasan saja. Tanpa embel-embel.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    res.status(200).send(text);

  } catch (error) {
    console.error("Error in /api/summarize:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// === ENDPOINTS APP 3: MAPPING MARKET ===

// 4. /api/map-market (Analisis Utama App 3 - DENGAN GOOGLE SEARCH)
app.post('/api/map-market', async (req, res) => {
  console.log('HIT: /api/map-market');
  try {
    const { userInput } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Ahli Strategi Pemasaran AI.
Data produk (dalam YAML) akan diberikan oleh pengguna.

TUGAS ANDA:
1.  **WAJIB GUNAKAN ALAT GOOGLE SEARCH** untuk mencari tren pasar TERKINI, statistik, dan perilaku konsumen yang relevan dengan produk dan audiens tersebut.
2.  Lakukan analisis mendalam berdasarkan data YAML dan HASIL PENCARIAN.
3.  Buat laporan "Market Mapping & Strategy" yang komprehensif.

STRUKTUR LAPORAN (WAJIB FORMAT HTML):
-   \`<h2>Analisis Lanskap Pasar (Berdasarkan Tren Terkini)</h2>\`
    -   \`<p>\` (Paragraf analisis tren dari Google Search) \`</p>\`
-   \`<h2>Segmentasi Audiens (Primer & Sekunder)</h2>\`
    -   \`<p>\` (Analisis mendalam tentang audiens) \`</p>\`
-   \`<h2>Analisis Kompetitor (Hipotesis)</h2>\`
    -   \`<p>\` (Analisis kompetitor berdasarkan USP produk) \`</p>\`
-   \`<h2>Strategi Pemosisian (Positioning)</h2>\`
    -   \`<p>\` (Rekomendasi strategi) \`</p>\`
-   \`<h2>Rekomendasi Kanal Pemasaran</h2>\`
    -   \`<ul><li>\` (Sebutkan 3-5 kanal yang paling relevan) \`</li></ul>\`

PENTING: Kembalikan HANYA teks HTML yang bersih.
Sertakan sitasi (citations) dari hasil pencarian Anda.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: userInput }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: [{ "google_search": {} }], 
    };

    const candidate = await callGeminiAPI(model, payload);
    const analysisText = candidate.content.parts[0].text;

    let citations = [];
    const groundingMetadata = candidate.groundingMetadata;
    if (groundingMetadata && groundingMetadata.groundingAttributions) {
        citations = groundingMetadata.groundingAttributions
            .map(attribution => ({
                uri: attribution.web?.uri,
                title: attribution.web?.title,
            }))
            .filter(source => source.uri && source.title);
    }
    
    res.status(200).json({ analysisText, citations });

  } catch (error) {
    console.error("Error in /api/map-market:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 5. /api/map-market-helper (Bantuan Form App 3)
app.post('/api/map-market-helper', async (req, res) => {
  console.log('HIT: /api/map-market-helper');
  try {
    const { productName } = req.body;
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah asisten AI yang membantu mengisi formulir 'Market Map'.
Seorang pengguna akan memberikan nama produk.
Tugas Anda adalah membuat draf hipotesis untuk 5 bidang:
- usp (Unique Selling Proposition)
- audiencePrimary
- audienceSecondary
- customerJobs (3 item, dipisahkan newline)
- customerPains (3 item, dipisahkan newline)
- customerGains (3 item, dipisahkan newline)

PENTING: Kembalikan HANYA objek JSON yang valid.
    `;
    
    const schema = {
      type: "OBJECT",
      properties: {
        "usp": { "type": "STRING" },
        "audiencePrimary": { "type": "STRING" },
        "audienceSecondary": { "type": "STRING" },
        "customerJobs": { "type": "STRING" },
        "customerPains": { "type": "STRING" },
        "customerGains": { "type": "STRING" }
      },
      required: ["usp", "audiencePrimary", "audienceSecondary", "customerJobs", "customerPains", "customerGains"]
    };

    const payload = {
      contents: [{ parts: [{ text: `Nama Produk: "${productName}"` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    const candidate = await callGeminiAPI(model, payload);
    const jsonResult = JSON.parse(candidate.content.parts[0].text);
    
    res.status(200).json(jsonResult);

  } catch (error) {
    console.error("Error in /api/map-market-helper:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// === ENDPOINTS APP 4: PSIKOLOGIS MARKET ===

// 6. /api/psikologis-helper (Bantuan Form App 4)
app.post('/api/psikologis-helper', async (req, res) => {
  console.log('HIT: /api/psikologis-helper');
  try {
    const { businessName } = req.body;
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah asisten AI yang membantu mengisi formulir 'Analisis Psikologis'.
Pengguna memberikan nama/ide bisnis.
Buat draf hipotesis untuk 3 bidang:
- mappingInput: (Hipotesis singkat tentang USP & Target Audiens)
- reviewInput: (Contoh 2-3 review pelanggan fiktif, positif & negatif)
- socialInput: (Contoh 2-3 obrolan fiktif di media sosial tentang produk/masalah)

PENTING: Kembalikan HANYA objek JSON yang valid. Buat konten dalam format multiline string.
    `;
    
    const schema = {
      type: "OBJECT",
      properties: {
        "mappingInput": { "type": "STRING" },
        "reviewInput": { "type": "STRING" },
        "socialInput": { "type": "STRING" }
      },
      required: ["mappingInput", "reviewInput", "socialInput"]
    };

    const payload = {
      contents: [{ parts: [{ text: `Nama Bisnis: "${businessName}"` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    const candidate = await callGeminiAPI(model, payload);
    const jsonResult = JSON.parse(candidate.content.parts[0].text);
    
    res.status(200).json(jsonResult);

  } catch (error) {
    console.error("Error in /api/psikologis-helper:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 7. /api/psikologis-market (Analisis Utama App 4)
app.post('/api/psikologis-market', async (req, res) => {
  console.log('HIT: /api/psikologis-market');
  try {
    const { userInput } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Detektif Profiler Audiens (Audience Profiler) kelas dunia.
Anda menganalisis data mentah (mapping, review, obrolan sosial) untuk mengungkap wawasan psikologis terdalam.
Tugas Anda adalah membuat Laporan Profil Psikologis yang sangat terstruktur dalam format Markdown.

STRUKTUR LAPORAN (WAJIB):
# Laporan Profil Psikologis Audiens

## 1. Analisis Emosional (Perasaan)
### ### Emosi Positif
- (Sebutkan emosi positif utama yang dicari/dirasakan)
### ### Emosi Negatif (Pain Points)
- (Sebutkan emosi negatif utama yang ingin dihindari)

## 2. Analisis Rasional (Pikiran)
### ### Keyakinan (Beliefs)
- (Apa yang mereka yakini tentang produk/masalah ini?)
### ### Keberatan (Objections)
- (Apa keraguan atau keberatan utama mereka sebelum membeli?)
### ### Pemicu Logis (Logical Triggers)
- (Fakta/data apa yang mendorong mereka membeli?)

## 3. Analisis Perilaku (Kebiasaan)
### ### Kebiasaan Media
- (Di mana mereka menghabiskan waktu online?)
### ### Pola Pembelian
- (Bagaimana mereka biasanya membeli?)
### ### Bahasa yang Digunakan
- (Sebutkan 3-5 kata kunci/slang yang sering mereka gunakan)

PENTING: Kembalikan HANYA teks laporan Markdown. Tanpa "Tentu, ini laporannya:".
    `;
    
    const payload = {
      contents: [{ parts: [{ text: userInput }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    res.status(200).send(text);

  } catch (error) {
    console.error("Error in /api/psikologis-market:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 8. /api/psikologis-hooks (Fitur Sekunder App 4)
app.post('/api/psikologis-hooks', async (req, res) => {
  console.log('HIT: /api/psikologis-hooks');
  try {
    const { prompt } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Ahli Copywriter Iklan.
Pengguna akan memberikan Laporan Profil Psikologis Audiens.
Tugas Anda: Buat 5 "Hook Iklan" baru yang tajam dan kreatif berdasarkan laporan tersebut.
Setiap hook harus menargetkan satu wawasan psikologis spesifik (emosi, pikiran, atau perilaku).

Format sebagai daftar Markdown.
PENTING: Kembalikan HANYA 5 hook dalam format daftar. Tanpa embel-embel.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    res.status(200).send(text);

  } catch (error) {
    console.error("Error in /api/psikologis-hooks:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// 9. /api/psikologis-persona (Fitur Sekunder App 4)
app.post('/api/psikologis-persona', async (req, res) => {
  console.log('HIT: /api/psikologis-persona');
  try {
    const { prompt } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Penulis Cerita (Storyteller) yang empatik.
Pengguna akan memberikan Laporan Profil Psikologis Audiens.
Tugas Anda: Tulis sebuah cerita persona "Satu Hari dalam Kehidupan" (A Day in the Life) yang singkat (2-3 paragraf) untuk audiens tersebut.
Cerita harus menghidupkan emosi, pikiran, dan perilaku dari laporan.

Format sebagai Markdown.
PENTING: Kembalikan HANYA cerita persona. Tanpa embel-embel.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    res.status(200).send(text);

  } catch (error) {
    console.error("Error in /api/psikologis-persona:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// === ENDPOINT APP 5: PERENCANA KONTEN ===

// 10. /api/content-planner (Analisis Utama App 5)
app.post('/api/content-planner', async (req, res) => {
  console.log('HIT: /api/content-planner');
  try {
    const { userPrompt } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Ahli Strategi Konten Media Sosial.
Pengguna akan memberikan Topik, Tujuan, dan Durasi Rencana.
Tugas Anda adalah membuat rencana konten yang mendetail.

PENTING: Respons Anda HARUS berupa TABEL HTML (dimulai dengan \`<table>\` dan diakhiri dengan \`</table>\`).
JANGAN tambahkan teks, judul, atau penjelasan apa pun di luar tag tabel.

Kolom tabel harus mencakup (minimal):
- Hari/Postingan
- Pilar Konten (misal: Edukasi, Inspirasi, Hiburan, Promosi)
- Ide Konten / Topik
- Format (misal: Reels, Carousel, Teks)
- CTA (Call to Action)
    `;
    
    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    let htmlTable = candidate.content.parts[0].text;
    
    const tableMatch = htmlTable.match(/<table[\s\S]*?<\/table>/i);
    if (tableMatch) {
      htmlTable = tableMatch[0];
    } else {
      htmlTable = `<table><tr><td>Error: AI tidak mengembalikan format tabel yang valid. Coba lagi.</td></tr></table>`;
    }
    
    res.status(200).send(htmlTable);

  } catch (error) {
    console.error("Error in /api/content-planner:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// === ENDPOINT APP 6: COPYWRITING ===

// 11. /api/copywriting (Analisis Utama App 6)
app.post('/api/copywriting', async (req, res) => {
  console.log('HIT: /api/copywriting');
  try {
    const { userPrompt } = req.body; 
    const model = 'gemini-2.5-flash-preview-09-2025';

    const systemPrompt = `
Anda adalah seorang Master Copywriter AI.
Anda akan menerima brief lengkap dari pengguna (Deskripsi, Target, CTA, Platform, Formula, Hook, Bahasa).
Tugas Anda adalah menulis copywriting yang sangat persuasif dan siap pakai berdasarkan brief tersebut.

PENTING: Respons Anda HARUS HANYA berupa naskah copywriting yang sudah jadi.
JANGAN tambahkan "Tentu, ini copywritingnya:", "Hasil:", judul, atau penjelasan apa pun.
Langsung tulis naskahnya.
    `;
    
    const payload = {
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    const candidate = await callGeminiAPI(model, payload);
    const text = candidate.content.parts[0].text;
    
    res.status(200).send(text);

  } catch (error) {
    console.error("Error in /api/copywriting:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// === ENDPOINT APP 7: TTS GENERATOR ===

// 12. /api/tts-generator (Analisis Utama App 7)
app.post('/api/tts-generator', async (req, res) => {
  console.log('HIT: /api/tts-generator');
  try {
    const { promptText, voice } = req.body;
    const model = 'gemini-2.5-flash-preview-tts';

    const payload = {
      contents: [{
        parts: [{ text: promptText }] 
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      },
    };

    const candidate = await callGeminiAPI(model, payload);
    
    const part = candidate.content?.parts?.[0];
    const audioData = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType;

    if (audioData && mimeType && mimeType.startsWith("audio/")) {
      res.status(200).json({ audioData, mimeType });
    } else {
      throw new Error("Respons API tidak valid atau tidak mengandung data audio.");
    }

  } catch (error) {
    console.error("Error in /api/tts-generator:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// === Penutup Server ===

// Rute dasar (root) untuk cek status
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Selamat datang di API Backend AI SATSET! Semua sistem berjalan.' 
  });
});

// Menjalankan server secara lokal (diabaikan oleh Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server lokal berjalan di http://localhost:${port}`);
  });
}

// Ekspor 'app' agar Vercel dapat menjalankannya
module.exports = app;
