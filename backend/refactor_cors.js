const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const apiDir = path.join(__dirname, 'app', 'api');

walkDir(apiDir, function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Remove the function corsHeaders() { ... } block
    content = content.replace(/function corsHeaders\(\)\s*\{[\s\S]*?\n\}\n*/, '');
    
    if (content !== original) {
      // If we removed it, it means the file was using it (or defining it).
      // Let's add the import at the top.
      if (!content.includes('import { corsHeaders } from \'@/lib/cors\'')) {
        content = "import { corsHeaders } from '@/lib/cors';\n" + content;
      }
      fs.writeFileSync(filePath, content);
      console.log('Refactored', filePath);
    }
  }
});
