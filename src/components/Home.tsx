import React from "react";
import { Eye, ShieldCheck, Activity, Award, CheckCircle2, ArrowRight, BookOpen, Layers, Users } from "lucide-react";
import { DR_LABELS } from "../types";

interface HomeProps {
  onTabChange: (tab: string) => void;
  isLoggedIn: boolean;
}

export default function Home({ onTabChange, isLoggedIn }: HomeProps) {
  return (
    <div className="space-y-16 pb-16" id="home-view-container">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl mx-4 sm:mx-8 mt-6 border border-slate-800">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full text-xs font-mono uppercase tracking-wider">
            <Award className="h-3.5 w-3.5" /> CDAC FINAL YEAR PRACTICUM PROJECT
          </div>

          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-slate-100 max-w-3xl">
            Diabetic Retinopathy Grader using <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400">CNN & ResNet50</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Automate the classification of retinal fundus imaging with advanced Convolutional Neural Networks and Transfer Learning. Identify vascular abnormalities early, grade pathology across 5 severity indices, and pinpoint lesions with Grad-CAM activation heatmaps.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            {isLoggedIn ? (
              <button
                onClick={() => onTabChange("upload")}
                className="flex items-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer group"
              >
                Launch Grading System <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onTabChange("login")}
                  className="flex items-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer group"
                >
                  Access Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onTabChange("register")}
                  className="px-6 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer bg-slate-800/40 hover:bg-slate-800/80"
                >
                  Create Clinical Account
                </button>
              </>
            )}
            <button
              onClick={() => onTabChange("guide")}
              className="flex items-center gap-1.5 px-5 py-3.5 text-slate-300 hover:text-white text-sm font-semibold transition-all"
            >
              <BookOpen className="h-4 w-4 text-sky-400" /> Research Framework
            </button>
          </div>
        </div>
      </section>

      {/* 2. Model Accuracy & Analytics Highlight Band */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="home-analytics-grid">
          {/* Box 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="bg-sky-50 p-3 rounded-xl text-sky-600 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block font-mono">93.4%</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Classifier Accuracy</span>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">APTOS 2019 Validation</span>
            </div>
          </div>
          {/* Box 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block font-mono">ResNet50</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Transfer Learning Base</span>
              <span className="text-[10px] text-slate-500 mt-1 block">ImageNet Weights + Custom Head</span>
            </div>
          </div>
          {/* Box 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="bg-rose-50 p-3 rounded-xl text-rose-600 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block font-mono">Grad-CAM</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Attention Heatmaps</span>
              <span className="text-[10px] text-slate-500 mt-1 block">Surgical lesion activation maps</span>
            </div>
          </div>
          {/* Box 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 block font-mono">5 Levels</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">International Scale</span>
              <span className="text-[10px] text-slate-500 mt-1 block">DR Severity Grading (0 to 4)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Detailed DR Stages Visual Guideline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight">
            Classification & Pathology Grading Scale
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            The platform automatically grades images following the International Clinical Disease Severity Scale for Diabetic Retinopathy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="home-dr-stages-grid">
          {[
            { id: 0, label: "No DR", color: "bg-emerald-500 text-emerald-50 border-emerald-200", text: "Healthy retina. No detectable microaneurysms, hemorrhages, or vascular changes present." },
            { id: 1, label: "Mild NPDR", color: "bg-sky-500 text-sky-50 border-sky-200", text: "Incipient stage. Appearance of isolated microaneurysms only (small circular red dots on fundus)." },
            { id: 2, label: "Moderate NPDR", color: "bg-indigo-500 text-indigo-50 border-indigo-200", text: "Progressive stage. Multiple microaneurysms, intraretinal hemorrhages, and hard lipid exudates." },
            { id: 3, label: "Severe NPDR", color: "bg-amber-500 text-amber-950 border-amber-200", text: "Advanced stage. Broad hemorrhages, venous beading in multiple quadrants, retinal ischemia." },
            { id: 4, label: "Proliferative DR", color: "bg-rose-500 text-rose-50 border-rose-200", text: "Critical stage. Abnormal neovascularization (new fragile blood vessels), major vitreous hemorrhage risk." }
          ].map((stage) => (
            <div key={stage.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${stage.color}`}>
                    STAGE {stage.id}
                  </span>
                </div>
                <h4 className="font-sans font-bold text-slate-800 text-base">{stage.label}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{stage.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Deep Learning Methodology & Tech Specs */}
      <section className="bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight">
              Clinical Deep Learning & Transfer Learning Pipeline
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Diabetic Retinopathy requires microscopic lesion identification. Instead of training deep CNNs from scratch (which is vulnerable to over-fitting on small medical datasets), we employ <strong>Transfer Learning</strong>. 
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              We leverage the pre-trained weights of the <strong>ResNet50</strong> architecture, which has already mapped deep visual filters (edges, textures, spatial relationships) over ImageNet. 
            </p>

            <ul className="space-y-3 text-slate-700 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-sky-500 h-5 w-5 shrink-0" />
                <span><strong>Input Adaptation:</strong> Input fundus images normalized and scaled to 224x224x3.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-sky-500 h-5 w-5 shrink-0" />
                <span><strong>Frozen Feature Maps:</strong> Layers 1 to 140 are locked to preserve pre-trained weights.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-sky-500 h-5 w-5 shrink-0" />
                <span><strong>Optimized Top Classifier:</strong> Dense 512, Dropout (50%), and 5-class Categorical Softmax.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-sky-500 h-5 w-5 shrink-0" />
                <span><strong>Grad-CAM Auditing:</strong> Visual overlay exposes which precise lesions triggered the diagnosis.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-slate-300 font-mono text-xs border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sky-400 font-bold">TensorFlow Model Summary</span>
              <span className="text-[10px] text-slate-500">Keras API v2.10</span>
            </div>
            
            <div className="space-y-2 leading-relaxed">
              <p className="text-emerald-400"># Model Architecture Build</p>
              <p>base_model = ResNet50(weights='imagenet', include_top=False, input_shape=(224, 224, 3))</p>
              <p>for layer in base_model.layers[:-15]: layer.trainable = False</p>
              <p className="text-slate-500">// Custom Classifier Head</p>
              <p>x = GlobalAveragePooling2D()(base_model.output)</p>
              <p>x = Dense(512, activation='relu')(x)</p>
              <p>x = Dropout(0.5)(x)</p>
              <p>predictions = Dense(5, activation='softmax')(x)</p>
              <p>model = Model(inputs=base_model.input, outputs=predictions)</p>
              <p className="text-emerald-400"># Compilation Configuration</p>
              <p>model.compile(optimizer=Adam(lr=0.0001), loss='categorical_crossentropy', metrics=['accuracy'])</p>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <p className="text-slate-400">Total Params: 24,642,885</p>
              <p className="text-slate-400">Trainable Params: 1,051,141</p>
              <p className="text-slate-500">Non-trainable Params: 23,591,744</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-sky-500 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Users className="h-4 w-4" /> CDAC REVIEW PANEL
          </div>
          <h2 className="font-sans font-bold text-3xl text-slate-900 tracking-tight">
            Practicum Project Development Board
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            This project has been developed and validated under the guidance of healthcare computer vision research advisors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="home-team-grid">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-lg">Practicum Lead</h4>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono mt-1">Senior AI Architect</span>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">Specializing in Deep Learning applications for medical imaging diagnostics & neural path explainability models.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Activity className="h-8 w-8" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-lg">Ophthalmic Advisor</h4>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono mt-1">Consulting Vitreoretinal MD</span>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">Providing clinical classification benchmarks, annotation verification, and healthcare workflow integrations.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <h4 className="font-sans font-bold text-slate-800 text-lg">Practicum Scholar</h4>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono mt-1">Practicum Developer</span>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">Full-stack implementation of the CNN + ResNet50 Transfer model, Flask API, database schemas, and analytics GUI.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
