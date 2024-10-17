// Function to send the audio file and API Params to the Deepgram API
async function uploadAudio(file, apiParams) {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("params", apiParams);
  
    try {
      const response = await fetch('https://batch-streaming-differ.glitch.me/upload_files', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const batchTranscript = data.results[0].batch_transcript.results.channels[0].alternatives[0].transcript;
        const streamingTranscript = data.results[0].streaming_transcript.results.channels[0].alternatives[0].transcript;
        return { batchTranscript, streamingTranscript };
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error; // Propagate the error to handle it in the caller
    }
  }
  