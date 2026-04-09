import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, ShoppingCart, Heart, Settings, ChevronDown, Calculator, HelpCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

// Main navigation links - streamlined
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/why-pawamore", label: "Why Us" },
  { to: "/about", label: "About" },
];

// Resources dropdown
const resourcesLinks = [
  { to: "/resources", label: "Resources Hub" },
  { to: "/resources/buyers-guide", label: "Buyer's Guide" },
  { to: "/solar-calculator", label: "Solar Calculator", icon: Calculator },
  { to: "/blog", label: "Blog & Guides" },
  { to: "/faqs", label: "FAQs" },
  { to: "/help", label: "Help Center", icon: HelpCircle },
  { to: "/contact", label: "Contact Us" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

  const handleLoginClick = () => {
    sessionStorage.setItem("intendedPath", location.pathname + location.search);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-forest/95 backdrop-blur-md">
      <div className="kente-strip" />
      <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <img src={logo} alt="PawaMore Systems" className="h-8 sm:h-10 w-auto rounded-lg group-hover:scale-110 transition-transform" />
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-sm sm:text-lg text-primary-foreground tracking-tight leading-none">PawaMore</span>
            <span className="font-display text-[8px] sm:text-[10px] text-primary-foreground/60 uppercase tracking-[0.2em]">Systems Ltd</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to ? "text-accent font-bold" : "text-primary-foreground/80 hover:text-accent"
              }`}>
              {link.label}
            </Link>
          ))}
          
          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent gap-1 px-3">
                Resources
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {resourcesLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild className="cursor-pointer">
                  <Link to={link.to} className="flex items-center gap-2 w-full">
                    {link.icon && <link.icon className="w-4 h-4 text-amber" />}
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop CTA / Auth — grouped into dropdown */}
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/cart" className="relative text-primary-foreground/80 hover:text-accent p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          {user && (
            <Link to="/wishlist" className="text-primary-foreground/80 hover:text-accent p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-accent gap-1">
                  <User className="w-4 h-4" />
                  <span className="max-w-[80px] truncate text-xs">Account</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAdmin && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2 cursor-pointer">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 cursor-pointer">
                  <Settings className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/orders")} className="gap-2 cursor-pointer">
                  <ShoppingCart className="w-4 h-4" /> My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="gap-2 cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            <Button variant="ghost" size="sm" onClick={handleLoginClick} className="text-primary-foreground/80 hover:text-accent">
              <User className="w-4 h-4 mr-1" /> Login
            </Button>
           )}
           <Link to="/contact" className="hidden xl:block">
             <Button variant="amber" size="default" className="text-sm font-semibold">Get Free Quote</Button>
           </Link>
         </div>

        {/* Mobile Cart & Wishlist & Toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <Link to="/cart" className="relative text-primary-foreground/80 hover:text-accent p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent text-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          {user && (
            <Link to="/wishlist" className="text-primary-foreground/80 hover:text-accent p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-primary-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-forest border-t border-primary-foreground/10 overflow-hidden">
            <div className="container py-4 px-4 sm:px-6 flex flex-col gap-2 max-h-[calc(100vh-80px)] overflow-y-auto">
              {navLinks.map((link, i) => (
                <motion.div key={link.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={link.to} onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px] flex items-center ${
                      location.pathname === link.to ? "bg-primary text-primary-foreground" : "text-primary-foreground/80 hover:bg-primary/20"
                    }`}>
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Resources section in mobile */}
              <div className="border-t border-primary-foreground/10 mt-2 pt-2">
                <p className="text-xs uppercase text-primary-foreground/50 px-4 mb-2 font-semibold tracking-wider">Resources</p>
                {resourcesLinks.map((link, i) => (
                  <motion.div key={link.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (navLinks.length + i) * 0.05 }}>
                    <Link to={link.to} onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg text-base font-medium text-primary-foreground/80 hover:bg-primary/20 min-h-[44px] flex items-center gap-2">
                      {link.icon && <link.icon className="w-4 h-4 text-amber" />}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Auth links mobile */}
              <div className="border-t border-primary-foreground/10 mt-2 pt-2">
                {user ? (
                  <>
                    {isAdmin && (
                     <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-accent hover:bg-primary/20 min-h-[44px] flex items-center">
                       <Shield className="w-4 h-4 inline mr-2" /> Admin Dashboard
                     </Link>
                     )}
                     <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-primary-foreground/80 hover:bg-primary/20 min-h-[44px] flex items-center">
                       <Settings className="w-4 h-4 inline mr-2" /> Profile
                     </Link>
                     <Link to="/orders" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-base font-medium text-primary-foreground/80 hover:bg-primary/20 min-h-[44px] flex items-center">
                       <ShoppingCart className="w-4 h-4 inline mr-2" /> My Orders
                     </Link>
                     <button onClick={() => { signOut(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-primary-foreground/80 hover:bg-primary/20 min-h-[44px] flex items-center">
                       <LogOut className="w-4 h-4 inline mr-2" /> Logout
                     </button>
                  </>
                 ) : (
                   <button
                     onClick={() => { handleLoginClick(); setIsOpen(false); }}
                     className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-primary-foreground/80 hover:bg-primary/20 min-h-[44px] flex items-center"
                   >
                     <User className="w-4 h-4 inline mr-2" /> Login / Sign Up
                   </button>
                 )}
              </div>

              <Link to="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="amber" className="w-full mt-2">Book Free Power Audit →</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
