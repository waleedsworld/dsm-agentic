import { useState } from "react";
import { Menu, ChevronDown, User, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SearchBar from "./SearchBar";
import { useApp } from "@/contexts/AppContext";

const softwareCategories = [
  "Operating Systems",
  "Productivity & Office",
  "Design & Creativity",
  "CAD & Engineering",
  "Security & Utility",
];

const primaryLinks: { label: string; to?: string; href?: string }[] = [
  { label: "Store", to: "/store" },
  { label: "DSM Marketing", to: "/marketing" },
  { label: "Enterprise", href: "#" },
  { label: "Support", href: "#" },
  { label: "About", href: "#" },
];

interface MobileNavProps {
  /** When true the trigger icon renders in dark ink (over light sections). */
  darkText?: boolean;
}

/**
 * Mobile / tablet navigation. Shown below the `lg` breakpoint where the desktop
 * mega-menu is hidden. Provides a hamburger trigger with an accessible 44px touch
 * target and a slide-in Sheet containing search, the full nav, and account links.
 */
const MobileNav = ({ darkText = false }: MobileNavProps) => {
  const { cartItemCount } = useApp();
  const [open, setOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);

  const triggerColor = darkText
    ? "text-[#1a1a1a] hover:text-crimson"
    : "text-[#FEFEFE] hover:text-crimson";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={`lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 transition-colors duration-300 ${triggerColor}`}
        >
          <Menu className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[86vw] max-w-sm bg-[#08080a] border-l border-white/[0.06] p-0 flex flex-col overflow-y-auto"
      >
        <SheetHeader className="px-6 pt-6 pb-4 text-left space-y-0">
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
          <img src="/dsm-white.png" alt="DSM" className="h-8 w-auto self-start shrink-0" />
        </SheetHeader>

        {/* Search */}
        <div className="px-6 pb-4">
          <SearchBar />
        </div>

        {/* Primary navigation */}
        <nav className="flex flex-col px-3 pb-2">
          {/* Software — expandable category group */}
          <button
            type="button"
            onClick={() => setSoftwareOpen((v) => !v)}
            aria-expanded={softwareOpen}
            className="flex items-center justify-between px-3 py-3 min-h-[48px] text-base font-medium text-[#FEFEFE] hover:text-crimson transition-colors duration-200"
          >
            Software
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${softwareOpen ? "rotate-180 text-crimson" : "opacity-60"}`}
            />
          </button>
          {softwareOpen && (
            <ul className="pl-3 pb-2 space-y-0.5">
              {softwareCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to="/store"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 min-h-[44px] text-sm text-[#B1B2B3] hover:text-crimson transition-colors duration-200"
                  >
                    {cat}
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {primaryLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 min-h-[48px] flex items-center text-base font-medium text-[#FEFEFE] hover:text-crimson transition-colors duration-200"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 min-h-[48px] flex items-center text-base font-medium text-[#FEFEFE] hover:text-crimson transition-colors duration-200"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Account + cart footer */}
        <div className="mt-auto border-t border-white/[0.06] px-6 py-5 flex items-center gap-3">
          <a
            href="#"
            onClick={() => setOpen(false)}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-sm border border-white/[0.1] text-sm font-medium text-[#FEFEFE] hover:border-crimson/40 hover:text-crimson transition-colors duration-200"
          >
            <User className="w-4 h-4" strokeWidth={1.5} /> Account
          </a>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] rounded-sm bg-crimson text-[#FEFEFE] text-sm font-medium hover:bg-crimson/90 transition-colors duration-200"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} /> Cart
            {cartItemCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#FEFEFE] text-crimson text-[11px] font-semibold leading-none">
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
