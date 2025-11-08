const PDFDocument = require('pdfkit');

exports.generateConfirmationSlip = async (student, allocation) => {
  // returns a Buffer with a simple confirmation slip
  const doc = new PDFDocument({ size: 'A4' });
  const chunks = [];
  return new Promise((resolve, reject) => {
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(20).text('Confirmation Slip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${student.user && student.user.name ? student.user.name : ''}`);
    doc.text(`Roll Number: ${student.rollNumber || ''}`);
    doc.text(`Allocated Subject: ${allocation.subject && allocation.subject.title ? allocation.subject.title : ''}`);
    doc.text(`Allocated Section: ${allocation.section || ''}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('This is an auto-generated confirmation slip.', { align: 'left' });
    doc.end();
  });
};
// Placeholder: add PDF / Excel generation logic (e.g. pdfkit / exceljs)
exports.generateAllotmentPdf = async (allotments) => {
  // return Buffer or path
  return Buffer.from('PDF placeholder');
};
