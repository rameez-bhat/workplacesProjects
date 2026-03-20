import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const GeneratePDF = () => {
  const generateMarksSheet = () => {
    const doc = new jsPDF();

    // Header Section
    doc.setFont("times", "bold");
    doc.setFontSize(30);
    doc.setTextColor("#327da8");
    doc.text("Govt. Boys High School Warpora", 105, 12, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor("#0bf6ef");
    doc.text("Zone Dangerpora", 105, 19, { align: "center" });
    doc.setTextColor(255, 0, 0);
    doc.text("Udise+: 01020501103", 105, 25, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Add Border for Header
    doc.setDrawColor(0, 0, 0);
    doc.rect(1, 1, 208, 28); // Header border

    // Student Details Section
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Name: John Doe", 15, 60);
    doc.text("Roll Number: 123456", 105, 60, { align: "left" });
    doc.text("Class: 10th Grade", 15, 70);
    doc.text("Session: 2024", 105, 70, { align: "left" });

    // Section Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#007bff");
    doc.text("Student Marks Sheet", 105, 90, { align: "center" });

    // Table Content
    const tableColumn = ["Subject", "Marks Obtained", "Total Marks"];
    const tableRows = [
      ["Mathematics", "85", "100"],
      ["Science", "92", "100"],
      ["English", "88", "100"],
      ["History", "75", "100"],
    ];

    // Table with Borders
    doc.autoTable({
      startY: 100,
      head: [tableColumn],
      body: tableRows,
      theme: "grid", // Ensures all cells have borders
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: "#ffffff",
        fontStyle: "bold",
        lineWidth: 0.5, // Border width
        lineColor: [0, 0, 0], // Border color
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
        halign: "center",
        valign: "middle",
        lineWidth: 0.5, // Add border to all cells
        lineColor: [0, 0, 0], // Border color
      },
    });

    // Footer Section
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Save PDF
    doc.save("Marks_Sheet.pdf");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        onClick={generateMarksSheet}
        style={{
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Generate Marks Sheet PDF
      </button>
    </div>
  );
};

export default GeneratePDF;
