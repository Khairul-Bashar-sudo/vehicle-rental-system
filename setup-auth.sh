#!/bin/bash

# Quick Setup Script for Authentication System

echo "🔐 Setting up Authentication System..."
echo "======================================"
echo ""

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Yarn not found. Using npm instead..."
    PKG_MGR="npm"
    INSTALL_CMD="npm install"
else
    PKG_MGR="yarn"
    INSTALL_CMD="yarn install"
fi

echo "Step 1: Installing dependencies..."
echo "Running: $INSTALL_CMD"
$INSTALL_CMD

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Generate NEXTAUTH_SECRET if not exists
if ! grep -q "NEXTAUTH_SECRET" .env.local 2>/dev/null; then
    echo "Step 2: Generating NEXTAUTH_SECRET..."
    
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
    else
        SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    fi
    
    echo "" >> .env.local
    echo "# NextAuth Configuration" >> .env.local
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
    echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
    
    echo "✅ NEXTAUTH_SECRET generated and added to .env.local"
else
    echo "✅ NEXTAUTH_SECRET already exists in .env.local"
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo "   $PKG_MGR dev"
echo ""
echo "2. Initialize the database:"
echo "   - Go to http://localhost:3000/admin"
echo "   - Login and click 'Initialize Database'"
echo "   - This will create the users table"
echo ""
echo "3. Test authentication:"
echo "   - Visit http://localhost:3000/signup"
echo "   - Create a test account"
echo "   - Login at http://localhost:3000/login"
echo "   - Try booking a vehicle!"
echo ""
echo "📚 Documentation:"
echo "   - AUTHENTICATION_SETUP.md - Full guide"
echo "   - AUTH_IMPLEMENTATION_SUMMARY.md - Overview"
echo ""
echo "Happy coding! 🚀"
