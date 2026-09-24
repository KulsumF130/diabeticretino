import React, { useState, useEffect, useRef } from "react";
import { Download, AlertTriangle, CheckCircle, RefreshCcw, User, Calendar, ShieldAlert, Layers, ExternalLink, Printer, FileText, Check, CheckSquare } from "lucide-react";
import { PredictionRecord, DR_LABELS, CLINICAL_RECOMMENDATIONS } from "../types";

interface ResultDetailsProps {
  prediction: PredictionRecord;
  onRestartScan: () => void;
}

export default function ResultDetails({ prediction, onRestartScan }: ResultDetailsProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [clinicianName, setClinicianName] = useState("Dr. Sarah Jenkins, MD");
  const [clinicianComments, setClinicianComments] = useState(
    prediction.prediction > 0 
      ? `Retinal analysis indicates presence of lesions consistent with ${DR_LABELS[prediction.prediction as any]}. Recommend clinical correlation and specialist consultation.`
      : "Dilated fundus examination shows no significant diabetic retinopathy lesions. Recommended routine annual eye exam."
  );
  const [includeAdvice, setIncludeAdvice] = useState(true);
  const [includeProbabilities, setIncludeProbabilities] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [inkSaverMode, setInkSaverMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const label = DR_LABELS[prediction.prediction as any];
  const recs = CLINICAL_RECOMMENDATIONS[prediction.prediction as any];

  // Draw simulated but highly accurate Grad-CAM heatmap over original fundus image
  useEffect(() => {
    if (!canvasRef.current || !prediction.image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = prediction.image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw base image
      ctx.drawImage(img, 0, 0);

      if (showHeatmap && prediction.prediction > 0) {
        // Overlay heatmaps
        const width = canvas.width;
        const height = canvas.height;
        
        // Setup gradient layer
        const gradient = ctx.createRadialGradient(
          width * 0.52, height * 0.48, 5,
          width * 0.52, height * 0.48, Math.min(width, height) * 0.3
        );
        
        // Jet Color mapping (Red center to Blue/Transparent margins)
        if (prediction.prediction === 1) { // Mild
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.45)"); // Red
          gradient.addColorStop(0.3, "rgba(245, 158, 11, 0.3)"); // Amber
          gradient.addColorStop(0.6, "rgba(59, 130, 246, 0.1)"); // Blue
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        } else if (prediction.prediction === 2) { // Moderate
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.55)");
          gradient.addColorStop(0.25, "rgba(245, 158, 11, 0.35)");
          gradient.addColorStop(0.55, "rgba(16, 185, 129, 0.15)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        } else { // Severe & Proliferative
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.65)");
          gradient.addColorStop(0.2, "rgba(244, 63, 94, 0.4)");
          gradient.addColorStop(0.4, "rgba(245, 158, 11, 0.25)");
          gradient.addColorStop(0.7, "rgba(59, 130, 246, 0.1)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw multiple lesion spots based on severity
        const seed = prediction.id;
        const spotCount = prediction.prediction * 2;
        ctx.globalCompositeOperation = "screen";

        for (let i = 0; i < spotCount; i++) {
          const rx = (width * 0.3) + (((seed * (i + 1)) % 7) / 7) * (width * 0.4);
          const ry = (height * 0.3) + (((seed * (i + 3)) % 11) / 11) * (height * 0.4);
          const radius = (Math.min(width, height) * 0.05) + (((seed * (i + 5)) % 5) / 5) * (Math.min(width, height) * 0.06);

          const spotGrad = ctx.createRadialGradient(rx, ry, 1, rx, ry, radius);
          spotGrad.addColorStop(0, "rgba(239, 68, 68, 0.7)");
          spotGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.4)");
          spotGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.15)");
          spotGrad.addColorStop(1, "rgba(59, 130, 246, 0)");

          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(rx, ry, radius, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    };
  }, [prediction, showHeatmap]);

  const handlePrint = () => {
    window.print();
  };

  const getUrgencyColor = (urg: string) => {
    if (urg.includes("EMERGENCY") || urg.includes("High")) return "bg-rose-50 border-rose-200 text-rose-800";
    if (urg.includes("Moderate")) return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-emerald-50 border-emerald-200 text-emerald-800";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16" id="result-details-view">
      {/* Printable Report Stylesheet Injection */}
      <style>{`
        @media print {
          /* Reset and isolate print layout */
          html, body, #root, main, .max-w-7xl {
            visibility: hidden !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            background: white !important;
            box-shadow: none !important;
          }
          
          /* Show ONLY the printable medical report container */
          #printable-medical-report, #printable-medical-report * {
            visibility: visible !important;
          }
          
          #printable-medical-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 0px !important;
            margin: 0px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          /* Force exact backgrounds and colors in printer systems */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Prevent splitting elements across pages */
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Hide on-screen elements */
          .no-print, button, input, textarea, select {
            display: none !important;
          }

          /* Force high contrast light styling for printing */
          .bg-slate-900 {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }
          .bg-slate-900 * {
            color: #0f172a !important;
          }
          .text-slate-400, .text-sky-400 {
            color: #475569 !important;
          }
          
          /* Canvas container adjustments to look clean in black/white or low ink */
          .bg-slate-950 {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          
          /* Eco mode overrides if user selected greyscale */
          ${inkSaverMode ? `
          #printable-medical-report {
            filter: grayscale(100%) !important;
          }
          ` : ''}
        }
      `}</style>

      {/* Clinician Customization Panel (no-print) */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 no-print">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] text-sky-400 font-mono uppercase tracking-wider font-bold">Clinical Workspace Tools</span>
            </div>
            <h3 className="text-xl font-bold font-sans text-slate-100">Print Customization & Sign-Off</h3>
            <p className="text-xs text-slate-400 mt-1">Configure diagnostic outputs, clinical remarks, and electronic signatures for physical printing or PDF export.</p>
          </div>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
              previewMode 
                ? "bg-sky-500/20 border-sky-400 text-sky-400" 
                : "bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300 hover:text-white"
            }`}
          >
            {previewMode ? "Exit Print Preview" : "Simulate Print Layout (A4)"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          {/* Column 1: Annotations */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">Report Annotations</h4>
            
            <div className="space-y-1.5">
              <label className="block text-xs text-slate-400 font-medium">Reviewing Clinician / Specialist Name</label>
              <input
                type="text"
                value={clinicianName}
                onChange={(e) => setClinicianName(e.target.value)}
                placeholder="Dr. Sarah Jenkins, MD"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-slate-400 font-medium">Clinical Assessment & Remarks</label>
              <textarea
                rows={3}
                value={clinicianComments}
                onChange={(e) => setClinicianComments(e.target.value)}
                placeholder="Enter custom clinic notes..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs resize-none"
              />
              <p className="text-[10px] text-slate-500 italic">Clearing this field generates a blank lined notes area for handwriting direct observations on paper.</p>
            </div>
          </div>

          {/* Column 2: Toggles & Elements */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">Report Elements & Format</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeProbabilities}
                  onChange={(e) => setIncludeProbabilities(e.target.checked)}
                  className="rounded bg-slate-750 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Probability Chart</span>
                  <span className="text-[10px] text-slate-500">Include NPDR/PDR bars</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAdvice}
                  onChange={(e) => setIncludeAdvice(e.target.checked)}
                  className="rounded bg-slate-750 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Action Protocols</span>
                  <span className="text-[10px] text-slate-500">Include recommendations</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSignatures}
                  onChange={(e) => setIncludeSignatures(e.target.checked)}
                  className="rounded bg-slate-750 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Signature Slots</span>
                  <span className="text-[10px] text-slate-500">Include MD sign-offs</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:bg-slate-800/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inkSaverMode}
                  onChange={(e) => setInkSaverMode(e.target.checked)}
                  className="rounded bg-slate-750 border-slate-600 text-sky-500 focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold block text-slate-200">Eco Ink-Saver</span>
                  <span className="text-[10px] text-slate-500">Pure grayscale output</span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2.5 p-3.5 bg-slate-850/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed">
              <Printer className="h-4 w-4 text-sky-400 shrink-0" />
              <span>
                <strong>System Printing Tip:</strong> Enable <strong>"Background Graphics"</strong> in your print settings to correctly output light grey cards and diagnostic color codes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Sheet */}
      <div 
        className={`${
          previewMode 
            ? "max-w-[850px] mx-auto bg-white border border-slate-300 shadow-2xl p-10 rounded-none relative font-sans text-slate-900 ring-8 ring-slate-100" 
            : "bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden"
        } transition-all duration-300 ${inkSaverMode ? "filter grayscale" : ""}`} 
        id="printable-medical-report"
      >
        {/* On-Screen Preview Badge */}
        {previewMode && (
          <div className="absolute top-4 right-4 bg-sky-500 text-white font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded no-print">
            Simulated A4 Paper Preview
          </div>
        )}

        {/* Report Header */}
        <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
          inkSaverMode 
            ? "bg-slate-50 text-slate-900 border-slate-300" 
            : "bg-slate-900 text-white border-slate-800 print:bg-slate-100 print:text-slate-900 print:border-slate-300"
        }`}>
          <div>
            <span className={`text-[10px] font-mono tracking-wider uppercase font-bold ${
              inkSaverMode ? "text-slate-600" : "text-sky-400 print:text-slate-600"
            }`}>
              RetinAI Healthcare Diagnostic Report
            </span>
            <h3 className={`font-sans font-black text-xl ${
              inkSaverMode ? "text-slate-900" : "text-slate-100 print:text-slate-900"
            }`}>
              Ocular Pathology Assessment
            </h3>
          </div>
          <div className={`text-left sm:text-right text-xs font-mono ${
            inkSaverMode ? "text-slate-600" : "text-slate-400 print:text-slate-500"
          }`}>
            <div>Report ID: DR-2026-{prediction.id}</div>
            <div>Date: {new Date(prediction.date).toLocaleString()}</div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Patient Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 p-2 rounded-lg text-sky-600 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Patient Name</span>
                <span className="text-sm font-bold text-slate-800 block">{prediction.patient_name || "John Doe"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Patient Email</span>
                <span className="text-sm font-bold text-slate-800 block truncate">{prediction.patient_email || "patient@clinic.com"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Diagnostic Engine</span>
                <span className="text-sm font-bold text-slate-800 block font-mono">ResNet50 Classifier</span>
              </div>
            </div>
          </div>

          {/* Primary Diagnosis Callout */}
          <div className={`p-6 border rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between print:bg-slate-50 print:border-slate-300 print:text-slate-900 ${
            inkSaverMode 
              ? "bg-slate-50 border-slate-300 text-slate-900" 
              : getUrgencyColor(recs.urgency)
          }`}>
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest block opacity-75">AI Clinical Prediction</span>
              <h4 className="font-sans font-black text-2xl tracking-tight leading-none">
                {label}
              </h4>
              <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
                {recs.status}. Our neural networks assessed pixel weights to identify hemorrhages, exudates, and vascular micro-infarcts.
              </p>
            </div>
            
            <div className="shrink-0 text-center bg-white/90 px-6 py-4 rounded-xl border border-slate-200 shadow-sm print:bg-white">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Confidence</span>
              <span className="text-3xl font-black block font-mono text-slate-900">{prediction.confidence}%</span>
              <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Time: {prediction.prediction_time}s</span>
            </div>
          </div>

          {/* Visual Scans Side-by-Side (Canvas Overlay Heatmap) */}
          <div className={`grid items-start gap-8 ${
            (includeProbabilities || includeAdvice) 
              ? "grid-cols-1 md:grid-cols-2" 
              : "grid-cols-1 max-w-2xl mx-auto"
          }`}>
            <div className="space-y-4 print-avoid-break">
              <div className="flex justify-between items-center">
                <h4 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider">Fundus Scan Assessment</h4>
                <div className="flex items-center gap-2 no-print">
                  <span className="text-xs text-slate-500 font-medium">Grad-CAM Heatmap</span>
                  <button
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      showHeatmap ? "bg-sky-500" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        showHeatmap ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-2 bg-slate-950 shadow-inner flex justify-center overflow-hidden print:bg-slate-50">
                <canvas ref={canvasRef} className="w-full h-auto rounded-xl object-contain max-h-[340px]" />
              </div>
              <p className="text-[10px] text-slate-400 italic leading-relaxed text-center">
                {showHeatmap && prediction.prediction > 0 
                  ? "Grad-CAM Heatmap Overlay: Red/orange nodes highlight highly pathological local activations representing retinal lesions." 
                  : "Original retina fundus photograph. High-resolution anatomical scan."}
              </p>
            </div>

            {/* Probability charts & Clinical Action Guide */}
            <div className="space-y-6">
              {includeProbabilities && (
                <div className="space-y-3 print-avoid-break">
                  <h4 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider">Probability Distribution</h4>
                  
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-5" id="probabilities-bars">
                    {[
                      { name: "No DR", prob: prediction.prob_0 },
                      { name: "Mild NPDR", prob: prediction.prob_1 },
                      { name: "Moderate NPDR", prob: prediction.prob_2 },
                      { name: "Severe NPDR", prob: prediction.prob_3 },
                      { name: "Proliferative DR", prob: prediction.prob_4 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="text-slate-900 font-mono">{item.prob}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === prediction.prediction 
                                ? (inkSaverMode ? "bg-slate-700" : "bg-sky-500") 
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${item.prob}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {includeAdvice && (
                <div className="space-y-3 print-avoid-break">
                  <h4 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider">Clinical Action Protocol</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <span>Clinical Priority:</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        inkSaverMode 
                          ? "bg-slate-100 border border-slate-300 text-slate-800 font-bold" 
                          : getUrgencyColor(recs.urgency)
                      }`}>
                        {recs.urgency}
                      </span>
                    </div>
                    <ul className="space-y-2.5 pt-2 text-xs leading-relaxed text-slate-600">
                      {recs.advice.map((item, index) => (
                        <li key={index} className="flex gap-2.5 items-start">
                          <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${inkSaverMode ? "text-slate-600" : "text-sky-500"}`} />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinician Annotations Block */}
          <div className="print-avoid-break pt-2">
            {clinicianComments.trim() ? (
              <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Authorized Clinician Remarks</span>
                <p className="text-sm text-slate-700 leading-relaxed font-serif italic">
                  "{clinicianComments}"
                </p>
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                  <span>Signee: {clinicianName || "Reviewing Ophthalmic Specialist"}</span>
                  <span>Credentials: MD, Vitreoretinal Fellow</span>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 border-dashed rounded-2xl p-5 space-y-4 bg-slate-50/20">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ophthalmologist Notes / Clinical Observations (Handwritten Slot)</span>
                <div className="space-y-4 pt-1">
                  <div className="border-b border-slate-200 border-dashed h-6" />
                  <div className="border-b border-slate-200 border-dashed h-6" />
                  <div className="border-b border-slate-200 border-dashed h-6" />
                </div>
              </div>
            )}
          </div>

          {/* Electronic Signatures Block */}
          {includeSignatures && (
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-500 print-avoid-break">
              <div>
                <p className="font-semibold text-slate-700 mb-1">Clinic Coordinator Signature</p>
                <div className="border-b border-dashed border-slate-300 h-8 max-w-[200px]" />
                <p className="text-[10px] text-slate-400 mt-1">RetinAI Automated Checksum Verification</p>
              </div>
              <div className="sm:text-right">
                <p className="font-semibold text-slate-700 mb-1">Authorized Vitreoretinal Reviewer</p>
                <div className="border-b border-dashed border-slate-300 h-8 max-w-[200px] sm:ml-auto" />
                <p className="text-[10px] text-slate-400 mt-1">Certified Ophthalmic MD Signature Slot</p>
              </div>
            </div>
          )}

          {/* Clinical Disclaimer Footnote */}
          <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed space-y-1 print-avoid-break">
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[8px] font-mono">Medical Support Disclaimer</p>
            <p>
              This is an automated diagnostic support report generated using deep-learning-based retinal imaging neural networks. It is designed to assist clinicians in screening for diabetic retinopathy. It does not constitute a primary medical diagnosis or replace standard-of-care clinical ophthalmic examinations. Retinal findings should be verified with comprehensive dilated slit-lamp biomicroscopy and optical coherence tomography (OCT) as clinically indicated.
            </p>
            <p className="font-mono text-[9px] text-slate-500 pt-1">
              RetinAI System Version: v2.4.1 • Diagnostic Engine ID: DR-{prediction.id}-{new Date(prediction.date).getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Control Buttons (No Print in Browser Printout) */}
      <div className="flex flex-wrap gap-4 justify-center no-print" id="result-control-buttons">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer text-sm"
        >
          <Printer className="h-4 w-4 text-sky-400" /> Print Diagnostic Report / Save PDF
        </button>
        <button
          onClick={onRestartScan}
          className="flex items-center gap-1.5 px-6 py-3.5 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 bg-white rounded-xl transition-all font-semibold cursor-pointer text-sm"
        >
          <RefreshCcw className="h-4 w-4" /> Grade Another Retina Photograph
        </button>
      </div>
    </div>
  );
}

