import React, { useState } from "react";
import { GitBranch, GitPullRequest, HelpCircle, Key, Lock } from "lucide-react";
import FrameworkDropdown from "./FrameworkDropdown";


interface DeployGitFormProps {
  token: string;
  onDeployStart: () => void;
  onDeploySuccess: (deployment: any) => void;
  onDeployError: (errMessage: string) => void;
  addToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function DeployGitForm({
  token,
  onDeployStart,
  onDeploySuccess,
  onDeployError,
  addToast,
}: DeployGitFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [projectName, setProjectName] = useState("");
  const [framework, setFramework] = useState("detect");
  const [githubToken, setGithubToken] = useState("");
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState(0);

  const detectFrameworkFromGitHub = async (url: string, branchName: string) => {
    try {
      if (!url) return;
      const cleanUrl = url.replace(".git", "").replace(/\/$/, "");
      let owner = "";
      let repo = "";

      if (cleanUrl.includes("github.com/")) {
        const parts = cleanUrl.split("github.com/")[1].split("/");
        owner = parts[0];
        repo = parts[1];
      } else {
        const parts = cleanUrl.split("/");
        if (parts.length === 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }

      if (!owner || !repo) return;

      // Auto-set the project name based on the repo if it's currently empty
      if (!projectName) {
        setProjectName(repo.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3.raw",
      };
      if (githubToken) {
        headers["Authorization"] = `token ${githubToken}`;
      }

      // Check for config files first to be smart
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`;
      const treeRes = await fetch(treeUrl, { headers });
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const treeFiles = treeData.tree.map((t: any) => t.path);
        
        let fileFramework = null;
        if (treeFiles.includes("next.config.js") || treeFiles.includes("next.config.mjs") || treeFiles.includes("next.config.ts")) fileFramework = "nextjs";
        else if (treeFiles.includes("vite.config.js") || treeFiles.includes("vite.config.ts")) fileFramework = "vite";
        else if (treeFiles.includes("nuxt.config.js") || treeFiles.includes("nuxt.config.ts")) fileFramework = "nuxtjs";
        else if (treeFiles.includes("astro.config.mjs")) fileFramework = "astro";
        else if (treeFiles.includes("Dockerfile")) fileFramework = "docker";
        else if (treeFiles.includes("requirements.txt")) fileFramework = "python";
        
        if (fileFramework) {
           setFramework(fileFramework);
           addToast(`Detected framework from files`, "info");
           return;
        }
      }

      // Try fetching package.json
      const pkgUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${branchName}`;
      const res = await fetch(pkgUrl, { headers });
      
      if (res.ok) {
        const pkgData = await res.json();
        let contentStr = "";
        try {
          contentStr = atob(pkgData.content);
        } catch(e) {}
        
        if (contentStr) {
          const pkgJsonData = JSON.parse(contentStr);
          const deps = { ...pkgJsonData.dependencies, ...pkgJsonData.devDependencies };
          
          if (deps["vite"]) {
            setFramework("vite");
          } else if (deps["next"]) {
            setFramework("nextjs");
          } else if (deps["express"]) {
            setFramework("express");
          } else if (deps["astro"]) {
            setFramework("astro");
          } else if (deps["nuxt"]) {
            setFramework("nuxtjs");
          } else if (deps["vue"]) {
            setFramework("vue");
          } else if (deps["react-scripts"]) {
            setFramework("create-react-app");
          } else {
            setFramework("detect");
          }
          addToast(`Detected framework from repository package.json`, "info");
          return;
        }
      }
      
      if (treeRes.ok) {
         const treeData = await treeRes.json();
         const treeFiles = treeData.tree.map((t: any) => t.path);
         if (treeFiles.includes("index.html")) {
            setFramework("static");
            addToast(`Detected static framework`, "info");
         }
      }
      
    } catch (e) {
      console.error("Failed to detect framework from Github", e);
    }
  };

  // Trigger detection when url or branch loses focus
  const handleUrlBlur = () => {
    if (repoUrl && framework === "detect") {
      detectFrameworkFromGitHub(repoUrl, branch);
    }
  };

  const submitDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast("Please authorize/connect your Vercel Token first.", "error");
      return;
    }
    if (!repoUrl) {
      addToast("Please enter a valid GitHub repository URL.", "error");
      return;
    }

    setDeploying(true);
    setProgress(15);
    onDeployStart();

    try {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev < 88) return prev + Math.floor(Math.random() * 6) + 2;
          return prev;
        });
      }, 500);

      const response = await fetch("/api/deploy/git", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repoUrl,
          branch,
          projectName: projectName || undefined,
          framework,
          githubToken: githubToken || undefined,
          target: "vercel",
        }),
      });

      clearInterval(timer);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "GitHub repository deployment failed.");
      }

      setProgress(100);
      setTimeout(() => {
        onDeploySuccess({ ...data, sourceType: "github", gitRepoUrl: repoUrl, gitBranch: branch });
        addToast("Repository synchronized. Launching compilation pipeline...", "success");
        setRepoUrl("");
        setBranch("main");
        setProjectName("");
        setGithubToken("");
        setDeploying(false);
        setProgress(0);
      }, 500);
    } catch (err: any) {
      setProgress(0);
      setDeploying(false);
      onDeployError(err.message);
      addToast(err.message, "error");
    }
  };

  return (
    <form onSubmit={submitDeploy} className="flex flex-col gap-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Repository URL */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase">
            GitHub Repository URL
          </label>
          <div className="relative">
            <input
              type="url"
              required
              placeholder="e.g. https://github.com/verge/project-boilerplate"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onBlur={handleUrlBlur}
              className="w-full pl-4 pr-10 py-3.5 bg-stone-900/40 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-xl font-sans text-sm text-stone-200 placeholder-stone-600 focus:outline-none transition-all shadow-inner"
            />
            <GitPullRequest className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          </div>
        </div>

        {/* Git Branch */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase">
            Git Branch
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              onBlur={handleUrlBlur}
              className="w-full pl-4 pr-10 py-3 bg-stone-900/40 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-xl font-sans text-sm text-stone-200 placeholder-stone-600 focus:outline-none transition-all shadow-inner"
            />
            <GitBranch className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
          </div>
        </div>

        {/* Project Name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase">
            Project Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. custom-pipeline-name"
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
            Framework Target
            <span
              className="text-[10px] text-stone-500 cursor-help"
              title="Select framework or Auto-Detect for standard projects."
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          </label>
          <FrameworkDropdown value={framework} onChange={(val) => setFramework(val)} />
        </div>

        {/* Private Repo GitHub Token */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-medium tracking-wide text-stone-400 uppercase flex items-center gap-1.5">
            GitHub PAT (For Private Repos)
            <span
              className="text-[10px] text-stone-500 cursor-help"
              title="Specify a GitHub Personal Access Token to pull files from an active private repository."
            >
              <Lock className="w-3.5 h-3.5" />
            </span>
          </label>
          <div className="relative">
            <input
              type={showGithubToken ? "text" : "password"}
              placeholder="github_pat_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-stone-900/40 border border-white/5 hover:border-white/10 focus:border-white/20 rounded-xl font-mono text-xs text-stone-200 placeholder-stone-700 focus:outline-none transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowGithubToken(!showGithubToken)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors focus:outline-none"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {deploying && (
        <div className="flex flex-col gap-2 w-full animate-modal-entrance">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Fetching repository & parsing file manifest...</span>
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
        disabled={deploying || !repoUrl}
        className="w-full py-4 bg-white hover:bg-stone-200 text-stone-950 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-98 disabled:opacity-35 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 glow-btn uppercase tracking-wider"
      >
        {deploying ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Triggering Pipeline on Vercel...
          </>
        ) : (
          "Deploy Git Repository"
        )}
      </button>
    </form>
  );
}
