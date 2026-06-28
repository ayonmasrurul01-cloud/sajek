import React, { useState, useMemo } from "react";
import { Trees, Calendar, Menu, X, ShieldCheck, User, LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (adminMode: boolean) => void;
  onOpenBooking: () => void;
  user: any;
  isUserAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  isAdminMode,
  setIsAdminMode,
  onOpenBooking,
  user,
  isUserAdmin,
  onOpenLogin,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useMemo(() => {
    const items = [
      { id: "home", label: "Home" },
      { id: "cottages", label: "Cottages" },
      { id: "packages", label: "Packages" },
      { id: "contact", label: "Contact" },
    ];
    // If guest is logged in, append dashboard to main tabs
    if (user) {
      items.push({ id: "dashboard", label: "My Dashboard" });
    }
    return items;
  }, [user]);

  const handleTabChange = (tab: string) => {
    setIsAdminMode(false); // turn off admin panel view when clicking any general tab
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#FAF9F6]/90 border-b border-black/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleTabChange("home")}>
            <div className="p-2 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Trees className="w-6 h-6 text-gold" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] text-[#1A1A1A]">
                MEGHPUNJI<span className="text-gold font-light">.</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-gold font-semibold -mt-1 font-sans">
                SAJEK VALLEY
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          {!isAdminMode ? (
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`text-xs uppercase tracking-widest font-sans font-semibold transition-all duration-200 hover:text-gold ${
                    currentTab === item.id && !isAdminMode ? "text-gold border-b border-gold pb-1" : "text-black/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-bold font-sans bg-gold/5 border border-gold/20 px-4 py-1.5 rounded-full">
                👑 Administrator Control Panel
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* User status & Auth trigger */}
            {user ? (
              <div className="flex items-center gap-2 border-r border-black/10 pr-4">
                <span className="text-[10px] text-black/40 uppercase tracking-wider max-w-[120px] truncate">
                  Hi, {user.displayName || user.email?.split("@")[0]}
                </span>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-black/5 text-black/60 hover:text-gold transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-widest font-sans font-semibold border border-black/10 hover:border-black rounded-full transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

            {/* Admin Toggle - visible ONLY to authenticated admin role users */}
            {isUserAdmin && (
              <button
                id="admin-toggle-btn"
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  if (!isAdminMode) {
                    setCurrentTab("admin");
                  } else {
                    setCurrentTab("home");
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-sans font-semibold border transition-all duration-200 rounded-full ${
                  isAdminMode
                    ? "bg-gold text-ink border-gold hover:opacity-90"
                    : "bg-transparent text-black border-black/10 hover:border-black"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isAdminMode ? "Guest View" : "Admin Panel"}
              </button>
            )}

            {/* Quick Book */}
            {!isAdminMode && (
              <button
                id="quick-book-btn"
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-sans font-semibold hover:bg-black transition-all duration-200 shadow-md rounded-full"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Stay
              </button>
            )}
          </div>

          {/* Mobile Menu Button Section */}
          <div className="md:hidden flex items-center gap-3">
            {isUserAdmin && (
              <button
                id="mobile-admin-toggle-btn"
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  if (!isAdminMode) {
                    setCurrentTab("admin");
                  } else {
                    setCurrentTab("home");
                  }
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl border transition-all ${
                  isAdminMode ? "bg-gold text-ink border-gold" : "bg-transparent text-[#1A1A1A] border-black/10"
                }`}
                title={isAdminMode ? "Switch to Guest View" : "Switch to Admin Dashboard"}
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:text-gold transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F6] border-b border-black/10 px-4 pt-4 pb-6 space-y-3 animate-fade-in">
          {!isAdminMode ? (
            <>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm uppercase tracking-widest font-sans ${
                    currentTab === item.id && !isAdminMode ? "bg-black/5 text-gold font-semibold" : "text-black/80 hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">Admin Workspace</p>
              <p className="text-[11px] text-black/60 font-sans mt-0.5">Control panel active. Switch to Guest View to explore.</p>
            </div>
          )}
          
          <div className="pt-4 border-t border-black/10 flex flex-col gap-3">
            {user ? (
              <div className="flex items-center justify-between px-4 py-2 bg-black/5 rounded-xl">
                <span className="text-xs text-black/60 truncate font-semibold">
                  Hi, {user.displayName || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 font-sans"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 border border-black/10 hover:border-black text-xs uppercase tracking-widest font-sans font-bold rounded-full"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}

            {!isAdminMode && (
              <button
                id="mobile-quick-book-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-sans font-semibold hover:bg-black transition-all duration-200 rounded-full"
              >
                <Calendar className="w-4 h-4" />
                Book Stay
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
