import { mkdir, writeFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const GAMES_DIR = "/Users/youssefmohamed/Downloads/Game-Library-Manager/artifacts/gaming-os/public/games";

const GAMES = [
  { id: "2048", repo: "gabrielecirulli/2048", branch: "master" },
  { id: "hextris", repo: "Hextris/hextris", branch: "master" },
  { id: "minesweeper", repo: "donaldali/JS-Minesweeper", branch: "master" },
  { id: "sudoku", repo: "dachev/sudoku", branch: "master" },
  { id: "tetris", repo: "ganlvtech/tetris", branch: "master" },
  { id: "2048-ai", repo: "ovolve/2048-AI", branch: "master" },
  { id: "samegame", repo: "skratchdot/samegame", branch: "master" },
  { id: "blockrain", repo: "Aerolab/blockrain.js", branch: "master" },
  { id: "lights-out", repo: "jonhoo/lights-out", branch: "master" },
  { id: "nonogram", repo: "ramesaliyev/nonogram", branch: "master" },
  { id: "floppy-bird", repo: "nebez/floppybird", branch: "master" },
  { id: "clumsy-bird", repo: "ellisonleao/clumsy-bird", branch: "master" },
  { id: "t-rex-runner", repo: "wayou/t-rex-runner", branch: "master" },
  { id: "pacman", repo: "daleharvey/pacman", branch: "master" },
  { id: "pong", repo: "brenopolanski/pong-game", branch: "master" },
  { id: "asteroids", repo: "16bitlolz/asteroids-js", branch: "master" },
  { id: "space-invaders", repo: "straker/space-invaders", branch: "main" },
  { id: "breakout", repo: "cykod/Quintus", branch: "master" },
  { id: "arkanoid", repo: "ericdouglas/Arkanoid-JS", branch: "master" },
  { id: "snake", repo: "trekhleb/javascript-algorithms", branch: "master" },
  { id: "hexgl", repo: "BKcore/HexGL", branch: "master" },
  { id: "racer", repo: "ondras/racer", branch: "master" },
  { id: "drift", repo: "darsain/drift", branch: "master" },
  { id: "canvas-racing", repo: "mattdesl/canvas-sketch", branch: "master" },
  { id: "car-game", repo: "Chalarangelo/car-game", branch: "master" },
  { id: "browserquest", repo: "mozilla/BrowserQuest", branch: "master" },
  { id: "untrusted", repo: "AlexNisnevich/untrusted", branch: "master" },
  { id: "alien-invasion", repo: "learncodeacademy/alien-invasion", branch: "master" },
  { id: "2d-shooter", repo: "chriscourses/2d-shooter", branch: "master" },
  { id: "zombie-survival", repo: "jakesgordon/javascript-zombies", branch: "master" },
  { id: "tank-game", repo: "lostdecade/simple-tanks", branch: "master" },
  { id: "space-shooter", repo: "ehsangazar/space-shooter", branch: "master" },
  { id: "bullet-hell", repo: "melonjs/melonJS", branch: "master" },
  { id: "tiny-platformer", repo: "michaelvillar/tiny-platformer", branch: "master" },
  { id: "battle-city", repo: "chriscourses/battle-city-js", branch: "master" },
  { id: "browserquest-mmo", repo: "mozilla/BrowserQuest", branch: "master" },
  { id: "kaetram", repo: "kaetram/Kaetram", branch: "develop" },
  { id: "realtime-multiplayer", repo: "onedayitwillmake/Realtime-Multiplayer", branch: "master" },
  { id: "pomelo", repo: "NetEase/pomelo", branch: "master" },
  { id: "io-game", repo: "victorqribeiro/IOGame", branch: "master" },
  { id: "openttd", repo: "OpenTTD/OpenTTD", branch: "master" },
  { id: "freeciv", repo: "freeciv/freeciv-web", branch: "develop" },
  { id: "hex-empire", repo: "kevinroark/hex-empire", branch: "master" },
  { id: "rts-engine", repo: "mrdoob/three.js", branch: "master" },
  { id: "war-game", repo: "lostdecade/simple-war-game", branch: "master" },
  { id: "doom-js", repo: "diwic/doom-js", branch: "master" },
  { id: "wolfenstein", repo: "id-Software/wolf3d", branch: "master" },
  { id: "tetris-classic", repo: "jakesgordon/javascript-tetris", branch: "master" },
  { id: "mario-js", repo: "martindrapeau/backbone-game-engine", branch: "master" },
  { id: "lode-runner", repo: "wayou/lode-runner-js", branch: "master" },
];

const PLACEHOLDER = (repo) => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Game</title>
<style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f0f0f;color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;text-align:center;padding:20px}
a{color:#6cf;word-break:break-all}
h1{font-size:24px;margin-bottom:8px}
p{color:#999;margin:4px 0}
.btn{display:inline-block;margin-top:16px;padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}
.btn:hover{background:#1d4ed8}
</style></head><body>
<div>
<h1>Loading game...</h1>
<p>Redirecting to the original game...</p>
<a class="btn" href="https://github.com/${repo}" target="_top">Play on GitHub</a>
</div>
<script>
window.location.href = "https://github.com/${repo}";
</script>
</body></html>`;

async function downloadGame(id, repo, branch) {
  const dir = path.join(GAMES_DIR, id);
  const indexPath = path.join(dir, "index.html");
  
  await mkdir(dir, { recursive: true });
  
  if (existsSync(indexPath)) {
    console.log(`✓ ${id}: already exists`);
    return;
  }

  console.log(`  ${id}: downloading...`);
  
  // Try multiple URL patterns for index.html
  const patterns = [
    `https://raw.githubusercontent.com/${repo}/${branch}/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/public/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/src/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/app/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/docs/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/example/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/examples/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/game/index.html`,
    `https://raw.githubusercontent.com/${repo}/${branch}/client/index.html`,
  ];

  for (const url of patterns) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const html = await resp.text();
        await writeFile(indexPath, html);
        console.log(`  ✓ ${id}: downloaded from ${url}`);
        return;
      }
    } catch {}
  }

  // Try downloading the repo archive
  try {
    const archiveUrl = `https://github.com/${repo}/archive/refs/heads/${branch}.zip`;
    const resp = await fetch(archiveUrl);
    if (resp.ok) {
      const buffer = Buffer.from(await resp.arrayBuffer());
      const tmpDir = `/tmp/game-${id}`;
      const zipPath = `/tmp/game-${id}.zip`;
      require("fs").writeFileSync(zipPath, buffer);

      execSync(`mkdir -p ${tmpDir} && unzip -o ${zipPath} -d ${tmpDir} > /dev/null 2>&1`, { stdio: "pipe" });
      
      const extracted = execSync(`find ${tmpDir} -name "index.html" -type f 2>/dev/null | head -1`, { encoding: "utf8" }).trim();
      if (extracted) {
        const extDir = path.dirname(extracted);
        execSync(`cp "${extracted}" "${indexPath}"`, { stdio: "pipe" });
        
        for (const assetDir of ["css", "js", "img", "assets", "dist", "build", "fonts", "sound", "music"]) {
          const src = path.join(extDir, assetDir);
          const dest = path.join(dir, assetDir);
          if (existsSync(src)) {
            execSync(`cp -r "${src}" "${dest}" 2>/dev/null`, { stdio: "pipe" });
          }
        }
        console.log(`  ✓ ${id}: extracted from archive`);
        execSync(`rm -rf ${tmpDir} ${zipPath}`, { stdio: "pipe" });
        return;
      }
      execSync(`rm -rf ${tmpDir} ${zipPath}`, { stdio: "pipe" });
    }
  } catch {}

  // Create placeholder
  await writeFile(indexPath, PLACEHOLDER(repo));
  console.log(`  ✗ ${id}: placeholder created`);
}

async function main() {
  console.log(`Creating ${GAMES.length} game directories...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const game of GAMES) {
    const dir = path.join(GAMES_DIR, game.id);
    await mkdir(dir, { recursive: true });
    
    try {
      await downloadGame(game.id, game.repo, game.branch);
      const indexPath = path.join(dir, "index.html");
      if (existsSync(indexPath)) {
        const content = require("fs").readFileSync(indexPath, "utf8");
        if (content.includes("PLACEHOLDER_REPO")) {
          failed++;
        } else if (content.includes("Redirecting to the original")) {
          failed++;
        } else {
          success++;
        }
      }
    } catch (e) {
      console.log(`  ✗ ${game.id}: error - ${e.message}`);
      await writeFile(path.join(dir, "index.html"), PLACEHOLDER(game.repo));
      failed++;
    }
  }
  
  console.log(`\nDone! ${success} games downloaded, ${failed} placeholders created`);
}

main().catch(console.error);
