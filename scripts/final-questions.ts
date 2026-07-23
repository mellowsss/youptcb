import * as fs from "fs";

interface Question {
  id: string;
  domain: "medications" | "federal" | "patient_safety" | "order_entry";
  subArea: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  isCalculation: boolean;
}

// Load existing questions
const existingQuestions: Question[] = JSON.parse(fs.readFileSync("./data/questions.json", "utf-8"));
const questions: Question[] = [...existingQuestions];

let questionCounter: Record<string, number> = {};
for (const q of existingQuestions) {
  const key = `${q.domain}-${q.subArea}`;
  questionCounter[key] = (questionCounter[key] || 0) + 1;
}

function addQ(
  domain: Question["domain"],
  subArea: string,
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  isCalculation = false
) {
  const key = `${domain}-${subArea}`;
  questionCounter[key] = (questionCounter[key] || 0) + 1;
  const num = String(questionCounter[key]).padStart(4, "0");
  
  questions.push({
    id: `${domain.substring(0, 3)}-${subArea}-${num}`,
    domain,
    subArea,
    question,
    options,
    correctIndex,
    explanation,
    isCalculation,
  });
}

// ============================================================
// FINAL BATCH - MORE FEDERAL REQUIREMENTS
// ============================================================

const finalFederalQuestions = [
  { q: "A pharmacy must notify the DEA within how many days of a theft or significant loss?", o: ["1 business day", "7 days", "30 days", "90 days"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "DEA requires notification within 1 business day of discovering theft/loss of controlled substances." },
  { q: "Which is true about Schedule II emergency dispensing?", o: ["Pharmacist must determine it's an emergency and quantity is limited", "Any amount can be dispensed", "No follow-up prescription needed", "Only for hospitalized patients"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Emergency C-II dispensing requires pharmacist judgment, limited quantity, and follow-up Rx within 7 days." },
  { q: "Controlled substance prescriptions must contain:", o: ["Patient name, address, prescriber info, drug, quantity, directions, date, signature", "Only drug name", "Only quantity", "Only patient name"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Complete CS prescriptions require all patient/prescriber info, drug details, and signature." },
  { q: "A mid-level practitioner's DEA number typically starts with:", o: ["M", "A", "B", "F"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Mid-level practitioners (NP, PA) typically have DEA numbers starting with M." },
  { q: "The first letter 'B' in a DEA number typically indicates:", o: ["A practitioner (MD, DO, DDS)", "A hospital", "A mid-level practitioner", "A pharmacy"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "B indicates a practitioner; A was used earlier; F is for practitioners in certain situations." },
  { q: "How is a DEA number validated?", o: ["By adding digits and checking against a formula", "By calling the DEA", "By visual inspection only", "DEA numbers cannot be validated"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "DEA numbers follow a checksum formula that can be calculated to verify validity." },
  { q: "Prescription monitoring programs (PDMPs) help:", o: ["Track controlled substance prescriptions to identify misuse", "Process insurance claims", "Order inventory", "Train technicians"] as [string, string, string, string], c: 0 as const, s: "2.3", e: "PDMPs are state databases tracking CS prescriptions to identify doctor shopping and diversion." },
  { q: "Which agency administers the Medicaid Drug Rebate Program?", o: ["CMS (Centers for Medicare & Medicaid Services)", "DEA", "FDA", "CDC"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "CMS administers Medicaid programs including drug rebate agreements." },
  { q: "The 340B Drug Pricing Program benefits:", o: ["Eligible healthcare organizations serving low-income patients", "All pharmacies equally", "Only hospital pharmacies", "Insurance companies"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "340B provides discounted drugs to eligible entities serving vulnerable populations." },
  { q: "FDA drug approval phases include:", o: ["Phase I (safety), Phase II (efficacy), Phase III (large trials), Phase IV (post-market)", "Only one phase", "Phases 1-10", "No specific phases"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Drug approval involves multiple phases testing safety, efficacy, and post-market surveillance." },
  { q: "An IND (Investigational New Drug) application is submitted:", o: ["Before testing a drug in humans", "After FDA approval", "After marketing begins", "Only for generic drugs"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "IND applications must be submitted before clinical trials in humans can begin." },
  { q: "Generic drug approval requires an ANDA, which stands for:", o: ["Abbreviated New Drug Application", "Annual New Drug Assessment", "Advanced Notice of Drug Approval", "Automated National Drug Application"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "ANDAs demonstrate bioequivalence for generic drug approval without full clinical trials." },
  { q: "The therapeutic equivalence code 'AB' means:", o: ["The generic is therapeutically equivalent to the brand", "The generic is not equivalent", "Additional studies needed", "Brand only available"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "AB-rated generics are therapeutically equivalent and can be substituted for the brand." },
  { q: "USP Chapter 795 covers:", o: ["Non-sterile compounding standards", "Sterile compounding", "Controlled substances", "Insurance billing"] as [string, string, string, string], c: 0 as const, s: "2.1", e: "USP 795 establishes standards for preparing non-sterile compounded preparations." },
  { q: "When is a patient's written consent required for HIPAA?", o: ["For uses beyond treatment, payment, and healthcare operations", "Never", "For all prescriptions", "For OTC purchases"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "HIPAA allows disclosure for TPO without consent; other uses require authorization." },
  { q: "The minimum age to purchase pseudoephedrine federally is:", o: ["18 years", "21 years", "16 years", "No age requirement"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Federal law requires purchasers to be at least 18 years old for pseudoephedrine." },
  { q: "Which medication requires special prescriber certification (X-waiver)?", o: ["Buprenorphine for opioid use disorder", "Metformin", "Lisinopril", "Amoxicillin"] as [string, string, string, string], c: 0 as const, s: "2.4", e: "Buprenorphine for addiction treatment requires DATA-waiver certification." },
  { q: "A pharmacy's responsibility in a recall includes:", o: ["Identifying affected products and notifying patients who received them", "Ignoring the recall", "Continuing to dispense", "Only documenting in-stock products"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Pharmacies must identify, quarantine, and trace affected products to patients when possible." },
  { q: "Which organization sets standards for pharmacy accreditation?", o: ["ACHC, URAC, or The Joint Commission depending on setting", "Only the state board", "Only the DEA", "Only Medicare"] as [string, string, string, string], c: 0 as const, s: "2.2", e: "Various organizations accredit pharmacies: ACHC, URAC, TJC for different settings and services." },
  { q: "The FDA's Sentinel System monitors:", o: ["Post-market drug safety using electronic health data", "Pre-approval trials only", "Pharmacy inventory", "Controlled substance prescriptions"] as [string, string, string, string], c: 0 as const, s: "2.5", e: "Sentinel actively monitors post-market safety signals using electronic healthcare data." },
];

for (const q of finalFederalQuestions) {
  addQ("federal", q.s, q.q, q.o, q.c, q.e);
}

// ============================================================
// FINAL BATCH - MORE PATIENT SAFETY
// ============================================================

const finalPatientSafetyQuestions = [
  { q: "What is the purpose of a 'time-out' before a procedure?", o: ["To verify correct patient, procedure, and site", "To take a break", "To call insurance", "To order supplies"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Time-outs are safety checks to verify patient identity, procedure, and site before beginning." },
  { q: "Vincristine should ONLY be administered:", o: ["Intravenously in a minibag, NEVER by syringe", "Intrathecally", "By any route", "Orally"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Vincristine is fatal if given intrathecally; minibag delivery prevents syringe-related errors." },
  { q: "Which is a characteristic of high-reliability organizations?", o: ["Culture of continuous improvement and safety reporting", "Punishment for all errors", "Ignoring near-misses", "Blaming individuals"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "HROs embrace safety culture, report errors freely, and focus on system improvement." },
  { q: "The purpose of failure mode and effects analysis (FMEA) is to:", o: ["Proactively identify potential failures before they occur", "React to errors after they happen", "Blame staff for failures", "Calculate financial losses"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "FMEA is a proactive tool to identify and mitigate potential failure points." },
  { q: "Human factors engineering in pharmacy focuses on:", o: ["Designing systems to accommodate human limitations", "Training humans to be perfect", "Eliminating all technology", "Reducing staffing"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Human factors engineering designs systems that work with human limitations, reducing errors." },
  { q: "Which is true about look-alike medication packaging?", o: ["It can lead to selection errors", "It prevents errors", "It is encouraged", "It has no safety impact"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Similar packaging increases selection errors; differentiation strategies help prevent them." },
  { q: "An important check at pickup for controlled substances is:", o: ["Verifying patient identity with photo ID", "No special check needed", "Asking favorite color", "Checking weather"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Photo ID verification at pickup helps ensure controlled substances reach the correct patient." },
  { q: "Allergy documentation should include:", o: ["The allergen and the patient's reaction", "Only the drug name", "Only 'allergy'", "Nothing specific"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Complete allergy documentation includes the substance and the type of reaction experienced." },
  { q: "True allergy vs. intolerance: which typically involves immune response?", o: ["True allergy", "Intolerance", "Both equally", "Neither"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "True allergies involve immune-mediated responses; intolerances are non-immune (e.g., GI upset)." },
  { q: "Cross-sensitivity exists between penicillins and:", o: ["Cephalosporins (though lower risk than previously thought)", "Fluoroquinolones", "Macrolides", "Tetracyclines"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Penicillin-allergic patients may have cephalosporin cross-reactivity (1-2% true cross-allergy)." },
  { q: "A drug utilization review (DUR) evaluates:", o: ["Appropriateness of prescribed medications for the patient", "Only drug costs", "Only controlled substances", "Pharmacy profit margins"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "DUR evaluates drug therapy appropriateness, including interactions, duplications, and dosing." },
  { q: "Polypharmacy is concerning because:", o: ["More medications increase interaction and adverse event risks", "Patients get confused by pill colors", "It's always unnecessary", "Insurance doesn't cover it"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Polypharmacy (5+ medications) increases risks of interactions, falls, and adverse events." },
  { q: "The Beers Criteria identify:", o: ["Potentially inappropriate medications for older adults", "Best medications for children", "Controlled substances", "Generic equivalents"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "Beers Criteria list medications that may be inappropriate for patients 65+ due to higher risks." },
  { q: "When a patient reports a new symptom, the technician should:", o: ["Document and refer to the pharmacist", "Diagnose the problem", "Recommend OTC treatment", "Ignore it"] as [string, string, string, string], c: 0 as const, s: "3.3", e: "New symptoms could indicate adverse effects; technicians must refer clinical questions." },
  { q: "Temperature monitoring in the pharmacy is important because:", o: ["Medications can degrade if stored outside proper ranges", "For patient comfort", "For employee comfort", "It's not important"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Proper temperature maintains drug integrity; excursions can affect potency and safety." },
  { q: "What should happen if a temperature excursion occurs in the refrigerator?", o: ["Document, quarantine affected items, and assess stability", "Ignore it", "Use products immediately", "Adjust the thermostat only"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Temperature excursions require documentation, quarantine, and stability assessment per manufacturer." },
  { q: "Proper medication labeling includes:", o: ["Drug name, strength, directions, warnings, and pharmacy info", "Only drug name", "Only directions", "Only patient name"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Complete labeling ensures patients have all necessary information for safe medication use." },
  { q: "Auxiliary labels should be:", o: ["Appropriate for the medication and readable", "As many as possible", "Optional for controlled substances", "In technical language only"] as [string, string, string, string], c: 0 as const, s: "3.2", e: "Auxiliary labels highlight key warnings/instructions in understandable language." },
  { q: "A hazardous drug is defined as one that:", o: ["Exhibits carcinogenic, teratogenic, or toxic characteristics", "Is expensive", "Requires prescription", "Is a controlled substance"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "NIOSH defines hazardous drugs by their potential for causing cancer, reproductive harm, or organ toxicity." },
  { q: "Negative pressure rooms are used for:", o: ["Isolating patients with airborne infections", "IV compounding", "General patient care", "Pharmacy storage"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Negative pressure rooms keep contaminated air inside, protecting others from airborne pathogens." },
  { q: "What PPE is required for non-hazardous sterile compounding?", o: ["Hair cover, face mask, non-shedding gown, and sterile gloves", "Just gloves", "No PPE needed", "Only a lab coat"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Non-HD sterile compounding requires full garbing to maintain sterility." },
  { q: "An anteroom serves what purpose?", o: ["Transition area between cleanroom and regular space for garbing", "Drug storage", "Patient counseling", "Break room"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Anterooms are ISO 8 spaces for handwashing, garbing, and staging before cleanroom entry." },
  { q: "How often should PECs (primary engineering controls) be certified?", o: ["Every 6 months or after service/relocation", "Annually", "Every 5 years", "Never"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Laminar flow hoods must be certified every 6 months and after any service or relocation." },
  { q: "Compounding personnel competency should be assessed:", o: ["Initially and at least annually", "Only at hiring", "Never", "Only after errors"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "USP chapters require initial and ongoing competency assessment for compounding personnel." },
  { q: "Sporicidal agents are used to:", o: ["Kill bacterial spores that regular disinfectants miss", "Clean counting trays", "Sanitize hands", "Clean regular surfaces only"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Sporicidal cleaning monthly helps eliminate resistant spores in compounding areas." },
  { q: "Media-fill testing verifies:", o: ["Aseptic technique of compounding personnel", "Drug potency", "Insurance coverage", "Inventory accuracy"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Media-fill tests verify that personnel can compound sterile products without contamination." },
  { q: "Immediate-use CSPs must be administered within:", o: ["1 hour of preparation", "24 hours", "48 hours", "1 week"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "Immediate-use CSPs (for emergency situations) must be used within 1 hour per USP 797." },
  { q: "Double-gloving for hazardous drugs means:", o: ["Wearing two pairs of chemotherapy-rated gloves", "Two regular gloves", "Extra-thick single gloves", "Gloves over bare hands"] as [string, string, string, string], c: 0 as const, s: "3.6", e: "HD handling requires two pairs of ASTM-tested chemotherapy gloves for added protection." },
  { q: "Which is NOT a strategy for reducing high-alert medication errors?", o: ["Storing all high-alert medications together in one location", "Using independent double-checks", "Limiting floor stock", "Using tall man lettering"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "High-alert medications should be separated and clearly marked, not all stored together." },
  { q: "The purpose of a smart pump in IV administration is:", o: ["To provide dose error reduction software alerts", "To reduce pharmacy workload", "To eliminate pharmacist review", "To increase infusion speed"] as [string, string, string, string], c: 0 as const, s: "3.1", e: "Smart pumps have dose error reduction systems that alert nurses to potential dosing errors." },
];

for (const q of finalPatientSafetyQuestions) {
  addQ("patient_safety", q.s, q.q, q.o, q.c, q.e);
}

// ============================================================
// FINAL BATCH - MORE ORDER ENTRY
// ============================================================

const finalOrderEntryQuestions = [
  // More calculations
  { q: "How many milligrams are in 0.25 grams?", o: ["250 mg", "25 mg", "2.5 mg", "2500 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "0.25 g × 1000 = 250 mg.", calc: true },
  { q: "A prescription is for 'ii gtts AU TID'. How many drops are given in one day?", o: ["12 drops total (6 per ear)", "2 drops", "6 drops", "3 drops"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "2 drops × both ears × 3 times = 12 drops total per day.", calc: true },
  { q: "If a 500 mL IV runs at 50 mL/hr, how long will it take to complete?", o: ["10 hours", "5 hours", "50 hours", "1 hour"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "500 mL ÷ 50 mL/hr = 10 hours.", calc: true },
  { q: "A child weighs 22 kg. The dose is 15 mg/kg/day divided BID. What is each dose?", o: ["165 mg", "330 mg", "22 mg", "15 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "15 mg × 22 kg = 330 mg/day ÷ 2 doses = 165 mg per dose.", calc: true },
  { q: "How many 5 mg tablets equal 0.05 g?", o: ["10 tablets", "5 tablets", "1 tablet", "50 tablets"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "0.05 g = 50 mg. 50 mg ÷ 5 mg = 10 tablets.", calc: true },
  { q: "A suspension is 125 mg/5 mL. How much for a 250 mg dose?", o: ["10 mL", "5 mL", "2.5 mL", "25 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "250 mg ÷ 125 mg × 5 mL = 10 mL.", calc: true },
  { q: "How many grams of NaCl are in 500 mL of NS (0.9%)?", o: ["4.5 g", "0.9 g", "9 g", "0.45 g"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "0.9% = 0.9 g/100 mL. 0.9 × 5 = 4.5 g in 500 mL.", calc: true },
  { q: "A patient uses 2 nitroglycerin patches per week. How many for a 30-day supply?", o: ["8-9 patches", "30 patches", "60 patches", "4 patches"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "2/week × 4.3 weeks ≈ 8-9 patches for 30 days.", calc: true },
  { q: "Calculate BSA using: BSA = √(height cm × weight kg / 3600). Patient: 180 cm, 80 kg", o: ["2.0 m²", "1.0 m²", "3.0 m²", "0.5 m²"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "√(180 × 80 / 3600) = √4 = 2.0 m².", calc: true },
  { q: "If a dose is 150 mg/m² and BSA is 2.0 m², what is the dose?", o: ["300 mg", "150 mg", "75 mg", "600 mg"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "150 mg/m² × 2.0 m² = 300 mg.", calc: true },
  { q: "How many 250 mL bags are in a case of 24?", o: ["24 bags", "6 bags", "12 bags", "250 bags"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "A case of 24 contains 24 bags.", calc: true },
  { q: "A TPN runs at 85 mL/hr for 12 hours. What is the total volume?", o: ["1020 mL", "85 mL", "12 mL", "850 mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "85 mL/hr × 12 hr = 1020 mL.", calc: true },
  { q: "Convert 1:1000 concentration to mg/mL:", o: ["1 mg/mL", "0.1 mg/mL", "10 mg/mL", "1000 mg/mL"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1:1000 = 1 g/1000 mL = 1000 mg/1000 mL = 1 mg/mL.", calc: true },
  { q: "What is the final concentration if 5 g is dissolved in 500 mL?", o: ["1%", "0.1%", "10%", "0.5%"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "5 g/500 mL = 1 g/100 mL = 1%.", calc: true },

  // More sig codes
  { q: "What does 'HS' mean?", o: ["At bedtime", "Half strength", "Hospital stay", "High strength"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "HS = hora somni = at bedtime (though can be confused with half strength)." },
  { q: "What does 'ASA' refer to?", o: ["Aspirin", "As soon as available", "All scheduled appointments", "Acute symptom assessment"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "ASA = acetylsalicylic acid = aspirin." },
  { q: "What does 'APAP' refer to?", o: ["Acetaminophen", "Aspirin", "Ibuprofen", "Naproxen"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "APAP = N-acetyl-para-aminophenol = acetaminophen (Tylenol)." },
  { q: "What does 'MVI' mean in IV orders?", o: ["Multivitamin infusion", "Most valuable infusion", "Maximum volume infusion", "Medication verification incomplete"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "MVI = multivitamins for intravenous use in TPN or other IV solutions." },
  { q: "What does 'KVO' mean for IV fluids?", o: ["Keep vein open (minimum infusion rate)", "Kill vein operation", "Known volume only", "Kidney vein outflow"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "KVO = keep vein open, running at minimum rate to maintain IV access." },
  { q: "The abbreviation 'IVPB' means:", o: ["Intravenous piggyback", "Into vein, push bolus", "IV push bottle", "Immediate verification pharmacy board"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "IVPB = intravenous piggyback, a small volume infusion connected to the main IV line." },
  { q: "What does 'D5W' stand for?", o: ["5% dextrose in water", "5 doses weekly", "Drug 5 warning", "Dilute 5 ways"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "D5W = 5% dextrose in water, a common IV fluid." },
  { q: "What does 'NS' mean?", o: ["Normal saline (0.9% NaCl)", "Not scheduled", "New strength", "No substitution"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NS = normal saline = 0.9% sodium chloride solution." },
  { q: "What does '1/2NS' indicate?", o: ["Half-normal saline (0.45% NaCl)", "One-half new strength", "Half the normal supply", "1/2 night shift"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "1/2NS = 0.45% sodium chloride, half the concentration of normal saline." },
  { q: "What does 'LR' stand for?", o: ["Lactated Ringer's solution", "Large refill", "Last refill", "Limited release"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "LR = Lactated Ringer's, an IV fluid with electrolytes similar to plasma." },
  
  // More equipment and technical
  { q: "A filter needle is used when:", o: ["Drawing from an ampule to remove glass particles", "Injecting into patients", "Drawing from vials", "All injections"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Filter needles remove glass particles when withdrawing from snapped ampules." },
  { q: "The hub of a needle refers to:", o: ["The plastic part that attaches to the syringe", "The point of the needle", "The shaft", "The bevel"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "The hub is the plastic connector at the base of the needle that fits onto the syringe." },
  { q: "The bevel of a needle is:", o: ["The slanted tip for easier insertion", "The shaft length", "The plastic hub", "The gauge number"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "The bevel is the slanted opening at the needle tip for smooth skin penetration." },
  { q: "Luer-Lok syringes differ from slip-tip in that:", o: ["They have a threaded connection for secure needle attachment", "They are disposable", "They hold more volume", "They are for oral use only"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Luer-Lok syringes have threading that locks the needle in place securely." },
  { q: "An infusion pump is used to:", o: ["Control the rate and volume of IV fluid delivery", "Mix medications", "Filter medications", "Store medications"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Infusion pumps precisely control the rate of IV medication/fluid delivery." },
  { q: "When using a class A balance, weights should be:", o: ["Handled with forceps, never fingers", "Handled with bare hands", "Cleaned with water before each use", "Stored in any container"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Forceps prevent oils and moisture from hands affecting weight accuracy." },
  { q: "An ointment mill is used to:", o: ["Reduce particle size and mix ingredients in semi-solid preparations", "Measure ointments", "Store ointments", "Heat ointments"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Ointment mills grind and mix ingredients for smooth, uniform semi-solid preparations." },
  { q: "Capsule sizes range from:", o: ["000 (largest) to 5 (smallest)", "1 (largest) to 10 (smallest)", "A (largest) to Z (smallest)", "All the same size"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Capsule sizes: 000, 00, 0, 1, 2, 3, 4, 5 (with 000 being the largest)." },
  { q: "A transfer set is used for:", o: ["Reconstituting vials and transferring contents", "Patient injection", "Blood collection", "Oral administration"] as [string, string, string, string], c: 0 as const, s: "4.2", e: "Transfer sets allow safe reconstitution and withdrawal from medication vials." },
  { q: "Compounding records must include:", o: ["Ingredients, quantities, lot numbers, BUD, and preparer identification", "Only the drug name", "Only the patient name", "Only the cost"] as [string, string, string, string], c: 0 as const, s: "4.3", e: "Complete compounding records ensure traceability and quality control." },
  
  // More processing
  { q: "When processing a prescription, which is verified first?", o: ["Patient identification and prescription validity", "Insurance coverage", "Inventory level", "Price"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Patient ID and prescription authenticity/validity are verified before processing." },
  { q: "DAW 0 means:", o: ["No product selection indicated - generic substitution allowed", "Brand required", "No substitution", "Dispense as written"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "DAW 0 = no preference - pharmacist may substitute generic if available." },
  { q: "DAW 1 means:", o: ["Substitution not allowed by prescriber", "Patient requests brand", "Generic unavailable", "No DAW needed"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "DAW 1 = prescriber requires brand, no generic substitution allowed." },
  { q: "DAW 2 means:", o: ["Substitution allowed but patient requests brand", "Prescriber requires brand", "Generic unavailable", "No preference"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "DAW 2 = patient requests brand despite generic availability." },
  { q: "A quantity limit on a prescription means:", o: ["Insurance restricts the amount that can be dispensed", "The pharmacy is out of stock", "The medication is discontinued", "The prescriber wants less"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Quantity limits are insurance restrictions on how much can be dispensed at once." },
  { q: "Prior authorization is required when:", o: ["Insurance requires justification before covering a medication", "Every prescription needs PA", "Patient asks for it", "Medication is recalled"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "PA is insurance requirement for coverage justification of certain medications." },
  { q: "A prescriber's NPI number is:", o: ["National Provider Identifier for billing and identification", "DEA number", "State license number", "Insurance ID"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "NPI is the 10-digit national provider identifier required for healthcare billing." },
  { q: "What is step therapy?", o: ["Insurance requirement to try cheaper drugs first", "Physical therapy before medication", "Increasing dose gradually", "Multiple prescriber review"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "Step therapy requires trying less expensive options before approving costlier drugs." },
  { q: "A point-of-sale (POS) system:", o: ["Processes transactions and transmits claims in real-time", "Only handles cash", "Only prints labels", "Only maintains inventory"] as [string, string, string, string], c: 0 as const, s: "4.1", e: "POS systems handle transactions, claims submission, and inventory simultaneously." },
];

for (const q of finalOrderEntryQuestions) {
  addQ("order_entry", q.s, q.q, q.o, q.c, q.e, q.calc || false);
}

// ============================================================
// FINAL BATCH - MORE MEDICATION QUESTIONS
// ============================================================

const finalMedicationQuestions = [
  // More indications and uses
  { q: "Albuterol is used primarily for:", o: ["Acute bronchospasm relief in asthma/COPD", "Lowering blood pressure", "Treating diabetes", "Reducing cholesterol"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Albuterol is a SABA for rapid relief of bronchospasm in respiratory conditions." },
  { q: "Metformin is contraindicated in patients with:", o: ["Severe renal impairment due to lactic acidosis risk", "Hypertension", "Asthma", "Allergies"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Metformin accumulates with poor kidney function, increasing lactic acidosis risk." },
  { q: "Which medication is used for opioid overdose reversal?", o: ["Naloxone (Narcan)", "Naltrexone", "Methadone", "Buprenorphine"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Naloxone is an opioid antagonist used for emergency reversal of opioid overdose." },
  { q: "Epinephrine auto-injectors are used for:", o: ["Severe allergic reactions (anaphylaxis)", "High blood pressure", "Asthma maintenance", "Depression"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Epinephrine is first-line treatment for anaphylaxis due to its rapid effect." },
  { q: "Which medication class is first-line for hypertension in diabetic patients?", o: ["ACE inhibitors or ARBs", "Beta blockers alone", "Calcium channel blockers alone", "Thiazide diuretics alone"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "ACE inhibitors/ARBs provide renal protection in diabetics with hypertension." },
  { q: "Levothyroxine should be taken:", o: ["On an empty stomach, 30-60 minutes before breakfast", "With a high-fat meal", "At bedtime with milk", "With calcium supplements"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Levothyroxine absorption is reduced by food, calcium, and iron; take on empty stomach." },
  { q: "Which antibiotic is commonly used for UTIs?", o: ["Nitrofurantoin", "Azithromycin", "Doxycycline", "Clindamycin"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Nitrofurantoin concentrates in urine and is effective for uncomplicated UTIs." },
  { q: "Methotrexate taken weekly is used for:", o: ["Rheumatoid arthritis, psoriasis", "Infections", "Hypertension", "Diabetes"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Low-dose weekly methotrexate is a DMARD for autoimmune conditions." },
  { q: "Which medication is used for smoking cessation?", o: ["Varenicline (Chantix)", "Omeprazole", "Lisinopril", "Atorvastatin"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "Varenicline is a partial nicotine agonist that reduces cravings and withdrawal." },
  { q: "Warfarin's effect is measured by:", o: ["INR (International Normalized Ratio)", "A1C", "Blood pressure", "Heart rate"] as [string, string, string, string], c: 0 as const, s: "1.6", e: "INR measures warfarin's anticoagulant effect; target usually 2-3." },
  
  // More brand/generic pairs
  { q: "What is the generic name for Xarelto?", o: ["Rivaroxaban", "Apixaban", "Warfarin", "Dabigatran"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Xarelto is the brand name for rivaroxaban, a factor Xa inhibitor anticoagulant." },
  { q: "What is the brand name for duloxetine?", o: ["Cymbalta", "Effexor", "Prozac", "Zoloft"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Duloxetine is marketed as Cymbalta, an SNRI for depression, anxiety, and neuropathy." },
  { q: "What is the generic name for Trulicity?", o: ["Dulaglutide", "Semaglutide", "Liraglutide", "Exenatide"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Trulicity (dulaglutide) is a weekly GLP-1 agonist for type 2 diabetes." },
  { q: "What is the brand name for trazodone?", o: ["Desyrel", "Ambien", "Lunesta", "Sonata"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Trazodone (Desyrel) is an antidepressant commonly used off-label for insomnia." },
  { q: "What is the generic name for Humira?", o: ["Adalimumab", "Infliximab", "Etanercept", "Certolizumab"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Humira (adalimumab) is a TNF inhibitor biologic for autoimmune conditions." },
  { q: "What is the brand name for pregabalin?", o: ["Lyrica", "Neurontin", "Topamax", "Lamictal"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Pregabalin (Lyrica) is used for neuropathy, fibromyalgia, and seizures." },
  { q: "What is the generic name for Adderall?", o: ["Amphetamine/dextroamphetamine", "Methylphenidate", "Lisdexamfetamine", "Atomoxetine"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Adderall is a mixed amphetamine salt C-II medication for ADHD." },
  { q: "What is the brand name for methylphenidate ER?", o: ["Concerta", "Adderall", "Vyvanse", "Strattera"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Concerta is extended-release methylphenidate (C-II) for ADHD." },
  
  // More drug classes
  { q: "What class of medication is omeprazole?", o: ["Proton pump inhibitor (PPI)", "H2 blocker", "Antacid", "Antiemetic"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Omeprazole is a PPI that blocks acid secretion in the stomach." },
  { q: "What class is lisinopril?", o: ["ACE inhibitor", "ARB", "Beta blocker", "Calcium channel blocker"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Lisinopril is an ACE inhibitor for hypertension and heart failure." },
  { q: "What class is amlodipine?", o: ["Calcium channel blocker", "ACE inhibitor", "ARB", "Beta blocker"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Amlodipine is a dihydropyridine calcium channel blocker for hypertension." },
  { q: "What class is gabapentin?", o: ["Anticonvulsant/analgesic", "SSRI", "Benzodiazepine", "Opioid"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Gabapentin is an anticonvulsant also used for neuropathic pain." },
  { q: "What class is montelukast?", o: ["Leukotriene receptor antagonist", "Inhaled corticosteroid", "Beta agonist", "Anticholinergic"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Montelukast (Singulair) is an LTRA for asthma and allergies." },
  { q: "What class is ondansetron?", o: ["5-HT3 receptor antagonist (antiemetic)", "Prokinetic", "Antacid", "PPI"] as [string, string, string, string], c: 0 as const, s: "1.1", e: "Ondansetron (Zofran) blocks serotonin receptors to prevent nausea/vomiting." },
  
  // Therapeutic equivalents
  { q: "Lisinopril and enalapril are:", o: ["Therapeutic equivalents within the ACE inhibitor class", "The same medication", "Different drug classes", "Not related"] as [string, string, string, string], c: 0 as const, s: "1.2", e: "Both are ACE inhibitors with similar mechanisms, though not substitutable without prescriber approval." },
  { q: "Taking both amlodipine and nifedipine would be:", o: ["Therapeutic duplication (both CCBs)", "Recommended", "Required", "Harmless"] as [string, string, string, string], c: 0 as const, s: "1.2", e: "Both are dihydropyridine CCBs - using both is unnecessary duplication." },
  { q: "Using both sertraline and fluoxetine would be:", o: ["Therapeutic duplication with increased serotonin syndrome risk", "Recommended", "Helpful", "Standard practice"] as [string, string, string, string], c: 0 as const, s: "1.2", e: "Both are SSRIs - combining increases risk of serotonin syndrome and side effects." },
  { q: "Omeprazole and esomeprazole are:", o: ["Related PPIs (esomeprazole is the S-isomer of omeprazole)", "Completely different drug classes", "Not related", "Opposite effects"] as [string, string, string, string], c: 0 as const, s: "1.2", e: "Esomeprazole is the active S-isomer of omeprazole; both are PPIs with similar effects." },
  
  // More interactions
  { q: "Tetracycline absorption is decreased by:", o: ["Dairy products, antacids, and iron supplements", "Nothing", "Only water", "All foods equally"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Calcium, aluminum, magnesium, and iron chelate tetracyclines, reducing absorption." },
  { q: "Lithium levels can become toxic when combined with:", o: ["NSAIDs, ACE inhibitors, and diuretics", "Acetaminophen", "Antacids", "Vitamins"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "These medications affect lithium excretion, potentially causing toxicity." },
  { q: "Theophylline levels are increased by:", o: ["Ciprofloxacin and erythromycin", "Acetaminophen", "Ibuprofen", "Antacids"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "These antibiotics inhibit CYP1A2, increasing theophylline levels and toxicity risk." },
  { q: "Digoxin toxicity risk increases when combined with:", o: ["Loop diuretics causing hypokalemia", "Antacids", "Acetaminophen", "Vitamins"] as [string, string, string, string], c: 0 as const, s: "1.3", e: "Hypokalemia from diuretics increases digoxin's effects and toxicity risk." },
];

for (const q of finalMedicationQuestions) {
  addQ("medications", q.s, q.q, q.o, q.c, q.e);
}

// Output and save
console.log("\nFinal questions added!");
console.log(`Total questions: ${questions.length}`);
console.log("\nBy domain:");
const byDomain: Record<string, number> = {};
for (const q of questions) {
  byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
}
for (const [domain, count] of Object.entries(byDomain)) {
  console.log(`  ${domain}: ${count}`);
}

fs.writeFileSync("./data/questions.json", JSON.stringify(questions, null, 2));
console.log("\nSaved to ./data/questions.json");
