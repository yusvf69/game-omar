#!/bin/bash
# Download full game repos from GitHub archives

GAMES_DIR="/Users/youssefmohamed/Downloads/Game-Library-Manager/artifacts/gaming-os/public/games"

# Games that need their full assets downloaded (non-placeholder, > 1000 bytes)
# Format: id:gh-repo:branch
GAMES="
2048:gabrielecirulli/2048:master
2048-ai:ovolve/2048-AI:master
blockrain:Aerolab/blockrain.js:master
clumsy-bird:ellisonleao/clumsy-bird:master
floppy-bird:nebez/floppybird:master
hexgl:BKcore/HexGL:master
hextris:Hextris/hextris:master
pacman:daleharvey/pacman:master
t-rex-runner:wayou/t-rex-runner:master
tetris-classic:jakesgordon/javascript-tetris:master
"

for LINE in $GAMES; do
  [ -z "$LINE" ] && continue
  ID=$(echo "$LINE" | cut -d: -f1)
  REPO=$(echo "$LINE" | cut -d: -f2)
  BRANCH=$(echo "$LINE" | cut -d: -f3)
  
  TARGET="$GAMES_DIR/$ID"
  INDEX="$TARGET/index.html"
  
  # Skip if index.html is a placeholder (small)
  if [ ! -f "$INDEX" ]; then
    echo "✗ $ID: no index.html"
    continue
  fi
  
  SIZE=$(wc -c < "$INDEX" | tr -d ' ')
  if [ "$SIZE" -lt 1000 ]; then
    echo "  $ID: placeholder, skipping full download"
    continue
  fi
  
  echo "  $ID: downloading full repo ($REPO)..."
  
  # Download the repo archive
  ARCHIVE_URL="https://github.com/$REPO/archive/refs/heads/$BRANCH.zip"
  TMP_ZIP="/tmp/game-$ID.zip"
  TMP_DIR="/tmp/game-$ID-extract"
  
  rm -rf "$TMP_ZIP" "$TMP_DIR" 2>/dev/null
  
  if curl -sfL "$ARCHIVE_URL" -o "$TMP_ZIP" 2>/dev/null; then
    mkdir -p "$TMP_DIR"
    unzip -o "$TMP_ZIP" -d "$TMP_DIR" > /dev/null 2>&1
    
    # Find the root of the extracted repo (first subdirectory)
    EXTRACTED_ROOT=$(ls -d "$TMP_DIR"/*/ 2>/dev/null | head -1)
    
    if [ -n "$EXTRACTED_ROOT" ] && [ -d "$EXTRACTED_ROOT" ]; then
      # Copy all files into the game directory
      cp -r "${EXTRACTED_ROOT}"* "$TARGET/"
      
      # Count files
      FILE_COUNT=$(find "$TARGET" -type f 2>/dev/null | wc -l | tr -d ' ')
      echo "    ✓ $ID: $FILE_COUNT files extracted"
    else
      echo "    ✗ $ID: could not find extracted root"
    fi
    
    rm -rf "$TMP_ZIP" "$TMP_DIR"
  else
    echo "    ✗ $ID: failed to download archive"
  fi
done

echo ""
echo "Done!"
