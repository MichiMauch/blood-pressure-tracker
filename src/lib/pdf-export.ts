import jsPDF from "jspdf";
import type { MeasurementSession } from "./types";
import { computeStats } from "./calculations";
import { getBpCategory } from "./bp-categories";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export async function generatePdfReport(
  sessions: MeasurementSession[],
  startDate: Date,
  endDate: Date
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Blutdruck-Bericht", margin, y + 7);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  doc.text("Michael Mauch", margin, y + 4);
  doc.setTextColor(120);
  doc.text("geb. 08.03.1974", margin + doc.getTextWidth("Michael Mauch  "), y + 4);
  y += 7;

  doc.setTextColor(100);
  doc.text(
    `Zeitraum: ${format(startDate, "dd.MM.yyyy", { locale: de })} - ${format(endDate, "dd.MM.yyyy", { locale: de })}`,
    margin,
    y + 4
  );
  y += 6;
  doc.text(`Erstellt am: ${format(new Date(), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr`, margin, y + 4);
  y += 10;

  // Line separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Statistics
  const stats = computeStats(sessions);
  if (stats) {
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Zusammenfassung", margin, y + 5);
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const statRows = [
      ["Anzahl Messungen", `${stats.count}`],
      ["Durchschnitt Systolisch", `${stats.avgSystolic} mmHg`],
      ["Durchschnitt Diastolisch", `${stats.avgDiastolic} mmHg`],
      ["Durchschnitt Puls", `${stats.avgPulse} bpm`],
      ["Bereich Systolisch", `${stats.minSystolic} - ${stats.maxSystolic} mmHg`],
      ["Bereich Diastolisch", `${stats.minDiastolic} - ${stats.maxDiastolic} mmHg`],
    ];

    for (const [label, value] of statRows) {
      doc.setTextColor(100);
      doc.text(label, margin, y + 4);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(value, margin + 70, y + 4);
      doc.setFont("helvetica", "normal");
      y += 6;
    }

    const avgCat = getBpCategory(stats.avgSystolic, stats.avgDiastolic);
    doc.setTextColor(100);
    doc.text("Durchschnittliche Kategorie", margin, y + 4);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(avgCat.label, margin + 70, y + 4);
    y += 12;
  }

  // Table header
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Alle Messungen", margin, y + 5);
  y += 12;

  // Table
  // Column layout
  const colDate = margin;
  const colTime = margin + 23;
  const colTod = margin + 37;
  const colM1 = margin + 54;
  const colM2 = margin + 86;
  const colAvg = margin + 118;
  const colCat = margin + 148;

  // Group header row (Messung 1 / Messung 2)
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(230, 240, 250);
  doc.rect(colM1 - 1, y - 1, 30, 5, "F");
  doc.rect(colM2 - 1, y - 1, 30, 5, "F");
  doc.setTextColor(80);
  doc.text("Messung 1", colM1, y + 2.5);
  doc.text("Messung 2", colM2, y + 2.5);
  y += 6;

  // Sub-header row
  doc.setFontSize(7.5);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 1, contentWidth, 5.5, "F");
  doc.setTextColor(60);
  doc.text("Datum", colDate + 1, y + 3);
  doc.text("Zeit", colTime + 1, y + 3);
  doc.text("Tagesz.", colTod + 1, y + 3);
  doc.text("Sys/Dia", colM1, y + 3);
  doc.text("Puls", colM1 + 22, y + 3);
  doc.text("Sys/Dia", colM2, y + 3);
  doc.text("Puls", colM2 + 22, y + 3);
  doc.text("Durchschn.", colAvg, y + 3);
  doc.text("Kategorie", colCat, y + 3);

  // Vertical separators for group headers
  doc.setDrawColor(200);
  doc.line(colM1 - 1.5, y - 7, colM1 - 1.5, y + 4.5);
  doc.line(colM2 - 1.5, y - 1, colM2 - 1.5, y + 4.5);
  doc.line(colAvg - 1.5, y - 1, colAvg - 1.5, y + 4.5);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  for (let rowIdx = 0; rowIdx < sorted.length; rowIdx++) {
    const s = sorted[rowIdx];

    if (y > 275) {
      doc.addPage();
      y = margin;
    }

    const cat = getBpCategory(s.systolicAvg, s.diastolicAvg);
    const todLabel =
      s.timeOfDay === "morning"
        ? "Morgens"
        : s.timeOfDay === "evening"
          ? "Abends"
          : "Andere";

    // Alternating row background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, y - 1, contentWidth, 6, "F");
    }

    doc.setTextColor(30);
    doc.text(s.date, colDate + 1, y + 3);
    doc.text(s.time, colTime + 1, y + 3);
    doc.setTextColor(100);
    doc.text(todLabel, colTod + 1, y + 3);

    // Messung 1
    doc.setTextColor(30);
    doc.text(`${s.systolic1}/${s.diastolic1}`, colM1, y + 3);
    doc.setTextColor(100);
    doc.text(`${s.pulse1}`, colM1 + 22, y + 3);

    // Messung 2
    doc.setTextColor(30);
    doc.text(`${s.systolic2}/${s.diastolic2}`, colM2, y + 3);
    doc.setTextColor(100);
    doc.text(`${s.pulse2}`, colM2 + 22, y + 3);

    // Average (bold)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(`${s.systolicAvg}/${s.diastolicAvg}`, colAvg, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${s.pulseAvg}`, colAvg + 22, y + 3);

    // Category with colored dot
    const dotY = y + 2;
    doc.setFillColor(
      parseInt(cat.color.slice(1, 3), 16),
      parseInt(cat.color.slice(3, 5), 16),
      parseInt(cat.color.slice(5, 7), 16)
    );
    doc.circle(colCat + 1.5, dotY, 1, "F");
    doc.setTextColor(60);
    doc.text(cat.label, colCat + 4.5, y + 3);

    // Row separator
    doc.setDrawColor(235);
    doc.line(margin, y + 4.5, pageWidth - margin, y + 4.5);
    y += 6;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("Created with", margin, y);
  // Draw a small heart shape
  const hx = margin + doc.getTextWidth("Created with ") + 1.2;
  const hy = y - 1.2;
  const hs = 0.9;
  doc.setFillColor(220, 50, 50);
  doc.setDrawColor(220, 50, 50);
  // Left arc
  doc.circle(hx - hs * 0.5, hy, hs * 0.55, "F");
  // Right arc
  doc.circle(hx + hs * 0.5, hy, hs * 0.55, "F");
  // Bottom triangle
  doc.triangle(
    hx - hs * 1.05, hy + hs * 0.1,
    hx + hs * 1.05, hy + hs * 0.1,
    hx, hy + hs * 1.6,
    "F"
  );
  const byX = hx + hs * 1.5 + 1;
  doc.setTextColor(150);
  doc.text("by Michi's Blood Pressure Tracker", byX, y);

  doc.save(
    `Blutdruck-Bericht_${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}.pdf`
  );
}
