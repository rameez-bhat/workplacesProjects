import React, { useEffect, useState,useRef,forwardRef } from 'react';
import { Link,useParams } from 'react-router-dom';
import Select1 from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Typography,
  CircularProgress,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  Select,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,IconButton
} from '@mui/material';
import {
  CCard, CCardBody, CCardHeader, CCol, CTable, CTableBody, CTableDataCell,CFormSelect,
  CTableHead, CFormInput, CTableHeaderCell, CTableRow, CButton, CAlert, CNav, CNavItem, CNavLink, CTabContent, CTabPane
} from '@coreui/react';
import axios from 'axios';
import { gapi } from "gapi-script";
import * as XLSX from 'xlsx';
import { useLoading } from '../../layout/LoadingContext';
let sheetName="";
let sheetID="";
let dataShown=[];
let MainSheetName=[];
let SubmissionIsOver=false;
const GoogleSheetTable = ({ ActualUser, AuthUser }) => {
console.log("ActualUser--->",ActualUser)
  const [sheetsData, setSheetsData] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [mergedRanges, setMergedRanges] = useState([]);
  const [ListOfColumnToVerify, setListOfColumnToVerify] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [FormatedData, setFormatedData] = useState({});
  const [FormatedDataProperties, setFormatedDataProperties] = useState({});
  const [headerRowCount, setheaderRowCount] = useState(0);
  const [SubmittedData, setSubmittedData] = useState(false);
  const [FirstFewColumnToIgnore, setFirstFewColumnToIgnore] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});
  const { showLoading, hideLoading, API_KEY, DatabaseName, firestoreQueries } = useLoading();
  const [AllowedRowValue, setAllowedRowValue] = useState([]);
  const [sheetInfo, setSheetInfo] = useState([]);
  const [FullSettings, setFullSettings] = useState([]);
  const [formulasData, setFormulasData] = useState([]);
  let { ddoid,zoneddocode } = useParams();
   const parentRef = useRef(null);

  useEffect(() => {
    fetchSheetInfo();

  }, []);
const RemoveSpaceIfNumber = (str) => {
  const trimmedStr = str.replace(/\s+/g, '');

  if(!isNaN(trimmedStr) && trimmedStr.trim() !== '')
  {
    return trimmedStr;
  }
  else
  {
    return str;
  }
};
  const fetchSheetInfo = async () => {
    try {
    console.log("------->")
      showLoading();
 dataShown=[];
      let expiryTimestamp;// Convert seconds to milliseconds
    const today = new Date();
        let GetUserData;
        if(typeof ddoid!=="undefined")
        {
           let  GetUserData1=await firestoreQueries.FetchDataFromCollection(DatabaseName, "users", 100, "uid", "==", ddoid);
            if(GetUserData1.length)
            {
              GetUserData=GetUserData1[0];
            }

        }
        else if(typeof  ActualUser.ActualUser!=="undefined")
        {
          GetUserData=ActualUser.ActualUser;
        }
        else
        {
          GetUserData=ActualUser;
        }
       let  AllowedRowValue1 = Object.values(GetUserData.listoflinks);
       setAllowedRowValue(AllowedRowValue1)
       if(typeof zoneddocode=="undefined" && typeof GetUserData?.zeocode!="undefined")
       {
       		zoneddocode=GetUserData.zeocode
       }
      const settingsData = await firestoreQueries.FetchDataFromCollection(DatabaseName, "settings", 100, 'settingtype', '==', zoneddocode);
      //

      let sheeturl="";
      let sheetnames=[];
      if (settingsData.length)
      {
        sheeturl=settingsData[0].sheeturl;
        setFullSettings(settingsData[0])
        expiryTimestamp=new Date(settingsData[0].expiry.seconds * 1000);

        let sheetNames = Object.values(settingsData[0].sheetname);
        MainSheetName=sheetNames;
        console.log("MainSheetName--->",MainSheetName)
        if(Object.keys(settingsData[0].sheetname).length)
        {
          sheetNames = sheetNames.filter(name => !name.includes("DONT-TOUCH"));
          sheetnames=sheetNames;
        }
      }
      console.log("sheetnames--->",sheetnames)
      console.log("MainSheetName--->",MainSheetName)
      const sheetID1 = extractSheetID(sheeturl);
      sheetID=sheetID1;
      setSheetInfo(sheetnames.map(name => ({ sheetID, name })));
      if (expiryTimestamp > today )
      {
      	let getIndex=MainSheetName.length-sheetnames.length;
        fetchData(sheetID, sheetnames[0],settingsData[0].headerrows[getIndex],settingsData[0].labelcolumn[getIndex],settingsData[0].columntoverify[0]);
      }
      else
      {
        SubmissionIsOver=true;
        setErrors({ status: "error", submissionMessage: "Date For Submission Is Over .Please Contact Accounts CEO Baramulla.!" });
             hideLoading();
      }
    } catch (error) {
      console.error("Error fetching sheet info:", error);
      hideLoading();
    }
  };
const extractSheetID = (url) => {
    const regex = /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const roundToTwoDecimalPlaces = (num) => {
  const number = parseFloat(num); // Convert to a float number
  if (isNaN(number)) {
    return 0; // Return 0 or handle the error appropriately if num is not a valid number
  }
  return parseFloat(number.toFixed(3)); // Round to 2 decimal places
};
  const fetchData = async (sheetID1, sheetName1,headerRowCount,LableColumnCount,vefifyfields) => {
    try {
      showLoading();
      const sheetRangeD = `${sheetName1}!A1:Z30000`;

      //const sheetResponse = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?includeGridData=true&ranges=${encodeURIComponent(sheetRangeD)}&key=${API_KEY}`);
     /* const sheetResponse = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?includeGridData=true&key=${API_KEY}`);
      sheetID=sheetID1;
      sheetName=sheetName1;
      console.log("sheetName-->",sheetName)
      console.log("sheetResponse-->",sheetResponse)
      const sheetData = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName);

      const rows = sheetData.data[0].rowData.map(row => {
  if (!row || !row.values) return []; // Ensures row and values exist
  return row.values.map(cell => cell.formulaValue || cell.formattedValue || '');
});*/

/**** New Code Added**/
sheetName=sheetName1;

const sheetResponse = await axios.get(
  `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?includeGridData=true&ranges=${sheetName}&key=${API_KEY}`
);

const sheetData = sheetResponse.data.sheets.find(
  (sheet) => sheet.properties.title === sheetName
);

const rows = sheetData.data[0].rowData.map((row) => {
  if (!row || !row.values) return [];
  return row.values.map(
    (cell) => cell.formulaValue || cell.formattedValue || ''
  );
});




const formulas = sheetData.data[0].rowData.map(row => {
  if (!row || !row.values) return []; // Ensures row and values exist
  return row.values.map(cell => cell?.userEnteredValue?.formulaValue || '');
});

      const mergedRanges = sheetData.merges || [];
      setheaderRowCount()
      setFormatedData(sheetData.data[0].rowData)
      setFormatedDataProperties(sheetData.data)
      setheaderRowCount(headerRowCount);
      setFirstFewColumnToIgnore(LableColumnCount);
      setSheetsData(prev => [...prev, { sheetName, rows }]);
      setMergedRanges(mergedRanges);
      setEditedRows(rows);
      setFormulasData(formulas);
      setListOfColumnToVerify(vefifyfields)
      setTableData(rows);
      hideLoading();
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      hideLoading();
    }
  };
  const evaluateExpressionInside = (expression, rowValues) => {
  const replacedExpression = expression.replace(/[A-Z]+\d+/g, (cellRef) => {
    const colIndex = columnToNumberGlobal(cellRef.replace(/\d+/, ''));
    const value = parseFloat(rowValues[colIndex]) || 0;
    return value;
  });
  return Function(`return ${replacedExpression}`)(); // Evaluate the final expression
};
const parseRange = (rangeStr, currentRow,updatedRows) => {
  const [startRef, endRef] = rangeStr.split(':').map(ref => ref.replace(/\$/g, ''));
  const startCell = parseCellReference(startRef, currentRow,updatedRows);
  const endCell = parseCellReference(endRef, currentRow,updatedRows);

  if (!startCell || !endCell) return [];

  const cells = [];
  for (let col = startCell.col; col <= endCell.col; col++) {
    const row = startCell.row; // For horizontal ranges, row stays the same
    const cellValue = updatedRows[row]?.[col];
    cells.push({ row, col, cellValue });
  }
  return cells;
};

// Helper function to parse a cell reference (e.g., "BQ3" or "$BQ$3")
const parseCellReference = (ref, currentRow) => {
  // Remove all $ signs as they don't affect the cell location in our case
  const cleanRef = ref.replace(/\$/g, '');
  const match = cleanRef.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    console.error(`Invalid cell reference: ${ref}`);
    return null;
  }

  const colLetters = match[1];
  const rowNum = parseInt(match[2], 10) - 1; // Convert to zero-based index

  // Convert column letters to index
  let colIndex = 0;
  for (let i = 0; i < colLetters.length; i++) {
    colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
  }
  colIndex -= 1; // Convert to zero-based index

  return { row: rowNum, col: colIndex };
};
  const handleTabChange = (index) => {
    setActiveSheetIndex(index);
    dataShown=[];

setSheetsData([]);
    if (sheetInfo[index]) {
      const { sheetID, name } = sheetInfo[index];

      fetchData(sheetID, name,FullSettings.headerrows[index],FullSettings.labelcolumn[index],FullSettings.columntoverify[0]);
    }
  };
const evaluateExpression = (expression, rowValues) => {
  const tokens = expression.split(/([-+*/])/).map(token => token.trim()); // Split by operators

  const evaluatedTokens = tokens.map(token => {
    if (/^[A-Z]+\d+$/.test(token)) { // If it's a cell reference (e.g., AA192)
      const match = token.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const colLetters = match[1]; // Extract column letters (e.g., "AA")
        const rowIndex = parseInt(match[2], 10); // Extract row index (not used here)

        // Convert column letters to index (e.g., "AA" -> 26 + 1 = 27)
        let colIndex = 0;
        for (let i = 0; i < colLetters.length; i++) {
          colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 64);
        }
        colIndex -= 1; // Convert to zero-based index


        return parseFloat(rowValues[colIndex]) || 0; // Get the value from editedRows
      }
    }

    return token; // Return the operator as is
  });

  // Evaluate the expression
  let result = evaluatedTokens[0]; // Start with the first token

  for (let i = 1; i < evaluatedTokens.length; i += 2) {
    const operator = evaluatedTokens[i];
    const value = evaluatedTokens[i + 1];
    switch (operator) {
      case '+':
        result += value;
        break;
      case '-':
        result -= value;
        break;
      case '*':
        result *= value;
        break;
      case '/':
        result /= value;
        break;
      default:
        break;
    }
  }

  return result;
};
  const removeLeadingSpace = (input) => {
  if (typeof input === "string") {
    return input.trimStart();
  }
  return input; // If it's a number, return it as is
};
  const handleInputChange = (originalRowIndex, cellIndex, value) => {
    value=RemoveSpaceIfNumber(value)
    const updatedRows = {
      ...editedRows,
      [originalRowIndex]: {
        ...editedRows[originalRowIndex],
        [cellIndex]: removeLeadingSpace(value),
      },
    };

    const updatedFormulasRow = formulasData[originalRowIndex];
    if (updatedFormulasRow) {
      updatedFormulasRow.forEach((formula, formulaIndex) => {

        if (formula) {
        formula=formula.toUpperCase()
          try {
            const rowValues = updatedRows[originalRowIndex];

            if (formula.includes("SUMIF")) {
            // Handle SUMIF formula (e.g., =SUMIF($D$3:$BC$3,$BQ$3,D4:BC4))
            const matches = formula.match(/SUMIF\(([^,]+),([^,]+),([^)]+)\)/);
            if (matches) {
              const rangeStr = matches[1].trim();       // $D$3:$BC$3
              const criteriaStr = matches[2].trim();    // $BQ$3
              const sumRangeStr = matches[3].trim();    // D4:BC4
              // Convert range strings to actual ranges
              const criteriaRange = parseRange(rangeStr, originalRowIndex,updatedRows);
              const sumRange = parseRange(sumRangeStr, originalRowIndex,updatedRows);
              const criteriaCell = parseCellReference(criteriaStr, originalRowIndex);
              // Get the criteria value
              const criteriaValue = criteriaCell ?
                (updatedRows[criteriaCell.row]?.[criteriaCell.col] ||
                 tableData[criteriaCell.row]?.[criteriaCell.col]) :
                null;
              if (!criteriaValue) {
                updatedRows[originalRowIndex][formulaIndex] = 0;
                return;
              }
              // Calculate SUMIF
              let sum = 0;
              for (let i = 0; i < criteriaRange.length; i++) {
                const criteriaCellValue = criteriaRange[i].cellValue;

                if (criteriaCellValue === criteriaValue) {
                  sum += parseFloat(Number(sumRange[i].cellValue)) || 0;
                }
              }

              updatedRows[originalRowIndex][formulaIndex] = sum;
            }
          }
            else if (formula.includes("SUM")) {
  const matches = formula.match(/SUM\(([^)]+)\)/);
  if (matches) {
    const range = matches[1].split(':'); // Split the range into start and end (e.g., ['F189', 'H189'])

    // Function to convert column letters to numbers
    const columnToNumber = (col) => {
      let colNumber = 0;
      for (let i = 0; i < col.length; i++) {
        colNumber = colNumber * 26 + (col.charCodeAt(i) - 64); // 'A' is 65 in ASCII
      }
      return colNumber - 1; // Convert to zero-based index
    };

    // Extract start and end columns
    const startCol = columnToNumber(range[0].replace(/\d+/, '')); // Remove row number from 'F189'
    const endCol = columnToNumber(range[1].replace(/\d+/, ''));


    // Sum the values from the specified columns only
    const cellValues = [];
    for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
      const cellValue = parseFloat(rowValues[colIndex]) || 0; // Use the original row data
      cellValues.push(cellValue);
    }

    // Calculate the sum
    const sum = cellValues.reduce((acc, val) => acc + val, 0);
    updatedRows[originalRowIndex][formulaIndex] = sum; // Update the formula cell with the sum
  }
}
else if (formula.includes("ROUNDUP")) {
  // Extract the value and precision from the ROUND formula (e.g., ROUND(F189, 2))
  const matches = formula.match(/ROUNDUP\(([^,]+),\s*(\d+)\)/);
  if (matches) {
    const innerExpression = matches[1].trim(); // e.g., F189
    const precision = parseInt(matches[2], 10); // e.g., 2

    // Function to convert column letters to numbers
    const columnToNumber = (col) => {
      let colNumber = 0;
      for (let i = 0; i < col.length; i++) {
        colNumber = colNumber * 26 + (col.charCodeAt(i) - 64); // 'A' is 65 in ASCII
      }
      return colNumber - 1; // Convert to zero-based index
    };

    // Extract the column index

    const evaluatedValue = evaluateExpressionInside(innerExpression, updatedRows[originalRowIndex]);
    //const colIndex = columnToNumber(columnReference.replace(/\d+/, '')); // Remove row number from 'F189'

    //console.log("evaluatedValue---->", evaluatedValue);

    // Get the value from the specified column
    const value = parseFloat(evaluatedValue) || 0;

    // Round the value to the specified precision
    const roundedValue = parseFloat(value.toFixed(precision));


    // Update the formula cell with the rounded value
    updatedRows[originalRowIndex][formulaIndex] = roundedValue;
  }
}
else if (formula.includes("ROUND")) {
  // Extract the value and precision from the ROUND formula (e.g., ROUND(F189, 2))
  const matches = formula.match(/ROUND\(([^,]+),\s*(\d+)\)/);
  if (matches) {
    const innerExpression = matches[1].trim(); // e.g., F189
    const precision = parseInt(matches[2], 10); // e.g., 2

    // Function to convert column letters to numbers
    const columnToNumber = (col) => {
      let colNumber = 0;
      for (let i = 0; i < col.length; i++) {
        colNumber = colNumber * 26 + (col.charCodeAt(i) - 64); // 'A' is 65 in ASCII
      }
      return colNumber - 1; // Convert to zero-based index
    };

    // Extract the column index

    const evaluatedValue = evaluateExpressionInside(innerExpression, updatedRows[originalRowIndex]);
    //const colIndex = columnToNumber(columnReference.replace(/\d+/, '')); // Remove row number from 'F189'

    //console.log("evaluatedValue---->", evaluatedValue);

    // Get the value from the specified column
    const value = parseFloat(evaluatedValue) || 0;

    // Round the value to the specified precision
    const roundedValue = parseFloat(value.toFixed(precision));


    // Update the formula cell with the rounded value
    updatedRows[originalRowIndex][formulaIndex] = roundedValue;
  }
}


            else if (/^=\w+\d+([-+*/]\w+\d+)+$/.test(formula)) { // Check for expressions like =E189-I189
            const expression = formula.slice(1); // Remove the '=' sign
            const evaluatedValue = evaluateExpression(expression, updatedRows[originalRowIndex]);
            updatedRows[originalRowIndex][formulaIndex] = evaluatedValue; // Update the formula cell with evaluated value
          }

          } catch (error) {
            console.error("Error updating formula:", error);
          }
        }
      });
    }

    setEditedRows(updatedRows);  // Update state
  };
  const columnToNumberGlobal = (col) => {
      let colNumber = 0;
      for (let i = 0; i < col.length; i++) {
        colNumber = colNumber * 26 + (col.charCodeAt(i) - 64); // 'A' is 65 in ASCII
      }
      return colNumber - 1; // Convert to zero-based index
    };


const getColumnLetter = (colIndex) => {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
};
  const updateGoogleSheet = async (range,valuesF) => {
  try {
    const response = await fetch(" https://updategooglesheet-f6dijyh4qq-uc.a.run.app ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId: sheetID,
        range: range,
        valueInputOption: "USER_ENTERED",
        values: valuesF,
      }),
    });

    const result = await response.json();
    return result;
    //console.log(`${result.updatedCells} cells updated.`);
  } catch (error) {
    return error;
  }
};
const updateGoogleSheetBatchs = async (updatesArray) => {
  try {
    const response = await fetch("https://us-central1-ceoaccountsbla.cloudfunctions.net/updateGoogleSheetInBatchs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetId: sheetID,
        updates: updatesArray,
      }),
    });

    const result = await response.json();
    return result;
    //console.log(`${result.updatedCells} cells updated.`);
  } catch (error) {
    return error;
  }
};
/*const handleSubmitUpdates = async () => {
  try {
    showLoading();

    const filteredRows = Object.entries(editedRows)
      .filter(([rowIndex]) => AllowedRowValue.includes(tableData[parseInt(rowIndex)][1])) // Filter allowed rows
      .map(([rowIndex, updatedCells]) => {
        const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
          const formulaCell = formulasData[rowIndex]?.[cellIndex];

          if (formulaCell) {
            return `${formulaCell}`; // Assign formula to the cell
          } else {
            return updatedCells[cellIndex] || cell; // Otherwise, keep updated or original cell value
          }
        });

        return { rowIndex: parseInt(rowIndex), updatedRow };
      });

    const requests = filteredRows.map(({ rowIndex, updatedRow }) => {
      const filteredRow = updatedRow.map((cell, cellIndex) => {
        if (cellIndex < FirstFewColumnToIgnore) {
          return null;
        }

        return cell;
      }).filter(cell => cell !== null);

      const lastColIndex = updatedRow.length - 1;
      const colLetter = lastColIndex >= 0 ? getColumnLetter(lastColIndex) : null;
      const colLetterFirst = lastColIndex >= 0 ? getColumnLetter(FirstFewColumnToIgnore) : null;

      if (!colLetter) return null;

      return {
        range: `${sheetName}!${colLetterFirst}${rowIndex + 1}:${colLetter}${rowIndex + 1}`,
        values: [filteredRow],
      };
    }).filter(request => request !== null);

    const dataToSend = requests.filter(req => req.values[0].length > 0);
    if (dataToSend.length > 0) {
      const results = await Promise.all(dataToSend.map(async (item) => {
      const res = await updateGoogleSheet(item.range, item.values);
      return res;
    }));
      if (results.every(res => res.status === "success")) {
        setSubmittedData(true);
        setErrors({ status: "success", submissionMessage: "Successfully Updated!" });
      } else {
        setErrors({ status: "error", submissionMessage: "Please Submit Again As It Was Not Saved!" });
      }
    } else {
      console.log("No data to send to Google Sheets.");
      setErrors({ status: "info", submissionMessage: "No updates to save!" });
    }

    hideLoading();
  } catch (error) {
    console.error("Error submitting updates:", error);
    hideLoading();
    setErrors({ status: "error", submissionMessage: "Failed to update data!" });
  }
};*/
const handleSubmitUpdates = async () => {
  try {
    showLoading();

    const allUpdatedRows = [];
    const rowIndices = [];

    Object.entries(editedRows).forEach(([rowIndex, updatedCells]) => {
      if (!AllowedRowValue.includes(tableData[parseInt(rowIndex)][1])) return;
      const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
        const formulaCell = formulasData[rowIndex]?.[cellIndex];

        return formulaCell ? `${formulaCell}` : (updatedCells[cellIndex] ?? cell);

      });

      const filteredRow = updatedRow
        .map((cell, cellIndex) => (cellIndex >= FirstFewColumnToIgnore ? cell : null))
        .filter(cell => cell !== null);

      allUpdatedRows.push(filteredRow);
      rowIndices.push(parseInt(rowIndex));
    });

    if (allUpdatedRows.length > 0) {
      // Calculate range
      const minRow = Math.min(...rowIndices) + 1; // Google Sheet row starts from 1
      const maxRow = Math.max(...rowIndices) + 1;
      const startColLetter = getColumnLetter(FirstFewColumnToIgnore);
      const endColLetter = getColumnLetter(tableData[10].length - 1);

      const fullRange = `${sheetName}!${startColLetter}${minRow}:${endColLetter}${maxRow}`;

        const requests = allUpdatedRows.map((row, i) => {
        const rowNum = rowIndices[i] + 1; // Google Sheets is 1-indexed
        const startCol = getColumnLetter(FirstFewColumnToIgnore);
        const endCol = getColumnLetter(row.length + Number(FirstFewColumnToIgnore)-1);
        const range = `${sheetName}!${startCol}${rowNum}:${endCol}${rowNum}`;
        return {
          range,
          values: [row],
        };
      });
     const result =await updateGoogleSheetBatchs(requests)
      //const result = await updateGoogleSheet(fullRange, allUpdatedRows);
      console.log("result--->",result)
      if (result?.status === "success") {
        setSubmittedData(true);
        setErrors({ status: "success", submissionMessage: "Successfully Updated!" });
      } else {
        setErrors({ status: "error", submissionMessage: "Please Submit Again As It Was Not Saved!" });
      }
    } else {
      console.log("No data to send to Google Sheets.");
      setErrors({ status: "info", submissionMessage: "No updates to save!" });
    }

    hideLoading();
  } catch (error) {
    console.error("Error submitting updates:", error);
    hideLoading();
    setErrors({ status: "error", submissionMessage: "Failed to update data!" });
  }
};
  const exportSelectedRowsToExcel = (googleSheetData, formatting, selectedRows) => {
  const selectedData = selectSpecificRows(googleSheetData, selectedRows);
  const selectedFormatting = selectSpecificRowsData(formatting, selectedRows);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(selectedFormatting);


  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Save the Excel file
  XLSX.writeFile(wb, "SelectedExport.xlsx");
};
const selectAndFlattenRows = (sheetData, selectedRows) => {
  const selected = selectedRows.map(rowIndex => sheetData[rowIndex]);
  return flattenRowData(selected); // Flatten the data to array of arrays
};
 const selectSpecificRows = (sheetData, selectedRows) => {
  return selectedRows.map(rowIndex => {
    const row = sheetData[rowIndex].values; // Extract the cell values

  return row;
  });
};
 const selectSpecificRowsData = (sheetData, selectedRows) => {
  return selectedRows.map(rowIndex => {
    const row = sheetData[rowIndex].values; // Extract the cell values
    const transformedRows =Object.entries(editedRows[rowIndex]).map(([key, value])=>value)
      return transformedRows;
  });
};
   const exportToExcel = () => {

    let SelectRowsAre=[];
    let ToexportData=[];
    Array.from({ length: headerRowCount }, (_, rowIndex) => {
    ToexportData.push(tableData[rowIndex]);
    SelectRowsAre.push(rowIndex)
    })
     const filteredRows = Object.entries(editedRows)
      .filter(([rowIndex]) => AllowedRowValue.includes(tableData[parseInt(rowIndex)][1])) // Filter allowed rows
      .map(([rowIndex, updatedCells]) => {
        const updatedRow = tableData[parseInt(rowIndex)].map((cell, cellIndex) => {
          const formulaCell = formulasData[rowIndex]?.[cellIndex];
          return editedRows[rowIndex]?.[cellIndex]?editedRows[rowIndex]?.[cellIndex] : cell; // Send formula instead of value
        });

        return { rowIndex: parseInt(rowIndex), updatedRow };
      });
    const requests = filteredRows.map(({ rowIndex, updatedRow }) => {
      const filteredRow = updatedRow.map((cell, cellIndex) => {
        return cell; // Keep the cell (formula or updated value)
      }).filter(cell => cell !== null); // Remove null values from the row

      // Get the range (column letters)
      const lastColIndex = updatedRow.length - 1;
      const colLetter = lastColIndex >= 0 ? getColumnLetter(lastColIndex) : null;
      const colLetterFirst = lastColIndex >= 0 ? getColumnLetter(FirstFewColumnToIgnore) : null;

      // If there's no valid column, skip this request
      if (!colLetter) return null;
      SelectRowsAre.push(rowIndex)
      // Return the update request for this row
      ToexportData.push(filteredRow)
      return filteredRow
    }).filter(request => request !== null); // Filter out null requests


  exportSelectedRowsToExcel(FormatedData,FormatedData,SelectRowsAre);
  };
 const getMergedCellIndex = (rowIndex, cellIndex) => {
    const mergedRange = mergedRanges.find(range => {
      const startRow = range.startRowIndex;
      const endRow = range.endRowIndex;
      const startCol = range.startColumnIndex;
      const endCol = range.endColumnIndex;

      return (
        rowIndex >= startRow && rowIndex < endRow &&
        cellIndex >= startCol && cellIndex < endCol
      );
    });
  if (mergedRange) {
      return {
        endRowIndex: mergedRange.endRowIndex,
        startRowIndex:mergedRange.startRowIndex,
        endColumnIndex: mergedRange.endColumnIndex,
         startColumnIndex:mergedRange.startColumnIndex
      };
    }


    return { startRowIndex: -2, endRowIndex: -2, endColumnIndex: -2, startColumnIndex: -2};
  };

const CustomDateInput = forwardRef(({ value, onClick, onChange }, ref) => {
  return (
    <input
      type="text"
      className="form-control MinWidth"
      placeholder="DD-MM-YYYY"
      ref={ref}
      value={value}
      onClick={onClick}
      onChange={onChange}
    />
  );
});
const formatDateToDDMMYYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDateFromDDMMYYYY = (str) => {
  const [dd, mm, yyyy] = str.split('-');
  return new Date(`${yyyy}-${mm}-${dd}`);
};

const formatDateInputSmart = (value) => {
  const cleaned = value.replace(/[^0-9-]/g, '');
  if (/^\d{2}-\d{2}-\d{4}$/.test(cleaned)) return cleaned;

  const digits = cleaned.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
};
  const getMergedCellSpan = (rowIndex, cellIndex) => {
    const mergedRange = mergedRanges.find(range => {
      const startRow = range.startRowIndex;
      const endRow = range.endRowIndex;
      const startCol = range.startColumnIndex;
      const endCol = range.endColumnIndex;

      return (
        rowIndex >= startRow && rowIndex < endRow &&
        cellIndex >= startCol && cellIndex < endCol
      );
    });

    if (mergedRange) {
      return {
        rowSpan: mergedRange.endRowIndex - mergedRange.startRowIndex,
        colSpan: mergedRange.endColumnIndex - mergedRange.startColumnIndex,
      };
    }

    return { rowSpan: 1, colSpan: 1 };
  };

const renderHeaders = () => {
    return (
      <>
      <CTableHead>
        {Array.from({ length: headerRowCount }, (_, rowIndex) => {
          let skipColumns = 0;
          return (
            <CTableRow key={rowIndex}>
              {tableData[rowIndex]?.map((headerCell, cellIndex) => {
                if (skipColumns > 0) {
                  skipColumns--;
                  return null;
                }

                const { rowSpan, colSpan } = getMergedCellSpan(rowIndex, cellIndex);

                if (colSpan > 1) {
                  skipColumns = colSpan - 1;
                }

                return (
                  <CTableHeaderCell
                    key={cellIndex}
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                  >
                    {headerCell || ''}
                  </CTableHeaderCell>
                );
              })}
            </CTableRow>
          );
        })}
        </CTableHead>
      </>
    );
  };


  const renderTableBody = () => {

   //document.querySelector(".TableDataTop div")?.classList.add("tab-pane", "active", "fade", "show", "overflow-auto");

    return tableData
      .map((row, originalRowIndex) => {
        if (!AllowedRowValue.includes(row[1])) return null;
        return (
          <CTableRow key={originalRowIndex}>
            {row.map((cell, cellIndex) => {
              const { rowSpan, colSpan } = getMergedCellSpan(originalRowIndex , cellIndex);
              const isFormulaCell = !!formulasData[originalRowIndex ]?.[cellIndex];

              return (
                <CTableDataCell
                	rownumber={originalRowIndex}
                	columnnumber={cellIndex}
                	className="CellClass"
                  key={cellIndex}
                  rowSpan={rowSpan}
                  colSpan={colSpan}
                >
                  {cellIndex >= FirstFewColumnToIgnore ? (
                    isFormulaCell ? (
                      <span>{roundToTwoDecimalPlaces(editedRows[originalRowIndex]?.[cellIndex]) || cell}</span> // Show formula cells as non-editable
                    ) : FormatedData[originalRowIndex]['values'][cellIndex]?.dataValidation?.condition?.type==="ONE_OF_LIST" ? (
                      <>
                       <CCol md={12}>
                <Select
                    placeholder="Header Rows"
                    className="ThisisDropdown"
                    value={editedRows[originalRowIndex]?.[cellIndex]}
                    invalid={!!errors[originalRowIndex]}
                    required
                    isSearchable
                    onChange={(e) => handleInputChange(originalRowIndex, cellIndex, e.target.value)}>
                    <MenuItem value="">
                        Select
                      </MenuItem>
{FormatedData[originalRowIndex]?.values[cellIndex]?.dataValidation?.condition?.values?.map((val, idx) => (
    <MenuItem key={idx} value={val.userEnteredValue}>{val.userEnteredValue}</MenuItem>
  ))}
                  </Select>

                {errors.labelcolumn?.[index] && (
                      <CFormFeedback invalid>{errors.labelcolumn?.[index]}</CFormFeedback>
                  )}
              </CCol>



                      </>

                    ):

                      FormatedData[originalRowIndex]['values'][cellIndex]?.dataValidation?.condition?.type==="DATE_IS_VALID" ? (
                      <DatePicker
  selected={
    editedRows[originalRowIndex]?.[cellIndex]
      ? parseDateFromDDMMYYYY(editedRows[originalRowIndex][cellIndex])
      : null
  }
  onChange={(date) =>
    handleInputChange(
      originalRowIndex,
      cellIndex,
      date ? formatDateToDDMMYYYY(date) : ''
    )
  }
  customInput={
    <CustomDateInput
      value={editedRows[originalRowIndex]?.[cellIndex] || ''}
      onChange={(e) => {
        const formatted = formatDateInputSmart(e.target.value);
        handleInputChange(originalRowIndex, cellIndex, formatted);
      }}
    />
  }
  dateFormat="dd-MM-yyyy"
  isClearable
  showYearDropdown
  showMonthDropdown
  scrollableYearDropdown
  yearDropdownItemNumber={70}
  autoComplete="off"
/>
                    ):
                    (
                       <CFormInput
                        type="text"
                        className="MinWidth"
                        vakklue={editedRows[originalRowIndex]?.[cellIndex] }
                        value={editedRows[originalRowIndex]?.[cellIndex]}
                        invalid={!!errors[originalRowIndex]}
                        onChange={(e) => handleInputChange(originalRowIndex, cellIndex, e.target.value)}
                      />
                    )
                )
                  : (
                    cell || ''
                  )}
                </CTableDataCell>
              );
            })}
          </CTableRow>
        );
      });
  };

  return (
  <CCol xs={12}>
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Google Sheets Data</strong>
      </CCardHeader>
      <CCardBody>
        {!SubmissionIsOver && (
          <>
            <CNav variant="tabs">
              {sheetInfo.map((info, index) => (
                <CNavItem key={index}>
                  <CNavLink
                    active={activeSheetIndex === index}
                    onClick={() => handleTabChange(index)}
                    role="tab"
                  >
                    {info.name}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>

            <CTabContent className="tab-pane active fade show overflow-auto TableDataTop">
              {sheetsData.map((sheetData, index) => {
              //if(!dataShown.includes(index))
              {
                dataShown.push(index);
                return (
                <CTabPane
                  key={index}
                  visible={activeSheetIndex === index}
                  className="overflow-auto"
                >
                <div className="tab-pane active fade show overflow-auto TableData">
                  <CTable color="success" className="tab-pane active fade show overflow-auto" bordered>
                    {renderHeaders(sheetData.rows)}
                    <CTableBody>
                      {renderTableBody(sheetData.rows, index)}
                    </CTableBody>
                  </CTable>
                </div>

                  <CButton color="primary" onClick={handleSubmitUpdates}>
                    Update Sheet
                  </CButton>

                  {SubmittedData && (
                    <CButton color="warning" className="m-4" onClick={exportToExcel}>
                      Export
                    </CButton>
                  )}
                </CTabPane>

                )
              }
              })}
            </CTabContent>
          </>
        )}

        {errors.status && (
          <CAlert color={errors.status === "error" ? "danger" : "success"}>
            {errors.submissionMessage}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  </CCol>
);
};

export default GoogleSheetTable;
