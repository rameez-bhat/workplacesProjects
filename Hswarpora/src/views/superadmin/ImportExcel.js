import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useLoading } from '../../layout/LoadingContext';

function ImportExcel  () {
  const [excelData, setExcelData] = useState([]);
 const {showLoading,hideLoading,firestoreQueries,DatabaseName,TooltipsPopovers} = useLoading();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedData = await Promise.all(
        jsonData.map(async (row) => {
          // Create local copies for each row to avoid overwriting
       const parseExcelDate = (excelDate) => {
  const epoch = new Date(1899, 11, 30); // Excel's epoch date: Dec 30, 1899
  const daysOffset = excelDate * 86400 * 1000; // Convert Excel days to milliseconds
  return new Date(epoch.getTime() + daysOffset); // Return as a Date object
};

// Function to parse date if it's in dd-mm-yyyy string format
const parseStringDate = (dateString) => {
  const [day, month, year] = dateString.split('-').map(Number); // Split and convert parts to numbers
  return new Date(year, month - 1, day); // Create a Date object, with month zero-based
};
            const dob = typeof row['D.O.B'] === 'number'
          ? parseExcelDate(row['D.O.B']).toLocaleDateString()
          : parseStringDate(row['D.O.B']).toLocaleDateString();

        const dobActual = typeof row['D.O.B'] === 'number'
          ? parseExcelDate(row['D.O.B']).toLocaleDateString()
          : parseStringDate(row['D.O.B']).toLocaleDateString();

          const dobActual1=firestoreQueries.Timestamp.fromDate(new Date(dobActual));

          let admissionnumber="Student_"+row['Admission No'];
          let dataTobesend={
            name:row['Name'],
            fathersname:row["Father's Name"],
            mothersname:row["Mother's Name"],
            dob:row['D.O.B'],
            dobActual:dobActual1,
            admissionno:row['Admission No'],
            rollno:row['Roll No'],
            category:row['Category'],
            currentclass:row['CLASS']
          }
          console.log("dob----->",dob)
          console.log("dobActual1----->",dobActual1)
           console.log("dobActual----->",dobActual)
 console.log("admissionnumber----->",admissionnumber)
  console.log("dataTobesend----->",dataTobesend)
          try
          {
            // Update Firestore with user data
           let response= await firestoreQueries.updateOrCreateById(DatabaseName, "students",  admissionnumber, dataTobesend);
           console.log("response=====>",response)
          }
          catch (error)
          {
            console.log("error======>",error)
          }
          return dataTobesend;
        })
      );

      setExcelData(processedData); // Store processed data in state
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <h2>Import Excel File in React</h2>
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />

      <div>
        <h3>Excel Data:</h3>
        <pre>{JSON.stringify(excelData, null, 2)}</pre>
      </div>
    </div>
  );
}

export default ImportExcel;
