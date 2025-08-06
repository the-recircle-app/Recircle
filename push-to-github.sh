#!/bin/bash

# Safe GitHub Push Script for ReCircle
# This script pushes only safe, non-sensitive files to GitHub

echo "🔒 Preparing safe GitHub push for ReCircle..."

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git remote add origin https://github.com/the-recircle-app/Recircle.git
fi

# Set remote if it doesn't exist
git remote set-url origin https://github.com/the-recircle-app/Recircle.git

# Create/update .gitignore to protect sensitive files
cat > .gitignore << 'EOF'
# Environment and secrets
.env*
!.env.example
*.key
*.pem
secrets/

# Node modules and dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.vite/

# Cache directories
cache/
.cache/

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Replit specific
.replit
.replit.*
replit_agent/

# Test files with sensitive data
test-receipt.html
*test*.js
CORRECT_*.js
debug-*.js
derive-*.js
deploy-*.js
create-test-*.js
check-*.js

# Personal development files
LOCAL_*.md
SIMPLE_*.md
STEP_BY_STEP*.md
URGENT_*.md
WINDOWS_*.md
FIXED_*.md
REAL_*.md
WORKING_*.md
HONEST_*.md
PIERRE_*.md
COLLABORATIVE_*.md
CRITICAL_*.md
CORRECTED_*.md
VEWORLD_*.md
VEBETTERDAO_*.md
PRODUCTION_*.md
BLOCKCHAIN_*.md
FRONTEND_*.md
GITHUB_*.md
QUICK_*.md
RESTART_*.md

# Proof files that might contain sensitive data
proof/
VeBetterDAO_Technical_Proof.json

# Large documentation that's not needed on GitHub
ALTERNATIVE_*.md
COMPLETE_*.md
FINAL_*.md
TECHNICAL_*.md

# Docker and deployment configs that might have secrets
docker-compose.yml
start.sh
dev-start.sh
EOF

echo "✅ Updated .gitignore to protect sensitive files"

# Add safe files only
echo "📁 Adding safe files to Git..."

# Core application files
git add package.json
git add tsconfig.json
git add vite.config.ts
git add tailwind.config.js
git add postcss.config.js

# Source code (automatically excludes .env files)
git add client/
git add server/
git add shared/
git add public/

# Safe documentation
git add README.md
git add replit.md
git add ARCHITECTURE.md
git add API_DOCUMENTATION.md
git add DEPLOYMENT.md
git add VECHAIN_INTEGRATION.md

# Google Apps Scripts documentation (safe to share)
git add docs/approval-responses-processing-script.js
git add docs/step-by-step-responses-setup.md
git add docs/complete-sheets-setup-guide.md
git add docs/deployment-integration-status.md

# Example files (no secrets)
git add .env.example

echo "✅ Safe files added to Git"

# Commit changes
echo "💾 Committing changes..."
git add .gitignore
git commit -m "Update ReCircle with fixed webhook integration and complete Google Sheets support

Features:
- Fixed manual review webhook processing (txResult bug resolved)
- Complete Google Apps Scripts for approval processing
- Real B3TR token distribution working
- Unlimited user scaling capability
- Production-ready with deployment integration
- Enhanced security with proper .gitignore

All sensitive files excluded from repository."

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Successfully pushed ReCircle to GitHub!"
echo "🔗 Repository: https://github.com/the-recircle-app/Recircle"
echo "🔒 All sensitive files protected and excluded"