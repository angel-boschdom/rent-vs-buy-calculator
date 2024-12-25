import React from 'react'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import '@/index.css';
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import RentVsBuyCalculator from "@/pages/calc/RentVsBuyCalculator";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/housing/rent-vs-buy" component={RentVsBuyCalculator} />
        <Route path="/housing/afford" component={RentVsBuyCalculator} />
        <Route path="/retire/fire" component={RentVsBuyCalculator} />
        <Route path="/retire/salary-sacrifice" component={RentVsBuyCalculator} />
        <Route>404 - Page not found</Route>
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