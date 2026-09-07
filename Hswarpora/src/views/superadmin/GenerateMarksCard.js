import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToaster,
} from '@coreui/react'
import { Grid } from '@mui/material'
import QRCode from 'qrcode'
import dayjs from 'dayjs'
import Select1 from 'react-select'
import { useLoading } from '../../layout/LoadingContext'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const dateFormat = 'DD-MM-YYYY'
const BaseUrl = 'https://hswarporasopore.web.app/results/findresult/'

const SUBJECTS = [
  { key: 'english', label: 'English' },
  { key: 'math', label: 'Math' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'kashmiri', label: 'Kashmiri' },
  { key: 'science', label: 'Science' },
  { key: 's_science', label: 'S.Science' },
  { key: 'co-curricular-activities', label: 'Co.Curricular' },
  { key: 'apparel', label: 'Vocational(Apparels)' },
  { key: 'retail', label: 'Vocational(Retail)' },
]

const decodeParam = (value) => {
  if (!value) return ''

  try {
    return decodeURIComponent(escape(atob(value)))
  } catch (error) {
    console.error('Unable to decode route parameter:', value, error)
    return ''
  }
}

const encodeParam = (value) => {
  try {
    return btoa(unescape(encodeURIComponent(String(value ?? ''))))
  } catch (error) {
    console.error('Unable to encode route parameter:', value, error)
    return ''
  }
}

const getGrade = (marksObtained, maximumMarks) => {
  if (!maximumMarks) return '-'

  const percentage = (Number(marksObtained) / Number(maximumMarks)) * 100

  if (percentage >= 90) return 'Grade A1'
  if (percentage >= 80) return 'Grade A2'
  if (percentage >= 70) return 'Grade B1'
  if (percentage >= 60) return 'Grade B2'
  if (percentage >= 50) return 'Grade C1'
  if (percentage >= 40) return 'Grade C2'
  if (percentage >= 30) return 'Grade D'
  return 'Fail'
}

const getStudentYearResult = (student, selectedYear) => {
  const yearData = student?.[selectedYear]

  if (!yearData) return null

  return {
    particulars: yearData?.particulars || {},
    subjects: yearData?.subjects || {},
    admissionno: Number(student?.admissionno || 0),
    category: student?.category,
    dob: student?.dob,
    dobActual: student?.dobActual,
    fathersname: student?.fathersname,
    id: student?.id,
    mothersname: student?.mothersname,
    name: student?.name,
  }
}

const Validation = () => {
  const { cid, yearPar, classPar, studentPar } = useParams()

  const { showLoading, hideLoading, firestoreQueries, DatabaseName } = useLoading()

  const [errors, setErrors] = useState({})
  const [toast] = useState(0)
  const toaster = useRef()

  const [yearToBeSelected, setYearToBeSelected] = useState(null)
  const [autoSelected, setAutoSelected] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const [listClassOption, setListClassOption] = useState([])
  const [listClassOptionFull, setListClassOptionFull] = useState([])
  const [listStudentOption, setListStudentOption] = useState([])
  const [listAllStudentWithDetails, setListAllStudentWithDetails] = useState([])

  const [fullClassDetails, setFullClassDetails] = useState({})
  const [fullStudentResult, setFullStudentResult] = useState({})

  const [currentData, setCurrentData] = useState({})
  const [currentResult, setCurrentResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const sessionSelected = useMemo(() => {
    if (!yearToBeSelected) return ''
    return `${Number(yearToBeSelected) - 1}-${String(yearToBeSelected).slice(-2)}`
  }, [yearToBeSelected])

  const selectedClassName = currentData?.class?.value || ''

  const selectedClassDetails = selectedClassName
    ? fullClassDetails?.[selectedClassName]
    : null

  const selectedYearClassDetails = selectedClassDetails?.[yearToBeSelected] || {}

  const examEntries = useMemo(() => {
    return Object.entries(selectedYearClassDetails?.exams || {}).sort(([keyA], [keyB]) =>
      keyA.localeCompare(keyB, undefined, { numeric: true }),
    )
  }, [selectedYearClassDetails])

  const sortedExamKeys = useMemo(() => examEntries.map(([key]) => key), [examEntries])

  const maximumMarks = useMemo(() => {
    return examEntries.reduce((total, [, exam]) => total + Number(exam?.Max || 0), 0)
  }, [examEntries])

  const classSubjectList = selectedClassDetails?.subjects || {}

  const resultRows = useMemo(() => {
    if (!currentResult) return []

    return SUBJECTS.filter(({ key }) => {
      const studentHasSubject = !!currentResult?.subjects?.[key]
      const classHasSubject = !!classSubjectList?.[key]

      return studentHasSubject && (classHasSubject || Object.keys(classSubjectList).length === 0)
    }).map(({ key, label }) => {
      const marks = sortedExamKeys.map((exam) =>
        Number(currentResult?.subjects?.[key]?.[exam] || 0),
      )

      const marksObtained = marks.reduce((total, value) => total + Number(value || 0), 0)

      return {
        key,
        label,
        marks,
        marksObtained,
        maximumMarks,
      }
    })
  }, [currentResult, classSubjectList, sortedExamKeys, maximumMarks])

  const grandMaxMarks = useMemo(
    () => resultRows.reduce((total, row) => total + Number(row.maximumMarks || 0), 0),
    [resultRows],
  )

  const grandMarksObtained = useMemo(
    () => resultRows.reduce((total, row) => total + Number(row.marksObtained || 0), 0),
    [resultRows],
  )

  const grade = useMemo(
    () => getGrade(grandMarksObtained, grandMaxMarks),
    [grandMarksObtained, grandMaxMarks],
  )

  const loadClasses = async (selectedYear) => {
    const listOfClasses = await firestoreQueries.FetchDataFromCollection(
      DatabaseName,
      'classes',
      1000,
      null,
      null,
      'DDO',
      'FieldOrderCol',
      'asc',
    )

    const classMap = {}

    const classOptions = (listOfClasses || []).map((classItem) => {
      classMap[classItem.class] = classItem

      return {
        value: classItem.class,
        label: classItem.class,
      }
    })

    setFullClassDetails(classMap)
    setListClassOption(classOptions)
    setListClassOptionFull(listOfClasses || [])

    console.log('Loaded classes for selected year:', selectedYear)

    return {
      listOfClasses: listOfClasses || [],
      classMap,
    }
  }

  const loadStudentsForClass = async (className, selectedYear) => {
    if (!className || !selectedYear) {
      setListStudentOption([])
      setListAllStudentWithDetails([])
      setFullStudentResult({})
      return []
    }

    const classFieldMap = `${selectedYear}.particulars.currentclass`

    const listOfStudents = await firestoreQueries.FetchDataFromCollection(
      DatabaseName,
      'students',
      1000,
      classFieldMap,
      '==',
      className,
      'name',
      'asc',
    )

    const studentMap = {}
    const studentOptions = []

    ;(listOfStudents || []).forEach((student) => {
      const result = getStudentYearResult(student, selectedYear)

      if (!result) return

      studentMap[student.id] = result
      studentOptions.push({
        value: student.id,
        label: student.name,
        rollno: student.id,
      })
    })

    setListAllStudentWithDetails(listOfStudents || [])
    setFullStudentResult(studentMap)
    setListStudentOption(studentOptions)

    console.log('Selected year:', selectedYear)
    console.log('Selected class:', className)
    console.log('Students loaded:', studentOptions.length)

    return listOfStudents || []
  }

  const loadAutoSelectedResult = async (selectedYear, selectedClass, selectedStudent) => {
    let classList = await firestoreQueries.FetchDataFromCollection(
      DatabaseName,
      'classes',
      1000,
      'id',
      '==',
      selectedClass,
      'FieldOrderCol',
      'asc',
    )

    if (!classList?.length) {
      const allClasses = await firestoreQueries.FetchDataFromCollection(
        DatabaseName,
        'classes',
        1000,
        null,
        null,
        'DDO',
        'FieldOrderCol',
        'asc',
      )

      classList = (allClasses || []).filter(
        (classItem) => classItem?.class === selectedClass || classItem?.id === selectedClass,
      )
    }

    if (!classList?.length) {
      throw new Error(`Class ${selectedClass} was not found.`)
    }

    const classItem = classList[0]

    setFullClassDetails((prev) => ({
      ...prev,
      [selectedClass]: classItem,
    }))

    const listOfStudents = await firestoreQueries.FetchDataFromCollection(
      DatabaseName,
      'students',
      1000,
      'id',
      '==',
      selectedStudent,
      'name',
      'asc',
    )

    if (!listOfStudents?.length) {
      throw new Error(`Student ${selectedStudent} was not found.`)
    }

    const student = listOfStudents[0]
    const studentResult = getStudentYearResult(student, selectedYear)

    if (!studentResult) {
      throw new Error(`No result data was found for selected year ${selectedYear}.`)
    }

    const studentOption = {
      value: student.id,
      label: student.name,
      rollno: student.id,
    }

    setFullStudentResult({ [student.id]: studentResult })
    setListStudentOption([studentOption])
    setListAllStudentWithDetails([student])

    setCurrentData({
      class: {
        value: selectedClass,
        label: selectedClass,
      },
      student: studentOption,
    })

    setCurrentResult(studentResult)
    setShowResult(true)
  }

  useEffect(() => {
    const initialize = async () => {
      setInitializing(true)
      setShowResult(false)

      try {
        let selectedYear = null

        if (yearPar) {
          const decodedYear = decodeParam(yearPar)
          selectedYear = Number(decodedYear)
        }

        if (!selectedYear || Number.isNaN(selectedYear)) {
          const settingsList = await firestoreQueries.FetchDataFromCollection(
            DatabaseName,
            'settings',
            1000,
            'settingtype',
            '==',
            'currentyear',
            'currentyear',
            'asc',
          )

          if (settingsList?.length) {
            selectedYear = Number(settingsList[0].currentyear)
          }
        }

        if (!selectedYear || Number.isNaN(selectedYear)) {
          throw new Error('Unable to determine result year.')
        }

        setYearToBeSelected(selectedYear)

        const selectedClass = classPar ? decodeParam(classPar) : ''
        const selectedStudent = studentPar ? decodeParam(studentPar) : ''

        if (selectedClass && selectedStudent) {
          setAutoSelected(true)
          await loadAutoSelectedResult(selectedYear, selectedClass, selectedStudent)
        } else {
          setAutoSelected(false)
          await loadClasses(selectedYear)
        }
      } catch (error) {
        console.error('Initialization error:', error)
        setErrors({
          mainerror: error?.message || 'Unable to load result data.',
        })
      } finally {
        setInitializing(false)
      }
    }

    initialize()
  }, [yearPar, classPar, studentPar, DatabaseName, firestoreQueries])

  const handleFormChange = async (value, name = '') => {
    setErrors({})
    setShowResult(false)
    setCurrentResult(null)

    if (name === 'class') {
      const selectedClass = value?.value || ''

      setCurrentData({
        class: value,
      })

      setListStudentOption([])
      setListAllStudentWithDetails([])
      setFullStudentResult({})

      if (selectedClass) {
        try {
          showLoading()
          await loadStudentsForClass(selectedClass, yearToBeSelected)
        } catch (error) {
          console.error('Unable to load students:', error)
          setErrors({
            mainerror: error?.message || 'Unable to load students.',
          })
        } finally {
          hideLoading()
        }
      }

      return
    }

    if (name === 'student') {
      setCurrentData((prev) => ({
        ...prev,
        student: value,
      }))
    }
  }

  const formValidate = () => {
    const validationErrors = {}

    if (!currentData?.class) {
      validationErrors.class = 'Please Select Class.'
    }

    if (!currentData?.student) {
      validationErrors.student = 'Please Select Student.'
    }

    return validationErrors
  }

  const handleFormSubmit = async () => {
    showLoading()

    try {
      const validationErrors = formValidate()
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length) {
        setShowResult(false)
        return
      }

      const studentResult = fullStudentResult?.[currentData.student.value]

      if (!studentResult) {
        setErrors({
          mainerror: `Result is not available for ${currentData.student.label} in year ${yearToBeSelected}.`,
        })
        setShowResult(false)
        return
      }

      setCurrentResult(studentResult)
      setShowResult(true)
    } finally {
      hideLoading()
    }
  }

  const getSubjectKeysForExcel = () => {
    const classSubjects = fullClassDetails?.[selectedClassName]?.subjects || {}

    return SUBJECTS.filter(({ key }) => {
      if (classSubjects?.[key]) return true

      return listAllStudentWithDetails.some((student) => !!student?.[yearToBeSelected]?.subjects?.[key])
    })
  }

  const generateExcelForAllStudents = async () => {
    if (!selectedClassName) {
      setErrors({ class: 'Please Select Class.' })
      return
    }

    if (!listAllStudentWithDetails?.length) {
      setErrors({ mainerror: 'No students found for selected class and year.' })
      return
    }

    if (!examEntries.length) {
      setErrors({ mainerror: `No exams are configured for ${selectedClassName} in ${yearToBeSelected}.` })
      return
    }

    showLoading()

    try {
      const subjects = getSubjectKeysForExcel()
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Result Sheet')

      const headerRow1 = ['Name', 'Fathers Name', 'D-O-B', 'Class', 'Roll No']
      const headerRow2 = ['', '', '', '', '']
      const mergeRanges = []

      let currentColumn = 6

      subjects.forEach(({ label }) => {
        headerRow1.push(label)

        for (let i = 0; i < sortedExamKeys.length; i += 1) {
          headerRow1.push('')
        }

        headerRow2.push(
          ...sortedExamKeys.map((exam) => exam.replace(/^.*\$\$/, '')),
          'Total',
        )

        mergeRanges.push({
          from: currentColumn,
          to: currentColumn + sortedExamKeys.length,
        })

        currentColumn += sortedExamKeys.length + 1
      })

      headerRow1.push('Grand Total')
      headerRow2.push('Grand Total')

      const excelHeaderRow1 = worksheet.addRow(headerRow1)
      const excelHeaderRow2 = worksheet.addRow(headerRow2)

      mergeRanges.forEach(({ from, to }) => {
        if (to > from) {
          worksheet.mergeCells(1, from, 1, to)
        }
      })

      listAllStudentWithDetails.forEach((student) => {
        const yearData = student?.[yearToBeSelected]
        if (!yearData) return

        const rollNo = yearData?.particulars?.rollno
        const displayRollNo = rollNo !== undefined && rollNo !== null
          ? String(rollNo).slice(1)
          : ''

        const dob = student?.dobActual?.seconds
          ? dayjs(new Date(student.dobActual.seconds * 1000)).format(dateFormat)
          : ''

        const rowData = [
          student?.name || '',
          student?.fathersname || '',
          dob,
          yearData?.particulars?.currentclass || '',
          displayRollNo,
        ]

        let grandTotal = 0

        subjects.forEach(({ key }) => {
          const marks = sortedExamKeys.map((exam) =>
            Number(yearData?.subjects?.[key]?.[exam] || 0),
          )

          const subjectTotal = marks.reduce((total, mark) => total + mark, 0)
          grandTotal += subjectTotal

          rowData.push(...marks, subjectTotal)
        })

        rowData.push(grandTotal)

        const row = worksheet.addRow(rowData)

        row.eachCell((cell) => {
          cell.font = { name: 'Arial', size: 12 }
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      })

      ;[excelHeaderRow1, excelHeaderRow2].forEach((row) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.font = { bold: true }
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D9E1F2' },
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      })

      worksheet.columns.forEach((column) => {
        let maxLength = 10

        column.eachCell({ includeEmpty: true }, (cell) => {
          const length = cell.value?.toString().length || 0
          if (length > maxLength) maxLength = length
        })

        column.width = Math.min(maxLength + 2, 30)
      })

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(
        new Blob([buffer]),
        `${selectedClassName}_${sessionSelected}_ResultSheet.xlsx`,
      )
    } catch (error) {
      console.error('Excel generation error:', error)
      setErrors({
        mainerror: error?.message || 'Unable to generate Excel result sheet.',
      })
    } finally {
      hideLoading()
    }
  }

  const generatePDF = async () => {
    if (!currentResult || !selectedClassName || !yearToBeSelected) return

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    doc.setFont('times', 'bold')
    doc.setFontSize(30)
    doc.setTextColor('#8C183B')
    doc.text('Govt. Boys High School Warpora', 105, 12, { align: 'center' })

    doc.setFontSize(12)
    doc.text('Zone Dangerpora', 105, 19, { align: 'center' })

    doc.setTextColor(255, 0, 0)
    doc.text('Udise+: 01020501103', 105, 25, { align: 'center' })

    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(0, 0, 0)
    doc.rect(1, 2, 208, 28)
    doc.rect(1, 40, 208, 255)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(255, 0, 0)
    doc.text(`Session: ${sessionSelected}`, 105, 45, { align: 'center' })

    const drawLabelValue = (label, value, x, y) => {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor('#8C183B')
      doc.text(label, x, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor('#000000')
      doc.text(String(value ?? ''), x + doc.getTextWidth(label), y)
    }

    drawLabelValue('Name: ', currentResult?.name, 7, 60)
    drawLabelValue(
      'Roll Number: ',
      currentResult?.particulars?.rollno !== undefined
        ? String(currentResult.particulars.rollno).slice(1)
        : '',
      110,
      60,
    )
    drawLabelValue("Father's Name: ", currentResult?.fathersname, 7, 70)
    drawLabelValue(
      'D.O.B: ',
      currentResult?.dobActual?.seconds
        ? dayjs(new Date(currentResult.dobActual.seconds * 1000)).format(dateFormat)
        : '',
      110,
      70,
    )
    drawLabelValue("Mother's Name: ", currentResult?.mothersname, 7, 80)
    drawLabelValue('Admission No: ', currentResult?.admissionno, 110, 80)
    drawLabelValue('Class: ', selectedClassName, 7, 90)

    const yearEncoded = encodeParam(yearToBeSelected)
    const classEncoded = encodeParam(selectedClassName)
    const studentEncoded = encodeParam(currentResult?.id)
    const qrData = `${BaseUrl}${yearEncoded}/${classEncoded}/${studentEncoded}`

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor('#007bff')
    doc.text('Student Marks Sheet', 105, 100, { align: 'center' })

    const headRow = [
      'Subject',
      ...examEntries.map(([key, value]) =>
        `${key.replace(/^.*\$\$/, '')}\n(${Number(value?.Max || 0)})`,
      ),
      'Max Marks',
      'Marks Obtained',
    ]

    const bodyRows = resultRows.map((row) => [
      row.label,
      ...row.marks,
      row.maximumMarks,
      row.marksObtained,
    ])

    bodyRows.push([
      {
        content: 'Grand Total',
        colSpan: Math.max(headRow.length - 2, 1),
        styles: { halign: 'center', fontStyle: 'bold' },
      },
      grandMaxMarks,
      grandMarksObtained,
    ])

    bodyRows.push([
      {
        content: 'Performance',
        colSpan: Math.max(headRow.length - 2, 1),
        styles: { halign: 'center', fontStyle: 'bold' },
      },
      {
        content: grade,
        colSpan: 2,
        styles: { halign: 'center', fontStyle: 'bold' },
      },
    ])

    doc.autoTable({
      startY: 105,
      margin: { left: 2 },
      head: [headRow],
      body: bodyRows,
      theme: 'grid',
      tableWidth: 205,
      headStyles: {
        fillColor: [192, 192, 192],
        textColor: '#ffffff',
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 12,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.minCellHeight = 13
        }
      },
    })

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.text('Teacher I/C: ', 15, 250)
    doc.text('Checked By: ', 80, 250)
    doc.text('Headmaster: ', 150, 250)

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 100 })
      doc.addImage(qrCodeDataUrl, 'PNG', 155, 45, 40, 40)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }

    doc.setFontSize(10)
    doc.setTextColor('#000000')
    doc.text(
      `System Generated on: ${new Date().toLocaleDateString()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' },
    )

    doc.save(`${currentResult?.name || 'Student'}_${sessionSelected}_Marks_Sheet.pdf`)
  }

  if (initializing) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardBody>Loading result data...</CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        {!autoSelected && (
          <CCard className="mb-4">
            <CToaster ref={toaster} push={toast} placement="top-end" />

            <CCardHeader>
              <strong>Result </strong> <small>Searching</small>
            </CCardHeader>

            <CCardBody>
              <p className="text-body-secondary small">
                {errors?.mainerror && (
                  <span className="validationerror">{errors.mainerror}</span>
                )}
              </p>

              <CForm className="row g-3 needs-validation">
                <CCol md={6}>
                  <CFormLabel htmlFor="result-class">Select Class</CFormLabel>

                  <Grid item xs={6}>
                    <Select1
                      inputId="result-class"
                      value={currentData?.class || null}
                      onChange={(event) => handleFormChange(event, 'class')}
                      options={listClassOption}
                      placeholder="Select Class"
                      isSearchable
                      menuPosition="fixed"
                      styles={{
                        menu: (base) => ({
                          ...base,
                          backgroundColor: 'white',
                          zIndex: 9999,
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }),
                      }}
                    />

                    {errors?.class && (
                      <span className="validationerror">{errors.class}</span>
                    )}
                  </Grid>
                </CCol>

                {!!currentData?.class && (
                  <CCol md={6}>
                    <CFormLabel htmlFor="result-student">Select Name</CFormLabel>

                    <Grid item xs={6}>
                      <Select1
                        inputId="result-student"
                        value={currentData?.student || null}
                        onChange={(event) => handleFormChange(event, 'student')}
                        options={listStudentOption}
                        placeholder="Select Name"
                        isSearchable
                        menuPosition="fixed"
                        styles={{
                          menu: (base) => ({
                            ...base,
                            backgroundColor: 'white',
                            zIndex: 9999,
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                          }),
                        }}
                      />

                      {errors?.student && (
                        <span className="validationerror">{errors.student}</span>
                      )}
                    </Grid>
                  </CCol>
                )}

                <CCol xs={12} className="row">
                  <p></p>

                  <CCol xs={6}>
                    <CButton color="primary" type="button" onClick={handleFormSubmit}>
                      Fetch Result
                    </CButton>
                  </CCol>

                  <CCol xs={6}>
                    <CButton
                      color="primary"
                      type="button"
                      onClick={generateExcelForAllStudents}
                    >
                      Generate Result Sheet
                    </CButton>
                  </CCol>
                </CCol>
              </CForm>
            </CCardBody>
          </CCard>
        )}

        {showResult && currentResult && (
          <CCard className="mb-4">
            <CCardHeader>
              <strong>View Result</strong>
            </CCardHeader>

            <CCardBody>
              <p className="text-body-secondary small" style={{ textAlign: 'center' }}>
                <CCol
                  style={{
                    margin: '0 auto',
                    width: '120px',
                    fontSize: '21px',
                    fontWeight: 900,
                    textAlign: 'center',
                  }}
                >
                  {sessionSelected}
                </CCol>
              </p>

              <CRow>
                <CCol xs="6">
                  <strong>Name:</strong> {currentResult?.name}
                </CCol>

                <CCol xs="6" className="text-right">
                  <strong>Roll No:</strong>{' '}
                  {currentResult?.particulars?.rollno !== undefined
                    ? String(currentResult.particulars.rollno).slice(1)
                    : ''}
                </CCol>
              </CRow>

              <CRow className="mt-4">
                <CCol xs="6">
                  <strong>Fathers Name:</strong> {currentResult?.fathersname}
                </CCol>

                <CCol xs="6" className="text-right">
                  <strong>DOB:</strong>{' '}
                  {currentResult?.dobActual?.seconds
                    ? dayjs(new Date(currentResult.dobActual.seconds * 1000)).format(dateFormat)
                    : ''}
                </CCol>
              </CRow>

              <CRow className="mt-4 mb-4">
                <CCol xs="6">
                  <strong>Mothers Name:</strong> {currentResult?.mothersname}
                </CCol>

                <CCol xs="6" className="text-right">
                  <strong>Admission No:</strong> {currentResult?.admissionno}
                </CCol>
              </CRow>

              {!examEntries.length ? (
                <p className="validationerror">
                  No exams are configured for {selectedClassName} in year {yearToBeSelected}.
                </p>
              ) : (
                <CTable color="success" bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Subject</CTableHeaderCell>

                      {examEntries.map(([key, value]) => (
                        <CTableHeaderCell
                          key={key}
                          scope="col"
                          className="text-center"
                        >
                          {key.replace(/^.*\$\$/, '')}
                          <br />
                          ({Number(value?.Max || 0)})
                        </CTableHeaderCell>
                      ))}

                      <CTableHeaderCell scope="col" className="text-center align-top">
                        Max Marks
                      </CTableHeaderCell>

                      <CTableHeaderCell scope="col" className="text-center align-top">
                        Marks Obtained
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody>
                    {resultRows.map((row) => (
                      <CTableRow key={row.key}>
                        <CTableHeaderCell scope="row">{row.label}</CTableHeaderCell>

                        {row.marks.map((mark, index) => (
                          <CTableDataCell
                            key={`${row.key}-${sortedExamKeys[index]}`}
                            className="text-center"
                          >
                            {mark}
                          </CTableDataCell>
                        ))}

                        <CTableDataCell className="text-center">
                          {row.maximumMarks}
                        </CTableDataCell>

                        <CTableDataCell className="text-center">
                          {row.marksObtained}
                        </CTableDataCell>
                      </CTableRow>
                    ))}

                    <CTableRow>
                      <CTableHeaderCell
                        colSpan={sortedExamKeys.length + 1}
                        className="text-end"
                      >
                        Grand Total
                      </CTableHeaderCell>

                      <CTableHeaderCell className="text-center">
                        {grandMaxMarks}
                      </CTableHeaderCell>

                      <CTableHeaderCell className="text-center">
                        {grandMarksObtained}
                      </CTableHeaderCell>
                    </CTableRow>

                    <CTableRow>
                      <CTableHeaderCell
                        colSpan={sortedExamKeys.length + 1}
                        className="text-end"
                      >
                        Performance
                      </CTableHeaderCell>

                      <CTableHeaderCell className="text-center" colSpan={2}>
                        {grade}
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              )}

              <CButton color="primary" type="button" onClick={generatePDF}>
                Download PDF
              </CButton>
            </CCardBody>
          </CCard>
        )}
      </CCol>
    </CRow>
  )
}

export default Validation
