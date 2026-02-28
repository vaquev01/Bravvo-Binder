#!/bin/bash

echo "🔍 Probing environment..."

# Try standard NVM location
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  echo "✅ Found nvm.sh, sourcing..."
  . "$NVM_DIR/nvm.sh"
else
  echo "⚠️ nvm.sh not found in default location"
fi

# Try finding node directly if nvm failing
if ! command -v npm &> /dev/null; then
    echo "🔍 Searching for node binaries..."
    # Look for node in common nvm versions
    POSSIBLE_NODE=$(ls -d $HOME/.nvm/versions/node/v20* 2>/dev/null | head -n 1)
    if [ ! -z "$POSSIBLE_NODE" ]; then
        echo "✅ Found Node at: $POSSIBLE_NODE"
        export PATH="$POSSIBLE_NODE/bin:$PATH"
    else
        POSSIBLE_NODE_18=$(ls -d $HOME/.nvm/versions/node/v18* 2>/dev/null | head -n 1)
        if [ ! -z "$POSSIBLE_NODE_18" ]; then
             echo "✅ Found Node at: $POSSIBLE_NODE_18"
             export PATH="$POSSIBLE_NODE_18/bin:$PATH"
        fi
    fi
fi

if command -v npm &> /dev/null; then
    echo "🚀 NPM found: $(which npm)"
    echo "📦 Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        echo "🚀 Deploying..."
        npm run deploy
        if [ $? -eq 0 ]; then
             echo "✅ Deploy successful!"
        else
             echo "❌ Deploy failed"
             exit 1
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
else
    echo "❌ NPM still not found. Cannot build."
    echo "Environment PATH: $PATH"
    exit 127
fi
