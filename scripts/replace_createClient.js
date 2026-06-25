const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('src/app/admin');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('createClient()')) {
        content = content.replace(/createClient\(\)/g, 'createClient(true)');
        fs.writeFileSync(file, content);
        changed++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Done. Changed ${changed} files.`);
