import React from "react";
import { Eye, LogOut, User, LayoutDashboard, Shield, BookOpen, UserCheck } from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  user: UserType | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, currentTab, onTabChange, onLogout }: NavbarProps) {
  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div 
            onClick={() => onTabChange("home")} 
            className="flex items-center gap-2 cursor-pointer group"
            id="nav-logo-container"
          >
            <div className="bg-sky-500 p-2 rounded-lg text-white group-hover:bg-sky-400 transition-colors">
              <Eye className="h-6 w-6" id="nav-logo-icon" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight block leading-tight">RetinAI</span>
              <span className="text-[10px] text-sky-400 font-mono tracking-wider uppercase block">DR GRADER PRO</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6" id="nav-links-container">
            <button
              onClick={() => onTabChange("home")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === "home" ? "text-sky-400 bg-slate-800" : "text-slate-300 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange("guide")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === "guide" ? "text-sky-400 bg-slate-800" : "text-slate-300 hover:text-white"
              }`}
            >
              Clinical Guide
            </button>
            {user && !user.is_admin && (
              <>
                <button
                  onClick={() => onTabChange("dashboard")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === "dashboard" || currentTab === "upload" || currentTab === "history" || currentTab.startsWith("result:")
                      ? "text-sky-400 bg-slate-800" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange("upload")}
                  className={`px-3 py-2 rounded-md text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-colors`}
                >
                  New Retinal Scan
                </button>
              </>
            )}
            {user && user.is_admin && (
              <button
                onClick={() => onTabChange("admin")}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTab === "admin" ? "text-rose-400 bg-slate-800" : "text-slate-300 hover:text-white"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </button>
            )}
          </div>

          {/* User Auth Buttons / Status */}
          <div className="flex items-center gap-4" id="nav-user-container">
            {user ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => onTabChange("profile")}
                  className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <User className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  {user.is_admin ? (
                    <span className="bg-rose-500/20 text-rose-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-sky-500/20 text-sky-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      User
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTabChange("login")}
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onTabChange("register")}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
