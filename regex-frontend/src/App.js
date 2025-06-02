import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './styles.css';

function App() {
  const [file, setFile] = useState(null);
  const [column, setColumn] = useState('');
  const [description, setDescription] = useState('');
  const [replacement, setReplacement] = useState('');
  const [output, setOutput] = useState('');
  const [fileData, setFileData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [processedColumns, setProcessedColumns] = useState([]);

  const getRegexFromLLM = async (description) => {
    if (description.toLowerCase().includes('email')) {
      return "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,7}\\b";
    } else if (description.toLowerCase().includes('phone')|| description.toLowerCase().includes('contact number')) {
      return "\\d{7,15}"; // Match 7-15 digit numbers
    }
    return null; // If description doesn't match known patterns
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const reader = new FileReader();
    const isExcel = uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls');
    const isCSV = uploadedFile.name.endsWith('.csv');

    reader.onload = (evt) => {
      let data = evt.target.result;
      let rows = [];

      if (isExcel) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      } else if (isCSV) {
        rows = data.split('\n').map(line => line.split(','));
      }

      if (rows.length > 0) {
        setColumns(rows[0]);
        setFileData(rows.slice(1));
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(uploadedFile);
    } else if (isCSV) {
      reader.readAsText(uploadedFile);
    } else {
      alert('Unsupported file type');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a file before processing.");
      return;
    }
    if (!column.trim()) {
      alert("Please enter the column name.");
      return;
    }
    if (!description.trim()) {
      alert("Please enter the pattern description.");
      return;
    }
    if (!replacement.trim()) {
      alert("Please enter the replacement value.");
      return;
    }

    // 🔥 Normalize user input and file column names for matching
    const normalizedInput = column.trim().toLowerCase().replace(/\s+/g, '');
    const normalizedColumns = columns.map(col => col.toLowerCase().replace(/\s+/g, ''));
    const matchedIndex = normalizedColumns.indexOf(normalizedInput);

    if (matchedIndex === -1) {
      alert(`The column "${column}" does not exist in the uploaded file.`);
      return;
    }

    const actualColumnName = columns[matchedIndex]; // Use correct name

    const regex = await getRegexFromLLM(description);
    if (!regex) {
      alert(`Could not generate a regex for the description: "${description}".`);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pattern', regex);
      formData.append('replacement', replacement);
      formData.append('column', actualColumnName); // Use correct column name

      const res = await axios.post('http://localhost:8000/api/upload/', formData);
      const csvData = res.data.data;
      setOutput(csvData);

      const csvRows = csvData.trim().split('\n').map(line => line.split(','));
      if (csvRows.length > 0) {
        setProcessedColumns(csvRows[0]);
        setProcessedData(csvRows.slice(1));
      }

      // 🛠️ Check if any replacements occurred
      const originalValues = fileData.map(row => row[matchedIndex]);
      const processedValues = csvRows.slice(1).map(row => row[matchedIndex]);

      let changes = false;
      for (let i = 0; i < originalValues.length; i++) {
        if (originalValues[i] !== processedValues[i]) {
          changes = true;
          break;
        }
      }

      if (!changes) {
        alert("No matches found for the pattern in the specified column. Please check the description or column.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while processing the file.");
      setOutput("An error occurred.");
    }
  };

  return (
    <div>
      <h1>Regex Pattern Matching & Replacement</h1>
      <input type="file" onChange={handleFileChange} />
      <input type="text" placeholder="Column name" value={column} onChange={e => setColumn(e.target.value)} />
      <input type="text" placeholder="Pattern description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="text" placeholder="Replacement" value={replacement} onChange={e => setReplacement(e.target.value)} />
      <button onClick={handleSubmit}>Upload & Process</button>

      <div className="main-section">
        {fileData.length > 0 && (
          <div className="table-section">
            <h2>Uploaded File Preview</h2>
            <table>
              <thead>
                <tr>{columns.map((col, idx) => <th key={idx}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {fileData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => <td key={cellIdx}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {processedData.length > 0 && (
          <div className="table-section">
            <h2>Processed Output</h2>
            <table>
              <thead>
                <tr>{processedColumns.map((col, idx) => <th key={idx}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {processedData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((cell, cellIdx) => <td key={cellIdx}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {output && (
        <div className="output-section">
          <h3>Processed Data (Raw CSV)</h3>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
