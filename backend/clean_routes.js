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
    
    // Remove corsHeaders function and OPTIONS function
    content = content.replace(/function corsHeaders\(\) \{[\s\S]*?\}\s*/, '');
    content = content.replace(/export async function OPTIONS\(\) \{[\s\S]*?\}\s*/, '');
    
    // Remove headers: corsHeaders() from responses
    content = content.replace(/,\s*headers:\s*corsHeaders\(\)/g, '');
    content = content.replace(/headers:\s*corsHeaders\(\)/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log('Cleaned', filePath);
  }
});
