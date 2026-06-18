const fs = require('fs');
const path = require('path');

const helper = `\nexport async function runAction<T>(actionPromise: Promise<T>): Promise<T> {\n  const result = await actionPromise;\n  if (result && typeof result === 'object' && '__error' in result) {\n    throw new Error(result.__error as string);\n  }\n  return result;\n}\n`;

if (!fs.readFileSync('src/lib/utils.ts', 'utf-8').includes('runAction')) {
  fs.appendFileSync('src/lib/utils.ts', helper);
}

const dir = 'src/app/(dashboard)';
const folders = fs.readdirSync(dir);

folders.forEach(folder => {
  const pagePath = path.join(dir, folder, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');
    
    // Add import if not exists
    if (!content.includes('runAction')) {
      content = content.replace(/import .* from [\"\']lucide-react[\"\']/, match => match + '\nimport { runAction } from \"@/lib/utils\"');
    }

    // List of all our actions to wrap
    const actions = [
      'getSistemas', 'getSistemaById', 'updateSistema', 'updateSistemaStatus', 'deleteSistema', 'createSistema', 'getClienteByEmail',
      'getSensores', 'getSensorInfo', 'updateSensorStatus', 'deleteSensor', 'desvincularSensor', 'createSensor', 'createSensorSync',
      'getClientes', 'getClienteById', 'updateCliente', 'deleteCliente'
    ];
    
    actions.forEach(action => {
      // Regex to find await action(...)
      // We want to avoid wrapping if it's already wrapped
      const regex = new RegExp(`await (?!(?:runAction\\())(${action}\\([^\\n]*?\\))`, 'g');
      content = content.replace(regex, 'await runAction($1)');
    });
    
    fs.writeFileSync(pagePath, content);
  }
});

// Also check src/app/login/page.tsx just in case
const loginPath = 'src/app/login/page.tsx';
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf-8');
  if (!content.includes('runAction')) {
    if (content.includes('import {') && content.includes('@/actions/')) {
       // login might not have lucide-react, so just prepend to top if needed, but wait it doesn't matter much if login doesn't have it.
       // Actually login doesn't have lucide-react. Let's append after use client
       content = content.replace(/['"]use client['"];?/, match => match + '\nimport { runAction } from \"@/lib/utils\"');
       const regex = new RegExp(`await (?!(?:runAction\\())((login)\\([^\\n]*?\\))`, 'g');
       // if we have login action, wait login action wasn't in the list
    }
  }
}

console.log('Pages updated!');
