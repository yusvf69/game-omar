#!/bin/bash
set -e

GAMES_DIR="/Users/youssefmohamed/Downloads/Game-Library-Manager/artifacts/gaming-os/public/games"
mkdir -p "$GAMES_DIR"

TMPFILE=$(mktemp)
cat > "$TMPFILE" << 'EOF'
2048|gabrielecirulli/2048|master
hextris|Hextris/hextris|master
minesweeper|donaldali/JS-Minesweeper|master
sudoku|dachev/sudoku|master
tetris|ganlvtech/tetris|master
2048-ai|ovolve/2048-AI|master
samegame|skratchdot/samegame|master
blockrain|Aerolab/blockrain.js|master
lights-out|jonhoo/lights-out|master
nonogram|ramesaliyev/nonogram|master
floppy-bird|nebez/floppybird|master
clumsy-bird|ellisonleao/clumsy-bird|master
t-rex-runner|wayou/t-rex-runner|master
pacman|daleharvey/pacman|master
pong|brenopolanski/pong-game|master
asteroids|16bitlolz/asteroids-js|master
space-invaders|straker/space-invaders|main
breakout|cykod/Quintus|master
arkanoid|ericdouglas/Arkanoid-JS|master
hexgl|BKcore/HexGL|master
racer|ondras/racer|master
drift|darsain/drift|master
zombie-survival|jakesgordon/javascript-zombies|master
tank-game|lostdecade/simple-tanks|master
war-game|lostdecade/simple-war-game|master
tetris-classic|jakesgordon/javascript-tetris|master
lode-runner|wayou/lode-runner-js|master
car-game|Chalarangelo/car-game|master
2d-shooter|chriscourses/2d-shooter|master
space-shooter|ehsangazar/space-shooter|master
alien-invasion|learncodeacademy/alien-invasion|master
tiny-platformer|michaelvillar/tiny-platformer|master
battle-city|chriscourses/battle-city-js|master
snake|trekhleb/javascript-algorithms|master
EOF

TOTAL=$(wc -l < "$TMPFILE" | tr -d ' ')
COUNT=0
SUCCESS=0

echo "Downloading games..."

while IFS='|' read -r id repo branch; do
  [ -z "$id" ] && continue
  COUNT=$((COUNT + 1))
  TARGET="$GAMES_DIR/$id"
  INDEX="$TARGET/index.html"
  
  mkdir -p "$TARGET"
  
  if [ -f "$INDEX" ]; then
    printf "  [%02d/%02d] ✓ %s (exists)\n" "$COUNT" "$TOTAL" "$id"
    SUCCESS=$((SUCCESS + 1))
    continue
  fi
  
  printf "  [%02d/%02d] %s ... " "$COUNT" "$TOTAL" "$id"
  
  DOWNLOADED=false
  for path in "index.html" "public/index.html" "src/index.html" "app/index.html" "docs/index.html" "example/index.html" "examples/index.html" "game/index.html" "client/index.html"; do
    URL="https://raw.githubusercontent.com/$repo/$branch/$path"
    if curl -sfL "$URL" -o "$INDEX" 2>/dev/null; then
      DOWNLOADED=true
      break
    fi
  done
  
  if [ "$DOWNLOADED" = true ]; then
    echo "✓"
    SUCCESS=$((SUCCESS + 1))
  else
    PLACEHOLDER_PATH="$TARGET/index.html"
    cat > "$PLACEHOLDER_PATH" << PLACE
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>$id</title>
<style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0f0f0f;color:#fff;font-family:-apple-system,sans-serif;text-align:center;padding:20px}
a{color:#6cf}.btn{display:inline-block;margin-top:16px;padding:10px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}</style>
</head><body>
<div>
<h1>$id</h1>
<p>Game files not available for embedding.</p>
<a class="btn" href="https://github.com/$repo" target="_top">View on GitHub</a>
</div>
</body></html>
PLACE
    echo "✗ (placeholder)"
  fi
done < "$TMPFILE"

rm -f "$TMPFILE"
echo ""
echo "Done! $SUCCESS/$TOTAL games ready"
