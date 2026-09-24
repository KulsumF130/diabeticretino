import React from "react";
import { ShieldAlert, BookOpen, ExternalLink, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8" id="footer-grid-container">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="bg-sky-500 p-1.5 rounded text-white">
                <span className="font-sans font-bold text-base">RA</span>
              </div>
              <span className="font-sans font-bold text-lg tracking-tight">RetinAI Healthcare</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Developing next-generation computer vision diagnostic assistance models. 
              Our transfer learning pipelines utilize ResNet50 weights combined with high-resolution image augmentations to facilitate automated screening in global healthcare systems.
            </p>
          </div>

          {/* Quick Contact info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Clinical Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                <span>support@retinai.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span>+91 1800-425-2322</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400 shrink-0" />
                <span>CDAC Healthtech Incubator, India</span>
              </li>
            </ul>
          </div>

          {/* Training Resources Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Research References</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.kaggle.com/c/aptos2019-blindness-detection" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  APTOS 2019 Dataset <ExternalLink className="h-3 w-3 text-sky-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://arxiv.org/abs/1512.03385" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  ResNet Paper <ExternalLink className="h-3 w-3 text-sky-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/ramprs/grad-cam" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Grad-CAM Methodology <ExternalLink className="h-3 w-3 text-sky-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 mb-8" id="footer-disclaimer-box">
          <div className="flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" id="footer-disclaimer-icon" />
            <div>
              <h5 className="text-slate-200 font-semibold text-sm mb-1">AUTOMATED SCREENING AID DISCLAIMER</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                The RetinAI grading output is generated via deep neural network analysis (ResNet50 + Transfer Learning). 
                This platform is designed to act as an offline-first diagnostic screening aid for general practitioner triage. 
                It does <strong>NOT</strong> constitute a final, legally binding clinical diagnosis. 
                Any retinal abnormality or disease indicator MUST be reviewed and validated by a registered, certified vitreoretinal ophthalmologist or medical professional prior to commencing clinical therapies or invasive interventions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 pt-8 border-t border-slate-800">
          <p>© 2026 RetinAI Systems. Designed and developed as a Final Year CDAC Practicum Project.</p>
          <p className="mt-2 md:mt-0 font-mono text-[10px] bg-slate-800 px-2.5 py-1 rounded border border-slate-700/60">
            SYSTEM STATUS: ONLINE (V2.1-TF)
          </p>
        </div>
      </div>
    </footer>
  );
}
