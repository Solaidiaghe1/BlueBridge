#!/bin/bash

# Script to start Expo with proper file watcher configuration
# This avoids the "EMFILE: too many open files" error

echo "🚀 Starting BlueBridge Expo Server..."
echo ""

# Set environment variables to reduce file watching
export EXPO_NO_DOTENV=1
export WATCHMAN_BINARY_PATH=$(which watchman)

# Kill any existing Metro/Expo processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

sleep 2

echo "✅ Starting with reduced file watching..."
echo ""

# Start Expo with minimal file watching
npx expo start --max-workers 2
