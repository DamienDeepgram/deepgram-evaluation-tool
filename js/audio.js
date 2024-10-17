function addAudioRecorder(td, rowIndex) {
    const recordButton = document.createElement("button");
    recordButton.innerText = "Record";
    recordButton.classList.add("audio-btn");
  
    let mediaRecorder;
    let chunks = [];
    let isRecording = false;
  
    td.setAttribute('draggable', true);
    td.addEventListener('dragover', (e) => e.preventDefault()); // Prevent default behavior
    td.addEventListener('drop', (e) => handleFileDrop(e, rowIndex, td)); // Handle file drop
  
    // Handle file drop functionality
    function handleFileDrop(event, rowIndex, td) {
      event.preventDefault();
      
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        // Read the dropped audio file as a base64 string
        const reader = new FileReader();
        reader.onload = async function(e) {
          const base64Audio = e.target.result;
  
          // Replace the record button with an audio player
          td.innerHTML = '';
          createAudioElement(td, base64Audio);
          hot.setDataAtCell(rowIndex, 0, base64Audio); // Save the audio to the table
  
          const apiParams = hot.getDataAtCell(rowIndex, 1); // Get API Params column value
  
          // Send the dropped file to the API
          try {
            const { batchTranscript, streamingTranscript } = await uploadAudio(file, apiParams);
            hot.setDataAtCell(rowIndex, 2, batchTranscript); // Update Deepgram Batch column
            hot.setDataAtCell(rowIndex, 3, streamingTranscript); // Update Deepgram Streaming column
          } catch (error) {
            console.error('Error uploading dropped audio:', error);
          }
  
          saveData(); // Save the table data to local storage
        };
        reader.readAsDataURL(file); // Read the file
      }
    }
  
    // Function to start or stop recording
    recordButton.addEventListener("click", async () => {
      if (!isRecording) {
        chunks = [];
        recordButton.classList.add("recording");
        recordButton.innerText = "Stop";
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
  
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
  
          // Replace the button with an audio element and save the base64 data
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            td.innerHTML = '';
            createAudioElement(td, base64Audio);
            hot.setDataAtCell(rowIndex, 0, base64Audio); // Save the audio data in the table
  
            const apiParams = hot.getDataAtCell(rowIndex, 1); // API Params column
            
            try {
              // Call the uploadAudio function from deepgram.js
              const { batchTranscript, streamingTranscript } = await uploadAudio(file, apiParams);
  
              // Update Deepgram Batch and Deepgram Streaming columns
              hot.setDataAtCell(rowIndex, 2, batchTranscript); // Update Deepgram Batch column
              hot.setDataAtCell(rowIndex, 3, streamingTranscript); // Update Deepgram Streaming column
            } catch (error) {
              console.error('Failed to upload audio and process transcripts:', error);
            }
  
            saveData();  // Save the updated table data to local storage
          };
  
          isRecording = false;
          recordButton.classList.remove("recording");
          recordButton.innerText = "Record";
        };
  
        mediaRecorder.start();
        isRecording = true;
      } else {
        mediaRecorder.stop();
      }
    });
  
    return recordButton;
  }
  

function createAudioElement(td, base64Audio) {
    const audioElement = document.createElement("audio");
    audioElement.controls = true;
    audioElement.src = base64Audio; // Use the base64 string to load the audio
    td.appendChild(audioElement);
}

function reloadStoredAudio(hot) {
    for (let rowIndex = 0; rowIndex < hot.countRows(); rowIndex++) {
        const cellMeta = hot.getCellMeta(rowIndex, 0); // Get cell metadata for the first column
        if (cellMeta && cellMeta.base64Audio) {
        const td = hot.getCell(rowIndex, 0);
        createAudioElement(td, cellMeta.base64Audio); // Recreate audio element with stored data
        }
    }
}

function saveData(hot) {
    const data = hot.getData();
    localStorage.setItem("spreadsheetData", JSON.stringify(data));
}

async function reprocessAudio(rowIndex) {
    const base64Audio = hot.getDataAtCell(rowIndex, 0); // Get the stored base64 audio
    const apiParams = hot.getDataAtCell(rowIndex, 1); // Get the API Params
    
    if (!base64Audio || !apiParams) {
      alert('No audio or API parameters found for this row.');
      return;
    }
  
    // Convert base64 to Blob (WAV file)
    const byteString = atob(base64Audio.split(',')[1]);
    const mimeString = base64Audio.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(buffer);
  
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
  
    const blob = new Blob([buffer], { type: mimeString });
    const file = new File([blob], 'reprocessed_audio.wav', { type: 'audio/wav' });
  
    // Send the audio file to the API
    try {
      const { batchTranscript, streamingTranscript } = await uploadAudio(file, apiParams);
  
      // Update the results
      hot.setDataAtCell(rowIndex, 2, batchTranscript); // Update Deepgram Batch column
      hot.setDataAtCell(rowIndex, 3, streamingTranscript); // Update Deepgram Streaming column
  
      saveData(); // Save the table data to localStorage
    } catch (error) {
      console.error('Error reprocessing audio:', error);
    }
  }
  

// Attach functions to the global `window` object
window.addAudioRecorder = addAudioRecorder;
window.createAudioElement = createAudioElement;
window.reloadStoredAudio = reloadStoredAudio;
window.saveData = saveData;
  