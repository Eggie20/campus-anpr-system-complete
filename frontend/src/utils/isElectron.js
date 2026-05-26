/**
 * Detect if the app is running inside Electron.
 * Uses the preload script's contextBridge exposure.
 */
export const isElectron = () => {
  return !!(
    typeof window !== 'undefined' &&
    window.electronAPI?.isElectron
  );
};

export default isElectron;
