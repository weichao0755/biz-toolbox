// 部署启动脚本：在沙箱内先构建，再启动静态服务
import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. 安装依赖并构建
console.log('[deploy] npm install...');
execSync('npm install', { stdio: 'inherit', cwd: __dirname });
console.log('[deploy] npm run build...');
execSync('npm run build', { stdio: 'inherit', cwd: __dirname });

// 2. 启动静态服务
const root = path.join(__dirname, 'dist');
const port = parseInt(process.env.PORT || '3000', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// 带 hash 的静态资源可长缓存；HTML 一律不缓存，保证更新后成员刷新即见新版
const CACHE_IMMUTABLE = 'public, max-age=31536000, immutable';
const CACHE_NO = 'no-cache, no-store, must-revalidate';

function sendHtml(res, html) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': CACHE_NO,
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(html);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.normalize(path.join(root, urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback：非静态资源路径一律返回 index.html（供 hash 路由）
      fs.readFile(path.join(root, 'index.html'), (err2, html) => {
        if (err2) { res.writeHead(404); res.end('Not Found'); }
        else sendHtml(res, html);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    if (ext === '.html' || ext === '') {
      headers['Cache-Control'] = CACHE_NO;
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = CACHE_IMMUTABLE;
    }
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[deploy] biz-toolbox serving dist on http://0.0.0.0:${port}`);
});
