import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToPDF = (title, columns, data, filename = 'export.pdf') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text((title || '').replace(/₹/g, 'Rs. '), 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 30);
  
  autoTable(doc, {
    startY: 36,
    head: [columns.map(col => (col.header || '').replace(/₹/g, 'Rs. '))],
    body: data.map(row => columns.map(col => {
      let val;
      if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else {
        val = row[col.accessorKey] || row[col.accessor];
      }
      const strVal = val !== undefined && val !== null ? String(val) : '';
      return strVal.replace(/₹/g, 'Rs. ');
    })),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // blue-500
    styles: { fontSize: 10, cellPadding: 3 },
  });

  doc.save(filename);
};

export const exportToExcel = (title, columns, data, filename = 'export.xlsx') => {
  // Format data for Excel
  const worksheetData = data.map(row => {
    const formattedRow = {};
    columns.forEach(col => {
      let val;
      if (typeof col.accessor === 'function') {
        val = col.accessor(row);
      } else {
        val = row[col.accessorKey] || row[col.accessor];
      }
      formattedRow[col.header] = val !== undefined && val !== null ? val : '';
    });
    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Adjust column widths
  const colWidths = columns.map(col => ({
    wch: Math.max(col.header.length, 15) // minimum width of 15
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
};
