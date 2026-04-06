import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { HospitalSettings, User } from '../context/AppContext';

export interface InvoiceData {
  id: string;
  date: string;
  dueDate: string;
  status: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  patientEmail?: string;
  items: {
    description: string;
    amount: number;
    quantity: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }[];
  subtotal: number;
  totalTaxAmount: number;
  totalAmount: number;
  gstNumber?: string;
  type: 'consultation' | 'pharmacy' | 'lab' | 'general';
  billId?: string;
}

export const generateClinicalPDF = (
  invoice: InvoiceData,
  settings: HospitalSettings | null,
  issuer: User | null
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // --- 1. Premium Header ---
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(settings?.name || 'SUNRISE HOSPITAL', 20, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings?.address || 'Railway Station Road, Renigunta, AP - 517520', 20, 28);
  doc.text(`Ph: ${settings?.phone || '+91 94949 94220'} | Email: ${settings?.email || 'contact@sunrisehospital.com'}`, 20, 33);

  // --- 2. Invoice Meta ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  const typeLabel = invoice.type.toUpperCase() + ' INVOICE';
  doc.text(typeLabel, 20, 60);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Invoice ID: #${invoice.billId || invoice.id.substring(0, 8).toUpperCase()}`, 20, 70);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 75);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 80);

  // Bill To Section
  doc.setFillColor(248, 250, 252);
  doc.rect(130, 50, 60, 35, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text('BILL TO:', 135, 60);
  doc.setFontSize(10);
  doc.text(invoice.patientName, 135, 67);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  if (invoice.patientId) doc.text(`ID: ${invoice.patientId}`, 135, 72);
  if (invoice.patientPhone) doc.text(`Ph: ${invoice.patientPhone}`, 135, 77);

  // --- 3. Items Table ---
  const tableColumn = ["Description", "Qty", "Rate", "GST %", "GST Amt", "Total"];
  const tableRows = (invoice.items || []).map(item => [
    item.description,
    item.quantity,
    `₹${item.amount.toFixed(2)}`,
    `${item.taxRate}%`,
    `₹${item.taxAmount.toFixed(2)}`,
    `₹${item.total.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // --- 4. Summary & Footer ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
  
  doc.text(`Total GST:`, 140, finalY + 6);
  doc.text(`₹${invoice.totalTaxAmount.toFixed(2)}`, 190, finalY + 6, { align: 'right' });

  doc.setFillColor(79, 70, 229);
  doc.rect(130, finalY + 10, 65, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`TOTAL DUE:`, 135, finalY + 18);
  doc.text(`₹${invoice.totalAmount.toFixed(2)}`, 190, finalY + 18, { align: 'right' });

  // Legal & Disclaimer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`GSTIN: ${invoice.gstNumber || '29AAAAA0000A1Z5'}`, 20, finalY + 18);
  doc.text('Computer generated invoice. No signature required.', 20, 275);
  doc.text(`Issued by: ${issuer?.name || 'System Administrator'}`, 20, 280);

  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text('THANK YOU FOR CHOOSING SUNRISE HOSPITAL', pageWidth / 2, 280, { align: 'center' });

  // Save
  const fileName = `${invoice.type.charAt(0).toUpperCase()}—${invoice.billId || invoice.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};
