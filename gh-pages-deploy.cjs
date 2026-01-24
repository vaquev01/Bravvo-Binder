const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const username = process.argv[2];
const token = process.argv[3];

if (!username || !token) {
    console.error('Usage: node gh-pages-deploy.cjs <username> <token>');
    process.exit(1);
}

const distDir = path.join(__dirname, 'dist');
const repoUrl = `https://github.com/${username}/BravvoOS-AG.git`;

async function deploy() {
    console.log('📦 Deploying to GitHub Pages...');

    // Clone gh-pages branch or create it
    const tempDir = path.join(__dirname, '.gh-pages-temp');

    // Clean temp dir if exists
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir);

    try {
        // Initialize git repo
        await git.init({ fs, dir: tempDir });

        // Add remote
        await git.addRemote({
            fs,
            dir: tempDir,
            remote: 'origin',
            url: repoUrl
        });

        // Copy dist contents to temp dir
        const files = fs.readdirSync(distDir);
        for (const file of files) {
            const src = path.join(distDir, file);
            const dest = path.join(tempDir, file);
            if (fs.statSync(src).isDirectory()) {
                fs.cpSync(src, dest, { recursive: true });
            } else {
                fs.copyFileSync(src, dest);
            }
        }

        // Add .nojekyll for GitHub Pages
        fs.writeFileSync(path.join(tempDir, '.nojekyll'), '');

        // Create 404.html for SPA routing
        fs.copyFileSync(
            path.join(tempDir, 'index.html'),
            path.join(tempDir, '404.html')
        );

        // Stage all files
        await git.add({ fs, dir: tempDir, filepath: '.' });

        // Commit
        await git.commit({
            fs,
            dir: tempDir,
            message: 'Deploy to GitHub Pages',
            author: {
                name: username,
                email: `${username}@users.noreply.github.com`
            }
        });

        // Push to gh-pages branch
        console.log('🚀 Pushing to gh-pages branch...');
        await git.push({
            fs,
            http,
            dir: tempDir,
            remote: 'origin',
            ref: 'master',
            remoteRef: 'gh-pages',
            force: true,
            onAuth: () => ({ username, password: token })
        });

        console.log('✅ Deployed successfully!');
        console.log(`🌐 Your site will be available at: https://${username}.github.io/BravvoOS-AG/`);

        // Clean up
        fs.rmSync(tempDir, { recursive: true, force: true });

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        // Clean up on error
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        process.exit(1);
    }
}

deploy();
