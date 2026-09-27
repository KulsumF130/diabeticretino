import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, AlertCircle, RefreshCw, Eye, Sparkles, HelpCircle } from "lucide-react";
import { User } from "../types";

interface UploadScanProps {
  user: User;
  onPredictionSuccess: (prediction: any) => void;
}

export default function UploadScan({ user, onPredictionSuccess }: UploadScanProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    "Uploading High-Resolution Retinal Fundus Image...",
    "Preprocessing and Normalizing pixels (Scaling to 224x224x3)...",
    "Running forward pass through ResNet50 Transfer layers...",
    "Extracting convolutional weights from conv5_block3...",
    "Computing Grad-CAM activation backpropagation maps...",
    "Finalizing diagnostic report parameters..."
  ];

  const triggerStepAdvancement = () => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setLoadingStep(step);
      } else {
        clearInterval(interval);
      }
    }, 900);
    return interval;
  };

  const validateAndSetImage = (file: File) => {
    setError(null);

    // Size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum size threshold of 10 MB.");
      return;
    }

    // Ext constraint
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported file format. Please upload a PNG, JPEG, or JPG retina scan.");
      return;
    }

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetImage(e.target.files[0]);
    }
  };

  const handlePredict = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setLoadingStep(0);
    const stepInterval = triggerStepAdvancement();

    try {
      const response = await fetch("/api/predictions/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageBase64: imagePreview,
          filename
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Model analysis failed.");
      }

      // Finish loading step
      setTimeout(() => {
        clearInterval(stepInterval);
        onPredictionSuccess(data);
      }, 500);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      clearInterval(stepInterval);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setFilename("");
    setError(null);
    setLoading(false);
  };

  // Helper to load clinical demo fundus scans for quick evaluation
  const loadDemoScan = (index: number) => {
    setLoading(true);
    setError(null);
    // Standard real high-quality ophthalmological fundus images from Unsplash to test out
    const demoURLs = [
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400", // normal
      "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=400"  // pathological
    ];

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        setImagePreview(reader.result as string);
        setFilename(`aptos_retina_sample_${index + 1}.png`);
        setLoading(false);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', demoURLs[index]);
    xhr.responseType = 'blob';
    xhr.send();
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4" id="upload-scan-container">
      {loading ? (
        /* Progress clinical screen */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 animate-fade-in text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex justify-center relative">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin" />
              <Eye className="h-8 w-8 text-sky-400 absolute inset-0 m-auto animate-pulse" />
            </div>
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <h3 className="text-xl font-bold font-sans">RetinAI Processing Core</h3>
            <p className="text-xs text-sky-400 font-mono tracking-widest uppercase">ResNet50 Forward & Gradient Propagation</p>
            
            <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 text-sky-500 animate-spin shrink-0" />
              <span className="text-xs text-slate-300 font-mono text-center">
                {loadingSteps[loadingStep]}
              </span>
            </div>
          </div>

          {/* Graphical Loading Bar */}
          <div className="w-full max-w-md mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-blue-500 h-full transition-all duration-700 ease-out"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-500 italic max-w-sm mx-auto">
            Please remain on this browser view. Do not refresh or close. Automated diagnostic algorithms are processing high-dimension activations.
          </p>
        </div>
      ) : (
        /* Form view */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-100">Submit Retina Fundus Image</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated screening & grading portal</p>
            </div>
            <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20 uppercase tracking-widest">
              RESNET-v1.2
            </span>
          </div>

          <div className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {!imagePreview ? (
              /* Drag Drop */
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                  dragActive
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
                }`}
                id="drag-drop-area"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />

                <div className="bg-sky-50 p-4 rounded-full text-sky-600">
                  <UploadCloud className="h-10 w-10 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <p className="font-sans font-bold text-slate-800 text-sm">
                    Drag and drop your retinal fundus image here
                  </p>
                  <p className="text-xs text-slate-500">
                    or click to browse your directory
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-400 pt-2 uppercase">
                  <span>PNG, JPG, JPEG</span>
                  <span>•</span>
                  <span>Maximum Size 10 MB</span>
                </div>
              </div>
            ) : (
              /* Preview Area */
              <div className="space-y-4">
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 flex justify-center max-h-[350px]">
                  <img
                    src={imagePreview}
                    alt="Retina Scan Preview"
                    className="object-contain max-h-[350px]"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 text-[11px] font-mono text-slate-300 rounded border border-slate-700">
                    File: {filename}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handlePredict}
                    className="flex-1 py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-sky-200" /> Start Automated Grading
                  </button>
                  <button
                    onClick={handleReset}
                    className="py-3.5 px-5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm font-semibold"
                  >
                    Choose Different Scan
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Fundus Selection Grid */}
            {!imagePreview && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" /> CDAC Evaluation Retina Samples
                </div>
                <p className="text-xs text-slate-400">
                  Select one of our pre-packaged high-resolution clinical retina fundus scans to evaluate prediction mapping immediately.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => loadDemoScan(0)}
                    className="flex items-center gap-3 p-3 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=120" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Normal Scan Sample</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Size: ~124KB, Res: 400px</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadDemoScan(1)}
                    className="flex items-center gap-3 p-3 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 rounded-xl transition-all cursor-pointer text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <img src="https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=120" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Pathological Scan Sample</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Size: ~180KB, Res: 400px</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
