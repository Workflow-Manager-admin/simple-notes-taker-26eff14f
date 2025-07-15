#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-notes-taker-26eff14f/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

