import React, { useState, useRef } from "react";
import { UploadCloud, FileArchive, FileCode, FileText, FileJson, File, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import FrameworkDropdown from "./FrameworkDropdown";
import JSZip from "jszip";
import { useLanguage } from "../utils/lang";

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <FileArchive className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />;
    case 'html':
    case 'htm':
    case 'css':
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'java':
    case 'xml':
    case 'py':
    case 'cpp':
    case 'c':
    case 'h':
    case 'cs':
    case 'sh':
    case 'php':
    case 'swift':
    case 'go':
    case 'rs':
    case 'rb':
    case 'kt':
      return <FileCode className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
    case 'md':
    case 'txt':
    case 'conf':
    case 'ini':
    case 'yaml':
    case 'yml':
      return <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
    default:
      return <File className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />;
  }
};


interface DeployZipFormProps {
  token: string;
  user: any;
  onOpenAuth: () => void;
  onDeployStart: () => void;
  onDeploySuccess: (deployment: any) => void;
  onDeployError: (errMessage: string) => void;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function DeployZipForm({
  token,
  user,
  onOpenAuth,
  onDeployStart,
  onDeploySuccess,
  onDeployError,
  addToast,
}: DeployZipFormProps) {
  const { t } = useLanguage();
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState("detect");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFrameworkFromFiles = async (newFiles: File[]) => {
    let pkgJsonContent: string | null = null;

    const pkgFile = newFiles.find(f => f.name === "package.json");
    if (pkgFile) {
      pkgJsonContent = await pkgFile.text();
    } else {
      const zipFile = newFiles.find(f => f.name.toLowerCase().endsWith(".zip"));
      if (zipFile) {
        try {
          const jsZip = new JSZip();
          const zipContent = await jsZip.loadAsync(zipFile);
          
          const entries = Object.keys(zipContent.files);
          const packageJsonEntry = entries.find(e => e === "package.json" || e.endsWith("/package.json"));
          
          if (packageJsonEntry) {
            pkgJsonContent = await zipContent.files[packageJsonEntry].async("string");
          }
        } catch (e) {
          console.error("Failed to read ZIP for auto-detect", e);
        }
      }
    }

    if (pkgJsonContent) {
      try {
        const pkgData = JSON.parse(pkgJsonContent);
        const deps = { ...pkgData.dependencies, ...pkgData.devDependencies };
        
        if (deps["vite"]) {
          setFramework("vite");
        } else if (deps["next"]) {
          setFramework("nextjs");
        } else if (deps["express"]) {
          setFramework("express");
        } else {
          setFramework("detect");
        }
      } catch(e) {
        console.error("Failed to parse package.json", e);
      }
    } else {
        const hasPython = newFiles.some(f => f.name.endsWith('.py'));
        if (hasPython) {
            setFramework("python");
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      if (!projectName) {
        // Standard project name from first file name
        const firstFile = droppedFiles[0];
        const ext = firstFile.name.substring(firstFile.name.lastIndexOf('.'));
        const cleanName = firstFile.name
          .replace(ext, "")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");
        setProjectName(cleanName || "my-project");
      }
      addToast(`Added ${droppedFiles.length} file(s)`, "info");
      detectFrameworkFromFiles(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      if (!projectName) {
        const firstFile = selectedFiles[0];
        const ext = firstFile.name.substring(firstFile.name.lastIndexOf('.'));
        const cleanName = firstFile.name
          .replace(ext, "")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-");
        setProjectName(cleanName || "my-project");
      }
      addToast(`Added ${selectedFiles.length} file(s)`, "info");
      detectFrameworkFromFiles(selectedFiles);
    }
  };

  const removeFile = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const submitDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      addToast(
        useLanguage().lang === "id" 
          ? "Harap masuk (login) terlebih dahulu untuk melakukan pendeployan proyek Anda." 
          : "Please log in first to proceed with your project deployment.", 
        "info"
      );
      return;
    }
    if (!token) {
      addToast(t.authRequired, "error");
      return;
    }
    if (files.length === 0) {
      addToast(t.uploadFilesRequired, "error");
      return;
    }

    setDeploying(true);
    setProgress(15);
    onDeployStart();

    const formData = new FormData();
    files.forEach(file => {
      formData.append("projectFiles", file);
    });
    formData.append("projectName", projectName || "fluxel-project");
    formData.append("framework", framework);
    formData.append("target", "vercel");

    try {
      // Simulate build upload steps visually while performing real post fetch
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 85) return prev + Math.floor(Math.random() * 8) + 2;
          return prev;
        });
      }, 400);

      const response = await fetch("/api/deploy/zip", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(timer);

      let data: any = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      }

      if (!response.ok) {
        throw new Error(
          data?.error || 
          data?.message || 
          `Deployment failed with status code ${response.status}. Please check your target configuration.`
        );
      }

      setProgress(100);
      setTimeout(() => {
        onDeploySuccess({ ...(data || {}), sourceType: "zip", target: "vercel" });
        addToast(t.uploadedStarting, "success");
        setFiles([]);
        setProjectName("");
        setDeploying(false);
        setProgress(0);
      }, 600);
    } catch (err: any) {
      setProgress(0);
      setDeploying(false);
      onDeployError(err.message);
      addToast(err.message, "error");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={submitDeploy} className="flex flex-col gap-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase">
            {t.projDomainName}
          </label>
          <input
            type="text"
            required
            placeholder={t.placeholderName}
            value={projectName}
            onChange={(e) =>
              setProjectName(
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
              )
            }
            className="w-full px-4 py-3 bg-stone-900/40 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-xl font-sans text-sm text-stone-200 placeholder-stone-600 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Framework Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase flex items-center gap-1.5">
            {t.frameworkTarget}
            <span
              className="text-[10px] text-stone-500 cursor-help"
              title={t.helpFramework}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <FrameworkDropdown value={framework} onChange={(val) => setFramework(val)} />
        </div>
      </div>

      {/* Drag & Drop File Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`relative min-h-[8rem] md:min-h-[11rem] lg:min-h-[12rem] p-4 sm:p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none transition-all group ${
          isDragging
            ? "border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            : files.length > 0
            ? "border-emerald-500/30 bg-stone-900/20"
            : "border-white/5 bg-stone-950/20 hover:bg-stone-900/20 hover:border-white/10"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*"
          multiple
          className="hidden"
        />

        {files.length > 0 ? (
          <div className="flex flex-col items-center text-center w-full animate-modal-entrance">
            <div className="flex flex-wrap gap-2 justify-center mb-3 max-h-[110px] md:max-h-[164px] overflow-y-auto w-full px-2 py-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-stone-900 border border-white/10 rounded-lg max-w-[200px]" onClick={(e) => e.stopPropagation()}>
                  {getFileIcon(f.name)}
                  <span className="text-[11px] sm:text-xs text-stone-200 truncate font-mono">{f.name}</span>
                  <button type="button" onClick={(e) => removeFile(i, e)} className="text-stone-500 hover:text-red-400 ml-1 transition-colors">
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-stone-500 mt-0.5">
              {files.length} {t.readyToDispatch} • {(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center px-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-stone-900/60 border border-white/5 text-stone-400 mb-2 md:mb-3 group-hover:scale-105 group-hover:text-white transition-all">
              <UploadCloud className="w-4 h-4 md:w-5 h-5" />
            </div>
            <span className="font-sans text-xs sm:text-sm font-semibold text-stone-300">
              {t.dragDropFiles}
            </span>
            <span className="text-[10px] sm:text-xs text-stone-500 mt-1 md:mt-1.5 leading-relaxed max-w-[280px] md:max-w-none">
              {t.dragDropSubtitle}
            </span>
          </div>
        )}
      </div>

      {deploying && (
        <div className="flex flex-col gap-2 w-full animate-modal-entrance">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400">
            <span>{t.uploadingPipeline}</span>
            <span className="text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-900 border border-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Deploy Actions */}
      <button
        type="submit"
        disabled={deploying || files.length === 0}
        className="w-full py-4 bg-white hover:bg-stone-200 text-stone-950 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-98 disabled:opacity-30 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 glow-btn uppercase tracking-wider"
      >
        {deploying ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t.sendingBtn}
          </>
        ) : (
          t.deployBtn
        )}
      </button>
    </form>
  );
}
