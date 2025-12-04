#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks that both frontend and backend can build successfully
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function checkFile(path, description) {
    if (existsSync(path)) {
        log(`✓ ${description} exists`, colors.green);
        return true;
    } else {
        log(`✗ ${description} missing`, colors.red);
        return false;
    }
}

async function verifyDeployment() {
    log('\n🔍 Starting pre-deployment verification...\n', colors.blue);

    let hasErrors = false;

    // Check required files
    log('📁 Checking required files...', colors.yellow);
    hasErrors = !checkFile('.env.example', 'Frontend .env.example') || hasErrors;
    hasErrors = !checkFile('server/.env.example', 'Backend .env.example') || hasErrors;
    hasErrors = !checkFile('render.yaml', 'render.yaml') || hasErrors;
    hasErrors = !checkFile('DEPLOYMENT.md', 'DEPLOYMENT.md') || hasErrors;

    // Check gitignore
    log('\n📝 Checking .gitignore files...', colors.yellow);
    hasErrors = !checkFile('.gitignore', 'Root .gitignore') || hasErrors;
    hasErrors = !checkFile('server/.gitignore', 'Server .gitignore') || hasErrors;

    // Build frontend
    log('\n🏗️  Building frontend...', colors.yellow);
    try {
        execSync('npm run build', { stdio: 'inherit' });
        log('✓ Frontend build successful', colors.green);
    } catch (error) {
        log('✗ Frontend build failed', colors.red);
        hasErrors = true;
    }

    // Build backend
    log('\n🏗️  Building backend...', colors.yellow);
    try {
        execSync('cd server && npm run build', { stdio: 'inherit', shell: true });
        log('✓ Backend build successful', colors.green);
    } catch (error) {
        log('✗ Backend build failed', colors.red);
        hasErrors = true;
    }

    // Check for .env files in git
    log('\n🔒 Checking for sensitive files...', colors.yellow);
    try {
        const gitFiles = execSync('git ls-files', { encoding: 'utf8' });
        if (gitFiles.includes('.env') && !gitFiles.includes('.env.example')) {
            log('⚠️  Warning: .env file might be tracked by git', colors.yellow);
            log('   Make sure .env is in .gitignore', colors.yellow);
        } else {
            log('✓ No sensitive files tracked', colors.green);
        }
    } catch (error) {
        log('⚠️  Could not check git files (not a git repo?)', colors.yellow);
    }

    // Summary
    log('\n' + '='.repeat(50), colors.blue);
    if (hasErrors) {
        log('❌ Verification FAILED - Please fix the errors above', colors.red);
        process.exit(1);
    } else {
        log('✅ Verification PASSED - Ready for deployment!', colors.green);
        log('\nNext steps:', colors.blue);
        log('1. Commit your changes: git add . && git commit -m "Ready for deployment"');
        log('2. Push to GitHub: git push origin main');
        log('3. Deploy on Render following DEPLOYMENT.md');
    }
    log('='.repeat(50) + '\n', colors.blue);
}

verifyDeployment().catch(error => {
    log(`\n❌ Verification failed with error: ${error.message}`, colors.red);
    process.exit(1);
});
