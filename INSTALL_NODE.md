# Installing Node.js

To run this Next.js application, you need Node.js and npm installed on your system.

## Option 1: Install via Homebrew (Recommended for macOS)

1. Install Homebrew (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node.js:
   ```bash
   brew install node
   ```

3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Option 2: Install via Official Installer

1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version for macOS
3. Run the installer and follow the instructions
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Option 3: Install via nvm (Node Version Manager)

1. Install nvm:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Restart your terminal or run:
   ```bash
   source ~/.bashrc
   # or
   source ~/.zshrc
   ```

3. Install Node.js LTS:
   ```bash
   nvm install --lts
   nvm use --lts
   ```

4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## After Installation

Once Node.js is installed, you can proceed with:

```bash
cd /Users/bob/Desktop/ABM_Valuation
npm install
npm run dev
```

The app will be available at http://localhost:3000
