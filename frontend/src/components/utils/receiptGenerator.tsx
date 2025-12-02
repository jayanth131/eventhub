import { jsPDF } from "jspdf";
import QRCode from "qrcode";

/**
 * PREMIUM EventHub PDF Receipt Generator
 */
export async function generateCombinedReceiptPDF(booking: any, currentUser?: any) {
  try {
    const b = booking || {};
    const user = currentUser || { name: "Customer", email: "" };

    // 🍁 Unified Stripe Transaction ID
    const stripeTxn =
      b.finalTransactionId ||
      b.advanceTransactionId ||
      b.finalPaymentIntentId ||
      b.paymentIntentId ||
      "N/A";

    const receiptUrl = b.finalReceiptUrl || b.stripeReceiptUrl || null;
    console.log("trans ",stripeTxn);
    console.log("b values ",b)
    // 🕊 Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(
      receiptUrl || `https://eventhub.app/receipt/${b.id}`
    );

    // Create Document
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    // BACKGROUND WATERMARK
    // doc.setGState(new doc.GState({ opacity: 0.08 }));
    // doc.addImage(
    //   "/eventhub-watermark.png",
    //   "PNG",
    //   pageWidth / 2 - 200,
    //   200,
    //   400,
    //   400
    // );
    // doc.setGState(new doc.GState({ opacity: 1 }));

    // HEADER BAR
    doc.setFillColor(120, 0, 0);
    doc.rect(0, 0, pageWidth, 70, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(255, 215, 100);
    doc.text("EventHub", 40, 45);

    doc.setFontSize(12);
    doc.text("Official Receipt", pageWidth - 40, 45, { align: "right" });

    // RECEIPT BOX
    y += 50;
    doc.setDrawColor(200, 180, 120);
    doc.setLineWidth(1.2);
    doc.roundedRect(30, y, pageWidth - 60, 80, 8, 8);

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Receipt ID: ${b.id}`, 40, y + 25);
    doc.text(
      `Generated On: ${new Date().toLocaleString("en-IN")}`,
      pageWidth - 40,
      y + 25,
      { align: "right" }
    );

    doc.text(
      `Payment Status: ${b.paymentStatus || (b.status === "completed" ? "Paid Full" : "Partial")}`,
      40,
      y + 45
    );
    doc.text(`Transaction ID: ${stripeTxn}`, pageWidth - 40, y + 45, {
      align: "right",
    });

    y += 110;

    // TWO COLUMN DETAILS
    const leftX = 40;
    const rightX = pageWidth / 2 + 10;

    // CUSTOMER SECTION
    doc.setFontSize(14);
    doc.text("Customer Details", leftX, y);
    doc.setFontSize(11);
    doc.text(`Name: ${user.name}`, leftX, y + 20);
    doc.text(`Email: ${user.email}`, leftX, y + 40);

    // VENDOR SECTION
    doc.setFontSize(14);
    doc.text("Vendor Details", rightX, y);
    doc.setFontSize(11);
    doc.text(`Name: ${b.vendorName}`, rightX, y + 20);
    doc.text(`Category: ${b.serviceCategory}`, rightX, y + 40);
    doc.text(`Location: ${b.vendorLocation}`, rightX, y + 60);

    y += 100;

    // EVENT DETAILS BLOCK
    doc.setFontSize(14);
    doc.text("Event Details", leftX, y);

    doc.setFontSize(11);
    doc.text(`Event Type: ${b.eventType}`, leftX, y + 20);
    doc.text(`Event Holder(s): ${b.eventHolderNames}`, leftX, y + 40);
    doc.text(`Date: ${new Date(b.date).toDateString()}`, leftX, y + 60);
    doc.text(`Time: ${b.time}`, leftX + 220, y + 60);

    y += 100;

    // PAYMENT BREAKDOWN SECTION
    doc.setFontSize(14);
    doc.text("Payment Breakdown", leftX, y);
// ---- PAYMENT BREAKDOWN (FIXED LAYOUT + FONT) ----
const fmt = (n: number) => {
  const cleaned = Number(n || 0);
  return "Rs. " + cleaned.toLocaleString("en-IN");
};


// Bring numbers inside the box
const valueX = pageWidth - 110;

// Ensure clean unicode printing


// Determine text dynamically
const isFullyPaid = b.paymentStatus === "paid_full";

const remainingLabel = isFullyPaid
  ? "Remaining Paid:"
  : "Remaining Amount To Be Paid:";

const remainingValue = isFullyPaid
  ? b.total - b.paid
  : b.balance ?? (b.total - b.paid);

const totalLabel = isFullyPaid ? "Total Paid:" : "Total Amount:";
const totalValue = b.total;

// DRAW BOX
doc.roundedRect(leftX, y + 10, pageWidth - 80, 130, 8, 8);
doc.setFontSize(12);

// --- ROW 1: ADVANCE ---
doc.text("Advance Paid:", leftX + 10, y + 40);
doc.text(fmt(b.paid), valueX, y + 40, { align: "right" });

// --- ROW 2: REMAINING ---
doc.text(remainingLabel, leftX + 10, y + 70);
doc.text(fmt(remainingValue), valueX, y + 70, { align: "right" });

// --- ROW 3: TOTAL ---
doc.text(totalLabel, leftX + 10, y + 100);
doc.setFont("helvetica", "bold");
doc.text(fmt(totalValue), valueX, y + 100, { align: "right" });
doc.setFont("helvetica", "normal");
    y += 160;

    // QR CODE & FOOTER
    doc.text("Verify Receipt:", leftX, y);
    doc.addImage(qrCodeDataUrl, "PNG", leftX, y + 10, 80, 80);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "This is a computer-generated receipt. No signature required.",
      leftX,
      y + 110
    );

    // SAVE FILE
    doc.save(`EventHub-Receipt-${b.id}.pdf`);

    return { success: true };
  } catch (err) {
    console.error("PDF Error:", err);
    return { success: false, error: err };
  }
}

export default generateCombinedReceiptPDF;
