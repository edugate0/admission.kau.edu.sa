#!/bin/bash
echo "Starting KAU payment server..."
cd "$(dirname "$0")"
npm install
node payment.js