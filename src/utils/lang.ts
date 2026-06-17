import { useState, useEffect } from "react";

export type Language = "id" | "en";

export interface TranslationSchema {
  // Hero section
  heroTitle: string;
  heroDesc: string;
  serverEngines: string;

  // Sidebar
  sidebarTitle: string;
  sidebarFileDrop: string;
  statusOnline: string;
  profileTitle: string;
  profileLabel: string;
  profilePlaceholder: string;
  profileHint: string;

  // Disclaimer Button & Modal
  disclaimerBtn: string;
  disclaimerTitle: string;
  disclaimerText1: string;
  disclaimerSupportTitle: string;
  disclaimerSupportDesc: string;
  disclaimerPoint1Title: string;
  disclaimerPoint1Desc: string;
  disclaimerPoint2Title: string;
  disclaimerPoint2Desc: string;
  disclaimerPoint3Title: string;
  disclaimerPoint3Desc: string;
  disclaimerUnderstand: string;

  // Analytics Metrics
  totalDeploys: string;
  totalDeploysDesc: string;
  successfulBuild: string;
  successfulBuildDesc: string;
  buildFailures: string;
  buildFailuresDesc: string;
  healthRatio: string;
  healthRatioDesc: string;

  // Form Section
  activePipelinesTitle: string;
  activePipelinesStatus: string;
  projDomainName: string;
  frameworkTarget: string;
  helpFramework: string;
  placeholderName: string;
  dragDropFiles: string;
  dragDropSubtitle: string;
  readyToDispatch: string;
  uploadingPipeline: string;
  deployBtn: string;
  sendingBtn: string;

  // Confirms
  confirmDeleteTitle: string;
  confirmDeleteDescPart1: string;
  confirmDeleteDescPart2: string;
  confirmDeleteBtn: string;
  cancelBtn: string;

  // Toasts and alerts
  initConnection: string;
  successfullyQueued: string;
  removedRecords: string;
  authRequired: string;
  uploadFilesRequired: string;
  uploadedStarting: string;
  toreDownSuccess: string;
  toreDownVercel: string;
  detectedBadge: string;

  // Additional keys for full localization
  stateSuccess: string;
  stateBuilding: string;
  stateQueued: string;
  stateFailed: string;
  noDeploysTitle: string;
  noDeploysDesc: string;
  projectLabel: string;
  githubImportLabel: string;
  zipUploadLabel: string;
  copyUrlBtn: string;
  consoleBtn: string;
  openBtn: string;
  toastCopied: string;

  consoleLogsTitle: string;
  consoleLogsCopiedToast: string;
  consoleAttaching: string;
  consoleFailedConnect: string;
  consoleTokenWarning: string;
  consoleWaiting: string;
  consolePreparing: string;
  consoleAttached: string;
  consoleActiveStream: string;
  consolePoweredBy: string;

  footerRights: string;
  footerDesc: string;
}

export const translations: Record<Language, TranslationSchema> = {
  id: {
    heroTitle: "Fluxel Deployment",
    heroDesc: "Unggah file Anda menjadi website tangguh dalam hitungan detik. Fluxel Deployment membuat publikasi proyek web cepat, sederhana, dan andal untuk semua orang.",
    serverEngines: "MESIN SERVER PRODUKSI",
    sidebarTitle: "Deployment",
    sidebarFileDrop: "File Drop",
    statusOnline: "Connected",
    profileTitle: "Profil & Akun",
    profileLabel: "Nama Profil Chrome / Perangkat",
    profilePlaceholder: "Contoh: Akun Utama",
    profileHint: "Riwayat disimpan lokal & dipisah berdasarkan nama profil ini agar tidak bercampur di setiap akun/perangkat.",
    disclaimerBtn: "Disclaimer",
    disclaimerTitle: "Pernyataan Batasan Layanan (Disclaimer)",
    disclaimerText1: "Aplikasi ini adalah sistem deployment profesional yang memfasilitasi integrasi file statis (ZIP) atau repositori Git secara efisien, praktis, dan instan.",
    disclaimerSupportTitle: "⚡ Jaringan Edge Cloud Cepat",
    disclaimerSupportDesc: "Seluruh berkas proyek, kode program, konfigurasi routing, dan kompilasi didistribusikan langsung menggunakan infrastruktur jaringan edge global yang tangguh secara komprehensif.",
    disclaimerPoint1Title: "Batas Kompilasi Dinamis:",
    disclaimerPoint1Desc: "Layanan ini didesain utama untuk demo halaman statis (HTML, CSS, JS), berkas ZIP proyek, dan framework terkompilasi modern secara optimal tanpa batas server konvensional.",
    disclaimerPoint2Title: "Keamanan Kredensial:",
    disclaimerPoint2Desc: "Aktivitas pendeployan terhubung aman memanfaatkan Token Keamanan Anda secara terenskripsi di backend server-side tanpa adanya kebocoran atau perekaman kunci di browser client.",
    disclaimerPoint3Title: "Infrastruktur Mandiri:",
    disclaimerPoint3Desc: "Seluruh simpul server saat ini didukung secara eksklusif oleh arsitektur pipeline performa tinggi demi kestabilan, kecepatan render instan, dan ketahanan data.",
    disclaimerUnderstand: "SAYA MENGERTI",
    totalDeploys: "TOTAL DEPLOYMENT",
    totalDeploysDesc: "Pipeline cloud diinisiasi",
    successfulBuild: "PEMBUATAN SUKSES",
    successfulBuildDesc: "Website aktif online",
    buildFailures: "GAGAL DIKOMPILASI",
    buildFailuresDesc: "Eror tertangkap saat kompilasi",
    healthRatio: "RASIO KESEHATAN TAMPILAN",
    healthRatioDesc: "Probabilitas siap produksi",
    activePipelinesTitle: "Riwayat Pipeline Aktif",
    activePipelinesStatus: "registrasi",
    projDomainName: "Nama Domain Project",
    frameworkTarget: "Target Framework",
    helpFramework: "Pilih target framework atau Deteksi Otomatis untuk project standar.",
    placeholderName: "misal. fluxel-next-app",
    dragDropFiles: "Tarik & letakkan ZIP standar, HTML, CSS, JS, JAVA, XML, atau file apa saja di sini",
    dragDropSubtitle: "Menerima halaman web HTML, stylesheet, skrip, basis data backend, atau kode mentah (Maks 50MB)",
    readyToDispatch: "file • Siap untuk dikompilasi",
    uploadingPipeline: "Mengunggah Arsip Pipeline...",
    deployBtn: "Deploy Sekarang",
    sendingBtn: "Mengirim Ke Server Distribusi...",
    confirmDeleteTitle: "Konfirmasi Penghapusan",
    confirmDeleteDescPart1: "Apakah Anda yakin ingin menghapus ",
    confirmDeleteDescPart2: "Tindakan ini juga akan menghapus project ini beserta seluruh deployment-nya dari cloud server secara otomatis.",
    confirmDeleteBtn: "Hapus Permanen",
    cancelBtn: "Batal",
    initConnection: "Menginisiasi koneksi dengan API Server...",
    successfullyQueued: "Berhasil menambahkan proyek",
    removedRecords: "Dihapus dari catatan lokal.",
    authRequired: "Harap masukkan Token Akses Anda terlebih dahulu.",
    uploadFilesRequired: "Harap unggah atau tarik berkas proyek terlebih dahulu.",
    uploadedStarting: "Arsip terunggah. Memulai kompilasi serverless...",
    toreDownSuccess: "Berhasil membersihkan resource cloud untuk",
    toreDownVercel: "Penghapusan sisi server telah dimulai untuk",
    detectedBadge: "Sistem mendeteksi bahasa perangkat Anda:",

    stateSuccess: "Sukses",
    stateBuilding: "Proses Build",
    stateQueued: "Mengantre",
    stateFailed: "Gagal",
    noDeploysTitle: "Tidak Ada Deployment Terdaftar",
    noDeploysDesc: "Hubungkan Token Akses Pribadi Anda dan jalankan target ZIP atau URL GitHub untuk meluncurkan server cloud nyata secara instan.",
    projectLabel: "Proyek",
    githubImportLabel: "Impor GitHub",
    zipUploadLabel: "Unggah ZIP",
    copyUrlBtn: "Salin URL",
    consoleBtn: "Konsol",
    openBtn: "Buka",
    toastCopied: "URL output berhasil disalin.",

    consoleLogsTitle: "Log Konsol Deployment",
    consoleLogsCopiedToast: "Log konsol berhasil disalin ke papan klip.",
    consoleAttaching: "Menghubungkan jalur pipa konsol aman virtual...",
    consoleFailedConnect: "Gagal menghubungkan aliran data konsol",
    consoleTokenWarning: "Pastikan Token Akses Anda memiliki hak akses ke pendeployan ini.",
    consoleWaiting: "Menunggu antrean output kompilasi...",
    consolePreparing: "Wadah build sedang menyiapkan spesifikasi lingkungan.",
    consoleAttached: "fluxel-terminal-shell berhasil terhubung pada platform wadah.",
    consoleActiveStream: "KONSOL AKTIF • ALIRAN PIPA AMAN",
    consolePoweredBy: "Didukung oleh Infrastruktur Build Serverless Fluxel",

    footerRights: "© 2026 Fluxel Deployment. Hak cipta dilindungi undang-undang.",
    footerDesc: "Fluxel Deployment dikembangkan dan dikelola oleh Fluxel Deployment.",
  },
  en: {
    heroTitle: "Fluxel Deployment",
    heroDesc: "Deploy your files into a powerful website in seconds. Fluxel Deployment makes publishing web projects fast, simple, and reliable for everyone.",
    serverEngines: "PRODUCTION SERVER ENGINES",
    sidebarTitle: "Deployment",
    sidebarFileDrop: "File Drop",
    statusOnline: "Connected",
    profileTitle: "Profile & Account",
    profileLabel: "Chrome Profile / Device Name",
    profilePlaceholder: "e.g. Primary Account",
    profileHint: "History is saved locally & separated by this profile name to keep deployments organized per account/device.",
    disclaimerBtn: "Disclaimer",
    disclaimerTitle: "Service Limitation Disclaimer",
    disclaimerText1: "This application is a professional deployment utility enabling instant, rapid integration of static assets (ZIP) or Git repositories with zero complexity.",
    disclaimerSupportTitle: "⚡ High-Speed Global Edge Network",
    disclaimerSupportDesc: "All project directories, source files, navigation routing, and compilation protocols are safely distributed across a premier global edge CDN architecture.",
    disclaimerPoint1Title: "Dynamic Build Limits:",
    disclaimerPoint1Desc: "This utility is highly optimized for hosting static content (HTML, CSS, JS), frontend ZIP bundles, and modern structured frameworks seamlessly.",
    disclaimerPoint2Title: "Secure Credential Encryption:",
    disclaimerPoint2Desc: "All active deployment processes utilize your secure Access Token completely server-side. No credentials, tokens, or private keys are cached locally in browser states.",
    disclaimerPoint3Title: "Independent Pipeline Integrity:",
    disclaimerPoint3Desc: "System components are fully managed by robust elite load-balancing servers to guarantee constant speed, low latency, and maximum stability.",
    disclaimerUnderstand: "I UNDERSTAND",
    totalDeploys: "TOTAL DEPLOYMENTS",
    totalDeploysDesc: "Cloud pipelines initiated",
    successfulBuild: "SUCCESSFUL BUILDS",
    successfulBuildDesc: "Active online websites",
    buildFailures: "BUILD FAILURES",
    buildFailuresDesc: "Errors caught during compilation",
    healthRatio: "PIPELINE HEALTH RATIO",
    healthRatioDesc: "Production-ready probability",
    activePipelinesTitle: "Active Pipelines History",
    activePipelinesStatus: "registries",
    projDomainName: "Project Domain Name",
    frameworkTarget: "Framework Target",
    helpFramework: "Select structural framework or use Auto-Detect for default compilation configs.",
    placeholderName: "e.g. fluxel-next-app",
    dragDropFiles: "Drag & drop standard ZIP, HTML, CSS, JS, JAVA, XML, or any source files here",
    dragDropSubtitle: "Accepts standard HTML structures, responsive stylesheets, scripting, backend databases or raw code sheets (Max 50MB)",
    readyToDispatch: "files • Ready to dispatch for build",
    uploadingPipeline: "Uploading Pipeline Archive...",
    deployBtn: "Deploy Now",
    sendingBtn: "Sending to Cloud Network...",
    confirmDeleteTitle: "Confirm Permanent Deletion",
    confirmDeleteDescPart1: "Are you absolutely sure you want to delete ",
    confirmDeleteDescPart2: "This action will automatically wipe this running project and all secondary cloud histories from your profile registers.",
    confirmDeleteBtn: "Delete Permanently",
    cancelBtn: "Cancel",
    initConnection: "Initiating secure gateway compilation...",
    successfullyQueued: "Successfully queued project",
    removedRecords: "Removed from offline histories.",
    authRequired: "Please authorize your Personal Access Token first.",
    uploadFilesRequired: "Please upload or drag & drop project files first.",
    uploadedStarting: "Pipeline uploaded. Starting serverless compilation...",
    toreDownSuccess: "Tore down cloud resources securely for",
    toreDownVercel: "Server-side teardown initiated for",
    detectedBadge: "Detected system device language:",

    stateSuccess: "Success",
    stateBuilding: "Building",
    stateQueued: "Queued",
    stateFailed: "Failed",
    noDeploysTitle: "No Deployments Registered",
    noDeploysDesc: "Link your Personal Access Token and execute a ZIP target or GitHub URL to launch a real cloud server instantly.",
    projectLabel: "Project",
    githubImportLabel: "GitHub Import",
    zipUploadLabel: "ZIP Upload",
    copyUrlBtn: "Copy URL",
    consoleBtn: "Console",
    openBtn: "Open",
    toastCopied: "output URL copied.",

    consoleLogsTitle: "Deployment Console Logs",
    consoleLogsCopiedToast: "Console logs copied to clipboard.",
    consoleAttaching: "Attaching virtual secure console pipeline...",
    consoleFailedConnect: "Failed to connect console stream",
    consoleTokenWarning: "Make sure your Access Token has access to this deployment.",
    consoleWaiting: "Waiting for compilation output queue...",
    consolePreparing: "Build containers are preparing environment specs.",
    consoleAttached: "fluxel-terminal-shell attached successfully on container platform.",
    consoleActiveStream: "CONSOLE ACTIVE • STREAMING SECURE PIPE",
    consolePoweredBy: "Powered by Fluxel Serverless Build Infrastructure",

    footerRights: "© 2026 Fluxel Deployment. All rights reserved.",
    footerDesc: "Fluxel Deployment is developed and maintained by Fluxel Deployment.",
  }
};

// Hook to automatically detect and reactive-toggle application languages
export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("fluxel_language_preference");
      if (saved === "id" || saved === "en") return saved as Language;

      // Detect phone/browser navigator settings
      const browserLang = (
        navigator.language || 
        (navigator.languages && navigator.languages[0]) || 
        ""
      ).toLowerCase();

      // If Indonesian / Malaysian, use ID, otherwise default to English
      if (browserLang.includes("id") || browserLang.includes("ms") || browserLang.includes("in")) {
        return "id";
      }
    } catch (e) {
      console.warn("Language auto-detection error, defaulting to English:", e);
    }
    return "en"; // Default is English as requested
  });

  const toggleLanguage = () => {
    const nextLang = lang === "id" ? "en" : "id";
    setLang(nextLang);
    try {
      localStorage.setItem("fluxel_language_preference", nextLang);
    } catch {}
  };

  const setLanguageManual = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("fluxel_language_preference", newLang);
    } catch {}
  };

  const t = translations[lang];

  return {
    lang,
    toggleLanguage,
    setLanguageManual,
    t
  };
}
