import React from "react";
import { BookOpen, Layers, Target, Eye, ShieldAlert, FileText, CheckCircle } from "lucide-react";

export default function ClinicalGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 animate-fade-in" id="clinical-guide-view">
      {/* 1. Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-sky-600 font-mono text-xs font-bold uppercase tracking-widest">
          <BookOpen className="h-4 w-4 shrink-0" /> RESEARCH & CLINICAL SPECIFICATION MANUAL
        </div>
        <h2 className="font-sans font-black text-3xl text-slate-900 tracking-tight mt-1">Medical Research Guide</h2>
        <p className="text-slate-500 text-sm mt-0.5">Explore the deep learning mechanics, dataset statistics, and clinical benchmarks of RetinAI.</p>
      </div>

      {/* 2. Pathological Stages Details */}
      <section className="space-y-6">
        <h3 className="font-sans font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2 border-l-4 border-sky-500 pl-3">
          Diabetic Retinopathy Pathologies
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Diabetic Retinopathy (DR) is a severe microvascular complication of diabetes mellitus, resulting in progressive damage to the tiny blood vessels of the light-sensitive retina. If unchecked, it leads to permanent blindness. Visual grading requires pinpointing highly specific micro-lesions:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="pathologies-grid">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">LESION #1</span>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Microaneurysms (MAs)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The earliest detectable clinical sign of DR. Appears as small, red, circular dots in the retina representing focal saccular outpouchings of capillary walls. They are localized lesions.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">LESION #2</span>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Intraretinal Hemorrhages</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capillary wall rupture results in retinal bleeding. May be "dot-and-blot" hemorrhages (located in inner nuclear layer) or "flame-shaped" hemorrhages (located in superficial nerve fiber layers).
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">LESION #3</span>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Hard Lipid Exudates (HEs)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Waxy, yellow lesions with well-defined margins. Composed of lipoprotein and lipid-laden macrophages leaked from incompetent capillaries, accumulating in outer plexiform layers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">LESION #4</span>
            <h4 className="font-sans font-bold text-slate-800 text-sm">Cotton-Wool Spots (CWS)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fluffy, white, or light gray lesions representing localized micro-infarctions of retinal nerve fiber bundles. Caused by acute capillary occlusion halting axonal transport.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ResNet50 Pipeline description */}
      <section className="space-y-6">
        <h3 className="font-sans font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2 border-l-4 border-sky-500 pl-3">
          ResNet50 Transfer Learning Architecture
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Developing highly accurate medical classifiers requires solving data sparsity. Using the pre-trained weights of deep networks trained on millions of diverse images establishes stable foundational filters. 
        </p>

        <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
          <div className="flex gap-4 items-start">
            <Layers className="h-6 w-6 text-sky-400 shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-white text-base">Stage 1: Pre-processing & Augmentation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Retinal fundus scans contain lighting and device-specific color variations. The input pipeline rescales pixels to [0,1], resizes dimensions to 224x224, and applies random horizontal/vertical flips to boost generalization and counter model over-fitting.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Target className="h-6 w-6 text-sky-400 shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-white text-base">Stage 2: Frozen ImageNet Backbone</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We freeze ResNet50's lower layers (1 to 140) containing robust general features (gabor filters, circles, vessel-like boundaries). We let layers 141 to 175 remain trainable to adapt complex macro-features to specific retinal pathologies.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <Eye className="h-6 w-6 text-sky-400 shrink-0 mt-1" />
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-white text-base">Stage 3: Categorical Softmax Classifier</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The feature map output is flattened via Global Average Pooling, passed through a Dense 512 ReLU layer, protected by a 50% Dropout layer, and fed into a 5-class Softmax layer outputs representing class probabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Clinical Workflow Protocols */}
      <section className="space-y-6">
        <h3 className="font-sans font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2 border-l-4 border-sky-500 pl-3">
          Deploying RetinAI in Clinical Workflows
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          The software serves as a screening and prioritization aid to fast-track patients with vision-threatening lesions to ophthalmic clinics:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="clinical-protocols-grid">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-mono font-bold text-xs">1</div>
            <h4 className="font-bold text-slate-800 text-sm">Primary Care Triage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Physicians or rural health clinicians capture retinal photographs via simple fundus cameras and upload them to the grading terminal.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-mono font-bold text-xs">2</div>
            <h4 className="font-bold text-slate-800 text-sm">Automated Screening</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              The neural model parses the scan in under 1 second, highlighting suspicious spots with Grad-CAM heatmaps and outputting severity grades.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-mono font-bold text-xs">3</div>
            <h4 className="font-bold text-slate-800 text-sm">Ophthalmologist Validation</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-severity screens (Stage 3 and 4) are flagged as high priority, queuing patients for prompt ophthalmic laser photocoagulation or anti-VEGF therapies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
