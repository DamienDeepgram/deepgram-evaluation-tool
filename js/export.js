// Handle Export Data button
document.getElementById('export-btn').addEventListener('click', function() {
    const data = hot.getData();
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepgram-evaluation-data.json';
    a.click();
    URL.revokeObjectURL(url); // Clean up the URL object
  });
  
  // Handle Load Data button
  document.getElementById('load-btn').addEventListener('click', function() {
    document.getElementById('load-input').click();
  });
  
  document.getElementById('load-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function(e) {
      const jsonData = JSON.parse(e.target.result);
      hot.loadData(jsonData);
      localStorage.setItem("spreadsheetData", JSON.stringify(jsonData)); // Save loaded data to localStorage
    };
    reader.readAsText(file);
  });
  
  // Function to compress data using gzip
function compressData(data) {
    const compressed = pako.gzip(data);
    return btoa(String.fromCharCode.apply(null, compressed));
  }
  
  // Function to decompress data using gzip
  function decompressData(compressedData) {
    const strData = atob(compressedData);
    const charData = strData.split('').map(x => x.charCodeAt(0));
    const binData = new Uint8Array(charData);
    const decompressed = pako.inflate(binData);
    return new TextDecoder().decode(decompressed);
  }
  // Create a database for storing spreadsheet data
async function openDB() {
    return await idb.openDB('SpreadsheetDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dataStore')) {
          db.createObjectStore('dataStore');
        }
      }
    });
  }
  
  // Save data to IndexedDB
  async function saveToIndexedDB(data) {
    const db = await openDB();
    const tx = db.transaction('dataStore', 'readwrite');
    tx.objectStore('dataStore').put(data, 'spreadsheetData');
    await tx.done;
  }
  
  // Load data from IndexedDB
  async function loadFromIndexedDB() {
    const db = await openDB();
    return await db.get('dataStore', 'spreadsheetData');
  }
  
  // Use IndexedDB in place of localStorage
  async function saveData() {
    const data = hot.getData(); // Get the current table data
  
    const settings = { columnWidths }; // Create a settings object that can store more settings later
  
    const jsonData = JSON.stringify({ data, settings }); // Store both data and settings
  
    try {
      const db = await openDB(); // Open the IndexedDB database
      const tx = db.transaction('dataStore', 'readwrite');
      tx.objectStore('dataStore').put(jsonData, 'spreadsheetData'); // Store data and settings in IndexedDB
      await tx.done; // Wait for transaction to complete
    } catch (e) {
      console.error('Error saving data to IndexedDB:', e);
    }
  }
  
  
  async function getInitialData() {
    const storedData = await loadFromIndexedDB();
    const additionalEmptyRows = Array.from({ length: 100 }, () => ["", "", "", "", "", "", ""]); // 100 additional empty rows
  
    if (storedData) {
      let { data, settings } = JSON.parse(storedData); // Parse stored data and settings
      if(!data || !settings){
        data = JSON.parse(storedData);
        settings = {columnWidths: [320, 250, 250, 250, 250, 250, 250]};
      }
      const newRows = data.concat(additionalEmptyRows); // Combine stored data with additional empty rows
  
      return { data: newRows, settings }; // Return combined rows and settings
    } else {
      return {
        data: [...additionalEmptyRows], // Only empty rows if no stored data
        settings: { columnWidths: [320, 250, 250, 250, 250, 250, 250] } // Default settings with empty colWidths
      };
    }
  }
  