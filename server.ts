import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import AdmZip from "adm-zip";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Use high capacity memory storage for ZIP file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

app.use(express.json());

// API: Check status of server
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Explicitly serve favicon correctly from the root
app.get("/favicon.jpg", (req, res) => {
  const filePath = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), 'dist', 'favicon.jpg')
    : path.join(process.cwd(), 'public', 'favicon.jpg');
    
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not Found');
  }
});

// Helper: Resolve Vercel Token from environment script or headers
function resolveVercelToken(authorizationHeader?: string): string {
  if (process.env.VERCEL_TOKEN && process.env.VERCEL_TOKEN.trim() !== "") {
    return process.env.VERCEL_TOKEN.trim();
  }
  const cleared = authorizationHeader?.replace("Bearer ", "") || "";
  if (cleared === "script_token" || cleared === "dummy" || !cleared) {
    return "";
  }
  return cleared.trim();
}

// Helper: Calculate SHA1 of a Buffer
function calculateSha1(buffer: Buffer): string {
  const shasum = crypto.createHash("sha1");
  shasum.update(buffer);
  return shasum.digest("hex");
}

// Helper: Strip common root directories and system junk from zip file lists
interface ExtractedFile {
  file: string;
  content: Buffer;
}

function normalizeFiles(extracted: ExtractedFile[]): ExtractedFile[] {
  // Filter out system files, mac junk, git folders
  const filtered = extracted.filter((f) => {
    const name = f.file;
    const isJunk =
      name.includes("__MACOSX") ||
      name.endsWith(".DS_Store") ||
      name.includes(".git/") ||
      name.endsWith("/") ||
      name.includes("node_modules/");
    return !isJunk;
  });

  if (filtered.length === 0) return [];

  // Check if all files start with a common directory (e.g. repo folder or root folder zip)
  let resolvedFiles = filtered;
  const firstPath = filtered[0].file;
  const firstSlashIdx = firstPath.indexOf("/");
  if (firstSlashIdx !== -1) {
    const parentDir = firstPath.substring(0, firstSlashIdx + 1);
    const hasSameParent = filtered.every((f) => f.file.startsWith(parentDir));
    if (hasSameParent) {
      // Strip parent directory prefix
      resolvedFiles = filtered.map((f) => ({
        file: f.file.substring(parentDir.length),
        content: f.content,
      }));
    }
  }

  // Auto-Index Fallback: Ensure there is always an index.html at the root for static projects
  const hasIndexHtml = resolvedFiles.some(f => f.file.toLowerCase() === "index.html");
  if (!hasIndexHtml) {
    // Find the first HTML file at the root level (no directories in its path)
    const rootHtmlFile = resolvedFiles.find(f => {
      const lower = f.file.toLowerCase();
      return (lower.endsWith(".html") || lower.endsWith(".htm")) && !f.file.includes("/");
    });

    if (rootHtmlFile) {
      // Duplicate its buffer as index.html
      resolvedFiles.push({
        file: "index.html",
        content: rootHtmlFile.content
      });
      console.log(`[Auto-Index] Automatically copied files: duplicated "${rootHtmlFile.file}" as "index.html" to prevent 404 router failure.`);
    }
  }

  return resolvedFiles;
}

// Helper: Auto-detect framework based on file list and packages
function detectFramework(files: ExtractedFile[]): string | null {
  const fileNames = files.map((f) => f.file.toLowerCase());
  const pkgFile = files.find((f) => f.file.toLowerCase() === "package.json");
  let pkgJson: any = null;

  if (pkgFile) {
    try {
      pkgJson = JSON.parse(pkgFile.content.toString("utf-8"));
    } catch (e) {
      console.error("Failed to parse package.json for framework detection", e);
    }
  }

  // Next.js
  if (
    fileNames.some(
      (f) =>
        f.includes("next.config.js") ||
        f.includes("next.config.mjs") ||
        f.includes("next.config.ts")
    ) ||
    (pkgJson && pkgJson.dependencies && pkgJson.dependencies.next)
  ) {
    return "nextjs";
  }

  // Astro
  if (
    fileNames.some(
      (f) => f.includes("astro.config.mjs") || f.includes("astro.config.js")
    ) ||
    (pkgJson?.dependencies?.astro || pkgJson?.devDependencies?.astro)
  ) {
    return "astro";
  }

  // Nuxt / Vue CLI
  if (
    fileNames.some(
      (f) => f.includes("nuxt.config.js") || f.includes("nuxt.config.ts")
    )
  ) {
    return "nuxtjs";
  }

  // Vite
  if (
    fileNames.some(
      (f) =>
        f.includes("vite.config.ts") ||
        f.includes("vite.config.js") ||
        f.includes("vite.config.mjs") ||
        f.includes("vite.config.mts")
    ) ||
    (pkgJson?.dependencies?.vite || pkgJson?.devDependencies?.vite)
  ) {
    return "vite";
  }

  // Vue (general)
  if (pkgJson?.dependencies?.vue || pkgJson?.devDependencies?.vue) {
    return "vue";
  }

  // React (standard CRA)
  if (pkgJson?.dependencies?.["react-scripts"]) {
    return "create-react-app";
  }

  return null; // Static HTML / standard project
}

function normalizeReadyState(state: string | undefined | null): string {
  if (!state) return "READY";
  const s = state.toUpperCase().trim();
  if (s === "READY" || s === "SUCCESS" || s === "LIVE" || s === "DONE") return "READY";
  if (s === "QUEUED" || s === "PENDING") return "QUEUED";
  if (s === "BUILDING" || s === "INITIALIZING" || s === "ANALYZING" || s === "DEPLOYING" || s === "PROCESSING") return "BUILDING";
  if (s === "CANCELED" || s === "CANCELLED") return "CANCELED";
  return "ERROR";
}

// Helper: Clean deployment URL hash strings in Vercel domains
function cleanVercelUrl(url: string, projectName: string): string {
  if (!url || !projectName) return url;
  if (!url.includes(".vercel.app")) return url;
  return `${projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-")}.vercel.app`;
}

// Helper: Fetch clean project domains from Vercel API
async function fetchCleanProjectDomains(projectId: string, vercelToken: string): Promise<string[]> {
  const domains: string[] = [];
  try {
    // 1. Fetch domains list which contains clean project domain and any custom domains
    const domainsRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      headers: { Authorization: `Bearer ${vercelToken}` }
    });
    if (domainsRes.ok) {
      const data = await domainsRes.json();
      if (data && Array.isArray(data.domains)) {
        for (const dom of data.domains) {
          if (dom.name) {
            domains.push(dom.name);
          }
        }
      }
    }

    // 2. Fallback / supplementary to fetch targeting production alias
    const projRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${vercelToken}` }
    });
    if (projRes.ok) {
      const projData = await projRes.json();
      if (projData.targets?.production?.alias) {
        for (const a of projData.targets.production.alias) {
          if (typeof a === 'string') domains.push(a);
        }
      }
      if (projData.alias && Array.isArray(projData.alias)) {
        for (const a of projData.alias) {
          const name = typeof a === 'string' ? a : a.domain;
          if (name) domains.push(name);
        }
      }
    }
  } catch (e) {
    console.error("Failed to fetch clean project domains:", e);
  }
  // Return unique domains in Vercel's default order
  return [...new Set(domains)];
}

// Core Helper: Perform Vercel deployment of normalized files
async function deployToVercel(
  files: ExtractedFile[],
  vercelToken: string,
  projectName: string,
  framework: string | null
) {
  // 1. Calculate SHA1, size, and paths for all files
  const filePayloads = files.map((f) => {
    const sha = calculateSha1(f.content);
    return {
      file: f.file,
      sha: sha,
      size: f.content.length,
      buffer: f.content,
    };
  });

  // 2. Upload files in concurrent chunk batches to Vercel v2/files API
  const CONCURRENCY = 5;
  for (let i = 0; i < filePayloads.length; i += CONCURRENCY) {
    const batch = filePayloads.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (fileObj) => {
        const response = await fetch("https://api.vercel.com/v2/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/octet-stream",
            "x-vercel-digest": fileObj.sha,
          },
          body: fileObj.buffer,
        });

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(
            `Failed to upload file "${fileObj.file}" (${fileObj.sha}) to Vercel API: ${errMsg}`
          );
        }
      })
    );
  }

  // 3. Request Deployment creation via Vercel’s v13/deployments API
  const fileListForDeployment = filePayloads.map((f) => ({
    file: f.file,
    sha: f.sha,
    size: f.size,
  }));

  let buildCommand = null;
  let outputDirectory = null;
  
  if (framework === "vite" || framework === "vue") {
    buildCommand = "npm run build";
    outputDirectory = "dist";
  } else if (framework === "nextjs") {
    buildCommand = "npm run build";
    outputDirectory = ".next";
  } else if (framework === "create-react-app") {
    buildCommand = "npm run build";
    outputDirectory = "build";
  } else if (framework === "astro") {
    buildCommand = "npm run build";
    outputDirectory = "dist";
  } else if (framework === "nuxtjs") {
    buildCommand = "npm run build";
    outputDirectory = "dist";
  } else if (framework === "static") {
    buildCommand = null;
    outputDirectory = ".";
  }

  const deployBody: any = {
    name: projectName,
    files: fileListForDeployment,
    target: "production",
    projectSettings: {
      framework: framework || null,
      ...(buildCommand ? { buildCommand } : {}),
      ...(outputDirectory ? { outputDirectory } : {})
    },
  };

  const deployResponse = await fetch("https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deployBody),
  });

  const deployData = await deployResponse.json();
  if (!deployResponse.ok) {
    throw new Error(
      deployData?.error?.message || "Vercel deployment request unsuccessful."
    );
  }
  
  let aliasList = deployData.alias || [];
  let mainUrl = deployData.url;
  
  // Try to fetch project alias immediately if available
  if (deployData.projectId) {
     const cleanDomains = await fetchCleanProjectDomains(deployData.projectId, vercelToken);
     if (cleanDomains.length > 0) {
        aliasList = [...new Set([...aliasList, ...cleanDomains])];
     }
  }

  if (aliasList.length > 0) {
     // Prioritize Vercel's assigned alias domain (e.g. index-mocha-nine-23.vercel.app)
     mainUrl = aliasList[0];
  } else if (deployData.name) {
     const defaultDomain = cleanVercelUrl(deployData.url, deployData.name);
     aliasList = [...new Set([defaultDomain, ...aliasList])];
     mainUrl = defaultDomain;
  }

  return {
    id: deployData.id,
    url: mainUrl,
    alias: aliasList,
    name: deployData.name,
    readyState: normalizeReadyState(deployData.readyState),
    creator: deployData.creator,
    createdAt: deployData.createdAt,
    framework: framework,
  };
}

// API: Deploy ZIP Project
app.post("/api/deploy/zip", upload.array("projectFiles", 50), async (req, res) => {
  try {
    const vercelToken = resolveVercelToken(req.headers.authorization);
    const projectName = req.body.projectName || "fluxel-project";
    const selectedFramework = req.body.framework || "detect"; // "detect" or specific framework ID

    if (!vercelToken) {
      return res.status(401).json({ error: "Vercel Access Token is not set. Please configure VERCEL_TOKEN in your server-side environment secrets panel." });
    }

    const uploadedFiles = req.files as Express.Multer.File[];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: "Please upload project files." });
    }

    const extractedFiles: ExtractedFile[] = [];

    uploadedFiles.forEach((file) => {
      if (file.originalname.toLowerCase().endsWith(".zip")) {
        // Parse ZIP file in-memory
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((entry) => {
          if (!entry.isDirectory) {
            extractedFiles.push({
              file: entry.entryName,
              content: entry.getData(),
            });
          }
        });
      } else {
        // Treat as single raw file deployment
        let targetName = file.originalname;
        extractedFiles.push({
          file: targetName,
          content: file.buffer,
        });
      }
    });

    if (extractedFiles.length === 0) {
      return res.status(400).json({ error: "The uploaded file is empty." });
    }

    // Normalize files structure
    const normalized = normalizeFiles(extractedFiles);
    if (normalized.length === 0) {
      return res.status(400).json({ error: "No valid files found." });
    }

    // Auto-detect framework
    let framework: string | null = null;
    if (selectedFramework === "detect") {
      framework = detectFramework(normalized);
    } else if (selectedFramework !== "static") {
      framework = selectedFramework;
    }

    const deployInfo = await deployToVercel(
      normalized,
      vercelToken,
      projectName,
      framework
    );

    res.json(deployInfo);
  } catch (error: any) {
    console.error("ZIP Deployment Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during zip deployment." });
  }
});

// API: Deploy from GitHub Repository URL
app.post("/api/deploy/git", async (req, res) => {
  try {
    const vercelToken = resolveVercelToken(req.headers.authorization);
    const { repoUrl, branch, projectName, framework: selectedFramework, githubToken } = req.body;

    if (!vercelToken) {
      return res.status(401).json({ error: "Vercel Access Token is not set. Please configure VERCEL_TOKEN in your server-side environment secrets panel." });
    }

    if (!repoUrl) {
      return res.status(400).json({ error: "Please provide a valid GitHub repository URL." });
    }

    const activeBranch = branch || "main";

    // Extract owner and repo elements from GitHub URL
    // e.g. https://github.com/facebook/react or git@github.com:facebook/react.git
    const cleanUrl = repoUrl.replace(".git", "").replace(/\/$/, "");
    let owner = "";
    let repo = "";

    if (cleanUrl.includes("github.com/")) {
      const parts = cleanUrl.split("github.com/")[1].split("/");
      owner = parts[0];
      repo = parts[1];
    } else {
      // Fallback for relative formats e.g. owner/repo
      const parts = cleanUrl.split("/");
      if (parts.length === 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }

    if (!owner || !repo) {
      return res.status(400).json({ error: "Unable to parse repository owner and name from the URL." });
    }

    // Pull ZIPball of the branch from GitHub API
    const gitZipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${activeBranch}`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Fluxel-Deployment-SaaS",
    };

    if (githubToken) {
      headers["Authorization"] = `token ${githubToken}`;
    }

    const gitResponse = await fetch(gitZipUrl, { headers });

    if (!gitResponse.ok) {
      const errDetail = await gitResponse.text();
      return res.status(gitResponse.status).json({
        error: `Failed to download repository ZIP from GitHub: ${gitResponse.statusText}. Please verify the URL, branch, and Token.`,
        details: errDetail,
      });
    }

    const arrayBuffer = await gitResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse zip archive
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const extractedFiles: ExtractedFile[] = [];

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        extractedFiles.push({
          file: entry.entryName,
          content: entry.getData(),
        });
      }
    });

    if (extractedFiles.length === 0) {
      return res.status(400).json({ error: "The downloaded repository branch archive is empty." });
    }

    const normalized = normalizeFiles(extractedFiles);
    if (normalized.length === 0) {
      return res.status(400).json({ error: "No valid files found within the repository branch archive." });
    }

    // Detect framework
    let framework: string | null = null;
    if (selectedFramework === "detect") {
      framework = detectFramework(normalized);
    } else if (selectedFramework !== "static") {
      framework = selectedFramework;
    }

    const finalProjectName = projectName || repo;
    const deployInfo = await deployToVercel(
      normalized,
      vercelToken,
      finalProjectName,
      framework
    );

    res.json(deployInfo);
  } catch (error: any) {
    console.error("Git Deployment Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during Git deployment." });
  }
});

// API: Get Deployment Status
app.get("/api/deploy/status/:id", async (req, res) => {
  try {
    const deploymentId = req.params.id;

    if (deploymentId.startsWith("srv-")) {
      const renderApiKey = process.env.RENDER_API_KEY;
      if (!renderApiKey) {
         return res.status(401).json({ error: "RENDER_API_KEY is not configured" });
      }

      const svcRes = await fetch(`https://api.render.com/v1/services/${deploymentId}`, {
         headers: { Authorization: `Bearer ${renderApiKey.trim()}`, Accept: "application/json" }
      });
      const svcData = await svcRes.json();
      if (!svcRes.ok) {
         return res.status(svcRes.status).json({ error: svcData.message || "Failed to fetch Render service" });
      }

      const deploysRes = await fetch(`https://api.render.com/v1/services/${deploymentId}/deploys?limit=1`, {
         headers: { Authorization: `Bearer ${renderApiKey.trim()}`, Accept: "application/json" }
      });
      const deploysData = await deploysRes.json();
      
      let readyState = "BUILDING";
      if (deploysRes.ok && Array.isArray(deploysData) && deploysData.length > 0) {
         const latestDeploy = deploysData[0].deploy;
         const deployStatus = latestDeploy?.status ? latestDeploy.status.toLowerCase().trim() : "";
         if (deployStatus === "live") {
            readyState = "READY";
         } else if (deployStatus === "build_failed" || deployStatus === "update_failed" || deployStatus === "pre_deploy_failed" || deployStatus === "post_deploy_failed") {
            readyState = "ERROR";
         } else if (deployStatus === "canceled" || deployStatus === "cancelled") {
            readyState = "CANCELED";
         } else if (
            deployStatus === "created" || 
            deployStatus === "build_in_progress" || 
            deployStatus === "pre_deploy_in_progress" || 
            deployStatus === "post_deploy_in_progress"
         ) {
            readyState = "BUILDING";
         }
      } else if (svcData?.suspended === "suspended") {
         readyState = "CANCELED";
      }

      const serviceUrl = svcData.serviceDetails?.url || svcData.url;
      return res.json({
         id: deploymentId,
         url: serviceUrl,
         alias: [serviceUrl],
         readyState: readyState,
         createdAt: new Date(svcData.createdAt).getTime(),
         target: "render"
      });
    }

    const vercelToken = resolveVercelToken(req.headers.authorization);

    if (!vercelToken) {
      return res.status(401).json({ error: "Vercel Access Token is not set. Please configure VERCEL_TOKEN in your server-side environment secrets panel." });
    }

    const statusResponse = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    const data = await statusResponse.json();
    if (!statusResponse.ok) {
      return res.status(statusResponse.status).json({ error: data?.error?.message || "Failed to fetch status." });
    }

    // Log the properties related to aliases
    console.log(`[Status] ${deploymentId} readyState: ${data.readyState}, url: ${data.url}, alias:`, data.alias, `aliasAssigned:`, data.aliasAssigned);
    
    let aliasList = data.alias || [];
    let mainUrl = data.url;
    
    // If it's ready, try to fetch the project to get its domains
    if (data.projectId) {
       const cleanDomains = await fetchCleanProjectDomains(data.projectId, vercelToken);
       if (cleanDomains.length > 0) {
          aliasList = [...new Set([...aliasList, ...cleanDomains])];
       }
    }

    if (aliasList.length > 0) {
       mainUrl = aliasList[0];
    } else if (data.name) {
       const defaultDomain = cleanVercelUrl(data.url, data.name);
       aliasList = [...new Set([defaultDomain, ...aliasList])];
       mainUrl = defaultDomain;
    }

    res.json({
      id: data.id,
      url: mainUrl,
      alias: aliasList,
      readyState: normalizeReadyState(data.readyState || data.status),
      createdAt: data.createdAt,
      inspectorUrl: data.inspectorUrl,
    });
  } catch (error: any) {
    console.error("Status Pull Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch deployment status." });
  }
});

// API: Get Deployment logs
app.get("/api/deploy/logs/:id", async (req, res) => {
  try {
    const vercelToken = resolveVercelToken(req.headers.authorization);
    const deploymentId = req.params.id;

    if (deploymentId.startsWith("srv-")) {
      return res.json({ events: [{ type: "stdout", payload: { text: "⚙️ Deploying on Render API. Check your Render Dashboard for live build logs.", date: Date.now() } }] });
    }

    if (!vercelToken) {
      return res.status(401).json({ error: "Vercel Access Token is not set. Please configure VERCEL_TOKEN in your server-side environment secrets panel." });
    }

    // Retrieve standard logs from /v2/deployments/{id}/events
    const logsUrl = `https://api.vercel.com/v2/deployments/${deploymentId}/events?direction=forward&follow=0`;
    const response = await fetch(logsUrl, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Vercel events pull failed: ${errText}` });
    }

    // Logs are newline-separated JSON values
    const textBuffer = await response.text();
    const lines = textBuffer.split("\n").filter((line) => line.trim() !== "");
    const events = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return null;
        }
      })
      .filter((ev) => ev !== null);

    res.json({ events });
  } catch (error: any) {
    console.error("Logs Pull Error:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve logs." });
  }
});

// API: Delete Deployment
app.delete("/api/deploy/delete/:id", async (req, res) => {
  try {
    const vercelToken = resolveVercelToken(req.headers.authorization);
    const deploymentId = req.params.id;

    if (deploymentId.startsWith("srv-")) {
      const renderApiKey = process.env.RENDER_API_KEY;
      if (!renderApiKey) {
         return res.json({ success: true, message: "Cleaned up locally" });
      }

      const delRes = await fetch(`https://api.render.com/v1/services/${deploymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${renderApiKey.trim()}`, Accept: "application/json" }
      });
      
      if (!delRes.ok) {
         const delData = await delRes.json().catch(()=>({}));
         return res.status(delRes.status).json({ error: delData.message || "Failed to delete Render service" });
      }
      return res.json({ success: true });
    }

    if (!vercelToken) {
      return res.status(401).json({ error: "Vercel Access Token is not set. Please configure VERCEL_TOKEN in your server-side environment secrets panel." });
    }

    // 1. Fetch deployment details first to retrieve the associate Vercel projectId or project name
    let projectId: string | null = null;
    let projectName: string | null = null;
    
    try {
      const getResponse = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      });
      if (getResponse.ok) {
        const getDetails = await getResponse.json();
        if (getDetails) {
          projectId = getDetails.projectId || null;
          projectName = getDetails.name || null;
        }
      }
    } catch (e) {
      console.error("Could not fetch deployment details before deletion:", e);
    }

    let projectDeleted = false;
    const projectIdentifier = projectId || projectName;
    
    // 2. Try to delete the entire Project from Vercel so it cleans up all builds, domains, and settings
    if (projectIdentifier) {
      try {
        const deleteProjResponse = await fetch(`https://api.vercel.com/v9/projects/${projectIdentifier}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
          },
        });
        if (deleteProjResponse.ok) {
          projectDeleted = true;
          console.log(`Successfully deleted entire Vercel project: ${projectIdentifier}`);
        } else {
          const errData = await deleteProjResponse.json().catch(() => ({}));
          console.warn(`Vercel project deletion returned non-2xx for ${projectIdentifier}:`, errData);
        }
      } catch (e) {
        console.error("Error during Vercel project deletion:", e);
      }
    }

    // 3. Fallback: If project deletion didn't succeed, delete the specific deployment directly
    if (!projectDeleted) {
      const deleteResponse = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      });

      const data = await deleteResponse.json();
      if (!deleteResponse.ok) {
        return res.status(deleteResponse.status).json({ error: data?.error?.message || "Failed to delete deployment." });
      }
      return res.json({ success: true, message: "Deployment deleted successfully from Vercel." });
    }

    res.json({ success: true, message: "Project and all of its associated deployments successfully deleted from Vercel." });
  } catch (error: any) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: error.message || "Failed to delete deployment." });
  }
});

// Boot Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite middleware integration
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    // Serve production static assets compiled into dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("/sitemap.xml", (req, res) => {
      res.sendFile(path.join(distPath, "sitemap.xml"));
    });

    app.get("/robots.txt", (req, res) => {
      res.sendFile(path.join(distPath, "robots.txt"));
    });
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fluxel Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
