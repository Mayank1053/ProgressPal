import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

function AppContainer() {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen flex-col">
        <Spinner className="mb-4 text-primary" />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectUrl: window.location.pathname,
        }}
      />
    );
  }

  // Main layout for authenticated users
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Header user={user} />

      {/* Main Content Area */}
      <main className="container mx-auto pb-12 pt-12">
        <Outlet />
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default AppContainer;
