const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'app', 'api'), function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("'Access-Control-Allow-Origin': '*'")) {
      content = content.replace(/'Access-Control-Allow-Origin': '\*'/g, "'Access-Control-Allow-Origin': 'http://localhost:4200'");
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
