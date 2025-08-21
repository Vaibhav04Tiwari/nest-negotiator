import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Hammer, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  
  const nav = [
    { to: "/calculator", label: t("header.budgetCalculator") },
    { to: "/materials", label: t("header.materials") },
    { to: "/map-planning", label: t("header.mapPlanning") },
    { to: "/marketplace", label: t("header.findLabour") },
  ];
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between h-16">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-brand text-brand-foreground shadow-glow">
            <Hammer className="h-5 w-5" />
          </span>
          BuildMate
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                "text-sm transition-colors hover:text-primary " +
                (isActive ? "text-primary" : "text-muted-foreground")
              }
            >
              {n.label}
            </NavLink>
          ))}
          <LanguageSelector />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {t("header.account")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/labour-registration">{t("header.registerAsLabour")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("header.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">{t("header.getStarted")}</Link>
            </Button>
          )}
        </div>
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <div className="mt-8 flex flex-col gap-4">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={
                      "text-base " +
                      (location.pathname === n.to
                        ? "text-primary"
                        : "text-foreground")
                    }
                  >
                    {n.label}
                  </Link>
                ))}
                <div className="mt-4">
                  <LanguageSelector />
                </div>
                {user ? (
                  <>
                    <Link
                      to="/labour-registration"
                      onClick={() => setOpen(false)}
                      className="text-base text-foreground"
                    >
                      {t("header.registerAsLabour")}
                    </Link>
                    <Button variant="outline" onClick={() => {
                      signOut();
                      setOpen(false);
                    }}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("header.signOut")}
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="hero" onClick={() => setOpen(false)}>
                    <Link to="/auth">{t("header.getStarted")}</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
