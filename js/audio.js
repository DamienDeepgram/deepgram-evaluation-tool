function addAudioRecorder(rowIndex) {
    const recordButton = document.createElement("button");
    recordButton.innerText = "Record";
    recordButton.classList.add("audio-btn");
  
    let mediaRecorder;
    let chunks = [];
    let isRecording = false;
  
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

          // Transcribe the audio
          setTimeout(async () => {
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
            }, 0);

          // Save the Audio
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64Audio = reader.result;
  
            // Save the base64Audio directly in the table
            hot.setDataAtCell(rowIndex, 0, base64Audio);
  
            saveData();  // Save to local storage
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

// Attach functions to the global `window` object
window.addAudioRecorder = addAudioRecorder;
window.createAudioElement = createAudioElement;
window.reloadStoredAudio = reloadStoredAudio;
window.saveData = saveData;
  