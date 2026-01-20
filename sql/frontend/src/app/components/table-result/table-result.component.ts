import { Component, Input, Output, EventEmitter } from "@angular/core";
import { QueryResult } from "../../models/message.model";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

@Component({
  selector: "app-table-result",
  templateUrl: "./table-result.component.html",
  styleUrls: ["./table-result.component.css"],
})
export class TableResultComponent {
  @Input() data!: QueryResult;
  @Output() loadMore = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}

  onLoadMore(): void {
    this.loadMore.emit();
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "-";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    // Format numbers with thousand separators
    if (typeof value === "number" || this.isNumericString(value)) {
      const num = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(num)) {
        return num.toLocaleString("en-US");
      }
    }
    if (value instanceof Date || this.isDateString(value)) {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return String(value);
  }

  /**
   * Check if value contains HTML
   */
  isHtmlContent(value: any): boolean {
    if (typeof value !== "string") return false;
    return /<[^>]+>/.test(value);
  }

  /**
   * Strip HTML tags and decode entities for plain text display
   */
  stripHtml(value: string): string {
    // Create a temporary div element
    const tmp = document.createElement("div");
    tmp.innerHTML = value;
    // Get text content (strips all HTML)
    const text = tmp.textContent || tmp.innerText || "";
    // Decode HTML entities
    return text.trim();
  }

  /**
   * Sanitize HTML for safe display
   */
  sanitizeHtml(value: string): SafeHtml {
    // Basic sanitization - remove script tags and dangerous attributes
    const cleaned = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "");
    return this.sanitizer.sanitize(1, cleaned) || "";
  }

  private isNumericString(value: any): boolean {
    if (typeof value !== "string") return false;
    // Check if string is purely numeric (including decimals)
    return /^\d+(\.\d+)?$/.test(value.trim());
  }

  private isDateString(value: any): boolean {
    if (typeof value !== "string") return false;
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.includes("-");
  }

  formatColumnName(column: string): string {
    // Convert snake_case to Title Case
    return column
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get export-ready value (clean, no HTML)
   */
  private getExportValue(value: any): string {
    if (this.isHtmlContent(value)) {
      return this.stripHtml(value);
    }
    return this.formatValue(value);
  }

  /**
   * Export table data as PDF
   */
  exportAsPDF(): void {
    // Determine orientation based on number of columns
    const orientation = this.data.columns.length > 6 ? "landscape" : "portrait";
    const doc = new jsPDF({
      orientation: orientation as any,
      unit: "mm",
      format: "a4",
    });

    // Add title
    doc.setFontSize(16);
    doc.text("Cemetery Query Results", 14, 15);

    // Add timestamp and row count
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Rows: ${this.data.rowCount}`, 14, 27);

    // Prepare table data
    const headers = this.data.columns.map((col) => this.formatColumnName(col));
    const rows = this.data.rows.map((row) =>
      this.data.columns.map((col) => {
        const value = this.getExportValue(row[col]);
        // Truncate very long values for PDF
        return value.length > 100 ? value.substring(0, 97) + "..." : value;
      }),
    );

    // Calculate appropriate font size based on column count
    const fontSize =
      this.data.columns.length > 10 ? 6 : this.data.columns.length > 6 ? 7 : 8;

    // Add table with better configuration
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 32,
      styles: {
        fontSize: fontSize,
        cellPadding: 1.5,
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      headStyles: {
        fillColor: [124, 114, 209],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250],
      },
      columnStyles: {
        // Auto-adjust column widths
      },
      margin: { top: 32, left: 10, right: 10 },
      tableWidth: "auto",
      theme: "grid",
    });

    // Save the PDF
    const fileName = `cemetery_data_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  /**
   * Export table data as Excel
   */
  exportAsExcel(): void {
    // Prepare data with headers
    const headers = this.data.columns.map((col) => this.formatColumnName(col));
    const rows = this.data.rows.map((row) =>
      this.data.columns.map((col) => this.getExportValue(row[col])),
    );

    // Create worksheet with headers
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = this.data.columns.map(() => ({ wch: 15 }));
    ws["!cols"] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Query Results");

    // Save the file
    const fileName = `cemetery_data_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}
