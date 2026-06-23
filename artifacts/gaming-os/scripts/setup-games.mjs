import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_GAMES = join(__dirname, "..", "public", "games");

const GAMES = [
  { id: "2048", name: "2048", category: "Puzzle", repo: "https://github.com/gabrielecirulli/2048" },
  { id: "hextris", name: "Hextris", category: "Puzzle", repo: "https://github.com/Hextris/hextris" },
  { id: "minesweeper", name: "JS Minesweeper", category: "Puzzle", repo: "https://github.com/donaldali/JS-Minesweeper" },
  { id: "sudoku", name: "Sudoku", category: "Puzzle", repo: "https://github.com/dachev/sudoku" },
  { id: "tetris", name: "Tetris", category: "Puzzle", repo: "https://github.com/ganlvtech/tetris" },
  { id: "2048-ai", name: "2048 AI", category: "Puzzle", repo: "https://github.com/ovolve/2048-AI" },
  { id: "samegame", name: "SameGame", category: "Puzzle", repo: "https://github.com/skratchdot/samegame" },
  { id: "blockrain", name: "Blockrain Tetris", category: "Puzzle", repo: "https://github.com/Aerolab/blockrain.js" },
  { id: "lights-out", name: "Lights Out", category: "Puzzle", repo: "https://github.com/jonhoo/lights-out" },
  { id: "nonogram", name: "Nonogram", category: "Puzzle", repo: "https://github.com/ramesaliyev/nonogram" },
  { id: "floppy-bird", name: "Floppy Bird", category: "Arcade", repo: "https://github.com/nebez/floppybird" },
  { id: "clumsy-bird", name: "Clumsy Bird", category: "Arcade", repo: "https://github.com/ellisonleao/clumsy-bird" },
  { id: "t-rex-runner", name: "Chrome Dino", category: "Arcade", repo: "https://github.com/wayou/t-rex-runner" },
  { id: "pacman", name: "Pac-Man", category: "Arcade", repo: "https://github.com/daleharvey/pacman" },
  { id: "pong", name: "Pong", category: "Arcade", repo: "https://github.com/brenopolanski/pong-game" },
  { id: "asteroids", name: "Asteroids", category: "Arcade", repo: "https://github.com/16bitlolz/asteroids-js" },
  { id: "space-invaders", name: "Space Invaders", category: "Arcade", repo: "https://github.com/straker/space-invaders" },
  { id: "breakout", name: "Breakout", category: "Arcade", repo: "https://github.com/cykod/Quintus" },
  { id: "arkanoid", name: "Arkanoid", category: "Arcade", repo: "https://github.com/ericdouglas/Arkanoid-JS" },
  { id: "snake", name: "Snake JS", category: "Arcade", repo: "https://github.com/trekhleb/javascript-algorithms" },
  { id: "hexgl", name: "HexGL", category: "Racing", repo: "https://github.com/BKcore/HexGL" },
  { id: "racer", name: "Racer JS", category: "Racing", repo: "https://github.com/ondras/racer" },
  { id: "drift", name: "Drift Game", category: "Racing", repo: "https://github.com/darsain/drift" },
  { id: "canvas-racing", name: "Canvas Racing", category: "Racing", repo: "https://github.com/mattdesl/canvas-sketch" },
  { id: "car-game", name: "Car JS", category: "Racing", repo: "https://github.com/Chalarangelo/car-game" },
  { id: "browserquest", name: "BrowserQuest", category: "Action", repo: "https://github.com/mozilla/BrowserQuest" },
  { id: "untrusted", name: "Untrusted", category: "Action", repo: "https://github.com/AlexNisnevich/untrusted" },
  { id: "alien-invasion", name: "Alien Invasion", category: "Action", repo: "https://github.com/learncodeacademy/alien-invasion" },
  { id: "2d-shooter", name: "JS Shooter", category: "Action", repo: "https://github.com/chriscourses/2d-shooter" },
  { id: "zombie-survival", name: "Zombie Survival", category: "Action", repo: "https://github.com/jakesgordon/javascript-zombies" },
  { id: "tank-game", name: "Tank Game", category: "Action", repo: "https://github.com/lostdecade/simple-tanks" },
  { id: "space-shooter", name: "Space Shooter", category: "Action", repo: "https://github.com/ehsangazar/space-shooter" },
  { id: "bullet-hell", name: "Bullet Hell", category: "Action", repo: "https://github.com/melonjs/melonJS" },
  { id: "tiny-platformer", name: "Top Down Shooter", category: "Action", repo: "https://github.com/michaelvillar/tiny-platformer" },
  { id: "battle-city", name: "Battle City", category: "Action", repo: "https://github.com/chriscourses/battle-city-js" },
  { id: "browserquest-mmo", name: "BrowserQuest MMO", category: "Multiplayer", repo: "https://github.com/mozilla/BrowserQuest" },
  { id: "kaetram", name: "Kaetram MMO", category: "Multiplayer", repo: "https://github.com/kaetram/Kaetram" },
  { id: "realtime-multiplayer", name: "Realtime Multiplayer", category: "Multiplayer", repo: "https://github.com/onedayitwillmake/Realtime-Multiplayer" },
  { id: "pomelo", name: "Pomelo MMO Engine", category: "Multiplayer", repo: "https://github.com/NetEase/pomelo" },
  { id: "io-game", name: "IO Game Starter", category: "Multiplayer", repo: "https://github.com/victorqribeiro/IOGame" },
  { id: "openttd", name: "OpenTTD", category: "Strategy", repo: "https://github.com/OpenTTD/OpenTTD" },
  { id: "freeciv", name: "Freeciv", category: "Strategy", repo: "https://github.com/freeciv/freeciv-web" },
  { id: "hex-empire", name: "Hex Empire", category: "Strategy", repo: "https://github.com/kevinroark/hex-empire" },
  { id: "rts-engine", name: "RTS Engine", category: "Strategy", repo: "https://github.com/mrdoob/three.js" },
  { id: "war-game", name: "War Game", category: "Strategy", repo: "https://github.com/lostdecade/simple-war-game" },
  { id: "doom-js", name: "DOOM JS", category: "Retro", repo: "https://github.com/diwic/doom-js" },
  { id: "wolfenstein", name: "Wolfenstein 3D", category: "Retro", repo: "https://github.com/id-Software/wolf3d" },
  { id: "tetris-classic", name: "Tetris Classic", category: "Retro", repo: "https://github.com/jakesgordon/javascript-tetris" },
  { id: "mario-js", name: "Mario JS", category: "Retro", repo: "https://github.com/martindrapeau/backbone-game-engine" },
  { id: "lode-runner", name: "Lode Runner", category: "Retro", repo: "https://github.com/wayou/lode-runner-js" },
];

const GAMINGOS_WRAPPER = `(function(){
  var badge = document.createElement("div");
  badge.id = "gamingos-badge";
  badge.innerHTML = "⚡GamingOS";
  Object.assign(badge.style, {
    position: "fixed", top: "12px", right: "12px", zIndex: "999999",
    background: "rgba(0,0,0,0.75)", color: "#fff", padding: "6px 14px",
    borderRadius: "20px", fontSize: "13px", fontWeight: "600",
    fontFamily: "-apple-system,sans-serif", letterSpacing: "0.5px",
    backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)",
    cursor: "pointer", userSelect: "none"
  });
  document.body.appendChild(badge);

  var user = (function(){
    try{return JSON.parse(localStorage.getItem("gamingos_user")||"{}")}catch(e){return{}}
  })();
  var API = "/api/game-progression";
  var gameId = location.pathname.split("/")[2];

  function api(path, data){
    return fetch(API+path, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){return r.json()});
  }

  var scoreBtn = document.createElement("div");
  scoreBtn.id = "gamingos-score-btn";
  scoreBtn.innerHTML = "⚡ GamingOS";
  Object.assign(scoreBtn.style, {
    position: "fixed", bottom: "16px", right: "16px", zIndex: "999999",
    background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff",
    border: "none", padding: "10px 20px", borderRadius: "12px",
    fontSize: "14px", fontWeight: "600",
    fontFamily: "-apple-system,sans-serif", boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
    pointerEvents: "none", opacity: "0.9"
  });
  document.body.appendChild(scoreBtn);

  window.GamingOS = {
    submitScore: function(score){
      if(!user.id)return Promise.reject("Not logged in");
      return api("/leaderboard",{gameId:gameId,userId:user.id,score:score});
    },
    toggleFavorite: function(){
      if(!user.id)return Promise.reject("Not logged in");
      return api("/favorites",{userId:user.id,gameId:gameId});
    },
    setRating: function(rating){
      if(!user.id)return Promise.reject("Not logged in");
      return api("/ratings",{userId:user.id,gameId:gameId,rating:rating});
    },
    recordPlay: function(score){
      if(!user.id)return Promise.reject("Not logged in");
      return api("/recently-played",{userId:user.id,gameId:gameId,score:score||0});
    }
  };

  if(user.id) window.GamingOS.recordPlay();
})();
`;

function placeholderHTML(game) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${game.name} - GamingOS</title>
<style>
body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f0f0f;color:#fff;font-family:-apple-system,sans-serif;text-align:center;padding:20px;box-sizing:border-box}
.spinner{width:40px;height:40px;border:3px solid #2a2a2a;border-top-color:#2563eb;border-radius:50%;animation:spin .8s linear infinite;margin-bottom:20px}
@keyframes spin{to{transform:rotate(360deg)}}
h1{font-size:24px;margin:0 0 8px;color:#fff}
p{color:#999;margin:0 0 4px;line-height:1.6;font-size:14px}
.id-badge{font-size:12px;color:#555;margin-top:24px}
.container{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:40px;max-width:480px;width:100%}
.loading-bar{width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;margin-top:20px}
.loading-bar-inner{width:30%;height:100%;background:linear-gradient(90deg,#2563eb,#7c3aed);border-radius:2px;animation:loading 2s ease-in-out infinite}
@keyframes loading{0%,100%{transform:translateX(-100%)}50%{transform:translateX(350%)}}
</style>
</head><body>
<div class="container">
<div class="spinner"></div>
<h1>${game.name}</h1>
<p>Loading game...</p>
<div class="loading-bar"><div class="loading-bar-inner"></div></div>
<div class="id-badge">${game.name}</div>
</div>
<script src="/games/gamingos.js"></script>
</body></html>`;
}

console.log("Setting up game placeholders...");
mkdirSync(PUBLIC_GAMES, { recursive: true });

const wrapperPath = join(PUBLIC_GAMES, "gamingos.js");
writeFileSync(wrapperPath, GAMINGOS_WRAPPER);
console.log("✓ gamingos.js");

let count = 0;
for (const game of GAMES) {
  const dir = join(PUBLIC_GAMES, game.id);
  const indexPath = join(dir, "index.html");
  if (existsSync(indexPath)) {
    count++;
    continue;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(indexPath, placeholderHTML(game));
  count++;
}
console.log(`✓ ${count}/${GAMES.length} game placeholders ready`);
