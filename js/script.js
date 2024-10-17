// Initialize Handsontable
const container = document.getElementById('spreadsheet');
let hot; // Declare 'hot' before it's initialized

document.addEventListener("DOMContentLoaded", async () => {
    const initialData = await getInitialData(); // Load data from IndexedDB
  
    hot = new Handsontable(container, {
      data: initialData, // Load initial data into Handsontable
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
        { readOnly: true, renderer: customRenderer, width: 320 }, // Audio Recorder column
        { editor: 'text' }, // API Params column
        { editor: 'text', readOnly: true, allowOverflow: false }, // Deepgram Batch column (read-only)
        { editor: 'text', readOnly: true, allowOverflow: false }, // Deepgram Streaming column (read-only)
        { editor: 'text' }, // Truth Transcript column
        { editor: 'text' }, // Comments column
        { editor: 'text' } // Notes column
      ],
      manualColumnResize: true, // Allow column resizing
      manualRowResize: true, // Allow row resizing
      stretchH: 'all',
      colWidths: [320, 250, 250, 250, 250, 250, 250],
      rowHeaders: true,
    //   autoRowSize: true,
      contextMenu: {
        items: {
          "reprocessAudio": {
            name: 'Reprocess Audio',
            callback: (key, options) => {
              const rowIndex = options[0].start.row;
              reprocessAudio(rowIndex);
            }
          },
          ...Handsontable.plugins.ContextMenu.DEFAULT_ITEMS,
        }
      },
      height: '100%', 
      width: '100%', 
      rowHeights: 60, // Set default row height to 60px
      observeChanges: true,
    });

    /* Popup
  
    // Add mouseover event listener to show popup
    const containerElement = document.getElementById('spreadsheet');

    containerElement.addEventListener('mouseover', function(event) {
        const cell = event.target;
      
        // Ensure the target is a table cell
        if (cell.nodeName === 'TD') {
          const rowIndex = cell.closest('tr').getAttribute('aria-rowindex') - 2; // Corrected offset
          const colIndex = cell.getAttribute('aria-colindex') - 2; // Corrected offset
      
          const cellContent = hot.getDataAtCell(rowIndex, colIndex);
          if (cellContent) {
            showPopup(event, cellContent);
          }
        }
    });
      
    containerElement.addEventListener('mouseout', function() {
    hidePopup();
    });

    // Function to show the popup
    function showPopup(event, content) {
    const popup = document.getElementById('cell-popup');
    if (!popup) {
        const popupElement = document.createElement('div');
        popupElement.id = 'cell-popup';
        popupElement.style.position = 'absolute';
        popupElement.style.backgroundColor = '#fff';
        popupElement.style.border = '1px solid #ccc';
        popupElement.style.padding = '10px';
        popupElement.style.zIndex = '1000';
        document.body.appendChild(popupElement);
    }
    const popupElement = document.getElementById('cell-popup');
    popupElement.innerHTML = content;
    popupElement.style.left = `${event.pageX + 10}px`;
    popupElement.style.top = `${event.pageY + 10}px`;
    popupElement.style.display = 'block';
    }

    // Function to hide the popup
    function hidePopup() {
    const popupElement = document.getElementById('cell-popup');
    if (popupElement) {
        popupElement.style.display = 'none';
    }
    }
    */

    hot.addHook('afterRowResize', function(currentRow, newSize) {
        console.log('Row resized:', currentRow, 'New size:', newSize);
        saveData(); // Save the data with the new row sizes
      });
      
  
    // Trigger saveData when changes occur
    hot.addHook('afterChange', function () {
      saveData();
    });
  
    hot.addHook('afterRemoveRow', function () {
      saveData();
    });
  
    setTimeout(() => {
      hot.render();
    }, 100);
  });
  

// Custom renderer to handle the display of audio elements in the first column
function customRenderer(instance, td, row, col, prop, value, cellProperties) {
    td.innerHTML = ''; // Clear cell content
  
    if (value && value.startsWith('data:audio')) {
      const audioElement = document.createElement('audio');
      audioElement.controls = true;
      audioElement.preload = 'auto';
  
      // Create the <source> element for the audio
      const sourceElement = document.createElement('source');
      sourceElement.src = value; // Set the base64 string as the audio source
      sourceElement.type = 'audio/wav'; // Set the correct MIME type
  
      // Append the <source> to the <audio> tag
      audioElement.appendChild(sourceElement);
      
      // Append the <audio> element to the table cell
      td.appendChild(audioElement);
    } else {
      const recordButton = addAudioRecorder(td, row); // If no audio, create a record button
      td.appendChild(recordButton);
    }
  }
  
