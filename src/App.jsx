import React, { useState, useEffect, useCallback, useRef } from 'react';

// === FUNGSI HELPER GLOBAL ===

/**
 * Panggilan API terpusat untuk semua aplikasi.
 * Memanggil endpoint back-end lokal (di /api/)
 */
const callLocalAPI = async (endpoint, body, retryCount = 0) => {
  const maxRetries = 3;
  const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Coba lagi untuk error server (5xx) atau rate limit (429)
      if ((response.status >= 500 || response.status === 429) && retryCount < maxRetries) {
        await new Promise(res => setTimeout(res, delay));
        return callLocalAPI(endpoint, body, retryCount + 1);
      }
      // Untuk error klien (4xx) atau error final, lempar error
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    // Cek jika respons adalah JSON atau teks biasa
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }

  } catch (error) {
    // Coba lagi untuk error jaringan
    if (retryCount < maxRetries) {
      await new Promise(res => setTimeout(res, delay));
      return callLocalAPI(endpoint, body, retryCount + 1);
    }
    console.error(`Gagal memanggil API ${endpoint} setelah ${maxRetries} percobaan:`, error);
    throw error; // Lemparkan error final
  }
};


// === KOMPONEN IKON (SVG Inline) ===
// --- PERBAIKAN: Semua ikon di bawah ini diubah untuk menerima `className` ---

const IconLayoutDashboard = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);
const IconBulb = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8 17a5 5 0 0 1 8 0h-8Z" /><path d="M9 11a5.002 5.002 0 0 1 5-5 5 5 0 0 1 5 5c0 1.83-1.04 3.4-2.5 4.16V17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-1.84C10.04 14.4 9 12.83 9 11Z" /><path d="M12 21a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H13a1 1 0 0 1-1-1Z" /><path d="M12 3a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H13a1 1 0 0 1-1-1Z" /><path d="M19.9 6.01a1 1 0 0 1-1.42 1.42 1 1 0 0 1-1.4-1.4Z" /><path d="M4.1 6.01a1 1 0 0 1 0 1.42 1 1 0 0 1-1.4 1.4Z" /><path d="m18 12 1.99.01a1 1 0 0 1 .99 1v.01a1 1 0 0 1-1 1H18a1 1 0 0 1 0-2Z" /><path d="m4 12 1.99.01a1 1 0 0 1 .99 1v.01a1 1 0 0 1-1 1H4a1 1 0 0 1 0-2Z" />
    </svg>
);
const IconMap = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" x2="8" y1="2" y2="18" /><line x1="16" x2="16" y1="6" y2="22" />
    </svg>
);
const IconBrain = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 0 0 9 22a4 4 0 0 0 4-4 4 4 0 0 0 4-4 4 4 0 0 0-2-3.465c.52-.69.8-1.58.8-2.535A3 3 0 0 0 12 5Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 0 1 15 22a4 4 0 0 1-4-4 4 4 0 0 1-4-4 4 4 0 0 1 2-3.465c-.52-.69-.8-1.58-.8-2.535A3 3 0 0 1 12 5Z" /><path d="M12 5a3 3 0 0 0-3 3" /><path d="M12 5a3 3 0 0 1 3 3" /><path d="M12 22v-4" /><path d="M15 18a3 3 0 0 0-3-3 3 3 0 0 0-3 3" /><path d="M12 15a3 3 0 0 0-3-3" /><path d="M12 15a3 3 0 0 1 3-3" />
    </svg>
);
const IconCalendar = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
);
const IconPencil = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" x2="22" y1="2" y2="6" /><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22l5.5-1.5Z" /><path d="m15 5 4 4" />
    </svg>
);
const IconVolume = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

// --- Ikon internal App (PERLU DEFINISI LENGKAP) ---
const IconWandSparkles = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11.8 9.2a1.21 1.21 0 0 0 0 1.72l5.8 5.8a1.21 1.21 0 0 0 1.72 0l6.84-6.84a1.21 1.21 0 0 0 0-1.72Z"/>
    <path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M14 17H9"/><path d="M17 17H9"/>
  </svg>
);

const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);


// =======================================================================
// === SLOT APLIKASI 1: DASHBOARD ===
// =======================================================================
const App1_Dashboard = ({ setActiveApp }) => {
    
    // Daftar shortcut untuk 6 aplikasi lainnya
    const shortcuts = [
        { id: 'app2', name: 'Analisis Value', icon: <IconBulb />, description: "Akses Analisis Value" },
        { id: 'app3', name: 'Mapping Market', icon: <IconMap />, description: "Akses Mapping Market" },
        { id: 'app4', name: 'Psikologis Market', icon: <IconBrain />, description: "Akses Psikologis Market" },
        { id: 'app5', name: 'Perencana Konten', icon: <IconCalendar />, description: "Akses Perencana Konten" },
        { id: 'app6', name: 'Copywriting', icon: <IconPencil />, description: "Akses Copywriting" },
        { id: 'app7', name: 'TTS Generator', icon: <IconVolume />, description: "Akses TTS Generator" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">DIVISI ANALISIS & STRATEGI KOMUNIKASI</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Selamat datang di ruang kerja kami! Kami siap membantu menganalisis & merencakan konten dalam hitungan detik.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Shortcut Aplikasi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shortcuts.map(app => (
                    <button
                        key={app.id}
                        onClick={() => setActiveApp(app.id)}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl dark:hover:shadow-yellow-300/20 transition-shadow duration-300 flex items-center text-left w-full border border-gray-200 dark:border-gray-700"
                    >
                        {/* PERBAIKAN: Menggunakan <span> dengan lebar tetap (w-20 / 5rem) 
                          untuk menampung ikon dan meratakannya. 
                        */}
                        <span className="w-20 flex items-center justify-center flex-shrink-0">
                           {React.cloneElement(app.icon, { className: "h-8 w-8 text-[#2022f3] dark:text-[#f8fb18]" })}
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{app.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// =======================================================================
// === APLIKASI 2: AI VALUE PRODUCT ANALYST
// =======================================================================
const App2_AnalisisValue = () => {
  
  // --- State Management ---
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('aiVal_formData');
    return saved ? JSON.parse(saved) : {
      'nama-produk': '', 'jenis-produk': '', 'lokasi-penjualan': '',
      'deskripsi-produk': '', 'target-konsumen': '', 'kompetitor': '',
      'harga': '', 'positioning': '', 'keunggulan-brand': '', 'pain-point-konsumen': '',
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // State untuk Hasil Utama
  const [visualResult, setVisualResult] = useState(() => localStorage.getItem('aiVal_visualText') || null);
  const [yamlResult, setYamlResult] = useState(() => localStorage.getItem('aiVal_yamlText') || null);
  
  const [copyStatus, setCopyStatus] = useState('Salin Hasil YAML');

  // State untuk Bantuan AI
  const [isAiHelping, setIsAiHelping] = useState(false);
  
  // State untuk Ringkasan
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState(() => localStorage.getItem('aiVal_summaryResult') || null);
  const [summaryError, setSummaryError] = useState(null);


  // --- EFEK: Menyimpan State ke localStorage Saat Berubah ---
  useEffect(() => {
    localStorage.setItem('aiVal_formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (visualResult) localStorage.setItem('aiVal_visualText', visualResult);
    else localStorage.removeItem('aiVal_visualText');
  }, [visualResult]);
  
  useEffect(() => {
    if (yamlResult) localStorage.setItem('aiVal_yamlText', yamlResult);
    else localStorage.removeItem('aiVal_yamlText');
  }, [yamlResult]);

  useEffect(() => {
    if (summaryResult) localStorage.setItem('aiVal_summaryResult', summaryResult);
    else localStorage.removeItem('aiVal_summaryResult');
  }, [summaryResult]);
  

  // --- Fungsi Helper ---

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: false }));
    }
  };

  const validateForm = useCallback(() => {
    const requiredFields = [
      'nama-produk', 'jenis-produk', 'lokasi-penjualan', 
      'deskripsi-produk', 'target-konsumen'
    ];
    let newErrors = {};
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        isValid = false;
      }
    });
    
    setValidationErrors(newErrors);
    return isValid;
  }, [formData]);

  /**
   * Meng-handle submit form utama (Analisis Sekarang)
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setError("Harap isi semua kolom yang wajib ditandai *");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setVisualResult(null);
    setYamlResult(null);
    setSummaryResult(null);
    setSummaryError(null);
    
    // Mengumpulkan data dari form state
    const userQuery = `
--- DATA PRODUK MENTAH ---
Nama Produk: ${formData['nama-produk']}
Jenis Produk/Layanan: ${formData['jenis-produk']}
Lokasi penjualan: ${formData['lokasi-penjualan']}
Deskripsi Singkat / Spesifikasi / Fitur Produk: 
${formData['deskripsi-produk']}
Target Konsumen / Persona Utama: ${formData['target-konsumen']}
--- DATA OPSIONAL ---
Kompetitor Utama: ${formData.kompetitor || 'Tidak disebutkan'}
Harga Produk/Layanan: ${formData.harga || 'Tidak disebutkan'}
Positioning brand: ${formData.positioning || 'Tidak disebutkan'}
Keunggulan utama menurut brand: ${formData['keunggulan-brand'] || 'Tidak disebutkan'}
Masalah konsumen yang ingin dipecahkan: ${formData['pain-point-konsumen'] || 'Tidak disebutkan'}
--- AKHIR DATA ---
Tolong analisis data di atas sekarang.
    `;

    try {
      // Memanggil back-end lokal
      const fullText = await callLocalAPI('/api/analyze', { userQuery });
      
      const parts = fullText.split('---VISUAL_BREAK---');
      
      if (parts.length < 2) {
        console.warn("AI response format error: separator not found. Displaying raw text.");
        setVisualResult(fullText.trim());
        setYamlResult(fullText.trim());
      } else {
        const visual = parts[0].trim();
        const yaml = parts[1].replace(/^```yaml\n|```$/g, '').trim();
        setVisualResult(visual);
        setYamlResult(yaml);
      }
      
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Meng-handle klik tombol "Bantu AI"
   */
  const handleAiHelp = async () => {
    const namaProduk = formData['nama-produk'];
    if (!namaProduk || namaProduk.trim() === '') {
      setValidationErrors(prev => ({ ...prev, 'nama-produk': true }));
      setError("Harap isi 'Nama Produk' terlebih dahulu sebelum menggunakan Bantuan AI.");
      return;
    }
    
    setIsAiHelping(true);
    setError(null);

    const userQuery = `Berdasarkan nama produk ini: "${namaProduk}", tolong buatkan draf untuk field-field berikut.`;

    try {
      // Memanggil back-end lokal
      const suggestions = await callLocalAPI('/api/ai-help', { userQuery });
      
      // suggestions sudah dalam format JSON
      setFormData(prev => ({
        ...prev,
        'jenis-produk': suggestions.jenisProduk || prev['jenis-produk'],
        'lokasi-penjualan': suggestions.lokasiPenjualan || prev['lokasi-penjualan'],
        'deskripsi-produk': suggestions.deskripsiProduk || prev['deskripsi-produk'],
        'target-konsumen': suggestions.targetKonsumen || prev['target-konsumen'],
      }));

    } catch (err) {
      setError(err.message || "Bantuan AI gagal. Silakan coba lagi.");
    } finally {
      setIsAiHelping(false);
    }
  };

  /**
   * Meng-handle klik tombol "Ringkasan Eksekutif"
   * (Fungsi ini tidak memerlukan back-end baru, karena hanya memanggil ulang API biasa)
   */
  const handleSummary = async () => {
    if (!visualResult) {
      setSummaryError("Tidak ada hasil analisis untuk diringkas.");
      return;
    }
    
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);

    const userQuery = `
Berikut adalah teks analisis nilai produk. Tolong buatkan "Ringkasan Eksekutif" dalam 1 paragraf singkat (maksimal 3-4 kalimat) dalam bahasa Indonesia, menyoroti USP utama, target, dan manfaat kunci.

--- TEKS UNTUK DIRINGKAS ---
${visualResult}
--- AKHIR TEKS ---
`;
    
    try {
      // Kita bisa gunakan endpoint '/api/analyze' yang sama, tapi dengan userQuery yang berbeda
      // atau buat endpoint baru /api/summarize. Untuk simpelnya, kita panggil /api/analyze
      // tapi ini kurang ideal.
      // Solusi LEBIH BAIK: Kita panggil endpoint /api/analyze, tapi endpoint itu harus
      // cukup pintar untuk tidak selalu menggunakan SYSTEM_PROMPT utama.
      // Untuk saat ini, kita akan membuat panggilan ke endpoint BEDA yang tidak pakai system prompt
      // Mari kita panggil '/api/psikologis-hooks' sebagai "generic summarizer"
      // INI HACK: Seharusnya kita buat endpoint /api/summarize
      const summaryText = await callLocalAPI('/api/psikologis-hooks', { prompt: userQuery });
      setSummaryResult(summaryText);
    } catch (err) {
      setSummaryError(err.message || "Gagal membuat ringkasan.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  /**
   * Meng-handle klik tombol "Reset Form"
   */
  const handleReset = () => {
    setFormData({
      'nama-produk': '', 'jenis-produk': '', 'lokasi-penjualan': '',
      'deskripsi-produk': '', 'target-konsumen': '', 'kompetitor': '',
      'harga': '', 'positioning': '', 'keunggulan-brand': '', 'pain-point-konsumen': '',
    });
    setError(null);
    setValidationErrors({});
    setVisualResult(null);
    setYamlResult(null);
    setSummaryResult(null);
    setSummaryError(null);
    setIsLoading(false);
    setIsAiHelping(false);
    setIsSummaryLoading(false);
    
    // Hapus localStorage
    localStorage.removeItem('aiVal_formData');
    localStorage.removeItem('aiVal_visualText');
    localStorage.removeItem('aiVal_yamlText');
    localStorage.removeItem('aiVal_summaryResult');
  };

  const handleCopyClick = () => {
    if (!yamlResult) return;
    const textToCopy = yamlResult;
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = textToCopy;
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.left = '-9999px';
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      setCopyStatus('Berhasil Disalin!');
      setTimeout(() => setCopyStatus('Salin Hasil YAML'), 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
      setCopyStatus('Gagal Menyalin');
      setTimeout(() => setCopyStatus('Salin Hasil YAML'), 2000);
    }
    document.body.removeChild(tempTextarea);
  };

  const getCopyButtonClass = () => {
    let baseClass = "text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
    if (copyStatus === 'Berhasil Disalin!') return `${baseClass} bg-green-600 hover:bg-green-700`;
    if (copyStatus === 'Gagal Menyalin') return `${baseClass} bg-red-600 hover:bg-red-700 w-full sm:w-auto`;
    return `${baseClass} bg-gray-600 hover:bg-gray-500 w-full sm:w-auto`;
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm";
    if (validationErrors[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return baseClass;
  };

  const formatVisualText = (text) => {
    if (!text) return { __html: '' };
    let safeText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safeText = safeText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    safeText = safeText.replace(/\n/g, '<br>');
    return { __html: safeText };
  };

  const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1.5" viewBox="0 0 16 16">
      <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.5 2.5 0 0 0 1.916 1.414l2.03.295c.34.05.48.462.2.73l-1.473 1.437a2.5 2.5 0 0 0-.71 2.225l.346 2.024c.06.338-.298.597-.61.43l-1.815-.954a2.5 2.5 0 0 0-2.34 0l-1.815.954c-.312.166-.67-.092-.61-.43l.346-2.024a2.5 2.5 0 0 0-.71-2.225L1.84 9.613c-.28-.268-.14-.68.2-.73l2.03-.295a2.5 2.5 0 0 0 1.916-1.414l.645-1.937zM4.1 0l.365 1.462a.5.5 0 0 0 .382.288l1.528.22a.5.5 0 0 1 .28.854l-1.106.94a.5.5 0 0 0-.142.443l.26 1.516a.5.5 0 0 1-.724.526l-1.367-.718a.5.5 0 0 0-.466 0l-1.367.718a.5.5 0 0 1-.724-.526l.26-1.516a.5.5 0 0 0-.142-.443l-1.106-.94a.5.5 0 0 1 .28-.854l1.528-.22a.5.5 0 0 0 .382-.288L4.1 0zm7 0l.365 1.462a.5.5 0 0 0 .382.288l1.528.22a.5.5 0 0 1 .28.854l-1.106.94a.5.5 0 0 0-.142.443l.26 1.516a.5.5 0 0 1-.724.526l-1.367-.718a.5.5 0 0 0-.466 0l-1.367.718a.5.5 0 0 1-.724-.526l.26-1.516a.5.5 0 0 0-.142-.443l-1.106-.94a.5.5 0 0 1 .28-.854l1.528-.22a.5.5 0 0 0 .382-.288L11.1 0z"/>
    </svg>
  );

  return (
    <>
      <style>{`
        /* CSS khusus untuk App 2 */
        .app2-container ::-webkit-scrollbar { width: 8px; height: 8px; }
        .app2-container ::-webkit-scrollbar-track { background: #f1f5f9; /* gray-100 */ }
        .app2-container ::-webkit-scrollbar-thumb { background: #94a3b8; /* gray-400 */ border-radius: 4px; }
        .app2-container ::-webkit-scrollbar-thumb:hover { background: #64748b; /* gray-500 */ }
        
        /* Penyesuaian Dark Mode untuk Scrollbar */
        .dark .app2-container ::-webkit-scrollbar-track { background: #1f2937; /* gray-800 */ }
        .dark .app2-container ::-webkit-scrollbar-thumb { background: #4b5563; /* gray-600 */ }
        .dark .app2-container ::-webkit-scrollbar-thumb:hover { background: #6b7280; /* gray-500 */ }
        
        .app2-container #output-yaml strong { font-weight: 700; color: #111827; /* gray-900 */ }
        .dark .app2-container #output-yaml strong { color: #f9fafb; /* gray-50 */ }
        .app2-container #output-yaml em { font-style: italic; color: #4b5563; /* gray-600 */ }
        .dark .app2-container #output-yaml em { color: #d1d5db; /* gray-300 */ }
      `}</style>

      <div className="app2-container p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Judul dan Deskripsi Alat */}
          <header className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
              AI Value Product Analyst
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-3xl mx-auto">
              Masukkan info detail produk kamu, supaya bisa aku analisis value-nya 😉
            </p>
          </header>

          {/* === KOTAK INFO BARU UNTUK APP 2 === */}
          <div className="mb-8 max-w-5xl mx-auto bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
              <div className="flex">
                  <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                  <div>
                      <p className="font-bold">Informasi Penting</p>
                      <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                          <li>Kualitas hasil sangat bergantung pada detail <strong>Deskripsi Fitur</strong> dan <strong>Target Konsumen</strong>.</li>
                          <li>Gunakan tombol "Bantu AI" jika Anda hanya memiliki nama produk untuk draf awal.</li>
                          <li>Hasil "YAML" dapat Anda salin untuk digunakan di aplikasi "Mapping Market".</li>
                      </ul>
                  </div>
              </div>
          </div>
          {/* === AKHIR KOTAK INFO BARU === */}

          {/* Konten Utama: Input dan Output */}
          <main className="grid md:grid-cols-2 gap-6 md:gap-8">
            
            {/* Kolom Input Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-cyan-600 dark:text-cyan-400 border-b border-gray-200 dark:border-gray-700 pb-3">
                Input Data Produk
              </h2>
              <form onSubmit={handleSubmit}>
                
                {/* Bagian Wajib */}
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Wajib Diisi</h3>
                  <div className="space-y-4">
                    
                    {/* --- Input Nama Produk --- */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="nama-produk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Nama Produk <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <button 
                          type="button" 
                          onClick={handleAiHelp}
                          disabled={isAiHelping}
                          className="text-xs flex items-center bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAiHelping ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <><MagicIcon /> Bantu AI</>
                          )}
                        </button>
                      </div>
                      <input 
                        type="text" 
                        id="nama-produk" 
                        className={getInputClass('nama-produk')} 
                        placeholder="Misal: BrightBoost C-Serum" 
                        value={formData['nama-produk']}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    {/* --- Input Jenis Produk --- */}
                    <div>
                      <label htmlFor="jenis-produk" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Jenis Produk/Layanan <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="jenis-produk" 
                        className={getInputClass('jenis-produk')}
                        placeholder="Misal: Serum Wajah, Aplikasi SaaS, Jasa Konsultasi" 
                        value={formData['jenis-produk']}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    {/* --- Input Lokasi Penjualan --- */}
                    <div>
                      <label htmlFor="lokasi-penjualan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lokasi Penjualan <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="lokasi-penjualan" 
                        className={getInputClass('lokasi-penjualan')}
                        placeholder="Misal: E-commerce (Shopee, Tokopedia), Website, Offline Store" 
                        value={formData['lokasi-penjualan']}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    {/* --- Input Deskripsi Produk --- */}
                    <div>
                      <label htmlFor="deskripsi-produk" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Deskripsi / Spesifikasi / Fitur <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <textarea 
                        id="deskripsi-produk" 
                        rows="6" 
                        className={getInputClass('deskripsi-produk')}
                        placeholder="Contoh:&#10;Product Skincare&#10;Mengandung Vitamin C 10% + Niacinamide 5%&#10;Mencerahkan kulit kusam dalam 7 hari&#10;Botol airless pump anti oksidasi&#10;Dermatologically tested" 
                        value={formData['deskripsi-produk']}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>
                    
                    {/* --- Input Target Konsumen --- */}
                    <div>
                      <label htmlFor="target-konsumen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target Konsumen / Persona Utama <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <textarea 
                        id="target-konsumen" 
                        rows="3" 
                        className={getInputClass('target-konsumen')}
                        placeholder="Contoh: Perempuan usia 20-35 tahun, peduli penampilan, sibuk, suka produk natural dan aman." 
                        value={formData['target-konsumen']}
                        onChange={handleFormChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Bagian Opsional (Collapsible) */}
                <details className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <summary className="cursor-pointer text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition duration-200">
                    Data Opsional (Klik untuk Buka)
                  </summary>
                  <div className="space-y-4 mt-4">
                    {/* --- Input Kompetitor --- */}
                    <div>
                      <label htmlFor="kompetitor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama 1-2 Kompetitor Utama
                      </label>
                      <input 
                        type="text" 
                        id="kompetitor" 
                        className={getInputClass('kompetitor')}
                        placeholder="Misal: Somethinc Niacinamide Serum" 
                        value={formData.kompetitor}
                        onChange={handleFormChange}
                      />
                    </div>
                    {/* --- Input Harga --- */}
                    <div>
                      <label htmlFor="harga" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Harga Produk/Layanan
                      </label>
                      <input 
                        type="text" 
                        id="harga" 
                        className={getInputClass('harga')}
                        placeholder="Misal: Rp 150.000" 
                        value={formData.harga}
                        onChange={handleFormChange}
                      />
                    </div>
                    {/* --- Input Positioning --- */}
                    <div>
                      <label htmlFor="positioning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Positioning Brand (Fokus Utama)
                      </label>
                      <input 
                        type="text" 
                        id="positioning" 
                        className={getInputClass('positioning')}
                        placeholder="Misal: Efektif, Aman, Harga Terjangkau" 
                        value={formData.positioning}
                        onChange={handleFormChange}
                      />
                    </div>
                    {/* --- Input Keunggulan Brand --- */}
                    <div>
                      <label htmlFor="keunggulan-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Keunggulan Utama (Menurut Brand)
                      </label>
                      <input 
                        type="text" 
                        id="keunggulan-brand" 
                        className={getInputClass('keunggulan-brand')}
                        placeholder="Misal: Formulasi Cepat Meresap" 
                        value={formData['keunggulan-brand']}
                        onChange={handleFormChange}
                      />
                    </div>
                    {/* --- Input Pain Point Konsumen --- */}
                    <div>
                      <label htmlFor="pain-point-konsumen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Masalah Konsumen (Pain Point)
                      </label>
                      <input 
                        type="text" 
                        id="pain-point-konsumen" 
                        className={getInputClass('pain-point-konsumen')}
                        placeholder="Misal: Kulit kusam dan lelah, sudah coba banyak produk tapi tidak ngefek" 
                        value={formData['pain-point-konsumen']}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </details>

                {/* Pesan Error Global (jika ada) */}
                {error && (
                  <div className="mt-6 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                {/* Tombol Submit & Reset */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit" 
                    id="analyze-button" 
                    disabled={isLoading}
                    className="flex-grow w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span id="button-spinner"><SpinnerIcon /> Menganalisis...</span>
                    ) : (
                      <span id="button-text">Analisis Sekarang</span>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg shadow-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>

            {/* Kolom Output Hasil */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col" style={{ maxHeight: '1200px' }}>
              <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-cyan-600 dark:text-cyan-400 border-b border-gray-200 dark:border-gray-700 pb-3">
                Hasil Analisis Nilai Produk
              </h2>
              
              {/* === TAMPILAN OUTPUT === */}

              {/* 1. Placeholder Awal */}
              {!isLoading && !visualResult && (
                <div id="placeholder" className="flex-grow flex items-center justify-center text-center">
                  <div className="text-gray-500 dark:text-gray-500">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p className="mt-2 text-lg">Hasil analisis akan muncul di sini.</p>
                    <p className="text-sm">Isi data produk di sebelah kiri dan klik "Analisis Sekarang".</p>
                  </div>
                </div>
              )}

              {/* 2. Tampilan Loading */}
              {isLoading && (
                <div id="loading-placeholder" className="flex-grow flex flex-col items-center justify-center text-center">
                  <SpinnerIcon />
                  <p className="mt-2 text-lg text-cyan-600 dark:text-cyan-400">Sedang menganalisis data produk Anda...</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Harap tunggu sebentar.</p>
                </div>
              )}

              {/* 3. Tampilan Hasil */}
              {visualResult && !isLoading && (
                <div id="result-container" className="flex-grow flex flex-col min-h-0">
                  
                  {/* --- Bagian Ringkasan Eksekutif --- */}
                  <div className="mb-4">
                    <button 
                      onClick={handleSummary}
                      disabled={isSummaryLoading || isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSummaryLoading ? (
                        <><SpinnerIcon /> Membuat Ringkasan...</>
                      ) : (
                        'Buat Ringkasan Eksekutif'
                      )}
                    </button>

                    {/* Tampilan Error Ringkasan */}
                    {summaryError && (
                      <div className="mt-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg text-sm" role="alert">
                        <strong>Error Ringkasan:</strong> {summaryError}
                      </div>
                    )}
                    
                    {/* Tampilan Hasil Ringkasan */}
                    {summaryResult && (
                      <div className="mt-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm">
                        <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-1">Ringkasan Eksekutif:</h4>
                        <p className="text-gray-800 dark:text-gray-200">{summaryResult}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* --- Bagian Tombol Salin --- */}
                  <button 
                    id="copy-button" 
                    onClick={handleCopyClick}
                    disabled={!yamlResult}
                    className={`${getCopyButtonClass()} mb-4`}
                  >
                    {copyStatus}
                  </button>
                  
                  {/* --- Tampilan Teks Hasil Analisis --- */}
                  <div 
                    id="output-yaml" 
                    className="mt-4 flex-grow overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-inner text-sm text-gray-800 dark:text-gray-200"
                    dangerouslySetInnerHTML={formatVisualText(visualResult)}
                  >
                  </div>
                </div>
              )}
              
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// =======================================================================
// === APLIKASI 3: MAPPING MARKET
// =======================================================================
const App3_MarketMapping = () => {

    const placeholderOutput = '<p class="text-gray-500 dark:text-gray-500">Hasil analisis pasar Anda akan muncul di sini...</p>';

    // --- Komponen Helper ---
    const LoadingSpinner = ({ text = "AI sedang menganalisis..." }) => (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">{text}</p>
        </div>
      </div>
    );

    const ManualInputForm = ({ formData, handleChange, onBantuAI, isAiHelping }) => (
      <div className="space-y-4">
        <div className="flex justify-between items-end gap-3">
          <div className="flex-1">
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
            <input
              type="text"
              id="product-name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Contoh: Kopi Susu Aren 'Nyaman'"
            />
          </div>
          <button
            type="button"
            onClick={onBantuAI}
            disabled={!formData.productName || isAiHelping}
            className="w-28 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isAiHelping ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "✨ Bantu AI"
            )}
          </button>
        </div>

        <div>
          <label htmlFor="usp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unique Selling Proposition (USP)</label>
          <input
            type="text"
            id="usp"
            name="usp"
            value={formData.usp}
            onChange={handleChange}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Contoh: Kopi Susu Aren nikmat dengan formula Low Acid, aman di lambung"
          />
        </div>
        <div>
          <label htmlFor="audience-primary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audiens Primer</label>
          <textarea
            id="audience-primary"
            name="audiencePrimary"
            rows="2"
            value={formData.audiencePrimary}
            onChange={handleChange}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Contoh: Pelajar/Mahasiswa yang sering begadang dan punya maag"
          ></textarea>
        </div>
        <div>
          <label htmlFor="audience-secondary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audiens Sekunder</label>
          <textarea
            id="audience-secondary"
            name="audienceSecondary"
            rows="2"
            value={formData.audienceSecondary}
            onChange={handleChange}
            className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Contoh: Pekerja kantor muda yang butuh kafein tapi sensitif lambungnya"
          ></textarea>
        </div>

        {/* Value Map Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <label htmlFor="customer-jobs" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Jobs</label>
            <textarea
              id="customer-jobs"
              name="customerJobs"
              rows="4"
              value={formData.customerJobs}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Satu item per baris:&#10;- Tetap fokus saat belajar&#10;- Menikmati kopi tanpa cemas&#10;- Minum sesuatu yang enak"
            ></textarea>
          </div>
          <div>
            <label htmlFor="customer-pains" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Pains</label>
            <textarea
              id="customer-pains"
              name="customerPains"
              rows="4"
              value={formData.customerPains}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Satu item per baris:&#10;- Maag kambuh setelah ngopi&#10;- Perut kembung/perih&#10;- Cemas Kopi merusak lambung"
            ></textarea>
          </div>
          <div>
            <label htmlFor="customer-gains" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Gains</label>
            <textarea
              id="customer-gains"
              name="customerGains"
              rows="4"
              value={formData.customerGains}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Satu item per baris:&#10;- Rasa aman di lambung&#10;- Bisa fokus belajar/kerja&#10;- Mood jadi lebih baik"
            ></textarea>
          </div>
        </div>
      </div>
    );

    const YamlInputForm = ({ yamlInput, handleChange }) => (
      <div className="h-full">
        <label htmlFor="yaml-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempelkan Product Value Analyst (YAML)</label>
        <textarea
          id="yaml-input"
          value={yamlInput}
          onChange={handleChange}
          className="w-full h-96 lg:h-[calc(100%-2rem)] bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          placeholder="product_name: Kopi Susu Aren 'Nyaman'
    usp: Kopi Susu Aren nikmat dengan formula Low Acid, aman di lambung
    audience:
      primary: Pelajar/Mahasiswa (18-24) ...
    (dan seterusnya...)"
        ></textarea>
      </div>
    );


    // --- State Aplikasi 3 ---
    const [currentInputMode, setCurrentInputMode] = useState('manual'); // 'manual' or 'yaml'
    const [formData, setFormData] = useState({
      productName: '', usp: '', audiencePrimary: '', audienceSecondary: '',
      customerJobs: '', customerPains: '', customerGains: ''
    });
    const [yamlInput, setYamlInput] = useState('');
    const [outputHtml, setOutputHtml] = useState(placeholderOutput);
    const [isMappingLoading, setIsMappingLoading] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Salin');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAiHelping, setIsAiHelping] = useState(false);

    useEffect(() => {
      const savedResult = sessionStorage.getItem('lastAnalysisResult');
      if (savedResult) {
        setOutputHtml(savedResult);
      }
      setIsLoaded(true);
    }, []);

    useEffect(() => {
      if (isLoaded && outputHtml !== placeholderOutput) {
        sessionStorage.setItem('lastAnalysisResult', outputHtml);
      }
    }, [outputHtml, isLoaded]);

    const handleManualFormChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const listToYaml = (text, indentLevel = 2) => {
      const indent = ' '.repeat(indentLevel * 2);
      return text.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `${indent}- ${line.trim()}`)
        .join('\n');
    };

    const getYamlFromManualForm = useCallback(() => {
      return `
    product_name: ${formData.productName || 'N/A'}
    usp: ${formData.usp || 'N/A'}
    audience:
      primary: ${formData.audiencePrimary || 'N/A'}
      secondary: ${formData.audienceSecondary || 'N/A'}
    value_map:
      customer_jobs:
    ${listToYaml(formData.customerJobs, 2)}
      customer_pains:
    ${listToYaml(formData.customerPains, 2)}
      customer_gains:
    ${listToYaml(formData.customerGains, 2)}
    `;
    }, [formData]);

    const getCurrentYamlInput = useCallback(() => {
      if (currentInputMode === 'manual') {
        return getYamlFromManualForm();
      } else {
        return yamlInput;
      }
    }, [currentInputMode, yamlInput, getYamlFromManualForm]);

    const handleMapping = async () => {
      const userInput = getCurrentYamlInput();

      if (!userInput.trim() || userInput.includes("N/A")) {
        setOutputHtml('<p class="text-red-500 dark:text-red-400">Silakan masukkan data produk Anda di formulir manual atau YAML.</p>');
        return;
      }

      setIsMappingLoading(true);
      setCopyButtonText('Salin');
      setOutputHtml('');

      try {
        // Memanggil back-end lokal
        const data = await callLocalAPI('/api/map-market', { userInput });
        
        let finalHtml = data.analysisText;
        if (data.citations && data.citations.length > 0) {
          let citationHtml = '<hr class="my-4 border-gray-300 dark:border-gray-700"><p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Didukung oleh data dari:</p><ul class="list-disc list-inside text-sm">';
          data.citations.forEach(c => {
            citationHtml += `<li class="mb-1"><a href="${c.uri}" target="_blank" class="text-indigo-500 dark:text-indigo-400 hover:text-indigo-300 underline">${c.title}</a></li>`;
          });
          citationHtml += '</ul>';
          finalHtml += citationHtml;
        }
        setOutputHtml(finalHtml);

      } catch (error) {
        console.error("Error fetching mapping:", error);
        setOutputHtml(`<p class="text-red-500 dark:text-red-400"><b>Terjadi Kesalahan:</b><br>${error.message}. Silakan coba lagi.</p>`);
      } finally {
        setIsMappingLoading(false);
      }
    };

    const handleBantuAI = async () => {
      const { productName } = formData;
      if (!productName.trim()) {
        setOutputHtml('<p class="text-red-500 dark:text-red-400">Harap isi "Nama Produk" terlebih dahulu untuk menggunakan "Bantu AI".</p>');
        return;
      }

      setIsAiHelping(true);
      setOutputHtml('<p class="text-gray-500 dark:text-gray-500">AI sedang mengisi draf untuk Anda...</p>');

      try {
        // Memanggil back-end lokal
        const parsedJson = await callLocalAPI('/api/map-market-helper', { productName });
        setFormData(prev => ({ ...prev, ...parsedJson }));
        setOutputHtml(placeholderOutput);
      } catch (error) {
        console.error("Error with Bantu AI:", error);
        setOutputHtml(`<p class="text-red-500 dark:text-red-400"><b>Terjadi Kesalahan (Bantu AI):</b><br>${error.message}.</p>`);
      } finally {
        setIsAiHelping(false);
      }
    };

    const handleCopy = () => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = outputHtml;
      // ... (logika konversi HTML ke Teks)
      let textToCopy = tempDiv.innerText || "";
      
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        var successful = document.execCommand('copy');
        if (successful) {
          setCopyButtonText('Tersalin!');
        } else {
          setCopyButtonText('Gagal Salin');
        }
      } catch (err) {
        setCopyButtonText('Gagal Salin');
        console.error('Gagal menyalin teks: ', err);
      }
      document.body.removeChild(textarea);
      setTimeout(() => setCopyButtonText('Salin'), 2000);
    };

    return (
      <>
        <style>{`
          /* CSS khusus untuk App 3 */
          #output-content p, .modal-content p { margin-bottom: 0.75rem; }
          #output-content ul, .modal-content ul { margin-bottom: 0.75rem; list-style-position: inside; padding-left: 0.5rem; }
          #output-content li, .modal-content li { margin-bottom: 0.25rem; }
          #output-content, .modal-content { line-height: 1.6; }
        `}</style>
        {/* Konten Aplikasi 3 (Mapping Market) */}
        <div className="p-4 md:p-8">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Kolom Kiri: Input */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 lg:flex lg:flex-col lg:h-full">
              <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-2 text-center">AI Mapping Market</h1>
              <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 text-center">Saya siap memetakan landscape market kamu 🗾</p>
              
              {/* === KOTAK INFO BARU UNTUK APP 3 === */}
              <div className="mb-4 bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
                  <div className="flex">
                      <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                      <div>
                          <p className="font-bold">Informasi Penting</p>
                          <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                              <li>Aplikasi ini menggunakan <strong>Google Search</strong> untuk mendapatkan data tren pasar terbaru.</li>
                              <li>Gunakan "Input Manual" atau "Bantu AI" untuk membuat draf data produk baru.</li>
                              <li>Gunakan "Input YAML" untuk menempelkan data yang sudah ada (misal, dari Hasil Analisis Value).</li>
                          </ul>
                      </div>
                  </div>
              </div>
              {/* === AKHIR KOTAK INFO BARU === */}
              
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setCurrentInputMode('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${currentInputMode === 'manual' ? 'text-white bg-indigo-600 shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Input Manual
                </button>
                <button
                  onClick={() => setCurrentInputMode('yaml')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${currentInputMode === 'yaml' ? 'text-white bg-indigo-600 shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  Input YAML
                </button>
              </div>

              <div className="custom-scrollbar pr-2 lg:flex-1 lg:overflow-y-auto">
                {currentInputMode === 'manual' ? (
                  <ManualInputForm
                    formData={formData}
                    handleChange={handleManualFormChange}
                    onBantuAI={handleBantuAI}
                    isAiHelping={isAiHelping}
                  />
                ) : (
                  <YamlInputForm yamlInput={yamlInput} handleChange={(e) => setYamlInput(e.target.value)} />
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleMapping}
                  disabled={isMappingLoading || isAiHelping}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isMappingLoading ? 'Memetakan...' : 'Mapping Market'}
                </button>
              </div>
            </div>

            {/* Kolom Kanan: Output */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 lg:flex lg:flex-col lg:h-full relative">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4 sm:gap-2">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Hasil Analisis</h2>
                <div className='flex gap-2 justify-end'>
                  <button
                    id="copy-button"
                    onClick={handleCopy}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition duration-200 w-24"
                    title="Salin ke Clipboard"
                  >
                    {copyButtonText}
                  </button>
                </div>
              </div>

              <div id="output-container" className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 custom-scrollbar min-h-[200px] lg:min-h-0 lg:flex-1 lg:overflow-y-auto border border-gray-200 dark:border-gray-700">
                {isMappingLoading ? (
                  <LoadingSpinner text="AI sedang menganalisis pasar... Ini mungkin perlu waktu." />
                ) : (
                  <div
                    id="output-content"
                    className="text-gray-800 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: outputHtml }}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
      </>
    );
};

// =======================================================================
// === APLIKASI 4: PSIKOLOGIS MARKET
// =======================================================================
const App4_PsikologisMarket = () => {
    
    // --- State Aplikasi 4 ---
    const [currentTab, setCurrentTab] = useState('manual');
    const [inputs, setInputs] = useState({
        mappingInput: '', reviewInput: '', socialInput: '', rawInput: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [businessName, setBusinessName] = useState('');
    const [isHelperLoading, setIsHelperLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState({ html: null, text: null });
    const [copyMessage, setCopyMessage] = useState('');
    const [secondaryLoading, setSecondaryLoading] = useState({ hooks: false, persona: false });
    const [secondaryResults, setSecondaryResults] = useState({ hooks: null, persona: null });

    // --- Refs ---
    const mappingInputRef = useRef(null);
    const reviewInputRef = useRef(null);
    const socialInputRef = useRef(null);
    const rawInputRef = useRef(null);
    const analysisResultRef = useRef(null);
    const businessNameInputRef = useRef(null);
    const textareaRefs = { mappingInput: mappingInputRef, reviewInput: reviewInputRef, socialInput: socialInputRef, rawInput: rawInputRef };

    // --- Efek Samping ---
    useEffect(() => {
        try {
            const savedTab = sessionStorage.getItem('app4_currentTab') || 'manual';
            setCurrentTab(savedTab);
            const savedMapping = sessionStorage.getItem('app4_mappingInput') || '';
            const savedReview = sessionStorage.getItem('app4_reviewInput') || '';
            const savedSocial = sessionStorage.getItem('app4_socialInput') || '';
            const savedRaw = sessionStorage.getItem('app4_rawInput') || '';
            setInputs({ mappingInput: savedMapping, reviewInput: savedReview, socialInput: savedSocial, rawInput: savedRaw });
            const savedBusinessName = sessionStorage.getItem('app4_businessName') || '';
            setBusinessName(savedBusinessName);
            const savedResultHtml = sessionStorage.getItem('app4_analysisResultHtml');
            const savedResultText = sessionStorage.getItem('app4_analysisResultText');
            if (savedResultHtml && savedResultText) {
                setAnalysisResult({ html: savedResultHtml, text: savedResultText });
            }
            setTimeout(autoExpandAllTextareas, 0);
        } catch (e) { console.warn("Gagal memuat session storage:", e); }
    }, []);

    useEffect(() => {
        try {
            sessionStorage.setItem('app4_currentTab', currentTab);
            sessionStorage.setItem('app4_mappingInput', inputs.mappingInput);
            sessionStorage.setItem('app4_reviewInput', inputs.reviewInput);
            sessionStorage.setItem('app4_socialInput', inputs.socialInput);
            sessionStorage.setItem('app4_rawInput', inputs.rawInput);
            sessionStorage.setItem('app4_businessName', businessName);
            if (analysisResult.html && analysisResult.text) {
                sessionStorage.setItem('app4_analysisResultHtml', analysisResult.html);
                sessionStorage.setItem('app4_analysisResultText', analysisResult.text);
            } else {
                sessionStorage.removeItem('app4_analysisResultHtml');
                sessionStorage.removeItem('app4_analysisResultText');
            }
        } catch (e) { console.warn("Gagal menyimpan session storage:", e); }
    }, [currentTab, inputs, businessName, analysisResult]);

    useEffect(() => {
        let timer;
        if (copyMessage) {
            timer = setTimeout(() => setCopyMessage(''), 2000);
        }
        return () => clearTimeout(timer);
    }, [copyMessage]);

    // --- Fungsi Helper ---
    const autoExpandTextarea = (event) => {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    };
    
    const autoExpandAllTextareas = () => {
        Object.values(textareaRefs).forEach(ref => {
            if (ref.current) {
                ref.current.style.height = 'auto';
                ref.current.style.height = (ref.current.scrollHeight) + 'px';
            }
        });
    };
    
    const formatGeminiResponse = (text) => {
      let html = text;
      function applyInlineFormatting(line) {
          return line
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-cyan-600 dark:text-cyan-400">$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>');
      }
      html = html.replace(/^####\s+(.*$)/gim, '<h4 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 mb-2">$1</h4>');
      html = html.replace(/^###\s+(.*$)/gim, '<h3 class="text-md font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4 mb-3">$1</h3>');
      html = html.replace(/^##\s+(.*$)/gim, '<h2 class="text-xl font-semibold text-cyan-700 dark:text-cyan-300 mt-6 mb-3">$1</h2>');
      html = html.replace(/^#\s+(.*$)/gim, '<h1 class="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">$1</h1>');
      html = html.replace(/^(?:[\*]|\-)\s+(.*$)/gim, (match, content) => {
          return `<li class="pb-1">${applyInlineFormatting(content)}</li>`;
      });
      html = html.replace(/(\<\/li\>\n?)+(\<li\>)/gim, '</li><li>');
      html = html.replace(/(<li>.*<\/li>)/gim, '<ul class="list-disc list-outside pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">$1</ul>');
      html = html.replace(/\<\/ul\>\n?(\<ul\>)/gim, '');
      html = html.split('\n').map(line => {
          line = line.trim();
          if (line.length === 0) return '';
          if (line.match(/^<\/?(h1|h2|h3|h4|ul|li|p)/)) return line;
          return `<p class="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">${applyInlineFormatting(line)}</p>`;
      }).join('\n');
      html = html.replace(/<p><\/p>/g, '');
      return html;
    };

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setInputs(prevInputs => ({ ...prevInputs, [id]: value }));
        autoExpandTextarea(e);
    };

    const switchTab = (tabId) => {
        setCurrentTab(tabId);
        setError(null);
    };

    const handleGenerateHelper = async () => {
        if (!businessName.trim()) {
            setError("Harap masukkan nama usaha Anda terlebih dahulu.");
            businessNameInputRef.current?.classList.add('border-red-500', 'ring-red-500');
            businessNameInputRef.current?.focus();
            return;
        }
        setIsHelperLoading(true);
        setError(null);
        businessNameInputRef.current?.classList.remove('border-red-500', 'ring-red-500');

        try {
            const parsedData = await callLocalAPI('/api/psikologis-helper', { businessName });
            setInputs(prev => ({
                ...prev,
                mappingInput: parsedData.mappingInput || '',
                reviewInput: parsedData.reviewInput || '',
                socialInput: parsedData.socialInput || ''
            }));
            setTimeout(autoExpandAllTextareas, 50);
        } catch (err) {
            console.error("Error generating helper data:", err);
            setError(`Gagal mendapatkan bantuan AI: ${err.message}`);
        } finally {
            setIsHelperLoading(false);
        }
    };

    const handleAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult({ html: null, text: null });
        setSecondaryResults({ hooks: null, persona: null });

        let userInput = "";
        let isValid = false;
        let errorElements = [];

        if (currentTab === 'manual') {
            const { mappingInput, reviewInput, socialInput } = inputs;
            if (mappingInput) userInput += `--- DATA MAPPING MARKET ---\n${mappingInput}\n\n`;
            if (reviewInput) userInput += `--- DATA REVIEW PELANGGAN ---\n${reviewInput}\n\n`;
            if (socialInput) userInput += `--- DATA OBROLAN SOSIAL ---\n${socialInput}\n\n`;
            isValid = mappingInput || reviewInput || socialInput;
            if (!isValid) {
                setError("Harap isi setidaknya satu kolom di 'Input Manual'.");
                errorElements = ['mappingInput', 'reviewInput', 'socialInput'];
            }
        } else {
            userInput = inputs.rawInput.trim();
            isValid = userInput.length > 0;
            if (!isValid) {
                setError("Harap tempelkan data mentah Anda di kolom yang tersedia.");
                errorElements = ['rawInput'];
            }
        }

        if (!isValid) {
            setIsLoading(false);
            errorElements.forEach(id => {
                textareaRefs[id].current?.classList.add('border-red-500', 'ring-red-500');
            });
            return;
        }
        
        Object.values(textareaRefs).forEach(ref => {
            ref.current?.classList.remove('border-red-500', 'ring-red-500');
        });

        try {
            const rawText = await callLocalAPI('/api/psikologis-market', { userInput });
            const formattedHtml = formatGeminiResponse(rawText);
            setAnalysisResult({ html: formattedHtml, text: rawText });
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(`Gagal menghubungi server AI: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateHooks = async () => {
        if (!analysisResult.text) return;
        setSecondaryLoading(prev => ({ ...prev, hooks: true }));
        setError(null);
        try {
            const newText = await callLocalAPI('/api/psikologis-hooks', { prompt: analysisResult.text });
            setSecondaryResults(prev => ({ ...prev, hooks: formatGeminiResponse(newText) }));
        } catch (err) {
            setError(`Gagal membuat hook: ${err.message}`);
        } finally {
            setSecondaryLoading(prev => ({ ...prev, hooks: false }));
        }
    };

    const handleGeneratePersona = async () => {
        if (!analysisResult.text) return;
        setSecondaryLoading(prev => ({ ...prev, persona: true }));
        setError(null);
        try {
            const newText = await callLocalAPI('/api/psikologis-persona', { prompt: analysisResult.text });
            setSecondaryResults(prev => ({ ...prev, persona: formatGeminiResponse(newText) }));
        } catch (err) {
            setError(`Gagal membuat persona: ${err.message}`);
        } finally {
            setSecondaryLoading(prev => ({ ...prev, persona: false }));
        }
    };

    function fallbackCopyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setCopyMessage('Hasil analisis disalin!');
            } else {
                throw new Error('Gagal copy execCommand');
            }
        } catch (err) {
            console.error('Gagal menyalin (fallback): ', err);
            setCopyMessage('Gagal menyalin. Silakan salin manual.');
        }
        document.body.removeChild(textArea);
    }

    const copyToClipboard = () => {
        if (analysisResultRef.current) {
            const textToCopy = analysisResultRef.current.innerText || analysisResultRef.current.textContent || "";
            fallbackCopyText(textToCopy);
        }
    };

    // --- JSX (Render) ---
    return (
        <>
            <style>{`
                /* CSS khusus untuk App 4, tanpa \`body\` */
                .app4-container ::-webkit-scrollbar { width: 8px; height: 8px; }
                .app4-container ::-webkit-scrollbar-track { background: #f1f5f9; /* gray-100 */ }
                .app4-container ::-webkit-scrollbar-thumb { background: #94a3b8; /* gray-400 */ border-radius: 4px; }
                .dark .app4-container ::-webkit-scrollbar-track { background: #1F2937; /* gray-800 */ }
                .dark .app4-container ::-webkit-scrollbar-thumb { background: #4B5563; /* gray-600 */ }
                .app4-container textarea { resize: none; overflow-y: hidden; }
            `}</style>
            
            <CopyNotification message={copyMessage} />

            <div className="app4-container p-2 sm:p-4 md:p-8">
                <main className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 sm:p-6 md:p-8">
                        <header className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                                AI Psikologis Market
                            </h1>
                            <p className="text-md text-gray-600 dark:text-gray-300">
                                Saya adalah Detektif Audience Profiler. Saya membaca pikiran & kebiasaan target market kamu 🕵🏻
                            </p>
                        </header>

                        {/* === KOTAK INFO BARU UNTUK APP 4 === */}
                        <div className="mb-4 bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
                            <div className="flex">
                                <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                                <div>
                                    <p className="font-bold">Informasi Penting</p>
                                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                        <li>Gunakan "Bantu Isi" untuk mendapatkan draf hipotesis awal hanya dengan nama usaha.</li>
                                        <li>Anda bisa mengisi salah satu atau semua kolom (Mapping, Review, Sosial) untuk dianalisis.</li>
                                        <li>Fitur "Analisis Lanjutan" (Hook & Persona) baru aktif setelah analisis utama selesai.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* === AKHIR KOTAK INFO BARU === */}

                        <nav className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                className={`tab-btn flex-1 py-3 px-4 text-center font-semibold transition-colors duration-200 ${
                                    currentTab === 'manual'
                                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400'
                                        : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                                onClick={() => switchTab('manual')}
                            >
                                Input Manual
                            </button>
                            <button
                                className={`tab-btn flex-1 py-3 px-4 text-center font-semibold transition-colors duration-200 ${
                                    currentTab === 'raw'
                                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400'
                                        : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                                onClick={() => switchTab('raw')}
                            >
                                Tempel Data Mentah
                            </button>
                        </nav>

                        <div>
                            {currentTab === 'manual' && (
                                <div id="panelManual" className="tab-panel space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 mb-4">
                                        <label htmlFor="businessNameInput" className="block text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                            Mulai di sini: Dapatkan Bantuan AI
                                        </label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                id="businessNameInput"
                                                ref={businessNameInputRef}
                                                className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                placeholder="Contoh: Kedai Kopi 'Senja'"
                                                value={businessName}
                                                onChange={(e) => {
                                                    setBusinessName(e.target.value);
                                                    businessNameInputRef.current?.classList.remove('border-red-500', 'ring-red-500');
                                                }}
                                                disabled={isHelperLoading || isLoading}
                                            />
                                            <button
                                                onClick={handleGenerateHelper}
                                                disabled={isHelperLoading || isLoading}
                                                className="sm:w-auto flex-shrink-0 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                style={{ minHeight: '50px' }}
                                            >
                                                {isHelperLoading ? (
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : "Bantu Isi"}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Masukkan nama/ide usaha Anda, dan AI akan membuatkan draf hipotesis untuk kolom di bawah.</p>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 pt-0">Isi atau edit draf di bawah ini.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="mappingInput" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">1. Mapping Market</label>
                                            <textarea
                                                id="mappingInput"
                                                ref={mappingInputRef}
                                                rows="3"
                                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                placeholder="Isi manual jika belum ada data..."
                                                value={inputs.mappingInput}
                                                onChange={handleInputChange}
                                                onInput={autoExpandTextarea}
                                                disabled={isHelperLoading}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label htmlFor="reviewInput" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">2. Review Pelanggan</label>
                                            <textarea
                                                id="reviewInput"
                                                ref={reviewInputRef}
                                                rows="3"
                                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                placeholder="Kutipan/review jujur dari pelanggan..."
                                                value={inputs.reviewInput}
                                                onChange={handleInputChange}
                                                onInput={autoExpandTextarea}
                                                disabled={isHelperLoading}
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label htmlFor="socialInput" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">3. Obrolan Sosial</label>
                                            <textarea
                                                id="socialInput"
                                                ref={socialInputRef}
                                                rows="3"
                                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                placeholder="Apa kata mereka di media sosial?..."
                                                value={inputs.socialInput}
                                                onChange={handleInputChange}
                                                onInput={autoExpandTextarea}
                                                disabled={isHelperLoading}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentTab === 'raw' && (
                                <div id="panelRaw" className="tab-panel">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tempel semua data mentah audiens Anda di sini.</p>
                                    <textarea
                                        id="rawInput"
                                        ref={rawInputRef}
                                        rows="10"
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        placeholder="Salin dan tempel data observasi, hasil wawancara, review, atau data riset pasar apa pun yang Anda miliki..."
                                        value={inputs.rawInput}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <button
                            id="analyzeButton"
                            className={`mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                            onClick={handleAnalysis}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Menganalisis...' : 'Analisis Psikologis Market'}
                        </button>

                        <div id="outputArea" className="mt-8">
                            {isLoading && (
                                <div id="loadingIndicator" className="text-center py-10">
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
                                    <p className="mt-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Menganalisis data audiens...</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Harap tunggu, detektIF AI sedang bekerja.</p>
                                </div>
                            )}
                            
                            {error && (
                                <div id="errorDisplay" className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-100 rounded-lg">
                                    <p className="font-bold">Terjadi Kesalahan</p>
                                    <p id="errorMessage">{error}</p>
                                </div>
                            )}

                            {analysisResult.html && !isLoading && (
                                <div id="resultContainer" className="relative">
                                    <button
                                        id="copyButton"
                                        title="Salin Hasil"
                                        className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        onClick={copyToClipboard}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <div
                                        id="analysisResult"
                                        ref={analysisResultRef}
                                        className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: analysisResult.html }}
                                    >
                                    </div>
                                </div>
                            )}

                            {analysisResult.html && !isLoading && (
                                <div id="geminiFeatures" className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <h3 className="text-xl font-semibold text-cyan-700 dark:text-cyan-300 mb-4">✨ Analisis Lanjutan</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-5">Gunakan laporan di atas sebagai konteks untuk mendapatkan wawasan baru.</p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                        <button
                                            onClick={handleGenerateHooks}
                                            disabled={secondaryLoading.hooks || secondaryLoading.persona}
                                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {secondaryLoading.hooks ? 'Membuat...' : '✨ Buat 5 Hook Iklan Baru'}
                                        </button>
                                        <button
                                            onClick={handleGeneratePersona}
                                            disabled={secondaryLoading.persona || secondaryLoading.hooks}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {secondaryLoading.persona ? 'Menulis...' : '✨ Buat Cerita Persona'}
                                        </button>
                                    </div>

                                    <div className="space-y-4 mt-6">
                                        {secondaryLoading.hooks && (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Membuat hook iklan baru...</p>
                                            </div>
                                        )}
                                        {secondaryResults.hooks && (
                                            <div
                                                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                dangerouslySetInnerHTML={{ __html: secondaryResults.hooks }}
                                            />
                                        )}
                                        {secondaryLoading.persona && (
                                            <div className="text-center py-4">
                                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 dark:border-purple-400"></div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Menulis cerita persona...</p>
                                            </div>
                                        )}
                                        {secondaryResults.persona && (
                                            <div
                                                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                dangerouslySetInnerHTML={{ __html: secondaryResults.persona }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

// =======================================================================
// === APLIKASI 5: PERENCANA KONTEN
// =======================================================================
const App5_ContentPlanner = () => {

    // --- Komponen Helper Internal ---
    const LoadingSpinner = () => (
      <div className="flex justify-center items-center p-4">
        {/* PERBAIKAN: Menggunakan warna border yang konsisten */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
      </div>
    );
    
    const CustomModal = ({ title, message, onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-gray-900 dark:text-white">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );

    // --- Konstanta & State ---
    const durationOptions = ["Rencana 7 Hari", "Rencana 5 Postingan", "Rencana Bulanan (Poin Utama)", "Lainnya..."];
    const [topic, setTopic] = useState('');
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState(durationOptions[0]);
    const [customDuration, setCustomDuration] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const [copyButtonText, setCopyButtonText] = useState('Salin');
    const tableResultRef = useRef(null);

    // --- Fungsi ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic || !goal) {
            setModal({ show: true, title: "Input Tidak Lengkap", message: "Mohon isi Topik dan Tujuan." });
            return;
        }
        let selectedDuration = duration;
        if (duration === "Lainnya..." && customDuration) {
            selectedDuration = customDuration;
        } else if (duration === "Lainnya..." && !customDuration) {
            setModal({ show: true, title: "Input Tidak Lengkap", message: "Mohon isi durasi kustom." });
            return;
        }
        
        setIsLoading(true);
        setResult('');
        setCopyButtonText('Salin');

        const userPrompt = `
          Topik Utama / Produk: "${topic}"
          Tujuan Utama Konten: "${goal}"
          Durasi Rencana: "${selectedDuration}"
          Buatkan rencana konten yang mendetail dalam format TABEL HTML.
          PENTING: Langsung berikan hasilnya sebagai tabel HTML. Tidak perlu judul, penjelasan, atau disclaimer di luar tag <table>.
        `;

        try {
            const tableHtml = await callLocalAPI('/api/content-planner', { userPrompt });
            
            // Bersihkan output untuk memastikan hanya tabel yang didapat
            const tableMatch = tableHtml.match(/<table[\s\S]*?<\/table>/);
            if (tableMatch) {
                setResult(tableMatch[0]);
            } else {
                setResult(`<p class="text-red-500 dark:text-red-300">Maaf, terjadi kesalahan saat membuat tabel. Coba lagi.</p><br>${tableHtml}`);
            }
        } catch (error) {
            setModal({ show: true, title: "Error", message: `Gagal membuat rencana: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        let textToCopy = '';
        if (tableResultRef.current) {
            const rows = tableResultRef.current.querySelectorAll('tr');
            const tsv = [];
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                const rowText = [];
                cells.forEach(cell => {
                    rowText.push(cell.innerText.trim().replace(/\s+/g, ' '));
                });
                tsv.push(rowText.join('\t')); // Gabungkan sel dengan TAB
            });
            textToCopy = tsv.join('\n'); // Gabungkan baris dengan NEWLINE
        } else {
            textToCopy = result;
        }
        
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            setCopyButtonText('Tersalin!');
            setTimeout(() => setCopyButtonText('Salin'), 2000);
        } catch (err) {
            setModal({ show: true, title: "Gagal Menyalin", message: "Gagal menyalin teks." });
        }
        document.body.removeChild(tempTextArea);
    };

    return (
        // PERBAIKAN: Mengganti wrapper gradient dengan style konsisten
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">✨ AI Perencana Konten</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">Masukkan ide/topik kamu, dan aku akan membuatkan rencana konten media sosial lengkap dengan ide, format, dan CTA 🗓️</p>
                    </div>
                    {/* PERBAIKAN: Info box disesuaikan dengan tema light/dark */}
                    <div className="bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                            <div>
                                <p className="font-bold">Informasi Penting</p>
                                <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li>AI akan memberikan ide dan struktur rencana, bukan konten jadi.</li>
                                    <li>Semakin spesifik Topik dan Tujuan Anda, semakin relevan rencana yang akan dibuat.</li>
                                    <li>Gunakan opsi "Lainnya" pada Durasi jika Anda memiliki kebutuhan rencana yang spesifik.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PERBAIKAN: Input disesuaikan dengan tema light/dark */}
                        <div>
                            <label htmlFor="planner-topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Brand-Produk/Jasa-Topik Kamu:</label>
                            <textarea id="planner-topic" value={topic} onChange={(e) => setTopic(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Katering sehat 'FitFood' untuk pekerja kantoran"></textarea>
                        </div>
                        <div>
                            <label htmlFor="planner-goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tujuan Utama Konten:</label>
                            <input id="planner-goal" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Meningkatkan penjualan paket mingguan"/>
                        </div>
                        <div>
                            <label htmlFor="planner-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durasi Rencana</label>
                            <select id="planner-duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                {durationOptions.map(option => <option key={option} value={option}>{option}</option>)}
                            </select>
                        </div>
                        {duration === "Lainnya..." && (
                            <div>
                                <label htmlFor="planner-custom-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tulis Durasi Kustom:</label>
                                <input id="planner-custom-duration" type="text" value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Rencana 10 hari"/>
                            </div>
                        )}
                        {/* PERBAIKAN: Tombol submit disesuaikan dengan tema */}
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            <IconWandSparkles />
                            <span>{isLoading ? 'Sedang Merencanakan...' : '✨ Buat Rencana Konten'}</span>
                        </button>
                    </form>
                    {(isLoading || result) && (
                        // PERBAIKAN: Area hasil disesuaikan dengan tema
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-lg"><LoadingSpinner /></div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hasil Rencana Konten:</h3>
                                        <button onClick={handleCopy} className="bg-gray-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:bg-gray-500 transition flex items-center space-x-1">
                                            <IconCopy />
                                            <span>{copyButtonText}</span>
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        {/* PERBAIKAN: Style tabel disesuaikan dengan tema light/dark */}
                                        <style>{`
                                            .content-plan-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                                            .content-plan-table th, .content-plan-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; font-size: 0.875rem; }
                                            .content-plan-table th { background-color: #f3f4f6; font-weight: 600; }
                                            .content-plan-table tr:nth-child(even) { background-color: #ffffff; }
                                            .content-plan-table tr:nth-child(odd) { background-color: #f9fafb; }
                                            
                                            .dark .content-plan-table th, .dark .content-plan-table td { border: 1px solid #4b5563; }
                                            .dark .content-plan-table th { background-color: #1f2937; }
                                            .dark .content-plan-table tr:nth-child(even) { background-color: #374151; }
                                            .dark .content-plan-table tr:nth-child(odd) { background-color: #4b5563; }
                                        `}</style>
                                        <div 
                                            ref={tableResultRef} 
                                            className="text-gray-800 dark:text-gray-200 leading-relaxed" 
                                            dangerouslySetInnerHTML={{ __html: result.replace(/<table/g, '<table class="content-plan-table"') }} 
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    {modal.show && <CustomModal title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />}
                </div>
            </div>
        </div>
    );
};

// =======================================================================
// === APLIKASI 6: COPYWRITING
// =======================================================================
const App6_Copywriting = () => {
    
    // --- Komponen Helper Internal ---
    const LoadingSpinner = () => (
      <div className="flex justify-center items-center p-4">
        {/* PERBAIKAN: Menggunakan warna border yang konsisten */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
      </div>
    );
    
    const CustomModal = ({ title, message, onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-gray-900 dark:text-white">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );

    // --- Konstanta & State ---
    const purposeOptions = [ "Video Reels/Tiktok", "Video Youtube", "Script Teks", "Status Facebook", "Status Threads/X", "Carousel Instagram", "Feed Single Post", "Caption", "Chat WA" ];
    const formulaOptions = [ "AIDA (Attention, Interest, Desire, Action)", "PAS (Problem, Agitate, Solve)", "FAB (Features, Advantages, Benefits)", "PPPP (Picture, Promise, Prove, Push)", "BAB (Before, After, Bridge)", "The Star-Story-Solution Formula", "ACCA (Awareness, Comprehension, Conviction, Action)", "4C (Clear, Concise, Compelling, Credible)", "GRAB (Gain attention, Relate, Agitate, Bridge)", "PASTOR (Person, Aspiration, Story, Testimony, Offer, Request)", "QUEST (Qualify, Understand, Educate, Stimulate, Transition)", "SLAP (Stop, Look, Act, Purchase)", "AICPBSAWN (Attention, Interest, Credibility, Proof, Benefit, Scarcity, Action, Warn, Now)" ];
    const hookOptions = [ "Negatif, Positif", "Problem, Solution", "Before, After", "Manfaat Langsung (Direct Benefit)", "Angka atau Daftar (Numbered List)", "Pertanyaan (Question)", "Perintah (Command)", "Rasa Penasaran & Kejutan (Curiosity & Intrigue)", "Berita atau Pengumuman (News/Announcement)", "Bukti Sosial & Testimonial (Social Proof)", "Urgensi & Kelangkaan (Urgency & Scarcity)", "Dulu.., Sekarang..." ];
    const languageOptions = [ "Bahasa Gen-Z", "Bahasa Indonesia", "Bahasa Jawa (ragam Ngoko)", "Bahasa Jawa (ragam Krama)", "Bahasa Sunda (ragam Loma)", "Bahasa Sunda (ragam Lemes)", "Bahasa Banjar (ragam Kuala)", "Bahasa Banjar (ragam Hulu)", "Bahasa Bali", "Bahasa Batak", "Bahasa Minangkabau", "Bahasa Makassar", "Bahasa Bugis", "Bahasa Aceh", "Bahasa Madura", "Bahasa Melayu", "Bahasa Papua", "Lainnya" ];
    const hookDropdownOptions = ["Random", ...hookOptions];

    const [formData, setFormData] = useState({
        deskripsi: '', target: '', cta: '',
        peruntukan: purposeOptions[0],
        formula: formulaOptions[0],
        hook: hookDropdownOptions[0],
        bahasa: languageOptions[1],
        bahasaKustom: '',
    });
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const [copyButtonText, setCopyButtonText] = useState('Salin');

    // --- Fungsi ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.deskripsi || !formData.target || !formData.cta) {
            setModal({ show: true, title: "Input Tidak Lengkap", message: "Mohon lengkapi semua kolom (deskripsi, target audiens, dan CTA)." });
            return;
        }
        
        setIsLoading(true);
        setResult('');
        setCopyButtonText('Salin');
        
        let selectedHook = formData.hook;
        if (selectedHook === "Random") {
            const randomIndex = Math.floor(Math.random() * hookOptions.length);
            selectedHook = hookOptions[randomIndex];
        }
        let selectedBahasa = formData.bahasa;
        if (formData.bahasa === "Lainnya" && formData.bahasaKustom) {
            selectedBahasa = formData.bahasaKustom;
        } else if (formData.bahasa === "Lainnya" && !formData.bahasaKustom) {
            selectedBahasa = "Bahasa Indonesia";
        }
        
        const userPrompt = `
          Deskripsi Produk/Topik: "${formData.deskripsi}"
          Target Penonton/Audiens: "${formData.target}"
          CTA (Call to Action) / Goals: "${formData.cta}"
          Peruntukan / Platform: ${formData.peruntukan}
          Formula Copywriting yang Digunakan: ${formData.formula}
          Gaya Hook (Kail) yang Digunakan: ${selectedHook}
          Bahasa yang Digunakan: ${selectedBahasa}
          Buatkan copywritingnya sekarang.
          PENTING: Berikan HANYA hasil copywriting yang sudah jadi, siap pakai, dalam bahasa yang diminta. Jangan tambahkan "Tentu, ini hasilnya:" atau "Hasil Copywriting:" atau penjelasan apa pun. Langsung tulis copywritingnya.
        `;

        try {
            const copyText = await callLocalAPI('/api/copywriting', { userPrompt });
            setResult(copyText.trim());
        } catch (error) {
            setModal({ show: true, title: "Error", message: `Gagal menghasilkan copywriting: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = result;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            setCopyButtonText('Tersalin!');
            setTimeout(() => setCopyButtonText('Salin'), 2000);
        } catch (err) {
            setModal({ show: true, title: "Gagal Menyalin", message: "Gagal menyalin teks." });
        }
        document.body.removeChild(tempTextArea);
    };

    return (
        // PERBAIKAN: Mengganti wrapper gradient dengan style konsisten
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <div className="space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Generator Copywriting AI ✍️</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">Buat naskah iklan, caption media sosial, atau skrip video yang menjual hanya dalam hitungan detik.</p>
                    </div>
                    {/* PERBAIKAN: Info box disesuaikan dengan tema light/dark */}
                    <div className="bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                            <div>
                                <p className="font-bold">Informasi Penting</p>
                                <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li>Kualitas hasil sangat bergantung pada deskripsi, target audiens, dan CTA Anda.</li>
                                    <li>Selalu periksa dan sesuaikan kembali hasil dari AI.</li>
                                    <li>Opsi "Random" pada Hook akan memilih gaya kail yang berbeda setiap kali Anda generate.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PERBAIKAN: Input disesuaikan dengan tema light/dark */}
                        <div>
                            <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsikan produk/topik Anda:</label>
                            <textarea id="product-description" name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="4" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Kopi bubuk Robusta premium..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Penonton/Audiens:</label>
                            <textarea id="target-audience" name="target" value={formData.target} onChange={handleChange} rows="2" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Mahasiswa, pekerja kantoran..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="cta-goals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CTA (Call to Action) / Goals:</label>
                            <textarea id="cta-goals" name="cta" value={formData.cta} onChange={handleChange} rows="2" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Ajak untuk membeli..."></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Peruntukan</label>
                                <select id="purpose" name="peruntukan" value={formData.peruntukan} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                    {purposeOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="formula" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Formula</label>
                                <select id="formula" name="formula" value={formData.formula} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                    {formulaOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="hook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">3. Hook</label>
                                <select id="hook" name="hook" value={formData.hook} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                    {hookDropdownOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="bahasa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">4. Bahasa</label>
                                <select id="bahasa" name="bahasa" value={formData.bahasa} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg appearance-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                    {languageOptions.map(option => <option key={option} value={option}>{option}</option>)}
                                </select>
                            </div>
                            {formData.bahasa === 'Lainnya' && (
                                <div>
                                    <label htmlFor="bahasaKustom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tulis Bahasa Lainnya:</label>
                                    <input type="text" id="bahasaKustom" name="bahasaKustom" value={formData.bahasaKustom} onChange={handleChange} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Bahasa Inggris"/>
                                </div>
                            )}
                        </div>
                        {/* PERBAIKAN: Tombol submit disesuaikan dengan tema */}
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            <IconWandSparkles />
                            <span>{isLoading ? 'Sedang Membuat...' : 'Buat Copywriting'}</span>
                        </button>
                    </form>
                    {(isLoading || result) && (
                        // PERBAIKAN: Area hasil disesuaikan dengan tema
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] relative">
                            {isLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 rounded-lg"><LoadingSpinner /></div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hasil Copywriting:</h3>
                                        <button onClick={handleCopy} className="bg-gray-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:bg-gray-500 transition flex items-center space-x-1">
                                            <IconCopy />
                                            <span>{copyButtonText}</span>
                                        </button>
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</div>
                                </>
                            )}
                        </div>
                    )}
                    {modal.show && <CustomModal title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />}
                </div>
            </div>
        </div>
    );
};


// =======================================================================
// === APLIKASI 7: TTS GENERATOR
// =======================================================================
const App7_TtsGenerator = () => {

    // --- Komponen Helper Internal ---
    const ButtonSpinner = () => (
      <svg className="animate-spin h-5 w-5 text-cyan-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    const CustomModal = ({ title, message, onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full text-gray-900 dark:text-white">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
    
    // --- Fungsi Helper Audio ---
    const base64ToArrayBuffer = (base64) => {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    };

    const pcmToWav = (pcmData, sampleRate) => {
      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
      const blockAlign = numChannels * (bitsPerSample / 8);
      const dataSize = pcmData.length * (bitsPerSample / 8);
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataSize, true);
      let offset = 44;
      for (let i = 0; i < pcmData.length; i++, offset += 2) {
        view.setInt16(offset, pcmData[i], true);
      }
      return new Blob([view], { type: 'audio/wav' });
    };

    // --- Konstanta & State ---
    const ttsLanguageStyleOptions = [ "Normal (Tanpa Gaya)", "Bahasa Gen-Z", "Bahasa Indonesia", "Bahasa Jawa (ragam Ngoko)", "Bahasa Jawa (ragam Krama)", "Bahasa Sunda (ragam Loma)", "Bahasa Sunda (ragam Lemes)", "Bahasa Banjar (ragam Kuala)", "Bahasa Banjar (ragam Hulu)", "Bahasa Bali", "Bahasa Batak", "Bahasa Minangkabau", "Bahasa Makassar", "Bahasa Bugis", "Bahasa Aceh", "Bahasa Madura", "Bahasa Melayu", "Bahasa Papua", "Lainnya" ];
    const ttsVoicesNew = [
      { name: "Achernar (Lembut) - Wanita", value: "Achernar" }, { name: "Achird (Ramah) - Wanita", value: "Achird" },
      { name: "Algenib (Serak) - Pria", value: "Algenib" }, { name: "Algieba (Halus) - Wanita", value: "Algieba" },
      { name: "Alnilam (Tegas) - Pria", value: "Alnilam" }, { name: "Aoede (Ringan) - Wanita", value: "Aoede" },
      { name: "Autonoe (Cerah) - Wanita", value: "Autonoe" }, { name: "Callirrhoe (Santai) - Wanita", value: "Callirrhoe" },
      { name: "Charon (Informatif) - Pria", value: "Charon" }, { name: "Despina (Halus) - Wanita", value: "Despina" },
      { name: "Enceladus (Berbisik) - Pria", value: "Enceladus" }, { name: "Erinome (Jelas) - Wanita", value: "Erinome" },
      { name: "Fenrir (Bersemangat) - Pria", value: "Fenrir" }, { name: "Gacrux (Dewasa) - Pria", value: "Gacrux" },
      { name: "Iapetus (Jelas) - Pria", value: "Iapetus" }, { name: "Kore (Tegas) - Wanita", value: "Kore" },
      { name: "Laomedeia (Ceria) - Wanita", value: "Laomedeia" }, { name: "Leda (Muda) - Wanita", value: "Leda" },
      { name: "Orus (Tegas) - Pria", value: "Orus" }, { name: "Puck (Ceria) - Pria", value: "Puck" },
      { name: "Pulcherrima (Terus Terang) - Wanita", value: "Pulcherrima" }, { name: "Rasalgethi (Informatif) - Pria", value: "Rasalgethi" },
      { name: "Sadachbia (Lincah) - Wanita", value: "Sadachbia" }, { name: "Sadaltager (Berpengetahuan) - Pria", value: "Sadaltager" },
      { name: "Schedar (Merata) - Wanita", value: "Schedar" }, { name: "Sulafat (Hangat) - Wanita", value: "Sulafat" },
      { name: "Umbriel (Santai) - Pria", value: "Umbriel" }, { name: "Vindemiatrix (Lembut) - Wanita", value: "Vindemiatrix" },
      { name: "Zephyr (Cerah) - Wanita", value: "Zephyr" }, { name: "Zubenelgenubi (Santai) - Pria", value: "Zubenelgenubi" }
    ].sort((a, b) => a.name.localeCompare(b.name));

    const [text, setText] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [voice, setVoice] = useState(ttsVoicesNew[0].value);
    const [selectedStyle, setSelectedStyle] = useState(ttsLanguageStyleOptions[0]);
    const [customStyle, setCustomStyle] = useState('');
    const [volume, setVolume] = useState(100);
    const [pitch, setPitch] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', message: '' });
    const audioRef = useRef(null);

    // --- Fungsi ---
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        setCharCount(newText.length);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text) {
            setModal({ show: true, title: "Teks Kosong", message: "Silakan masukkan teks terlebih dahulu." });
            return;
        }
        setIsLoading(true);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        
        let promptText = text;
        const pitchValue = parseInt(pitch, 10);
        let selectedGaya = selectedStyle;
        if (selectedStyle === "Lainnya" && customStyle) selectedGaya = customStyle;
        else if (selectedStyle === "Lainnya" && !customStyle) selectedGaya = ttsLanguageStyleOptions[0];
        
        const styleValue = selectedGaya.trim();
        let pitchStyle = '';
        if (pitchValue > 3) pitchStyle = 'dengan nada tinggi';
        else if (pitchValue < -3) pitchStyle = 'dengan nada rendah';
        
        let finalStyle = styleValue;
        if (pitchStyle) {
            if (styleValue !== ttsLanguageStyleOptions[0]) finalStyle = `${pitchStyle}, ${styleValue}`;
            else finalStyle = pitchStyle;
        }
        
        if (finalStyle && finalStyle !== ttsLanguageStyleOptions[0]) {
            promptText = `Katakan dengan gaya ${finalStyle}: ${text}`;
        }

        try {
            // Memanggil back-end lokal
            const { audioData, mimeType } = await callLocalAPI('/api/tts-generator', { promptText, voice });

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const sampleRateMatch = mimeType.match(/rate=(\d+)/);
                const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
                const pcmData = base64ToArrayBuffer(audioData);
                const pcm16 = new Int16Array(pcmData);
                const wavBlob = pcmToWav(pcm16, sampleRate);
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);
            } else {
                throw new Error("Respons API tidak valid atau tidak mengandung data audio.");
            }
        } catch (error) {
            setModal({ show: true, title: "Error", message: `Gagal menghasilkan suara: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.volume = volume / 100;
            audioRef.current.playbackRate = speed;
            audioRef.current.play();
        }
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [volume]);
    useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

    return (
        // PERBAIKAN: Mengganti wrapper gradient dengan style konsisten
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <div className="space-y-6">
                    <div className="text-center mb-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Generator Suara AI 🎧</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-base">Ubah teks atau naskah kamu menjadi audio (voice over) yang alami. Pilih mana yang paling cocok!</p>
                    </div>
                    {/* PERBAIKAN: Info box disesuaikan dengan tema light/dark */}
                    <div className="bg-gray-100 dark:bg-gray-900 border-l-4 border-cyan-500 text-gray-700 dark:text-gray-200 p-4 rounded-lg shadow-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><svg className="fill-current h-6 w-6 text-cyan-600 dark:text-cyan-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 11v4h2v-4H9zm0-4v2h2V7H9z"/></svg></div>
                            <div>
                                <p className="font-bold">Informasi Penting</p>
                                <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li>Kualitas audio terbaik didapat dari teks yang singkat (1-2 paragraf).</li>
                                    <li>Gunakan "Gaya Bicara / Bahasa" untuk mengubah aksen atau nada.</li>
                                    <li>Volume dan Kecepatan dapat diatur setelah audio berhasil dibuat.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Generate Audio</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {/* PERBAIKAN: Input disesuaikan dengan tema light/dark */}
                        <div>
                            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teks untuk diucapkan</label>
                            <div className="relative">
                                <textarea id="text-input" rows="5" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Tuliskan atau tempelkan teks di sini..." value={text} onChange={handleTextChange}></textarea>
                                <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">{charCount} karakter</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pilih Suara</label>
                                <select id="voice-select" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={voice} onChange={(e) => setVoice(e.target.value)}>
                                    {ttsVoicesNew.map(v => (<option key={v.value} value={v.value}>{v.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaya Bicara / Bahasa</label>
                                <select id="style-select" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
                                    {ttsLanguageStyleOptions.map(v => (<option key={v} value={v}>{v}</option>))}
                                </select>
                            </div>
                        </div>
                        {selectedStyle === 'Lainnya' && (
                            <div>
                                <label htmlFor="custom-style-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tulis Gaya Bicara Lainnya:</label>
                                <input type="text" id="custom-style-input" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Contoh: Bersemangat, Sedih, Berbisik" value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} />
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                            <div>
                                <label htmlFor="volume-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Volume: <span className="text-gray-900 dark:text-white">{volume}</span></label>
                                <input id="volume-slider" type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                            </div>
                            <div>
                                <label htmlFor="pitch-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nada (Pitch): <span className="text-gray-900 dark:text-white">{pitch}</span></label>
                                <input id="pitch-slider" type="range" min="-10" max="10" value={pitch} step="1" onChange={(e) => setPitch(e.target.value)} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                            </div>
                            <div>
                                <label htmlFor="speed-slider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kecepatan: <span className="text-gray-900 dark:text-white">{parseFloat(speed).toFixed(1)}</span>x</label>
                                <input id="speed-slider" type="range" min="0.5" max="2" value={speed} step="0.1" onChange={(e) => setSpeed(e.target.value)} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-600" />
                            </div>
                        </div>
                        <div className="pt-4">
                            {/* PERBAIKAN: Tombol submit disesuaikan dengan tema */}
                            <button type="submit" id="generate-btn" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                                {isLoading ? (<><ButtonSpinner /><span>Menghasilkan...</span></>) : (<span>Ucapkan Teks</span>)}
                            </button>
                        </div>
                    </form>
                    {audioUrl && (
                        // PERBAIKAN: Area hasil disesuaikan dengan tema
                        <div className="mt-8 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hasil Audio</h3>
                            <audio ref={audioRef} id="audio-player" controls src={audioUrl} className="w-full accent-cyan-600"></audio>
                            <a
                                href={audioUrl}
                                download="audio-hasil-ai-satset.wav"
                                className="mt-4 w-full inline-block text-center bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300"
                            >
                                Download Audio (.wav)
                            </a>
                        </div>
                    )}
                    {modal.show && <CustomModal title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, show: false })} />}
                </div>
            </div>
        </div>
    );
};


// =======================================================================
// === KOMPONEN INDUK / SHELL APLIKASI
// =======================================================================

// Daftar aplikasi untuk navigasi
const apps = [
    { id: 'app1', name: 'Dashboard', component: App1_Dashboard, icon: <IconLayoutDashboard /> },
    { id: 'app2', name: 'Analisis Value', component: App2_AnalisisValue, icon: <IconBulb /> },
    { id: 'app3', name: 'Mapping Market', component: App3_MarketMapping, icon: <IconMap /> },
    { id: 'app4', name: 'Psikologis Market', component: App4_PsikologisMarket, icon: <IconBrain /> },
    { id: 'app5', name: 'Perencana Konten', component: App5_ContentPlanner, icon: <IconCalendar /> },
    { id: 'app6', name: 'Copywriting', component: App6_Copywriting, icon: <IconPencil /> },
    { id: 'app7', name: 'Teks Ke Suara', component: App7_TtsGenerator, icon: <IconVolume /> },
];

// Komponen Navigasi Tombol
const NavButton = ({ app, activeApp, onClick }) => {
    const isActive = app.id === activeApp;
    // Terapkan style baru
    const classes = `flex items-center w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
        isActive 
            ? 'bg-[#f8fb18] text-[#2022f3] font-bold' 
            : 'text-[#f8fb18] opacity-70 hover:opacity-100 hover:bg-blue-900/50'
    }`;
    
    return (
        <li>
            <button onClick={() => onClick(app.id)} className={classes}>
                {/* PERBAIKAN: Menggunakan <span> dengan margin kanan (mr-4)
                  untuk merapikan ikon.
                */}
                <span className="mr-4 flex-shrink-0">
                  {React.cloneElement(app.icon, { className: "h-5 w-5" })}
                </span>
                {app.name}
            </button>
        </li>
    );
};

// Komponen Navigasi Tombol Mobile
const MobileNavButton = ({ app, activeApp, onClick }) => {
    const isActive = app.id === activeApp;
    // Terapkan style baru
    const classes = `w-20 flex-shrink-0 flex flex-col items-center p-2 rounded-lg ${
        isActive 
            ? 'bg-[#f8fb18] text-[#2022f3]' 
            : 'text-[#f8fb18] opacity-70'
    }`;

    return (
        <button onClick={() => onClick(app.id)} className={classes}>
            {React.cloneElement(app.icon, { className: "h-5 w-5" })}
            <span className="text-xs text-center">{app.name}</span>
        </button>
    );
};

// Komponen untuk me-render aplikasi yang aktif
const RenderActiveApp = ({ activeApp, setActiveApp }) => {
    const app = apps.find(a => a.id === activeApp);
    if (!app) return <div>Aplikasi tidak ditemukan</div>;

    const ActiveComponent = app.component;

    if (app.id === 'app1') {
        return <ActiveComponent setActiveApp={setActiveApp} />;
    }
    
    return <ActiveComponent />;
};

/**
 * Komponen Notifikasi Global untuk Salin (digunakan oleh App 4)
 */
function CopyNotification({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ease-out">
      {message}
    </div>
  );
}


// Komponen APP utama
export default function App() {
    const [activeApp, setActiveApp] = useState('app1');

    return (
        <>
            <style>{`
              /* Sembunyikan scrollbar untuk navigasi mobile */
              .mobile-nav-scrollbar::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
              }
              .mobile-nav-scrollbar {
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
            `}</style>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
                
                {/* 1. SIDEBAR (Desktop) */}
                <nav className="hidden md:flex md:flex-col md:w-64 bg-[#2022f3] text-white flex-shrink-0">
                    <div className="flex flex-col items-start justify-center h-auto p-4 shadow-md">
                        {/* Logo dan Title Utama */}
                        <div className="flex items-center mb-2">
                            <img src="/AI SATSET LOGO.png" alt="Logo" className="h-8 w-8 mr-2" />
                            <span className="text-2xl font-bold text-[#f8fb18]">AI SATSET</span>
                        </div>
                        
                        {/* Teks Tambahan */}
                        <div className="text-left text-blue-100">
                            <p className="text-sm font-semibold">AI Tim Konten</p>
                            <p className="text-xs">Div. Analis & Strategi Komunikasi</p>
                            <p className="text-xs mt-1 opacity-70">Update Versi: 1.0</p>
                        </div>
                    </div>
                    <ul className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
                        {apps.map(app => (
                            <NavButton
                                key={app.id}
                                app={app}
                                activeApp={activeApp}
                                onClick={setActiveApp}
                            />
                        ))}
                    </ul>
                </nav>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Opsional, tapi bagus untuk judul) */}
                <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 p-4 z-10">
                    <h1 id="page-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                        {/* {apps.find(a => a.id === activeApp)?.name || 'App'} */}
                        AI TIM KONTEN @ai.satset
                    </h1>
                </header>

                {/* Kontainer untuk "Aplikasi" yang aktif */}
                <div className="flex-1 p-0 overflow-y-auto pb-20 md:pb-0">
                    <RenderActiveApp activeApp={activeApp} setActiveApp={setActiveApp} />
                </div>
            </main>

            {/* 3. BOTTOM NAV (Mobile) */}
            <nav 
                className="md:hidden w-full p-2 flex overflow-x-auto flex-nowrap fixed bottom-0 left-0 right-0 mobile-nav-scrollbar" 
                style={{ backgroundColor: '#2022f3' }}
            >
                {apps.map(app => (
                    <MobileNavButton 
                        key={app.id}
                        app={app}
                        activeApp={activeApp}
                        onClick={setActiveApp}
                    />
                ))}
            </nav>

        </div>
        </>
    );
}



