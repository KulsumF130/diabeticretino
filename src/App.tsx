import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import ClinicalGuide from "./components/ClinicalGuide";
import Auth from "./components/Auth";
import UploadScan from "./components/UploadScan";
import ResultDetails from "./components/ResultDetails";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import Profile from "./components/Profile";
import { User, PredictionRecord } from "./types";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [activePrediction, setActivePrediction] = useState<PredictionRecord | null>(null);
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  // Restore session from localStorage on load
  useEffect(() => {
    const storedUser = localStorage.getItem("retina_session_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // If user is admin, default to admin dashboard, else standard dashboard
        setCurrentTab(parsed.is_admin ? "admin" : "dashboard");
      } catch (err) {
        localStorage.removeItem("retina_session_user");
      }
    }
  }, []);

  // Fetch predictions for authenticated user
  const fetchPredictions = async (u: User) => {
    try {
      const response = await fetch(`/api/predictions?userId=${u.id}&isAdmin=${u.is_admin}`);
      const data = await response.json();
      if (response.ok) {
        setPredictions(data);
      }
    } catch (err) {
      console.error("Failed to load historical scans", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPredictions(user);
    } else {
      setPredictions([]);
    }
  }, [user]);

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem("retina_session_user", JSON.stringify(authenticatedUser));
    setGlobalSuccess(`Access granted. Welcome, ${authenticatedUser.name}.`);
    
    // Redirect to dashboard
    setCurrentTab(authenticatedUser.is_admin ? "admin" : "dashboard");
    
    setTimeout(() => {
      setGlobalSuccess(null);
    }, 4000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("retina_session_user");
    setCurrentTab("home");
    setActivePrediction(null);
    setGlobalSuccess("Successfully logged out of RetinAI diagnostic systems.");
    setTimeout(() => {
      setGlobalSuccess(null);
    }, 4500);
  };

  const handlePredictionSuccess = (newPrediction: any) => {
    // Add to predictions list
    setPredictions((prev) => [newPrediction, ...prev]);
    setActivePrediction(newPrediction);
    setGlobalSuccess("Retinal Scan audited successfully with ResNet50 Classifier.");
    setCurrentTab("result");
    setTimeout(() => {
      setGlobalSuccess(null);
    }, 4000);
  };

  const handleSelectPrediction = (p: PredictionRecord) => {
    setActivePrediction(p);
    setCurrentTab("result");
  };

  const handleDeletePrediction = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this specific diagnostic scan record from your clinical log? This action is permanent.")) {
      return;
    }

    try {
      const response = await fetch("/api/predictions/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId: id }),
      });

      if (response.ok) {
        setPredictions((prev) => prev.filter((p) => p.id !== id));
        if (activePrediction && activePrediction.id === id) {
          setActivePrediction(null);
          setCurrentTab("dashboard");
        }
        setGlobalSuccess("Retina scan removed from database records.");
        setTimeout(() => setGlobalSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setGlobalError(errorData.error || "Failed to delete scan.");
        setTimeout(() => setGlobalError(null), 4000);
      }
    } catch (err) {
      setGlobalError("Database transaction interrupted.");
      setTimeout(() => setGlobalError(null), 4000);
    }
  };

  const handleDeleteUserFromAdmin = () => {
    // Re-fetch statistics and users on administrative delete
    if (user) {
      fetchPredictions(user);
    }
    setGlobalSuccess("Clinical patient record expunged.");
    setTimeout(() => setGlobalSuccess(null), 3500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500/30">
      {/* Navbar component */}
      <Navbar 
        user={user} 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        onLogout={handleLogout} 
      />

      {/* Global Banners */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4 space-y-2">
        {globalError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2.5 shadow-sm animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{globalError}</span>
          </div>
        )}

        {globalSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5 shadow-sm animate-fade-in">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{globalSuccess}</span>
          </div>
        )}
      </div>

      {/* Main Container Views switching */}
      <main className="flex-grow">
        {currentTab === "home" && (
          <Home onTabChange={setCurrentTab} isLoggedIn={!!user} />
        )}

        {currentTab === "guide" && (
          <ClinicalGuide />
        )}

        {(currentTab === "login" || currentTab === "register") && (
          <Auth 
            initialTab={currentTab as any} 
            onAuthSuccess={handleAuthSuccess} 
            onTabChange={setCurrentTab}
          />
        )}

        {user && currentTab === "dashboard" && (
          <Dashboard
            predictions={predictions}
            onSelectPrediction={handleSelectPrediction}
            onTabChange={setCurrentTab}
            onDeletePrediction={handleDeletePrediction}
          />
        )}

        {user && currentTab === "upload" && (
          <UploadScan 
            user={user} 
            onPredictionSuccess={handlePredictionSuccess} 
          />
        )}

        {user && currentTab === "result" && activePrediction && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ResultDetails 
              prediction={activePrediction} 
              onRestartScan={() => setCurrentTab("upload")} 
            />
          </div>
        )}

        {user && user.is_admin && currentTab === "admin" && (
          <AdminDashboard 
            onSelectPrediction={handleSelectPrediction}
            onDeleteUser={handleDeleteUserFromAdmin}
          />
        )}

        {user && currentTab === "profile" && (
          <Profile 
            user={user} 
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem("retina_session_user", JSON.stringify(updated));
            }} 
          />
        )}
      </main>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
