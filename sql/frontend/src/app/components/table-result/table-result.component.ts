import { Component, Input, Output, EventEmitter } from "@angular/core";
import { QueryResult } from "../../models/message.model";

@Component({
  selector: "app-table-result",
  templateUrl: "./table-result.component.html",
  styleUrls: ["./table-result.component.css"],
})
export class TableResultComponent {
  @Input() data!: QueryResult;
  @Output() loadMore = new EventEmitter<void>();

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
}
