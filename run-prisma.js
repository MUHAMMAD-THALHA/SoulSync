const { spawn } = require('child_process');
const path = require('path');

const prismaPath = path.join(__dirname, 'node_modules', '.bin', 'prisma.cmd');
const child = spawn(prismaPath, ['generate'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
});

child.on('close', (code) => {
    console.log(`Prisma generate exited with code ${code}`);
    if (code === 0) {
        const push = spawn(prismaPath, ['db', 'push', '--accept-data-loss'], {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });
        push.on('close', (pCode) => {
            console.log(`Prisma db push exited with code ${pCode}`);
        });
    }
});
