const fs = require('fs');
const lines = fs.readFileSync('src/app/pages/dashboard/dashboard.html', 'utf8').split('\n');
let newLines = [];
let inMain = false;
let inModals = false;

newLines.push('<div class="p-6 h-full flex flex-col">');

for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('<!-- Location Breadcrumb or Banner -->')) {
    inMain = true;
  }
  if (inMain && lines[i].includes('</main>')) {
    inMain = false;
  }
  if (inMain) newLines.push(lines[i]);
  
  if (lines[i].includes('<!-- Event Detail / Update Status Modal -->')) {
    inModals = true;
    newLines.push('</div>'); // close the p-6 div
  }
  if (inModals) newLines.push(lines[i]);
}

fs.writeFileSync('src/app/pages/dashboard/dashboard.html', newLines.join('\n'));
console.log('Done rewriting dashboard.html');
