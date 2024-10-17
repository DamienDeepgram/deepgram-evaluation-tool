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
  