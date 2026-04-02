import {
  LayoutDashboard,
  Bot,
  History,
  Activity,
  Globe,
  Bell,
  CreditCard,
  Settings,
  FileCode,
  ChevronLeft,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ui/theme-toggle";
import { useState, useEffect } from "react";
import { t, getLocalizedPath, type Locale, type TranslationKey } from "@/i18n/translations";

const navItemsDef = [
  { icon: LayoutDashboard, labelKey: "sidebar.dashboard" as const, path: "/dashboard" },
  { icon: Bot, labelKey: "sidebar.scrapers" as const, path: "/dashboard/scrapers" },
  { icon: History, labelKey: "sidebar.runHistory" as const, path: "/dashboard/runs" },
  { icon: Activity, labelKey: "sidebar.monitoring" as const, path: "/dashboard/monitoring" },
  { icon: Globe, labelKey: "sidebar.proxies" as const, path: "/dashboard/proxies" },
  { icon: Bell, labelKey: "sidebar.alerts" as const, path: "/dashboard/alerts" },
  { icon: CreditCard, labelKey: "sidebar.billing" as const, path: "/dashboard/billing" },
  { icon: Settings, labelKey: "sidebar.settings" as const, path: "/dashboard/settings" },
  { icon: FileCode, labelKey: "sidebar.apiDocs" as const, path: "/dashboard/api-docs" },
];

interface SidebarProps {
  currentPath: string;
  locale?: Locale;
}

export function Sidebar({ currentPath, locale = "en" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const l = (key: TranslationKey) => t(locale, key);
  const lp = (path: string) => getLocalizedPath(path, locale);
  const otherLocale: Locale = locale === "en" ? "es" : "en";

  const navItems = navItemsDef.map((item) => ({
    ...item,
    label: l(item.labelKey),
    href: lp(item.path),
  }));

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navContent = (isMobile: boolean) => (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ icon: Icon, label, href, path }) => {
          const isActive =
            currentPath === lp(path) ||
            (path !== "/dashboard" && currentPath.startsWith(lp(path)));

          return (
            <a
              key={path}
              href={href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2 text-sm transition-colors",
                isMobile && "h-10",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(isMobile || !collapsed) && <span>{label}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className={cn("flex items-center gap-2 px-2", isMobile && "py-1")}>
          <ThemeToggle />
          {(isMobile || !collapsed) && (
            <>
              <a
                href={getLocalizedPath(currentPath.replace(/^\/(es|en)/, ""), otherLocale)}
                className="flex h-6 items-center rounded border border-sidebar-border px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {otherLocale.toUpperCase()}
              </a>
              <div className="flex flex-1 items-center gap-2">
                <Avatar fallback="EG" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">Efrain Garay</p>
                  <Badge variant="default" className="mt-0.5">Pro</Badge>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex h-12 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
        <a href={lp("/")} className="text-sm font-semibold tracking-tight text-foreground">
          Phantom<span className="text-primary">Relay</span>
        </a>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar shadow-lg">
            <div className="flex h-12 items-center justify-between px-4">
              <a href={lp("/")} className="text-sm font-semibold tracking-tight text-foreground">
                Phantom<span className="text-primary">Relay</span>
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent(true)}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
          collapsed ? "w-14" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-12 items-center justify-between px-4">
          {!collapsed && (
            <a href={lp("/")} className="text-sm font-semibold tracking-tight text-foreground">
              Phantom<span className="text-primary">Relay</span>
            </a>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        {navContent(false)}
      </aside>
    </>
  );
}
