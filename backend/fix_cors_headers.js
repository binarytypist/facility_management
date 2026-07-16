const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {

  if (!fs.existsSync(dir)) {
    console.log('Directory not found:', dir);
    return;
  }

  fs.readdirSync(dir).forEach(file => {

    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, callback);
    } 
    else {
      callback(filePath);
    }

  });
}


walkDir(
  path.join(__dirname, 'app', 'api'),
  filePath => {

    if (path.basename(filePath) !== 'route.ts') {
      return;
    }


    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;


    content = content.replace(
      /(['"])Access-Control-Allow-Headers\1:\s*(['"])Content-Type\2/g,
      `$1Access-Control-Allow-Headers$1: $2Content-Type, Authorization$2`
    );


    if (content !== original) {

      fs.writeFileSync(
        filePath + '.backup',
        original
      );

      fs.writeFileSync(
        filePath,
        content
      );

      console.log('Fixed headers in:', filePath);
    }

  }
);
