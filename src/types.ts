export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface ClinicalRecommendation {
  status: string;
  advice: string[];
  urgency: string;
}

export interface PredictionProbabilities {
  id: number;
  name: string;
  prob: number;
}

export interface PredictionRecord {
  id: number;
  user_id: number;
  image: string;      // URL/path to uploaded fundus image
  heatmap: string;    // URL/path to Grad-CAM heatmap
  prediction: number; // 0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: Proliferative
  confidence: number; // 0 to 100
  prob_0: number;
  prob_1: number;
  prob_2: number;
  prob_3: number;
  prob_4: number;
  prediction_time: number; // time in seconds
  date: string;       // ISO timestamp
  patient_name?: string;
  patient_email?: string;
}

export interface DatabaseState {
  users: User[];
  predictions: PredictionRecord[];
}

export enum DRGrade {
  NO_DR = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  PROLIFERATIVE = 4
}

export const DR_LABELS: Record<DRGrade, string> = {
  [DRGrade.NO_DR]: 'No Diabetic Retinopathy (No DR)',
  [DRGrade.MILD]: 'Mild Non-Proliferative Diabetic Retinopathy (Mild NPDR)',
  [DRGrade.MODERATE]: 'Moderate Non-Proliferative Diabetic Retinopathy (Moderate NPDR)',
  [DRGrade.SEVERE]: 'Severe Non-Proliferative Diabetic Retinopathy (Severe NPDR)',
  [DRGrade.PROLIFERATIVE]: 'Proliferative Diabetic Retinopathy (PDR)'
};

export const CLINICAL_RECOMMENDATIONS: Record<DRGrade, ClinicalRecommendation> = {
  [DRGrade.NO_DR]: {
    status: 'Normal / Healthy Retina',
    advice: [
      'Continue annual routine comprehensive dilated eye examinations.',
      'Maintain optimal glycemic control (HbA1c < 7.0%) to prevent onset of retinopathy.',
      'Keep blood pressure (< 130/80 mmHg) and lipid levels within safe thresholds.',
      'Maintain a balanced diabetic diet and active lifestyle.'
    ],
    urgency: 'Routine (Annual Follow-up)'
  },
  [DRGrade.MILD]: {
    status: 'Early Stage Retinopathy detected',
    advice: [
      'Schedule a follow-up dilated eye examination in 6 to 12 months.',
      'Strictly optimize glycemic index monitoring to halt disease progression.',
      'Review diabetic medication regimen with your primary care endocrinologist.',
      'Avoid high-impact aerobic exercises if blood pressure fluctuates; control lipids.'
    ],
    urgency: 'Mild Priority (Follow-up in 6-12 Months)'
  },
  [DRGrade.MODERATE]: {
    status: 'Progressive vascular damage detected',
    advice: [
      'Schedule a prompt consultation with a specialist vitreoretinal ophthalmologist within 2-4 months.',
      'Intensify hemoglobin HbA1c control and maintain blood pressure monitoring.',
      'Assess for macular edema symptoms, such as central distortion or micropsias.',
      'Undergo optical coherence tomography (OCT) imaging to scan for sub-clinical edema.'
    ],
    urgency: 'Moderate Priority (Specialist Consult in 2-4 Months)'
  },
  [DRGrade.SEVERE]: {
    status: 'Advanced vascular leakage and ischemia risk',
    advice: [
      'Consult a vitreoretinal surgeon immediately (within 2-4 weeks).',
      'Prepare for potential diagnostic procedures such as Fluorescein Angiography (FA).',
      'Begin close monitoring of peripheral visual fields.',
      'Absolute restriction of strenuous physical activities or heavy lifting to prevent vitreous hemorrhage.'
    ],
    urgency: 'High Urgency (Ophthalmology Visit in 2 Weeks)'
  },
  [DRGrade.PROLIFERATIVE]: {
    status: 'Critical proliferative vascularization and retinal risk',
    advice: [
      'IMMEDIATE emergency ophthalmic intervention required (within 24-72 hours).',
      'Evaluate eligibility for anti-VEGF intravitreal injections (e.g., Eylea, Lucentis).',
      'Discuss Panretinal Photocoagulation (PRP) laser treatment options with your surgeon.',
      'Avoid sudden head movements, severe straining, or aspirin-containing compounds unless medically directed, to minimize major retinal hemorrhage risk.'
    ],
    urgency: 'EMERGENCY (Vitreoretinal Specialist within 48 Hours)'
  }
};
