const fs = require('fs');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

async function main() {
    const dir = process.cwd();

    console.log('Initializing git repository...');
    await git.init({ fs, dir });

    console.log('Adding remote origin...');
    await git.addRemote({
        fs,
        dir,
        remote: 'origin',
        url: 'https://github.com/viniciusguardaa-cpu/BravvoOS-AG.git'
    });

    console.log('Adding all files...');
    await git.add({ fs, dir, filepath: '.' });

    console.log('Committing...');
    await git.commit({
        fs,
        dir,
        message: 'Initial commit - Bravvo OS',
        author: {
            name: 'Bravvo Team',
            email: 'team@bravvo.com'
        }
    });

    console.log('Pushing to GitHub...');
    console.log('You will need to authenticate. Please enter your GitHub username and personal access token.');

    const username = process.argv[2];
    const token = process.argv[3];

    if (!username || !token) {
        console.error('Usage: node git-push.js <github-username> <github-token>');
        process.exit(1);
    }

    await git.push({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: 'master',
        onAuth: () => ({ username, password: token }),
        force: true
    });

    console.log('✅ Successfully pushed to GitHub!');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
