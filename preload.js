// Import the necessary Electron components.
const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

// White-listed channels.
const windowapi = {
    'render': {
        // From render to main.js (whitelisted ids)
        'send': [
            'window:minimize',
            'window:maximize',
            'window:restore',
            'window:close',
            'data-from-renderer',
            'turn-off',
        ],
        // From main to render.
        'receive': [],
        // From render to main and back again.
        'sendReceive': [],
    }
};

// Exposed protected methods in main.js
contextBridge.exposeInMainWorld(
    // Allowed 'ipcRenderer' methods.
    'ipcR', {
        // From render to main.
        send: (channel, args) => {
            let validChannels = windowapi.render.send;
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        // From main to render.
        receive: (channel, listener) => {
            let validChannels = windowapi.render.receive;
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender`.
                ipcRenderer.on(channel, (event, ...args) => listener(...args));
            }
        },
        // From render to main and back again.
        invoke: (channel, args) => {
            let validChannels = windowapi.render.sendReceive;
            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        },
        scan: (data) => {
            ipcRenderer.send('data-from-renderer', data);
          },
        endscan: () => {
            ipcRenderer.send('turn-off');
        }
    }
);