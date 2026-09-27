import React, { useState } from "react";
import { PlusCircle, Search, Trash2, ArrowUpRight, Activity, ShieldAlert, Sparkles, CheckSquare, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { PredictionRecord, DR_LABELS } from "../types";

interface DashboardProps {
  predictions: PredictionRecord[];
  onSelectPrediction: (prediction: PredictionRecord) => void;
  onTabChange: (tab: string) => void;
  onDeletePrediction: (id: number) => void;
}

export default function Dashboard({ predictions, onSelectPrediction, onTabChange, onDeletePrediction }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter based on search term
  const filteredPredictions = predictions.filter((p) => {
    const label = DR_LABELS[p.prediction as any].toLowerCase();
    const dateStr = new Date(p.date).toLocaleDateString().toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return label.includes(searchLower) || dateStr.includes(searchLower);
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage) || 1;
  const paginatedPredictions = filteredPredictions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Stats
  const totalScans = predictions.length;
  const abnormalScans = predictions.filter((p) => p.prediction > 0).length;
  const normalScans = totalScans - abnormalScans;
  const abnormalPercent = totalScans > 0 ? Math.round((abnormalScans / totalScans) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="patient-dashboard">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-sans font-black text-2xl text-slate-900 tracking-tight">Ocular Health Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage patient scans, monitor vascular trends, and access Grad-CAM reports.</p>
        </div>
        <button
          onClick={() => onTabChange("upload")}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-500/10 transition-colors cursor-pointer text-sm"
        >
          <PlusCircle className="h-4.5 w-4.5" /> Grade Retinal Photograph
        </button>
      </div>

      {/* 2. Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="dashboard-summary-cards">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Scans Audited</span>
            <span className="text-3xl font-black text-slate-900 block font-mono">{totalScans}</span>
          </div>
          <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pathology Detected</span>
            <span className="text-3xl font-black text-rose-600 block font-mono">{abnormalScans}</span>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Abnormality Rate</span>
            <span className="text-3xl font-black text-amber-600 block font-mono">{abnormalPercent}%</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Scans Registry list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Registry header controls */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-sans font-bold text-slate-800 text-base">Historical Diagnostic Records</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by severity or date..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table/List content */}
        {paginatedPredictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Graded Stage</th>
                  <th className="py-4 px-6">Confidence</th>
                  <th className="py-4 px-6">Diagnosis Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedPredictions.map((record) => {
                  const label = DR_LABELS[record.prediction as any];
                  const isHealthy = record.prediction === 0;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-200">
                          <img src={record.image} alt="Scan preview" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block">{label}</span>
                          <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isHealthy ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            STAGE {record.prediction}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-700">
                        {record.confidence}%
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono">
                        {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => onSelectPrediction(record)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 rounded-lg transition-colors cursor-pointer text-[11px] font-bold"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Report
                        </button>
                        <button
                          onClick={() => onDeletePrediction(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete scan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <CheckSquare className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No diagnostic reports located.</p>
            <p className="text-xs">Submit a high-resolution retinal fundus scan above to begin screening.</p>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
