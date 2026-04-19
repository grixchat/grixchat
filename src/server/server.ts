import express from "express";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized via service account');
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
  }
} else if (process.env.VITE_FIREBASE_PROJECT_ID) {
  // Fallback: Initialize with project ID (works if running in GCP with default service account)
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
  console.log('Firebase Admin initialized via project ID');
}

const app = express();
app.use(express.json({ limit: '50mb' }));

// GitHub OAuth Config
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

// Configure Multer for temporary storage in the OS temp directory
const upload = multer({ 
  dest: os.tmpdir(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GrixChat Server is running" });
});

// Serve Firebase Messaging Service Worker with config injected
// This avoids MIME type issues with query parameters in some environments
app.get("/firebase-messaging-sw.js", (req, res) => {
  const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const script = `
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(config)};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'New Message from GrixChat';
    const notificationOptions = {
      body: payload.notification?.body || 'You have a new message',
      icon: payload.notification?.icon || '/assets/favicon.png',
      badge: '/assets/favicon.png',
      data: payload.data
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
  `;
  res.setHeader("Content-Type", "application/javascript");
  res.send(script);
});

// Sitemap route for SEO
app.get("/sitemap.xml", (req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://grixchat.com/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>https://grixchat.com/hub</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
  <url><loc>https://grixchat.com/chats</loc><priority>0.9</priority><changefreq>always</changefreq></url>
  <url><loc>https://grixchat.com/reels</loc><priority>0.8</priority><changefreq>always</changefreq></url>
</urlset>`);
});

// Send Notification Proxy
app.post("/api/send-notification", async (req, res) => {
  const { tokens, title, body, data } = req.body;
  
  if (!tokens || !tokens.length) {
    return res.status(400).json({ error: 'No tokens provided' });
  }

  try {
    // Check if admin was actually initialized
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized. Check FIREBASE_SERVICE_ACCOUNT env var.');
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: data || {},
      webpush: {
        notification: {
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          requireInteraction: true // Keeps notification visible until user clicks
        }
      }
    });

    console.log(`Notification sent to ${tokens.length} devices. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    res.json({ success: true, response });
  } catch (error: any) {
    console.error('FCM Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// File Upload Proxy (Catbox for images/videos, Gofile.io for others)
app.post("/api/upload-file", (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'error', message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ status: 'error', message: `Unknown upload error: ${err.message}` });
    }
    next();
  });
}, async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No file uploaded' });
  }

  const isMedia = req.file.mimetype.startsWith('image/') || req.file.mimetype.startsWith('video/');

  try {
    if (isMedia) {
      // Upload to Catbox.moe
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      console.log('Uploading media to Catbox.moe...');
      const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        timeout: 60000,
      });

      if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.json({ 
          status: 'ok', 
          downloadUrl: response.data.trim(),
          provider: 'catbox'
        });
      }
      throw new Error(`Catbox error: ${response.data}`);
    } else {
      // Upload to Gofile.io
      // 1. Get best server
      console.log('Getting Gofile server...');
      const serverRes = await axios.get('https://api.gofile.io/getServer');
      const server = serverRes.data.data.server;

      // 2. Upload
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      console.log(`Uploading file to Gofile server: ${server}...`);
      const response = await axios.post(`https://${server}.gofile.io/contents/uploadfile`, form, {
        headers: form.getHeaders(),
        timeout: 120000, // Gofile can be slow for large files
      });

      if (response.data && response.data.status === 'ok') {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.json({ 
          status: 'ok', 
          downloadUrl: response.data.data.downloadPage, // Note: Direct link might require premium for Gofile, so we give download page
          fileId: response.data.data.fileId,
          provider: 'gofile'
        });
      }
      throw new Error(`Gofile error: ${JSON.stringify(response.data)}`);
    }
  } catch (error: any) {
    console.error('Upload failed:', error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ status: 'error', message: `Upload failed: ${error.message}` });
  }
});

// Debug endpoint
app.get("/api/github/debug", (req, res) => {
  res.json({
    hasClientId: !!GITHUB_CLIENT_ID,
    hasClientSecret: !!GITHUB_CLIENT_SECRET,
    appUrl: process.env.APP_URL || "Not Set",
    isVercel: !!process.env.VERCEL,
    env: process.env.NODE_ENV
  });
});

// GitHub Auth URL
app.get("/api/github/auth-url", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not set" });
  }
  
  // Better fallback logic for APP_URL
  let appUrl = process.env.APP_URL;
  
  // If APP_URL is missing or looks like a hash instead of a URL
  if (!appUrl || !appUrl.startsWith('http')) {
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    appUrl = `${protocol}://${host}`;
  }
  
  const redirectUri = `${appUrl}/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user,workflow`;
  res.json({ url });
});

// GitHub Callback
app.get(["/auth/github/callback", "/auth/github/callback/"], async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: "application/json" }
    });

    const accessToken = response.data.access_token;
    if (!accessToken) throw new Error("No access token");

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${accessToken}' }, '*');
              window.close();
            } else {
              window.location.href = '/hub';
            }
          </script>
          <p>Success! Closing window...</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Auth failed");
  }
});

// GitHub Push
app.post("/api/github/push", async (req, res) => {
  const { token, owner, repo, path: filePath, content, message, branch = 'main' } = req.body;
  try {
    let sha;
    try {
      const getFileRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: { Authorization: `token ${token}` }
      });
      sha = getFileRes.data.sha;
    } catch (e) {}

    const pushRes = await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      message, content, sha, branch
    }, {
      headers: { Authorization: `token ${token}` }
    });
    res.json(pushRes.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
});

// GitHub Batch Push (Atomic commit for multiple files)
app.post("/api/github/push-batch", async (req, res) => {
  const { token, owner, repo, files, message, branch = 'main' } = req.body;
  // files: Array<{ path: string, content: string }> (content is base64)
  
  try {
    const headers = { 
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    };

    // 1. Get the latest commit SHA of the branch
    const branchRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers });
    const parentSha = branchRes.data.commit.sha;
    const baseTreeSha = branchRes.data.commit.commit.tree.sha;

    // 2. Create blobs for each file
    const blobPromises = files.map(async (file: any) => {
      const blobRes = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
        content: file.content,
        encoding: 'base64'
      }, { headers });
      return {
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobRes.data.sha
      };
    });

    const treeItems = await Promise.all(blobPromises);

    // 3. Create a new tree
    const treeRes = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      base_tree: baseTreeSha,
      tree: treeItems
    }, { headers });

    // 4. Create a new commit
    const commitRes = await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      message,
      tree: treeRes.data.sha,
      parents: [parentSha]
    }, { headers });

    // 5. Update the branch reference
    const refRes = await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      sha: commitRes.data.sha,
      force: false
    }, { headers });

    res.json(refRes.data);
  } catch (error: any) {
    console.error("Batch push error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { message: error.message });
  }
});

// Vite / Static handling
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  // Dynamic import to avoid crashing on Vercel
  import("vite").then(({ createServer }) => {
    createServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then((vite) => {
      app.use(vite.middlewares);
    });
  });
} else {
  const distPath = path.resolve(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Start server locally
if (!process.env.VERCEL) {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
