
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';
const DatabaseName="LeadTracker";
const GoogleSheetTable = ({ sheetID, sheetName, API_KEY }) => {
const { showLoading, hideLoading,allCountries,CountryOption,firestoreQueries,countryOfMedicalCollege,medicalSchoolOptions } = useLoading();
  const [tableData, setTableData] = useState([]);
  const [mergedRanges, setMergedRanges] = useState([]);
	const headerRowCount=4;
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the values from the specified sheet
        const API_KEY = 'AIzaSyBAYjaOcvwnm2cZWxCGEjI0ysOOTHKS4AY';  // From Google Cloud Console
        const sheetID ='1JA6jHVRC2ZQ6w-PNNfUnQhVLACaWV43fKUI53wODhpQ';
        const sheetName='Salary';
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${API_KEY}`
        );
        const sheetResponse = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}?key=${API_KEY}`);
        const rows = response.data.values;
        const sheetInfo = sheetResponse.data.sheets.find(sheet => sheet.properties.title === sheetName);
        const mergedRanges = sheetInfo ? sheetInfo.merges || [] : [];
console.log("response----->",`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${API_KEY}`)
console.log("response----->",response)
console.log("mergedRanges----->",mergedRanges)
console.log("sheetResponse----->",sheetResponse)
		setTableData(rows);
        setMergedRanges(mergedRanges);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [sheetID, sheetName, API_KEY]);
 const renderHeaders = () => {
    return (
      <>
        {Array.from({ length: headerRowCount }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {tableData[rowIndex]?.map((headerCell, cellIndex) => {
              // Check if the cell is merged
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

              const isMerged = mergedRange !== undefined;

              return (
                <th
                  key={cellIndex}
                  rowSpan={isMerged ? (mergedRange.endRowIndex - mergedRange.startRowIndex) : 1}
                  colSpan={isMerged ? (mergedRange.endColumnIndex - mergedRange.startColumnIndex) : 1}
                  style={isMerged ? { backgroundColor: '#f0f0f0' } : {}}
                >
                  {headerCell || ''}
                </th>
              );
            })}
          </tr>
        ))}
      </>
    );
  };

  const renderTableBody = () => {
    // Skip the header rows when rendering the body
    return tableData.slice(headerRowCount).map((row, rowIndex) => (
      <tr key={rowIndex}>
        {row.map((cell, cellIndex) => {
          // Find if the cell is in a merged range
          const mergedRange = mergedRanges.find(range => {
            const startRow = range.startRowIndex;
            const endRow = range.endRowIndex;
            const startCol = range.startColumnIndex;
            const endCol = range.endColumnIndex;

            return (
              rowIndex + headerRowCount >= startRow && rowIndex + headerRowCount < endRow &&
              cellIndex >= startCol && cellIndex < endCol
            );
          });

          const isMerged = mergedRange !== undefined;

          return (
            <td
              key={cellIndex}
              rowSpan={isMerged ? (mergedRange.endRowIndex - mergedRange.startRowIndex) : undefined}
              colSpan={isMerged ? (mergedRange.endColumnIndex - mergedRange.startColumnIndex) : undefined}
              style={isMerged ? { backgroundColor: '#f0f0f0' } : {}}
            >
              {cell || ''}
            </td>
          );
        })}
      </tr>
    ));
  };

  return (
    <table>
      <thead>
        {renderHeaders()}
      </thead>
      <tbody>
        {renderTableBody()}
      </tbody>
    </table>
  );
};

export default GoogleSheetTable;

