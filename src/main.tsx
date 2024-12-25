import React from 'react';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import '@/index.css';
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import { NAV_ITEMS, NavItem } from "@/lib/constants";

// Utility function to recursively extract routes from NAV_ITEMS
const extractRoutes = (items: NavItem[]): Array<{ href: string; component: React.ComponentType }> => {
  const routes: Array<{ href: string; component: React.ComponentType }> = [];

  const traverse = (navItems: NavItem[]) => {
    navItems.forEach((item) => {
      if (item.href && item.component) {
        routes.push({ href: item.href, component: item.component });
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  };

  traverse(items);
  return routes;
};

function Router() {
  const routes = extractRoutes(NAV_ITEMS);

  return (
    <Layout>
      <Switch>
        {routes.map(({ href, component: Component }) => (
          <Route key={href} path={href}>
            <Component />
          </Route>
        ))}
        {/* Fallback Route for 404 */}
        <Route>
          <div className="flex items-center justify-center h-full">
            <h1 className="text-2xl">404 - Page not found</h1>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);