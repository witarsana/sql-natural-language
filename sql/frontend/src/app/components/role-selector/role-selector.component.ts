import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { UserRole, AVAILABLE_ROLES, RoleInfo } from "../../models/role.model";

@Component({
  selector: "app-role-selector",
  templateUrl: "./role-selector.component.html",
  styleUrls: ["./role-selector.component.css"],
})
export class RoleSelectorComponent implements OnInit {
  availableRoles = AVAILABLE_ROLES;
  currentRole: UserRole = UserRole.SALES;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentRole$.subscribe((role) => {
      this.currentRole = role;
    });
  }

  selectRole(role: UserRole): void {
    this.authService.setRole(role);
  }

  getRoleColor(role: UserRole): string {
    const roleInfo = AVAILABLE_ROLES.find((r) => r.role === role);
    return roleInfo?.color || "#6b7280";
  }
}
