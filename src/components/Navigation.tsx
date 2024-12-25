import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
// Import your NAV_ITEMS from constants
import { NAV_ITEMS } from "@/lib/constants";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [location] = useLocation();

  // Toggle which submenu is open in mobile mode
  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  // Check if a particular submenu is open
  const isSubmenuOpen = (label: string) => openSubmenus.includes(label);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand / Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            WealthMate
          </Link>

          {/* Desktop Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.label}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="capitalize text-foreground hover:text-primary">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[300px] gap-3 p-4 md:w-[400px] md:grid-cols-1 bg-background">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className={`block select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                    location === child.href
                                      ? "bg-accent text-accent-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href!}
                        className={`block select-none space-y-1 rounded-md p-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                          location === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA on Desktop */}
          <Button className="hidden md:inline-flex">Become a Pro</Button>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {/* Toggle icon: hamburger vs. X */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border"
          >
            <div className="space-y-1 px-4 pb-3 pt-2 bg-background">
              {NAV_ITEMS.map((item) => (
                <div key={item.label} className="border-b border-border py-2">
                  {item.children ? (
                    <motion.div>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className="flex w-full items-center justify-between py-2 text-foreground hover:text-primary"
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transform transition-transform ${
                            isSubmenuOpen(item.label) ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {isSubmenuOpen(item.label) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-highlight"
                          >
                            {item.children.map((child) => (
                              <div
                                key={child.label}
                                className="block pl-4"
                                onClick={() => setIsOpen(false)}
                              >
                                <Link
                                  href={child.href}
                                  className="block py-2 text-muted hover:text-primary"
                                >
                                  {child.label}
                                </Link>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <div onClick={() => setIsOpen(false)}>
                      <Link
                        href={item.href!}
                        className="block py-2 text-foreground hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </div>
                  )}
                </div>
              ))}

              {/* CTA on Mobile */}
              <div className="pt-4">
                <Link href="/appointments">
                  <Button className="w-full">Become a Pro</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}