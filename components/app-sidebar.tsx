"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Battery,
  BrainCircuit,
  Activity,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelemetryStore } from "@/lib/telemetry-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/battery", label: "Battery Analysis", icon: Battery },
  { href: "/diagnostics", label: "AI Diagnostics", icon: BrainCircuit },
];

export function AppSidebar() {
  const pathname = usePathname();
  const faults = useTelemetryStore((s) => s.faults);
  const criticalCount = faults.filter((f) => f.severity === "critical").length;
  const warningCount = faults.filter((f) => f.severity === "warning").length;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-sidebar-foreground">
            VCU Monitor
          </h1>
          <p className="text-xs text-muted-foreground">EV Control System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Status */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          System Status
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-sidebar-foreground">Online</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-primary" />
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs text-destructive">
                  {criticalCount} Critical
                </span>
              </div>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-accent">
                  {warningCount} Warning{warningCount > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
