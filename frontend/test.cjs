console.log('Is Electron:', !!process.versions.electron);
console.log('Electron Version:', process.versions.electron);
console.log('Process Type:', process.type);
console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);

try {
  const electronAPI = require('electron');
  console.log('typeof electronAPI.app:', typeof electronAPI.app);
} catch (e) {
  console.error('require error:', e.message);
}

try {
  import('electron').then(mod => {
    console.log('typeof import.app:', typeof mod.app);
    console.log('import default:', typeof mod.default);
  }).catch(e => {
    console.error('import error:', e.message);
  });
} catch (e) {
  console.error('dynamic import error:', e.message);
}

setTimeout(() => process.exit(0), 1000);
