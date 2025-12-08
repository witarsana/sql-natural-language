import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserRole } from "../models/role.model";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentRoleSubject = new BehaviorSubject<UserRole>(UserRole.SALES);
  public currentRole$: Observable<UserRole> =
    this.currentRoleSubject.asObservable();

  constructor() {
    // Load role from localStorage if available
    const savedRole = localStorage.getItem("chronicle_user_role");
    if (savedRole && Object.values(UserRole).includes(savedRole as UserRole)) {
      this.currentRoleSubject.next(savedRole as UserRole);
    }
  }

  getCurrentRole(): UserRole {
    return this.currentRoleSubject.value;
  }

  setRole(role: UserRole): void {
    this.currentRoleSubject.next(role);
    localStorage.setItem("chronicle_user_role", role);
  }
}
