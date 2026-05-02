#!/bin/bash
cd "$(dirname "$0")"
echo "Starting server at http://127.0.0.1:5500"
echo "Your portfolio will open in the browser. Keep this window open."
echo ""
open "http://127.0.0.1:5500"
python3 -m http.server 5500 --bind 127.0.0.1
