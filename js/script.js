// Initialize Handsontable
const container = document.getElementById('spreadsheet');
let hot; // Declare 'hot' before it's initialized

document.addEventListener("DOMContentLoaded", () => {
  hot = new Handsontable(container, {
    data: getInitialData(), // Initialize with data from local storage plus 100 empty rows
    colHeaders: [
      "Audio Recorder", 
      "API Params", 
      "Deepgram Batch", 
      "Deepgram Streaming", 
      "Truth Transcript", 
      "Comments", 
      "Notes"
    ],
    columns: [
      { readOnly: true, renderer: customRenderer, width: 320 }, // Fixed width of 320px for the first column
      { editor: 'text' }, // API Params
      { editor: 'text' }, // Deepgram Batch column (read-only)
      { editor: 'text' }, // Deepgram Streaming column (read-only)
      { editor: 'text' }, // Truth Transcript
      { editor: 'text' }, // Comments
      { editor: 'text' }, // Notes
    ],
    manualColumnResize: true, // Allow manual resizing of columns
    stretchH: 'last', // Stretch other columns to fill the remaining space
    colWidths: [320, 250, 250, 250, 250, 250, 250],
    rowHeaders: true,
    contextMenu: true,
    height: '100%', // Set full height
    width: '100%', // Set full width
    rowHeights: 60, // Set default row height to 60px
    observeChanges: true, // Observe changes and redraw when needed
  });

  // Force render after table is fully initialized to prevent misalignment
  setTimeout(() => {
    hot.render();
  }, 100);

  // Add hook to save data to local storage when changes occur
  hot.addHook('afterChange', function () {
    saveData();
  });

  // Add hook to save data to local storage when rows are removed
  hot.addHook('afterRemoveRow', function () {
    saveData();
  });
});

// Initialize with data from local storage plus 100 empty rows
function getInitialData() {
  const storedData = JSON.parse(localStorage.getItem("spreadsheetData")) || [];
  const additionalEmptyRows = Array.from({ length: 100 }, () => ["", "", "", "", "", "", ""]); // 100 additional empty rows

  return [...storedData, ...additionalEmptyRows]; // Combine stored data with empty rows
}

// Custom renderer to handle the display of audio elements in the first column
function customRenderer(instance, td, row, col, prop, value, cellProperties) {
  td.innerHTML = ''; // Clear cell content

  if (value && value.startsWith('data:audio')) { // Check if the value is a base64 audio string
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = value;
    td.appendChild(audioElement);
  } else {
    const recordButton = addAudioRecorder(row); // Create a record button if no audio exists
    td.appendChild(recordButton);
  }
}

// Save data to local storage
function saveData() {
  const data = hot.getData();
  localStorage.setItem("spreadsheetData", JSON.stringify(data));
}
