#!/bin/bash

echo "Starting BLUEBOT-MD environment fix..."

# Remove existing sharp and wa-sticker-formatter to ensure a clean reinstall
echo "Cleaning up existing problematic modules..."
rm -rf node_modules/sharp
rm -rf node_modules/wa-sticker-formatter

# Force install sharp for the correct platform
echo "Installing sharp for Linux x64..."
npm install --platform=linux --arch=x64 sharp@0.32.6

# Reinstall wa-sticker-formatter
echo "Reinstalling wa-sticker-formatter..."
npm install wa-sticker-formatter

echo "Environment fix complete. Starting the bot..."
node index.js
