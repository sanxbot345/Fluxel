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
}

export const translations: Record<Language, TranslationSchema> = {
  id: {
    heroTitle: "Fluxel Deployment",
    heroDesc: "Platform deployment modern untuk folder statis dan repositori Git, didukung jaringan edge global Vercel dan desain premium bergaya Apple Liquid Glass.",
    serverEngines: "MESIN SERVER PRODUKSI",
    sidebarTitle: "Deployment",
    sidebarFileDrop: "File Drop",
    statusOnline: "Connected",
    disclaimerBtn: "Disclaimer",
    disclaimerTitle: "Pernyataan Batasan Layanan (Disclaimer)",
    disclaimerText1: "Aplikasi ini adalah alat pendeploy sederhana yang memfasilitasi integrasi file statis (ZIP) atau repositori Git secara efisien, praktis, dan instan.",
    disclaimerSupportTitle: "⚡ Didukung Penuh Oleh Vercel",
    disclaimerSupportDesc: "Seluruh file, kode program, konfigurasi routing, dan kompilasi didistribusikan langsung menggunakan tenaga infrastruktur edge global https://vercel.com.",
    disclaimerPoint1Title: "Batas Kompilasi Dinamis:",
    disclaimerPoint1Desc: "Layanan ini didesain utama untuk demo halaman statis (HTML, CSS, JS), file Zip statis, dan framework terkompilasi serverless yang didukung penuh oleh adapter Vercel.",
    disclaimerPoint2Title: "Manajemen Kunci Token:",
    disclaimerPoint2Desc: "Aktivitas deployment terhubung penuh memanfaatkan Token Personal Vercel Anda secara aman di backend server-side tanpa adanya kebocoran kunci di browser client atau logging data tidak terotorisasi.",
    disclaimerPoint3Title: "Bebas Render:",
    disclaimerPoint3Desc: "Provider Render telah dinonaktifkan sepenuhnya. Semua alur kerja saat ini secara eksklusif menggunakan infrastruktur Vercel untuk performa yang lebih instan, terprediksi, dan andal.",
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
    sendingBtn: "Mengirim ke Vercel...",
    confirmDeleteTitle: "Konfirmasi Penghapusan",
    confirmDeleteDescPart1: "Apakah Anda yakin ingin menghapus ",
    confirmDeleteDescPart2: "Tindakan ini juga akan menghapus project ini beserta seluruh deployment-nya dari Vercel Anda secara otomatis.",
    confirmDeleteBtn: "Hapus Permanen",
    cancelBtn: "Batal",
    initConnection: "Menginisiasi koneksi aman dengan Vercel API...",
    successfullyQueued: "Berhasil menambahkan proyek",
    removedRecords: "Dihapus dari catatan lokal.",
    authRequired: "Harap masukkan Token Personal Vercel Anda terlebih dahulu.",
    uploadFilesRequired: "Harap unggah atau tarik berkas proyek terlebih dahulu.",
    uploadedStarting: "Arsip terunggah. Memulai kompilasi serverless...",
    toreDownSuccess: "Berhasil membersihkan resource cloud untuk",
    toreDownVercel: "Penghapusan sisi Vercel telah dimulai untuk",
    detectedBadge: "Sistem mendeteksi bahasa perangkat Anda:"
  },
  en: {
    heroTitle: "Fluxel Deployment",
    heroDesc: "A modern deployment platform for static folders and Git repositories, powered by Vercel's global edge network and featuring high-end Apple Liquid Glass accents.",
    serverEngines: "PRODUCTION SERVER ENGINES",
    sidebarTitle: "Deployment",
    sidebarFileDrop: "File Drop",
    statusOnline: "Connected",
    disclaimerBtn: "Disclaimer",
    disclaimerTitle: "Service Limitation Disclaimer",
    disclaimerText1: "This application is a simple deployment utility enabling instant, rapid integration of static assets (ZIP) or Git repositories with zero complexity.",
    disclaimerSupportTitle: "⚡ Fully Powered by Vercel",
    disclaimerSupportDesc: "All workspace files, source files, routing, and cloud compilations are securely distributed across the global edge CDN architecture of https://vercel.com.",
    disclaimerPoint1Title: "Dynamic Build Limits:",
    disclaimerPoint1Desc: "This platform is custom tailored for static site demos (HTML, CSS, JS), frontend SPA ZIP buffers, and serverless compile hooks supported by Vercel pipelines.",
    disclaimerPoint2Title: "Token Credential Management:",
    disclaimerPoint2Desc: "All cloud deployments process Vercel APIs with your Personal Auth Token fully server-side. No logs, credentials, or keys are cached locally in the browser.",
    disclaimerPoint3Title: "Render Deployment Bypassed:",
    disclaimerPoint3Desc: "The Render provider setup is disabled entirely. All running processes now use Vercel systems for elite speed, stability, and high performance.",
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
    sendingBtn: "Sending to Vercel CDN...",
    confirmDeleteTitle: "Confirm Permanent Deletion",
    confirmDeleteDescPart1: "Are you absolutely sure you want to delete ",
    confirmDeleteDescPart2: "This command will automatically clear this active project and all related deployments directly on your Vercel dashboard.",
    confirmDeleteBtn: "Delete Permanently",
    cancelBtn: "Cancel",
    initConnection: "Initiating secure connection with Vercel API...",
    successfullyQueued: "Successfully queued project",
    removedRecords: "Removed from offline histories.",
    authRequired: "Please authorize/connect your Vercel Token first.",
    uploadFilesRequired: "Please upload or drag & drop project files first.",
    uploadedStarting: "Pipeline uploaded. Starting serverless compilation...",
    toreDownSuccess: "Tore down cloud resources securely for",
    toreDownVercel: "Vercel side teardown started for",
    detectedBadge: "Detected system device language:"
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
      console.warn("Language auto-detection error, defaulting to Indonesia:", e);
    }
    return "id"; // Default is Indonesian as it was originally built
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
