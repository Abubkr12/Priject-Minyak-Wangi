const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetHtml1 = `<span className="brand-mark">EP</span>
          <div>
            <div className="brand-name">Ela Parfum</div>
            <div className="brand-sub">Checkout Aman</div>
          </div>`;
          
const targetHtml2 = `<span className="brand-mark">EP</span>
          <div>
            <div className="brand-name">Ela Parfum</div>
            <div className="brand-sub">Parfum Isi Ulang</div>
          </div>`;
          
const targetHtml3 = `<span className="brand-mark">N</span>
          <div>
            <div className="brand-name">Ela Parfum</div>
            <div className="brand-sub">Parfum Isi Ulang</div>
          </div>`;

const targetHtml4 = `<span className="brand-mark">N</span><div><div className="brand-name">Ela Parfum</div><div className="brand-sub">Parfum Isi Ulang</div></div>`;

const replacementHtml = `<img src="/assets/Ela Parfum.svg" alt="Ela Parfum Logo" style={{ height: "40px", width: "auto" }} />`;

walkDir('./src/app', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace blocks by regex to handle varying whitespace
    const regex1 = /<span\s+className="brand-mark">.*?<\/span>\s*<div.*?>\s*<div\s+className="brand-name">Ela\s+Parfum<\/div>\s*<div\s+className="brand-sub">.*?<\/div>\s*<\/div>/gs;
    
    content = content.replace(regex1, replacementHtml);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
