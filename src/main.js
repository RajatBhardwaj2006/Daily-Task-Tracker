const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const dataFile = () => path.join(app.getPath('userData'), 'tracker-data.json');

const defaultData = {
  settings: {
    startDate: '2026-01-01',
    endDate: '2027-12-31'
  },
  tasks: [],
  days: {}
};

function readData() {
  try {
    const file = dataFile();
    if (!fs.existsSync(file)) return defaultData;
    return { ...defaultData, ...JSON.parse(fs.readFileSync(file, 'utf8')) };
  } catch (e) {
    return defaultData;
  }
}

function writeData(data) {
  const dir = path.dirname(dataFile());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dataFile(), JSON.stringify(data, null, 2), 'utf8');
  return data;
}

function createWindow() {
  win = new BrowserWindow({
    width: 1380,
    height: 900,
    minWidth: 1050,
    minHeight: 720,
    backgroundColor: '#0b0f14',
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    title: 'Daily Task Tracker',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('data:load', () => readData());
  ipcMain.handle('data:save', (_, data) => writeData(data));
  ipcMain.handle('data:export', async (_, data) => {
    const result = await dialog.showSaveDialog(win, {
      title: 'Export tracker backup',
      defaultPath: `daily-task-tracker-${new Date().toISOString().slice(0,10)}.json`,
      filters: [{ name: 'Tracker JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf8');
    return { canceled: false, filePath: result.filePath };
  });
  ipcMain.handle('data:import', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Import tracker backup',
      properties: ['openFile'],
      filters: [{ name: 'Tracker JSON', extensions: ['json'] }]
    });
    if (result.canceled || !result.filePaths[0]) return { canceled: true };
    try {
      const imported = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
      writeData(imported);
      return { canceled: false, data: imported };
    } catch (e) {
      return { canceled: false, error: 'That file is not a valid tracker backup.' };
    }
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
