import { Component, Input } from "@angular/core";
import { QueryResult } from "../../models/message.model";

@Component({
  selector: "app-table-result",
  templateUrl: "./table-result.component.html",
  styleUrls: ["./table-result.component.css"],
})
export class TableResultComponent {
  @Input() data!: QueryResult;

  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "-";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
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
