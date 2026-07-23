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

const questions: Question[] = [];
let questionCounter: Record<string, number> = {};

function addQuestion(
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
// DOMAIN 1: MEDICATIONS (35% of exam, target ~368 questions)
// ============================================================

// 1.1 Generic/brand names and classifications
const medications = [
  // Cardiovascular
  { generic: "lisinopril", brand: "Zestril/Prinivil", class: "ACE inhibitor", indication: "hypertension, heart failure", commonDose: "10-40mg daily" },
  { generic: "losartan", brand: "Cozaar", class: "ARB", indication: "hypertension", commonDose: "25-100mg daily" },
  { generic: "amlodipine", brand: "Norvasc", class: "calcium channel blocker", indication: "hypertension, angina", commonDose: "5-10mg daily" },
  { generic: "metoprolol", brand: "Lopressor/Toprol-XL", class: "beta blocker", indication: "hypertension, heart failure, arrhythmias", commonDose: "25-200mg daily" },
  { generic: "atenolol", brand: "Tenormin", class: "beta blocker", indication: "hypertension, angina", commonDose: "25-100mg daily" },
  { generic: "carvedilol", brand: "Coreg", class: "beta blocker", indication: "heart failure, hypertension", commonDose: "3.125-25mg twice daily" },
  { generic: "hydrochlorothiazide", brand: "Microzide", class: "thiazide diuretic", indication: "hypertension, edema", commonDose: "12.5-50mg daily" },
  { generic: "furosemide", brand: "Lasix", class: "loop diuretic", indication: "edema, heart failure", commonDose: "20-80mg daily" },
  { generic: "spironolactone", brand: "Aldactone", class: "potassium-sparing diuretic", indication: "heart failure, edema, hypertension", commonDose: "25-100mg daily" },
  { generic: "digoxin", brand: "Lanoxin", class: "cardiac glycoside", indication: "atrial fibrillation, heart failure", commonDose: "0.125-0.25mg daily" },
  { generic: "warfarin", brand: "Coumadin", class: "anticoagulant", indication: "DVT, PE, atrial fibrillation", commonDose: "varies by INR" },
  { generic: "apixaban", brand: "Eliquis", class: "DOAC/factor Xa inhibitor", indication: "stroke prevention in AFib, DVT/PE", commonDose: "5mg twice daily" },
  { generic: "rivaroxaban", brand: "Xarelto", class: "DOAC/factor Xa inhibitor", indication: "stroke prevention in AFib, DVT/PE", commonDose: "20mg daily with food" },
  { generic: "clopidogrel", brand: "Plavix", class: "antiplatelet", indication: "ACS, stroke prevention, stent placement", commonDose: "75mg daily" },
  { generic: "atorvastatin", brand: "Lipitor", class: "statin", indication: "hyperlipidemia, cardiovascular protection", commonDose: "10-80mg daily" },
  { generic: "simvastatin", brand: "Zocor", class: "statin", indication: "hyperlipidemia", commonDose: "10-40mg daily at night" },
  { generic: "rosuvastatin", brand: "Crestor", class: "statin", indication: "hyperlipidemia", commonDose: "5-40mg daily" },
  { generic: "pravastatin", brand: "Pravachol", class: "statin", indication: "hyperlipidemia", commonDose: "10-80mg daily" },
  
  // Diabetes
  { generic: "metformin", brand: "Glucophage", class: "biguanide", indication: "type 2 diabetes", commonDose: "500-2000mg daily" },
  { generic: "glipizide", brand: "Glucotrol", class: "sulfonylurea", indication: "type 2 diabetes", commonDose: "5-40mg daily" },
  { generic: "glyburide", brand: "DiaBeta/Micronase", class: "sulfonylurea", indication: "type 2 diabetes", commonDose: "1.25-20mg daily" },
  { generic: "glimepiride", brand: "Amaryl", class: "sulfonylurea", indication: "type 2 diabetes", commonDose: "1-8mg daily" },
  { generic: "sitagliptin", brand: "Januvia", class: "DPP-4 inhibitor", indication: "type 2 diabetes", commonDose: "100mg daily" },
  { generic: "linagliptin", brand: "Tradjenta", class: "DPP-4 inhibitor", indication: "type 2 diabetes", commonDose: "5mg daily" },
  { generic: "empagliflozin", brand: "Jardiance", class: "SGLT2 inhibitor", indication: "type 2 diabetes, heart failure", commonDose: "10-25mg daily" },
  { generic: "canagliflozin", brand: "Invokana", class: "SGLT2 inhibitor", indication: "type 2 diabetes", commonDose: "100-300mg daily" },
  { generic: "liraglutide", brand: "Victoza", class: "GLP-1 agonist", indication: "type 2 diabetes, weight loss", commonDose: "0.6-1.8mg daily SC" },
  { generic: "semaglutide", brand: "Ozempic/Wegovy", class: "GLP-1 agonist", indication: "type 2 diabetes, weight loss", commonDose: "0.25-2mg weekly SC" },
  { generic: "insulin glargine", brand: "Lantus/Basaglar", class: "long-acting insulin", indication: "diabetes", commonDose: "varies" },
  { generic: "insulin lispro", brand: "Humalog", class: "rapid-acting insulin", indication: "diabetes", commonDose: "varies" },
  { generic: "insulin aspart", brand: "NovoLog", class: "rapid-acting insulin", indication: "diabetes", commonDose: "varies" },
  
  // Thyroid
  { generic: "levothyroxine", brand: "Synthroid/Levoxyl", class: "thyroid hormone", indication: "hypothyroidism", commonDose: "25-200mcg daily" },
  { generic: "liothyronine", brand: "Cytomel", class: "thyroid hormone (T3)", indication: "hypothyroidism", commonDose: "25-75mcg daily" },
  { generic: "methimazole", brand: "Tapazole", class: "antithyroid", indication: "hyperthyroidism", commonDose: "5-30mg daily" },
  
  // Respiratory
  { generic: "albuterol", brand: "Ventolin/ProAir", class: "SABA (short-acting beta agonist)", indication: "asthma, COPD", commonDose: "2 puffs q4-6h PRN" },
  { generic: "levalbuterol", brand: "Xopenex", class: "SABA", indication: "asthma, COPD", commonDose: "0.63-1.25mg nebulized" },
  { generic: "ipratropium", brand: "Atrovent", class: "anticholinergic", indication: "COPD, asthma", commonDose: "2 puffs QID" },
  { generic: "tiotropium", brand: "Spiriva", class: "LAMA (long-acting muscarinic antagonist)", indication: "COPD, asthma", commonDose: "1 capsule inhaled daily" },
  { generic: "salmeterol", brand: "Serevent", class: "LABA (long-acting beta agonist)", indication: "asthma, COPD", commonDose: "1 puff BID" },
  { generic: "formoterol", brand: "Foradil", class: "LABA", indication: "asthma, COPD", commonDose: "12mcg BID" },
  { generic: "fluticasone", brand: "Flovent", class: "inhaled corticosteroid", indication: "asthma", commonDose: "88-440mcg BID" },
  { generic: "budesonide", brand: "Pulmicort", class: "inhaled corticosteroid", indication: "asthma", commonDose: "180-720mcg BID" },
  { generic: "fluticasone/salmeterol", brand: "Advair", class: "ICS/LABA combination", indication: "asthma, COPD", commonDose: "1 puff BID" },
  { generic: "budesonide/formoterol", brand: "Symbicort", class: "ICS/LABA combination", indication: "asthma, COPD", commonDose: "2 puffs BID" },
  { generic: "montelukast", brand: "Singulair", class: "leukotriene receptor antagonist", indication: "asthma, allergies", commonDose: "10mg daily at night" },
  
  // GI
  { generic: "omeprazole", brand: "Prilosec", class: "PPI (proton pump inhibitor)", indication: "GERD, ulcers", commonDose: "20-40mg daily" },
  { generic: "pantoprazole", brand: "Protonix", class: "PPI", indication: "GERD, ulcers", commonDose: "40mg daily" },
  { generic: "esomeprazole", brand: "Nexium", class: "PPI", indication: "GERD, ulcers", commonDose: "20-40mg daily" },
  { generic: "lansoprazole", brand: "Prevacid", class: "PPI", indication: "GERD, ulcers", commonDose: "15-30mg daily" },
  { generic: "famotidine", brand: "Pepcid", class: "H2 blocker", indication: "GERD, ulcers", commonDose: "20-40mg BID" },
  { generic: "ranitidine", brand: "Zantac (discontinued)", class: "H2 blocker", indication: "GERD, ulcers", commonDose: "150mg BID" },
  { generic: "ondansetron", brand: "Zofran", class: "5-HT3 antagonist", indication: "nausea/vomiting", commonDose: "4-8mg q8h" },
  { generic: "promethazine", brand: "Phenergan", class: "phenothiazine antiemetic", indication: "nausea/vomiting", commonDose: "12.5-25mg q4-6h" },
  { generic: "metoclopramide", brand: "Reglan", class: "prokinetic", indication: "gastroparesis, nausea", commonDose: "10mg before meals" },
  { generic: "dicyclomine", brand: "Bentyl", class: "anticholinergic/antispasmodic", indication: "IBS", commonDose: "20mg QID" },
  { generic: "sucralfate", brand: "Carafate", class: "mucosal protectant", indication: "ulcers", commonDose: "1g QID" },
  { generic: "misoprostol", brand: "Cytotec", class: "prostaglandin analog", indication: "NSAID-induced ulcer prevention", commonDose: "200mcg QID" },
  
  // CNS/Psychiatry
  { generic: "sertraline", brand: "Zoloft", class: "SSRI", indication: "depression, anxiety, OCD, PTSD", commonDose: "50-200mg daily" },
  { generic: "fluoxetine", brand: "Prozac", class: "SSRI", indication: "depression, OCD, panic disorder", commonDose: "20-80mg daily" },
  { generic: "escitalopram", brand: "Lexapro", class: "SSRI", indication: "depression, anxiety", commonDose: "10-20mg daily" },
  { generic: "citalopram", brand: "Celexa", class: "SSRI", indication: "depression", commonDose: "20-40mg daily" },
  { generic: "paroxetine", brand: "Paxil", class: "SSRI", indication: "depression, anxiety, PTSD", commonDose: "20-50mg daily" },
  { generic: "venlafaxine", brand: "Effexor", class: "SNRI", indication: "depression, anxiety, pain", commonDose: "75-225mg daily" },
  { generic: "duloxetine", brand: "Cymbalta", class: "SNRI", indication: "depression, anxiety, neuropathy, fibromyalgia", commonDose: "30-60mg daily" },
  { generic: "bupropion", brand: "Wellbutrin", class: "NDRI", indication: "depression, smoking cessation", commonDose: "150-450mg daily" },
  { generic: "mirtazapine", brand: "Remeron", class: "tetracyclic antidepressant", indication: "depression, insomnia, appetite stimulation", commonDose: "15-45mg at bedtime" },
  { generic: "trazodone", brand: "Desyrel", class: "SARI", indication: "depression, insomnia", commonDose: "50-150mg at bedtime" },
  { generic: "amitriptyline", brand: "Elavil", class: "TCA", indication: "depression, neuropathy, migraine prevention", commonDose: "25-150mg at bedtime" },
  { generic: "nortriptyline", brand: "Pamelor", class: "TCA", indication: "depression, neuropathy", commonDose: "25-150mg daily" },
  { generic: "buspirone", brand: "Buspar", class: "anxiolytic", indication: "anxiety", commonDose: "15-60mg daily in divided doses" },
  { generic: "alprazolam", brand: "Xanax", class: "benzodiazepine", indication: "anxiety, panic disorder", commonDose: "0.25-2mg TID" },
  { generic: "lorazepam", brand: "Ativan", class: "benzodiazepine", indication: "anxiety, seizures, insomnia", commonDose: "0.5-2mg BID-TID" },
  { generic: "diazepam", brand: "Valium", class: "benzodiazepine", indication: "anxiety, seizures, muscle spasm", commonDose: "2-10mg BID-QID" },
  { generic: "clonazepam", brand: "Klonopin", class: "benzodiazepine", indication: "seizures, panic disorder", commonDose: "0.5-2mg BID" },
  { generic: "zolpidem", brand: "Ambien", class: "non-benzodiazepine hypnotic", indication: "insomnia", commonDose: "5-10mg at bedtime" },
  { generic: "eszopiclone", brand: "Lunesta", class: "non-benzodiazepine hypnotic", indication: "insomnia", commonDose: "1-3mg at bedtime" },
  { generic: "quetiapine", brand: "Seroquel", class: "atypical antipsychotic", indication: "schizophrenia, bipolar, depression adjunct", commonDose: "25-800mg daily" },
  { generic: "risperidone", brand: "Risperdal", class: "atypical antipsychotic", indication: "schizophrenia, bipolar, irritability in autism", commonDose: "1-6mg daily" },
  { generic: "olanzapine", brand: "Zyprexa", class: "atypical antipsychotic", indication: "schizophrenia, bipolar", commonDose: "5-20mg daily" },
  { generic: "aripiprazole", brand: "Abilify", class: "atypical antipsychotic", indication: "schizophrenia, bipolar, depression adjunct", commonDose: "5-30mg daily" },
  { generic: "haloperidol", brand: "Haldol", class: "typical antipsychotic", indication: "schizophrenia, acute psychosis", commonDose: "0.5-5mg BID-TID" },
  { generic: "lithium", brand: "Lithobid", class: "mood stabilizer", indication: "bipolar disorder", commonDose: "300-600mg BID-TID" },
  { generic: "valproic acid", brand: "Depakote", class: "anticonvulsant/mood stabilizer", indication: "seizures, bipolar, migraines", commonDose: "250-500mg BID-TID" },
  { generic: "lamotrigine", brand: "Lamictal", class: "anticonvulsant/mood stabilizer", indication: "seizures, bipolar", commonDose: "25-200mg daily" },
  { generic: "carbamazepine", brand: "Tegretol", class: "anticonvulsant", indication: "seizures, trigeminal neuralgia, bipolar", commonDose: "200-400mg BID" },
  { generic: "phenytoin", brand: "Dilantin", class: "anticonvulsant", indication: "seizures", commonDose: "100mg TID or 300mg daily" },
  { generic: "levetiracetam", brand: "Keppra", class: "anticonvulsant", indication: "seizures", commonDose: "500-1500mg BID" },
  { generic: "gabapentin", brand: "Neurontin", class: "anticonvulsant", indication: "seizures, neuropathy, anxiety", commonDose: "300-1200mg TID" },
  { generic: "pregabalin", brand: "Lyrica", class: "anticonvulsant", indication: "neuropathy, fibromyalgia, seizures", commonDose: "75-300mg BID" },
  { generic: "topiramate", brand: "Topamax", class: "anticonvulsant", indication: "seizures, migraines, weight loss", commonDose: "25-200mg BID" },
  
  // Pain
  { generic: "acetaminophen", brand: "Tylenol", class: "analgesic/antipyretic", indication: "pain, fever", commonDose: "325-1000mg q4-6h" },
  { generic: "ibuprofen", brand: "Motrin/Advil", class: "NSAID", indication: "pain, inflammation, fever", commonDose: "200-800mg q6-8h" },
  { generic: "naproxen", brand: "Aleve/Naprosyn", class: "NSAID", indication: "pain, inflammation", commonDose: "250-500mg BID" },
  { generic: "meloxicam", brand: "Mobic", class: "NSAID", indication: "osteoarthritis, rheumatoid arthritis", commonDose: "7.5-15mg daily" },
  { generic: "celecoxib", brand: "Celebrex", class: "COX-2 selective NSAID", indication: "osteoarthritis, rheumatoid arthritis", commonDose: "100-200mg BID" },
  { generic: "tramadol", brand: "Ultram", class: "opioid analgesic", indication: "moderate pain", commonDose: "50-100mg q4-6h" },
  { generic: "hydrocodone/acetaminophen", brand: "Norco/Vicodin", class: "opioid analgesic", indication: "moderate-severe pain", commonDose: "5-10mg q4-6h" },
  { generic: "oxycodone", brand: "OxyContin/Roxicodone", class: "opioid analgesic", indication: "moderate-severe pain", commonDose: "5-15mg q4-6h" },
  { generic: "morphine", brand: "MS Contin", class: "opioid analgesic", indication: "severe pain", commonDose: "15-30mg q4h or ER formulations" },
  { generic: "fentanyl", brand: "Duragesic", class: "opioid analgesic", indication: "severe chronic pain", commonDose: "12-100mcg/hr patch" },
  { generic: "codeine", brand: "various", class: "opioid analgesic", indication: "mild-moderate pain, cough", commonDose: "15-60mg q4-6h" },
  { generic: "sumatriptan", brand: "Imitrex", class: "triptan", indication: "migraine", commonDose: "25-100mg PO, 6mg SC" },
  { generic: "rizatriptan", brand: "Maxalt", class: "triptan", indication: "migraine", commonDose: "5-10mg" },
  
  // Antibiotics
  { generic: "amoxicillin", brand: "Amoxil", class: "penicillin", indication: "bacterial infections", commonDose: "250-500mg TID" },
  { generic: "amoxicillin/clavulanate", brand: "Augmentin", class: "penicillin + beta-lactamase inhibitor", indication: "bacterial infections", commonDose: "500-875mg BID" },
  { generic: "azithromycin", brand: "Zithromax/Z-pack", class: "macrolide", indication: "bacterial infections, STIs", commonDose: "250-500mg daily or Z-pack" },
  { generic: "clarithromycin", brand: "Biaxin", class: "macrolide", indication: "bacterial infections, H. pylori", commonDose: "250-500mg BID" },
  { generic: "ciprofloxacin", brand: "Cipro", class: "fluoroquinolone", indication: "UTI, bacterial infections", commonDose: "250-750mg BID" },
  { generic: "levofloxacin", brand: "Levaquin", class: "fluoroquinolone", indication: "pneumonia, UTI, sinusitis", commonDose: "250-750mg daily" },
  { generic: "doxycycline", brand: "Vibramycin", class: "tetracycline", indication: "bacterial infections, acne, Lyme disease", commonDose: "100mg BID" },
  { generic: "sulfamethoxazole/trimethoprim", brand: "Bactrim/Septra", class: "sulfonamide", indication: "UTI, MRSA, PCP prophylaxis", commonDose: "800/160mg BID" },
  { generic: "nitrofurantoin", brand: "Macrobid", class: "nitrofuran", indication: "UTI", commonDose: "100mg BID" },
  { generic: "metronidazole", brand: "Flagyl", class: "nitroimidazole", indication: "C. diff, bacterial vaginosis, anaerobes", commonDose: "500mg TID" },
  { generic: "cephalexin", brand: "Keflex", class: "1st gen cephalosporin", indication: "bacterial infections", commonDose: "250-500mg QID" },
  { generic: "cefdinir", brand: "Omnicef", class: "3rd gen cephalosporin", indication: "bacterial infections", commonDose: "300mg BID" },
  { generic: "clindamycin", brand: "Cleocin", class: "lincosamide", indication: "bacterial infections, MRSA", commonDose: "150-450mg QID" },
  { generic: "vancomycin", brand: "Vancocin", class: "glycopeptide", indication: "MRSA, C. diff (oral)", commonDose: "varies IV, 125mg QID PO" },
  
  // Antifungals
  { generic: "fluconazole", brand: "Diflucan", class: "azole antifungal", indication: "candidiasis, fungal infections", commonDose: "100-400mg daily" },
  { generic: "nystatin", brand: "Mycostatin", class: "polyene antifungal", indication: "oral/topical candidiasis", commonDose: "100,000 units QID swish and swallow" },
  { generic: "terbinafine", brand: "Lamisil", class: "allylamine antifungal", indication: "onychomycosis, tinea", commonDose: "250mg daily" },
  { generic: "clotrimazole", brand: "Lotrimin", class: "azole antifungal", indication: "topical fungal infections", commonDose: "apply BID" },
  
  // Antivirals
  { generic: "acyclovir", brand: "Zovirax", class: "antiviral", indication: "herpes, shingles", commonDose: "200-800mg 2-5x daily" },
  { generic: "valacyclovir", brand: "Valtrex", class: "antiviral", indication: "herpes, shingles", commonDose: "500-1000mg BID-TID" },
  { generic: "oseltamivir", brand: "Tamiflu", class: "neuraminidase inhibitor", indication: "influenza", commonDose: "75mg BID x 5 days" },
  
  // Allergy/Antihistamines
  { generic: "cetirizine", brand: "Zyrtec", class: "2nd gen antihistamine", indication: "allergies", commonDose: "10mg daily" },
  { generic: "loratadine", brand: "Claritin", class: "2nd gen antihistamine", indication: "allergies", commonDose: "10mg daily" },
  { generic: "fexofenadine", brand: "Allegra", class: "2nd gen antihistamine", indication: "allergies", commonDose: "180mg daily" },
  { generic: "diphenhydramine", brand: "Benadryl", class: "1st gen antihistamine", indication: "allergies, insomnia, itching", commonDose: "25-50mg q4-6h" },
  { generic: "hydroxyzine", brand: "Vistaril/Atarax", class: "1st gen antihistamine", indication: "anxiety, itching, sedation", commonDose: "25-100mg TID-QID" },
  { generic: "fluticasone nasal", brand: "Flonase", class: "intranasal corticosteroid", indication: "allergic rhinitis", commonDose: "1-2 sprays each nostril daily" },
  
  // Musculoskeletal
  { generic: "cyclobenzaprine", brand: "Flexeril", class: "muscle relaxant", indication: "muscle spasm", commonDose: "5-10mg TID" },
  { generic: "methocarbamol", brand: "Robaxin", class: "muscle relaxant", indication: "muscle spasm", commonDose: "750-1500mg TID-QID" },
  { generic: "baclofen", brand: "Lioresal", class: "muscle relaxant", indication: "spasticity", commonDose: "5-20mg TID" },
  { generic: "tizanidine", brand: "Zanaflex", class: "muscle relaxant", indication: "spasticity", commonDose: "2-8mg TID" },
  { generic: "allopurinol", brand: "Zyloprim", class: "xanthine oxidase inhibitor", indication: "gout, hyperuricemia", commonDose: "100-800mg daily" },
  { generic: "colchicine", brand: "Colcrys", class: "anti-gout", indication: "gout flare", commonDose: "0.6mg BID or as flare protocol" },
  { generic: "methotrexate", brand: "Trexall", class: "DMARD/antimetabolite", indication: "rheumatoid arthritis, psoriasis, cancer", commonDose: "7.5-25mg weekly" },
  { generic: "alendronate", brand: "Fosamax", class: "bisphosphonate", indication: "osteoporosis", commonDose: "70mg weekly" },
  { generic: "risedronate", brand: "Actonel", class: "bisphosphonate", indication: "osteoporosis", commonDose: "35mg weekly" },
  
  // Dermatology
  { generic: "hydrocortisone", brand: "Cortaid", class: "topical corticosteroid", indication: "inflammation, eczema", commonDose: "apply BID-TID" },
  { generic: "triamcinolone", brand: "Kenalog", class: "topical corticosteroid", indication: "inflammation, eczema, psoriasis", commonDose: "apply BID-TID" },
  { generic: "clobetasol", brand: "Temovate", class: "topical corticosteroid (high potency)", indication: "severe inflammation, psoriasis", commonDose: "apply BID" },
  { generic: "mupirocin", brand: "Bactroban", class: "topical antibiotic", indication: "skin infections, impetigo", commonDose: "apply TID" },
  { generic: "tretinoin", brand: "Retin-A", class: "topical retinoid", indication: "acne, photoaging", commonDose: "apply at night" },
  { generic: "benzoyl peroxide", brand: "various", class: "topical antimicrobial", indication: "acne", commonDose: "apply daily" },
  
  // Eye
  { generic: "latanoprost", brand: "Xalatan", class: "prostaglandin analog", indication: "glaucoma", commonDose: "1 drop at bedtime" },
  { generic: "timolol ophthalmic", brand: "Timoptic", class: "beta blocker (ophthalmic)", indication: "glaucoma", commonDose: "1 drop BID" },
  { generic: "brimonidine ophthalmic", brand: "Alphagan", class: "alpha-2 agonist", indication: "glaucoma", commonDose: "1 drop TID" },
  { generic: "olopatadine", brand: "Patanol/Pataday", class: "ophthalmic antihistamine", indication: "allergic conjunctivitis", commonDose: "1-2 drops daily" },
  
  // Hormones/Women's Health
  { generic: "estradiol", brand: "Estrace", class: "estrogen", indication: "menopause symptoms, HRT", commonDose: "0.5-2mg daily" },
  { generic: "medroxyprogesterone", brand: "Provera", class: "progestin", indication: "menstrual disorders, HRT", commonDose: "2.5-10mg daily" },
  { generic: "norethindrone", brand: "Aygestin", class: "progestin", indication: "contraception, endometriosis", commonDose: "0.35-5mg daily" },
  { generic: "ethinyl estradiol/norgestimate", brand: "Ortho Tri-Cyclen", class: "combined oral contraceptive", indication: "contraception, acne", commonDose: "1 tablet daily" },
  { generic: "testosterone", brand: "AndroGel", class: "androgen", indication: "hypogonadism", commonDose: "varies by formulation" },
  { generic: "finasteride", brand: "Proscar/Propecia", class: "5-alpha reductase inhibitor", indication: "BPH, male pattern baldness", commonDose: "1-5mg daily" },
  { generic: "tamsulosin", brand: "Flomax", class: "alpha blocker", indication: "BPH", commonDose: "0.4mg daily" },
  { generic: "sildenafil", brand: "Viagra", class: "PDE-5 inhibitor", indication: "erectile dysfunction, PAH", commonDose: "25-100mg PRN" },
  { generic: "tadalafil", brand: "Cialis", class: "PDE-5 inhibitor", indication: "erectile dysfunction, BPH", commonDose: "5-20mg daily or PRN" },
  
  // Other
  { generic: "prednisone", brand: "Deltasone", class: "corticosteroid", indication: "inflammation, autoimmune conditions", commonDose: "5-60mg daily" },
  { generic: "methylprednisolone", brand: "Medrol", class: "corticosteroid", indication: "inflammation", commonDose: "4-48mg daily" },
  { generic: "dexamethasone", brand: "Decadron", class: "corticosteroid", indication: "inflammation, nausea with chemo", commonDose: "0.5-9mg daily" },
  { generic: "naloxone", brand: "Narcan", class: "opioid antagonist", indication: "opioid overdose", commonDose: "0.4-2mg IM/IV/nasal" },
  { generic: "naltrexone", brand: "Vivitrol/ReVia", class: "opioid antagonist", indication: "opioid/alcohol dependence", commonDose: "50mg daily PO or 380mg IM monthly" },
  { generic: "buprenorphine/naloxone", brand: "Suboxone", class: "partial opioid agonist", indication: "opioid use disorder", commonDose: "8-24mg sublingual daily" },
  { generic: "potassium chloride", brand: "K-Dur/Klor-Con", class: "electrolyte", indication: "hypokalemia", commonDose: "10-20mEq daily" },
  { generic: "ferrous sulfate", brand: "Feosol", class: "iron supplement", indication: "iron deficiency anemia", commonDose: "325mg TID" },
  { generic: "cyanocobalamin", brand: "Nascobal", class: "vitamin B12", indication: "B12 deficiency", commonDose: "1000mcg daily or monthly IM" },
  { generic: "folic acid", brand: "Folvite", class: "B vitamin", indication: "folate deficiency, pregnancy", commonDose: "0.4-1mg daily" },
  { generic: "vitamin D3", brand: "various", class: "vitamin", indication: "vitamin D deficiency, osteoporosis", commonDose: "1000-5000 IU daily" },
];

// Generate diverse question types for medications
function generateMedicationQuestions() {
  const usedQuestions = new Set<string>();
  
  for (const med of medications) {
    // Type 1: Brand to Generic
    const q1 = `A patient brings in a prescription for ${med.brand.split("/")[0]}. What is the generic name?`;
    if (!usedQuestions.has(q1)) {
      usedQuestions.add(q1);
      const wrongGenerics = medications.filter(m => m.generic !== med.generic).slice(0, 3).map(m => m.generic);
      const options = [med.generic, ...wrongGenerics] as [string, string, string, string];
      const shuffled = shuffleWithCorrect(options, 0);
      addQuestion("medications", "1.1", q1, shuffled.options, shuffled.correctIndex, 
        `${med.brand.split("/")[0]} is the brand name for ${med.generic}, which is classified as a ${med.class}.`);
    }
    
    // Type 2: Indication-based (what would you use for X?)
    const q2 = `Which medication is indicated for ${med.indication.split(",")[0]}?`;
    if (!usedQuestions.has(q2) && Math.random() > 0.5) {
      usedQuestions.add(q2);
      const wrongMeds = medications.filter(m => !m.indication.includes(med.indication.split(",")[0])).slice(0, 3).map(m => m.generic);
      if (wrongMeds.length >= 3) {
        const options = [med.generic, ...wrongMeds] as [string, string, string, string];
        const shuffled = shuffleWithCorrect(options, 0);
        addQuestion("medications", "1.6", q2, shuffled.options, shuffled.correctIndex,
          `${med.generic} (${med.brand}) is used for ${med.indication}.`);
      }
    }
    
    // Type 3: Drug class identification
    const q3 = `${med.generic} belongs to which drug class?`;
    if (!usedQuestions.has(q3)) {
      usedQuestions.add(q3);
      const wrongClasses = [...new Set(medications.filter(m => m.class !== med.class).map(m => m.class))].slice(0, 3);
      if (wrongClasses.length >= 3) {
        const options = [med.class, ...wrongClasses] as [string, string, string, string];
        const shuffled = shuffleWithCorrect(options, 0);
        addQuestion("medications", "1.1", q3, shuffled.options, shuffled.correctIndex,
          `${med.generic} (${med.brand}) is classified as a ${med.class}.`);
      }
    }
  }
  
  // Additional clinical scenario questions
  const clinicalScenarios = [
    {
      q: "A patient on warfarin asks about taking ibuprofen for a headache. What should the technician do?",
      options: ["Refer to the pharmacist due to potential drug interaction", "Recommend acetaminophen as a safer alternative", "Tell them ibuprofen is fine to take", "Suggest they take half the dose"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "NSAIDs like ibuprofen increase bleeding risk in patients on warfarin. This requires pharmacist consultation.",
      subArea: "1.3"
    },
    {
      q: "Which medication requires monitoring of potassium levels?",
      options: ["Spironolactone", "Hydrochlorothiazide", "Amlodipine", "Metoprolol"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Spironolactone is a potassium-sparing diuretic and can cause hyperkalemia. Regular potassium monitoring is required.",
      subArea: "1.5"
    },
    {
      q: "A patient reports muscle pain while taking atorvastatin. This is most likely:",
      options: ["Myopathy, a known side effect of statins", "An allergic reaction requiring epinephrine", "Normal and will resolve on its own", "A sign of infection"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Statins can cause myopathy (muscle pain/weakness). The patient should be referred to the pharmacist for evaluation.",
      subArea: "1.5"
    },
    {
      q: "Which medication should be taken on an empty stomach, at least 30 minutes before eating?",
      options: ["Alendronate", "Metformin", "Lisinopril", "Atorvastatin"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Bisphosphonates like alendronate must be taken on an empty stomach with water, remaining upright for 30 minutes.",
      subArea: "1.4"
    },
    {
      q: "Which insulin has the longest duration of action?",
      options: ["Insulin glargine (Lantus)", "Insulin lispro (Humalog)", "Regular insulin", "Insulin aspart (NovoLog)"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Insulin glargine is a long-acting insulin with ~24 hour duration. Lispro and aspart are rapid-acting (3-5 hours).",
      subArea: "1.4"
    },
    {
      q: "A prescription for metformin should include which auxiliary label?",
      options: ["Take with food", "Take on empty stomach", "Avoid sunlight", "Refrigerate"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Metformin should be taken with food to reduce GI side effects.",
      subArea: "1.4"
    },
    {
      q: "Which medication requires a MedGuide to be dispensed with each fill?",
      options: ["Antidepressants (SSRIs)", "Omeprazole", "Lisinopril", "Metformin"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Antidepressants require a MedGuide due to the black box warning about suicidal thoughts, especially in young adults.",
      subArea: "1.5"
    },
    {
      q: "Which combination represents a therapeutic duplication?",
      options: ["Omeprazole and pantoprazole", "Lisinopril and amlodipine", "Metformin and glipizide", "Atorvastatin and aspirin"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Both omeprazole and pantoprazole are PPIs - taking both is a therapeutic duplication.",
      subArea: "1.2"
    },
    {
      q: "Which medication should NOT be crushed?",
      options: ["Metoprolol succinate ER (Toprol-XL)", "Immediate-release metoprolol", "Lisinopril", "Atorvastatin"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Extended-release (ER) formulations should never be crushed as it destroys the controlled-release mechanism.",
      subArea: "1.4"
    },
    {
      q: "A patient is allergic to sulfa drugs. Which medication should be avoided?",
      options: ["Sulfamethoxazole/trimethoprim", "Amoxicillin", "Azithromycin", "Ciprofloxacin"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Sulfamethoxazole is a sulfonamide antibiotic and should be avoided in patients with sulfa allergies.",
      subArea: "1.5"
    },
    {
      q: "Which medication has a black box warning for tendon rupture?",
      options: ["Fluoroquinolones (ciprofloxacin, levofloxacin)", "Penicillins", "Macrolides", "Cephalosporins"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Fluoroquinolones carry a black box warning for tendinitis and tendon rupture, especially in patients over 60.",
      subArea: "1.5"
    },
    {
      q: "Grapefruit juice significantly interacts with which medication?",
      options: ["Simvastatin", "Metformin", "Lisinopril", "Omeprazole"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Grapefruit inhibits CYP3A4 enzymes, increasing simvastatin levels and risk of myopathy.",
      subArea: "1.3"
    },
    {
      q: "Which medication requires protection from light?",
      options: ["Nitroglycerin", "Atorvastatin", "Metformin", "Lisinopril"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Nitroglycerin is light-sensitive and should be stored in its original amber container.",
      subArea: "1.8"
    },
    {
      q: "Which medication must be refrigerated?",
      options: ["Insulin (unopened)", "Metformin", "Lisinopril", "Omeprazole"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Unopened insulin should be refrigerated at 36-46°F. Once opened, most can be stored at room temperature for 28 days.",
      subArea: "1.8"
    },
    {
      q: "Which antidepressant has the longest half-life?",
      options: ["Fluoxetine (Prozac)", "Sertraline (Zoloft)", "Paroxetine (Paxil)", "Escitalopram (Lexapro)"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Fluoxetine has a half-life of 1-6 days (its metabolite norfluoxetine is 4-16 days), the longest of the SSRIs.",
      subArea: "1.7"
    },
    {
      q: "Which is NOT a side effect of opioid medications?",
      options: ["Diarrhea", "Constipation", "Respiratory depression", "Sedation"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Opioids cause constipation, not diarrhea. Other common effects include respiratory depression, sedation, and nausea.",
      subArea: "1.5"
    },
    {
      q: "Metformin is contraindicated in patients with:",
      options: ["Severe kidney impairment", "Hypertension", "High cholesterol", "Asthma"] as [string, string, string, string],
      correct: 0 as const,
      explanation: "Metformin is contraindicated in severe renal impairment (eGFR <30) due to risk of lactic acidosis.",
      subArea: "1.3"
    },
  ];
  
  for (const scenario of clinicalScenarios) {
    addQuestion("medications", scenario.subArea, scenario.q, scenario.options, scenario.correct, scenario.explanation);
  }
}

// Helper function to shuffle options while tracking correct answer
function shuffleWithCorrect(
  options: [string, string, string, string],
  correctIndex: number
): { options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 } {
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffled = indices.map(i => options[i]) as [string, string, string, string];
  const newCorrectIndex = indices.indexOf(correctIndex) as 0 | 1 | 2 | 3;
  return { options: shuffled, correctIndex: newCorrectIndex };
}

// Wrapper that calls addQuestion with shuffled result
function addQuestionShuffled(
  domain: Question["domain"],
  subArea: string,
  question: string,
  shuffleResult: { options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 },
  explanation: string,
  isCalculation = false
) {
  addQuestion(domain, subArea, question, shuffleResult.options, shuffleResult.correctIndex, explanation, isCalculation);
}

// ============================================================
// DOMAIN 2: FEDERAL REQUIREMENTS (18.75% of exam, target ~197 questions)
// ============================================================

function generateFederalQuestions() {
  const federalQuestions = [
    // DEA Schedules
    { q: "Which DEA schedule contains drugs with no accepted medical use and high abuse potential?", options: ["Schedule I", "Schedule II", "Schedule III", "Schedule IV"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Schedule I drugs (heroin, LSD, marijuana federally) have no accepted medical use and high abuse potential." },
    { q: "Hydrocodone combination products are classified as which DEA schedule?", options: ["Schedule II", "Schedule III", "Schedule IV", "Schedule V"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Since 2014, all hydrocodone combination products are Schedule II." },
    { q: "Which medication is a Schedule II controlled substance?", options: ["Oxycodone", "Tramadol", "Alprazolam", "Zolpidem"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Oxycodone is Schedule II. Tramadol is C-IV, alprazolam is C-IV, and zolpidem is C-IV." },
    { q: "Tramadol is classified as which DEA schedule?", options: ["Schedule IV", "Schedule II", "Schedule III", "Schedule V"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Tramadol was classified as Schedule IV in 2014." },
    { q: "Which benzodiazepine schedule is correct?", options: ["Schedule IV", "Schedule II", "Schedule III", "Schedule V"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Benzodiazepines (alprazolam, lorazepam, diazepam) are Schedule IV controlled substances." },
    { q: "Codeine cough syrup containing less than 200mg codeine per 100mL is classified as:", options: ["Schedule V", "Schedule II", "Schedule III", "Schedule IV"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Low-dose codeine cough preparations are Schedule V and may be sold OTC in some states with restrictions." },
    { q: "Which is NOT a Schedule II controlled substance?", options: ["Alprazolam", "Fentanyl", "Morphine", "Methylphenidate"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Alprazolam is Schedule IV. Fentanyl, morphine, and methylphenidate are all Schedule II." },
    { q: "Testosterone is classified as which DEA schedule?", options: ["Schedule III", "Schedule II", "Schedule IV", "Not scheduled"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Anabolic steroids including testosterone are Schedule III controlled substances." },
    
    // Prescription requirements
    { q: "A Schedule II prescription may NOT be:", options: ["Refilled", "Filled partially", "Faxed for emergency", "Written on a standard prescription form"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Schedule II prescriptions cannot be refilled. A new prescription is required each time." },
    { q: "What is the maximum days' supply for a Schedule II prescription in most states?", options: ["90 days", "30 days", "60 days", "No limit"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "While federal law doesn't set a limit, most states restrict Schedule II to 30-90 days' supply." },
    { q: "How long is a Schedule II prescription valid in most states?", options: ["90 days from date written", "6 months", "1 year", "30 days"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Schedule II prescriptions are typically valid for 90 days from the date written, varying by state." },
    { q: "A prescriber's DEA number is required on which prescriptions?", options: ["Controlled substances only", "All prescriptions", "Schedule II only", "Schedule I-III only"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "DEA numbers are required only on controlled substance prescriptions, not regular prescriptions." },
    { q: "The first letter of a DEA number for a physician is typically:", options: ["A, B, or F", "M or P", "X only", "Any letter"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "DEA numbers for physicians typically start with A, B, or F. M is for mid-level practitioners." },
    { q: "Schedule III-V controlled substances may be refilled up to:", options: ["5 times within 6 months", "Unlimited times", "3 times within 1 year", "No refills allowed"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Schedule III-V medications may be refilled up to 5 times within 6 months of the original date." },
    
    // Storage and handling
    { q: "Controlled substances must be stored:", options: ["In a securely locked cabinet with limited access", "On any shelf", "Near the pharmacy counter", "In the refrigerator"] as [string, string, string, string], correct: 0 as const, sub: "2.1", exp: "Federal law requires controlled substances to be stored in a securely locked, substantially constructed cabinet." },
    { q: "When disposing of controlled substances, pharmacies must:", options: ["Use a DEA-registered reverse distributor", "Flush them down the toilet", "Place in regular trash", "Return to manufacturer directly"] as [string, string, string, string], correct: 0 as const, sub: "2.1", exp: "Controlled substances must be disposed of through DEA-registered reverse distributors or DEA take-back programs." },
    { q: "Hazardous drug spills require:", options: ["Use of appropriate PPE and spill kits", "Immediate mopping with water", "Calling 911", "No special handling"] as [string, string, string, string], correct: 0 as const, sub: "2.1", exp: "Hazardous drug spills require proper PPE (gown, gloves, mask) and specialized spill kits for cleanup." },
    { q: "Which is required for handling chemotherapy drugs?", options: ["Closed-system transfer devices and PPE", "Standard gloves only", "No special precautions", "Surgical mask only"] as [string, string, string, string], correct: 0 as const, sub: "2.1", exp: "USP 800 requires closed-system transfer devices, double gloves, gowns, and other PPE for hazardous drugs." },
    
    // Controlled substance inventory
    { q: "How often must a pharmacy conduct a controlled substance inventory?", options: ["Every 2 years (biennial)", "Monthly", "Annually", "Weekly"] as [string, string, string, string], correct: 0 as const, sub: "2.3", exp: "DEA requires a biennial (every 2 years) inventory of all controlled substances." },
    { q: "Schedule II inventory must be:", options: ["Exact count", "Estimated if over 1000 units", "Visual check only", "Not required"] as [string, string, string, string], correct: 0 as const, sub: "2.3", exp: "Schedule II controlled substances require an exact count during inventory." },
    { q: "Controlled substance inventory records must be kept for:", options: ["At least 2 years", "6 months", "1 year", "5 years"] as [string, string, string, string], correct: 0 as const, sub: "2.3", exp: "DEA requires controlled substance records be maintained for at least 2 years (some states require longer)." },
    { q: "A perpetual inventory system tracks:", options: ["Real-time running count of controlled substances", "Only expired medications", "Monthly sales reports", "Patient demographics"] as [string, string, string, string], correct: 0 as const, sub: "2.3", exp: "Perpetual inventory provides a real-time running count of each controlled substance received and dispensed." },
    
    // REMS and restricted programs
    { q: "Which medication requires enrollment in a REMS program before dispensing?", options: ["Isotretinoin (iPLEDGE)", "Amoxicillin", "Lisinopril", "Omeprazole"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "Isotretinoin requires iPLEDGE REMS due to teratogenicity risks. Patients need monthly pregnancy tests." },
    { q: "Clozapine requires which special monitoring program?", options: ["Clozapine REMS (blood monitoring)", "iPLEDGE", "TIRF REMS", "No special program"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "Clozapine REMS requires regular ANC (absolute neutrophil count) monitoring due to agranulocytosis risk." },
    { q: "Pseudoephedrine sales are restricted because it can be used to make:", options: ["Methamphetamine", "LSD", "Marijuana", "Cocaine"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "The Combat Methamphetamine Epidemic Act restricts pseudoephedrine sales as it's a meth precursor." },
    { q: "What is the daily limit for pseudoephedrine purchases?", options: ["3.6 grams", "9 grams", "1 gram", "No limit"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "Federal law limits pseudoephedrine to 3.6g per day and 9g per 30-day period." },
    { q: "Pseudoephedrine must be stored:", options: ["Behind the counter or in locked cabinet", "On open shelves", "In refrigerator", "In controlled substance cabinet"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "Pseudoephedrine products must be kept behind the counter or in a locked cabinet, not openly displayed." },
    
    // FDA recalls
    { q: "A Class I FDA recall indicates:", options: ["Reasonable probability of serious adverse health consequences or death", "Temporary or reversible health effects", "Not likely to cause adverse health consequences", "Cosmetic defect only"] as [string, string, string, string], correct: 0 as const, sub: "2.5", exp: "Class I is the most serious recall - products may cause serious injury or death." },
    { q: "A Class II recall indicates:", options: ["May cause temporary or reversible health problems", "Serious or life-threatening consequences", "Unlikely to cause adverse health effects", "Packaging issues only"] as [string, string, string, string], correct: 0 as const, sub: "2.5", exp: "Class II recalls involve products that may cause temporary or medically reversible adverse health effects." },
    { q: "A Class III recall indicates:", options: ["Not likely to cause adverse health consequences", "Definitely causes death", "May cause permanent damage", "FDA-mandated destruction"] as [string, string, string, string], correct: 0 as const, sub: "2.5", exp: "Class III is the least severe - violations unlikely to cause adverse health consequences." },
    { q: "When a medication is recalled, the pharmacy must:", options: ["Remove product from shelves and quarantine immediately", "Continue selling until stock is depleted", "Wait for FDA to pick up", "Ignore if less than 30 days old"] as [string, string, string, string], correct: 0 as const, sub: "2.5", exp: "Recalled medications must be immediately removed from shelves, quarantined, and handled per recall instructions." },
    
    // DSCSA
    { q: "The Drug Supply Chain Security Act (DSCSA) requires:", options: ["Tracking and tracing of prescription drugs through the supply chain", "Patient identification verification", "Insurance verification", "Therapeutic substitution"] as [string, string, string, string], correct: 0 as const, sub: "2.6", exp: "DSCSA establishes national standards for tracking prescription drugs through the pharmaceutical distribution supply chain." },
    { q: "What does serialization under DSCSA involve?", options: ["Unique product identifier on each package", "Patient name on bottle", "Pharmacist signature", "Insurance ID number"] as [string, string, string, string], correct: 0 as const, sub: "2.6", exp: "Serialization requires a unique product identifier (SNI, NDC, lot, expiration) on each individual package." },
    { q: "DSCSA requires verification before:", options: ["Accepting returned products or products from non-authorized sources", "Every prescription fill", "Annual inventory", "Employee scheduling"] as [string, string, string, string], correct: 0 as const, sub: "2.6", exp: "DSCSA requires product verification to identify suspect or illegitimate products in the supply chain." },
    { q: "Transaction history under DSCSA must include:", options: ["Previous ownership and transaction dates", "Patient information only", "Insurance data only", "Prescriber preferences"] as [string, string, string, string], correct: 0 as const, sub: "2.6", exp: "Transaction documentation includes history (previous owners), information (product details), and statement (attestation)." },
    
    // Additional federal questions
    { q: "Which form is used to order Schedule II controlled substances?", options: ["DEA Form 222", "DEA Form 224", "DEA Form 106", "DEA Form 41"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "DEA Form 222 is the official order form for Schedule II controlled substances." },
    { q: "DEA Form 106 is used to report:", options: ["Theft or loss of controlled substances", "Annual inventory", "Ordering C-II medications", "DEA registration renewal"] as [string, string, string, string], correct: 0 as const, sub: "2.3", exp: "DEA Form 106 is used to report theft or significant loss of controlled substances." },
    { q: "The Combat Methamphetamine Epidemic Act (CMEA) is part of:", options: ["The USA PATRIOT Act reauthorization", "HIPAA", "The Affordable Care Act", "OBRA '90"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "CMEA was enacted as part of the USA PATRIOT Act reauthorization in 2006." },
    { q: "FDA MedWatch is used to report:", options: ["Adverse drug events and product problems", "DEA violations", "Insurance fraud", "Staffing issues"] as [string, string, string, string], correct: 0 as const, sub: "2.5", exp: "FDA MedWatch is the FDA's system for reporting adverse events, product problems, and medication errors." },
    { q: "Which agency oversees controlled substance regulations?", options: ["DEA (Drug Enforcement Administration)", "FDA only", "CDC", "CMS"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "The DEA, under the Department of Justice, enforces controlled substance laws and regulations." },
    { q: "A pharmacy's DEA registration must be renewed:", options: ["Every 3 years", "Every year", "Every 5 years", "Every 2 years"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "DEA registration (Form 224) must be renewed every 3 years." },
    { q: "Partial filling of Schedule II prescriptions for terminally ill patients:", options: ["Is allowed with proper documentation", "Is never permitted", "Requires new prescription each time", "Must be completed within 24 hours"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Partial fills for C-II are allowed for terminally ill patients and must be completed within 60 days." },
    { q: "Which information must be logged when selling pseudoephedrine?", options: ["Name, address, date, time, quantity, and signature", "Name only", "Date of birth only", "Insurance information"] as [string, string, string, string], correct: 0 as const, sub: "2.4", exp: "CMEA requires logging purchaser name, address, date/time, product name, quantity, and signature." },
    { q: "The National Drug Code (NDC) is a:", options: ["Unique product identifier assigned by the FDA", "Patient identification number", "DEA registration number", "Insurance claim number"] as [string, string, string, string], correct: 0 as const, sub: "2.6", exp: "The NDC is a unique 10-11 digit identifier for drugs: labeler code, product code, and package code." },
    { q: "Emergency dispensing of Schedule II without a prescription:", options: ["Is allowed in limited quantity with prescriber authorization and follow-up", "Is never permitted under any circumstances", "Requires DEA approval", "Requires hospital admission"] as [string, string, string, string], correct: 0 as const, sub: "2.2", exp: "Emergency C-II dispensing is permitted for 72-hour supply with verbal authorization; written Rx must follow within 7 days." },
  ];
  
  for (const q of federalQuestions) {
    addQuestion("federal", q.sub, q.q, q.options, q.correct, q.exp);
  }
}

// ============================================================
// DOMAIN 3: PATIENT SAFETY & QA (23.75% of exam, target ~249 questions)
// ============================================================

function generatePatientSafetyQuestions() {
  const safetyQuestions = [
    // High-alert medications
    { q: "Which is considered a high-alert medication?", options: ["Insulin", "Acetaminophen", "Cetirizine", "Omeprazole"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Insulin is a high-alert medication due to its narrow therapeutic index and potential for serious harm." },
    { q: "Anticoagulants are considered high-alert because:", options: ["Small dosing errors can cause serious bleeding or clots", "They are expensive", "They require refrigeration", "They are controlled substances"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Anticoagulants have a narrow therapeutic window; dosing errors can cause serious bleeding or thrombosis." },
    { q: "Which high-alert medication requires independent double-check before dispensing?", options: ["Chemotherapy", "Ibuprofen", "Vitamin D", "Calcium supplements"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Chemotherapy drugs are high-alert and require independent verification due to potential for serious harm." },
    { q: "Concentrated electrolytes (potassium chloride injection) are high-alert because:", options: ["They can cause fatal cardiac arrhythmias if given incorrectly", "They are expensive", "They expire quickly", "They require refrigeration"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Concentrated KCl can cause fatal cardiac arrhythmias if administered too rapidly or in wrong concentration." },
    { q: "Opioids are considered high-alert medications due to:", options: ["Risk of respiratory depression and overdose", "High cost", "Unpleasant taste", "Limited availability"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Opioids carry significant risk of respiratory depression, overdose, and death with dosing errors." },
    
    // LASA (Look-Alike Sound-Alike)
    { q: "HydrALAZINE and hydrOXYzine are examples of:", options: ["Look-alike/sound-alike (LASA) drugs", "Therapeutic equivalents", "Brand-generic pairs", "Drug interactions"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "HydrALAZINE and hydrOXYzine sound similar - tall man letters help differentiate LASA drugs." },
    { q: "Tall Man Lettering is used to:", options: ["Differentiate look-alike/sound-alike drug names", "Indicate controlled substances", "Show brand names", "Identify expired medications"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Tall Man Lettering (e.g., hydrOXYzine vs hydrALAZINE) helps prevent LASA medication errors." },
    { q: "Which pair are LASA medications?", options: ["CeleBREX and CeleXA", "Aspirin and Advil", "Tylenol and Motrin", "Prozac and Paxil"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "CeleBREX (celecoxib) and CeleXA (citalopram) are LASA drugs that could be easily confused." },
    { q: "To prevent LASA errors, pharmacies should:", options: ["Separate storage and use tall man letters", "Store all medications together", "Only use brand names", "Ignore similar names"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "Separating LASA medications on shelves and using Tall Man Letters helps prevent mix-ups." },
    { q: "PredniSONE and prednisoLONE are:", options: ["LASA medications requiring careful differentiation", "The same medication", "Not used anymore", "Always interchangeable"] as [string, string, string, string], correct: 0 as const, sub: "3.1", exp: "PredniSONE and prednisoLONE are different corticosteroids that are commonly confused LASA drugs." },
    
    // Error prevention
    { q: "The \"five rights\" of medication administration include:", options: ["Right patient, drug, dose, route, time", "Right price, insurance, provider, pharmacy, patient", "Right brand, generic, dose, quantity, refills", "Right color, shape, size, packaging, labeling"] as [string, string, string, string], correct: 0 as const, sub: "3.2", exp: "The 5 rights: right patient, right drug, right dose, right route, and right time." },
    { q: "Barcode scanning at dispensing helps prevent:", options: ["Wrong drug and wrong patient errors", "Insurance rejections", "Inventory shortages", "Prescription forgeries"] as [string, string, string, string], correct: 0 as const, sub: "3.2", exp: "Barcode scanning verifies correct drug, strength, and patient at point of dispensing." },
    { q: "A forcing function in medication safety is:", options: ["A design that prevents an error from occurring", "A disciplinary action", "A patient complaint", "An insurance requirement"] as [string, string, string, string], correct: 0 as const, sub: "3.2", exp: "Forcing functions physically prevent errors (e.g., IV tubing that only fits specific ports)." },
    { q: "The purpose of a medication reconciliation is to:", options: ["Create an accurate list of all patient medications to prevent errors", "Calculate copays", "Determine insurance coverage", "Schedule refills"] as [string, string, string, string], correct: 0 as const, sub: "3.2", exp: "Medication reconciliation ensures accurate medication list across care transitions to prevent errors." },
    { q: "Independent double-check involves:", options: ["Two people separately verifying high-alert medication", "One person checking twice", "Calling the doctor", "Checking insurance"] as [string, string, string, string], correct: 0 as const, sub: "3.2", exp: "Independent double-check means two people separately verify without influence from each other." },
    
    // Pharmacist intervention
    { q: "The technician should refer to the pharmacist when:", options: ["A patient asks about drug interactions", "Counting tablets", "Filing prescriptions", "Ordering inventory"] as [string, string, string, string], correct: 0 as const, sub: "3.3", exp: "Drug interaction questions require pharmacist expertise - technicians must refer clinical questions." },
    { q: "Which requires pharmacist intervention?", options: ["Patient reports allergic reaction to a prescribed medication", "Patient needs refill", "Insurance card update", "Change of address"] as [string, string, string, string], correct: 0 as const, sub: "3.3", exp: "Allergic reactions require immediate pharmacist evaluation and potential prescriber contact." },
    { q: "A technician notices a potential overdose on a prescription. They should:", options: ["Alert the pharmacist immediately", "Dispense as written", "Call the patient's family", "File a police report"] as [string, string, string, string], correct: 0 as const, sub: "3.3", exp: "Potential overdoses or safety concerns must be immediately brought to the pharmacist's attention." },
    { q: "When a patient asks 'Will this make me drowsy?', the technician should:", options: ["Refer the patient to the pharmacist", "Guess based on the medication", "Say no to all questions", "Tell them to read the insert"] as [string, string, string, string], correct: 0 as const, sub: "3.3", exp: "Questions about side effects require pharmacist counseling as it's clinical information." },
    { q: "A duplicate therapy alert appears during processing. The technician should:", options: ["Bring it to the pharmacist's attention", "Override it and continue", "Delete the prescription", "Call the insurance company"] as [string, string, string, string], correct: 0 as const, sub: "3.3", exp: "Clinical alerts like duplicate therapy require pharmacist review and potential prescriber contact." },
    
    // Event reporting
    { q: "A near-miss medication error should be:", options: ["Reported to learn and prevent future errors", "Ignored since no harm occurred", "Hidden from management", "Only reported if witnessed"] as [string, string, string, string], correct: 0 as const, sub: "3.4", exp: "Near-misses provide valuable learning opportunities to prevent actual harm - always report them." },
    { q: "Medication error reports should include:", options: ["What happened, when, medications involved, and outcome", "Only patient name", "Only the employee's name", "Insurance information"] as [string, string, string, string], correct: 0 as const, sub: "3.4", exp: "Complete error reports include circumstances, medications, outcome, and contributing factors." },
    { q: "The purpose of a root cause analysis (RCA) is to:", options: ["Identify system failures that contributed to an error", "Blame individual employees", "Calculate financial losses", "Report to the police"] as [string, string, string, string], correct: 0 as const, sub: "3.4", exp: "RCA focuses on identifying system failures, not individual blame, to prevent future errors." },
    { q: "A \"just culture\" in pharmacy means:", options: ["Distinguishing between human error and reckless behavior", "Punishing all errors equally", "Ignoring all errors", "Only reporting to insurance"] as [string, string, string, string], correct: 0 as const, sub: "3.4", exp: "Just culture recognizes that human errors differ from reckless behavior and focuses on learning." },
    { q: "ISMP (Institute for Safe Medication Practices) provides:", options: ["Medication safety information and error prevention strategies", "Insurance processing guidelines", "DEA registration", "Pharmacy licensing"] as [string, string, string, string], correct: 0 as const, sub: "3.4", exp: "ISMP is a nonprofit that provides medication safety resources and error prevention guidance." },
    
    // Types of errors
    { q: "Dispensing the wrong strength of a medication is called:", options: ["Wrong dose error", "Wrong patient error", "Wrong time error", "Documentation error"] as [string, string, string, string], correct: 0 as const, sub: "3.5", exp: "Wrong dose errors include incorrect strength, quantity, or frequency." },
    { q: "Giving medication to the wrong person is:", options: ["Wrong patient error", "Wrong drug error", "Wrong route error", "Wrong time error"] as [string, string, string, string], correct: 0 as const, sub: "3.5", exp: "Wrong patient errors occur when medication is given to an unintended recipient." },
    { q: "An omission error occurs when:", options: ["A prescribed dose is not given", "Wrong drug is given", "Extra doses are given", "Documentation is incomplete"] as [string, string, string, string], correct: 0 as const, sub: "3.5", exp: "Omission errors occur when a prescribed medication or dose is not administered." },
    { q: "Giving a medication at 8 PM instead of 8 AM is:", options: ["Wrong time error", "Wrong dose error", "Wrong patient error", "Omission error"] as [string, string, string, string], correct: 0 as const, sub: "3.5", exp: "Wrong time errors occur when medications are given at significantly different times than ordered." },
    { q: "Administering an IM injection IV is:", options: ["Wrong route error", "Wrong drug error", "Wrong dose error", "Documentation error"] as [string, string, string, string], correct: 0 as const, sub: "3.5", exp: "Wrong route errors occur when medication is given via incorrect administration route." },
    
    // Infection prevention
    { q: "Proper hand hygiene includes:", options: ["Washing with soap and water for at least 20 seconds or using alcohol-based sanitizer", "Quick rinse under water", "Using gloves instead of washing", "Washing once per shift"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Proper hand hygiene requires 20+ seconds of washing with soap or 20+ seconds with alcohol-based sanitizer." },
    { q: "When compounding sterile products, the first step is:", options: ["Perform proper hand hygiene and garbing", "Open vials", "Draw up medication", "Label the product"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Hand hygiene and proper garbing must occur before any sterile compounding activities." },
    { q: "The purpose of a laminar airflow hood is:", options: ["Provide a sterile environment for IV preparation", "Store medications", "Count tablets", "Review prescriptions"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Laminar airflow hoods (LAFW) provide ISO Class 5 sterile environment for IV compounding." },
    { q: "Which is proper aseptic technique?", options: ["Never touch critical sites of syringes and vials", "Touch anything as long as wearing gloves", "No special technique needed", "Only wash hands after compounding"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Aseptic technique requires never touching critical sites (syringe tips, needle hubs, vial tops) directly." },
    { q: "Cleaning a laminar flow hood should be done:", options: ["At the beginning of each shift and after spills", "Once per week", "Only when visibly dirty", "Once per month"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Hoods must be cleaned at start of shift, before compounding, after spills, and every 30 minutes during use." },
    { q: "ISO Class 5 refers to:", options: ["Air quality with less than 100 particles per cubic foot", "Medication storage temperature", "Drug potency", "Technician certification level"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "ISO Class 5 is the air quality standard inside laminar flow hoods with ≤100 particles (0.5µm+) per cubic foot." },
    { q: "PPE for hazardous drug handling includes:", options: ["Double gloves, chemo-rated gown, and respiratory protection", "Regular pharmacy coat only", "Just regular gloves", "No special PPE needed"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "USP 800 requires double chemo-rated gloves, gown, and appropriate respiratory protection for HD handling." },
    { q: "Multi-dose vials, once opened, are typically good for:", options: ["28 days unless otherwise specified", "Indefinitely", "24 hours", "1 year"] as [string, string, string, string], correct: 0 as const, sub: "3.6", exp: "Multi-dose vials are generally good for 28 days after opening if stored properly, unless labeled otherwise." },
  ];
  
  for (const q of safetyQuestions) {
    addQuestion("patient_safety", q.sub, q.q, q.options, q.correct, q.exp);
  }
}

// ============================================================
// DOMAIN 4: ORDER ENTRY & PROCESSING (22.5% of exam, target ~236 questions)
// ============================================================

function generateOrderEntryQuestions() {
  // Calculations
  const calculationQuestions = [
    { q: "A prescription calls for 500mg amoxicillin TID for 10 days. How many 500mg capsules are needed?", options: ["30 capsules", "10 capsules", "20 capsules", "50 capsules"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "TID = 3 times daily. 3 capsules × 10 days = 30 capsules.", calc: true },
    { q: "If a patient takes 2 tablets BID, how many tablets do they need for 30 days?", options: ["120 tablets", "60 tablets", "90 tablets", "30 tablets"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "BID = twice daily. 2 tablets × 2 times × 30 days = 120 tablets.", calc: true },
    { q: "Convert 5 mL to teaspoons:", options: ["1 teaspoon", "2 teaspoons", "0.5 teaspoon", "5 teaspoons"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "1 teaspoon = 5 mL, so 5 mL = 1 teaspoon.", calc: true },
    { q: "How many milliliters are in 2 tablespoons?", options: ["30 mL", "15 mL", "10 mL", "60 mL"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "1 tablespoon = 15 mL. 2 tablespoons = 30 mL.", calc: true },
    { q: "A child weighs 44 pounds. What is their weight in kilograms?", options: ["20 kg", "44 kg", "88 kg", "22 kg"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Divide pounds by 2.2 to get kg. 44 ÷ 2.2 = 20 kg.", calc: true },
    { q: "If a dose is 10mg/kg and the patient weighs 70kg, what is the total dose?", options: ["700 mg", "70 mg", "7 mg", "7000 mg"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "10 mg/kg × 70 kg = 700 mg total dose.", calc: true },
    { q: "How many grams are in 1500 mg?", options: ["1.5 g", "15 g", "150 g", "0.15 g"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Divide mg by 1000 to get grams. 1500 mg ÷ 1000 = 1.5 g.", calc: true },
    { q: "Convert 0.5 L to milliliters:", options: ["500 mL", "50 mL", "5 mL", "5000 mL"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Multiply liters by 1000 to get mL. 0.5 L × 1000 = 500 mL.", calc: true },
    { q: "A 150 mL bottle of medication is to be taken 5 mL TID. How many days will the bottle last?", options: ["10 days", "15 days", "30 days", "5 days"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "5 mL × 3 times = 15 mL per day. 150 mL ÷ 15 mL = 10 days.", calc: true },
    { q: "How many 0.5 mg tablets are needed to provide a 2 mg dose?", options: ["4 tablets", "2 tablets", "1 tablet", "0.5 tablets"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "2 mg ÷ 0.5 mg per tablet = 4 tablets.", calc: true },
    { q: "If an IV runs at 125 mL/hr, how much will infuse in 8 hours?", options: ["1000 mL", "500 mL", "125 mL", "2000 mL"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "125 mL/hr × 8 hours = 1000 mL.", calc: true },
    { q: "A prescription is for 240 mL of amoxicillin suspension 400mg/5mL. What is the total amount of drug?", options: ["19,200 mg (19.2 g)", "9,600 mg", "4,800 mg", "2,400 mg"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "240 mL ÷ 5 mL = 48 doses. 48 × 400 mg = 19,200 mg.", calc: true },
    { q: "How many mcg are in 2.5 mg?", options: ["2500 mcg", "250 mcg", "25 mcg", "25000 mcg"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Multiply mg by 1000 to get mcg. 2.5 mg × 1000 = 2500 mcg.", calc: true },
    { q: "A cream is to be applied to a 5cm × 10cm area. What is the area in cm²?", options: ["50 cm²", "15 cm²", "100 cm²", "500 cm²"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Area = length × width. 5 cm × 10 cm = 50 cm².", calc: true },
    { q: "If you need 1 g of a drug and the available form is 250 mg tablets, how many tablets do you need?", options: ["4 tablets", "2 tablets", "1 tablet", "8 tablets"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "1 g = 1000 mg. 1000 mg ÷ 250 mg = 4 tablets.", calc: true },
    
    // Sig codes and abbreviations
    { q: "What does 'BID' mean?", options: ["Twice daily", "Three times daily", "Four times daily", "At bedtime"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "BID = bis in die = twice daily." },
    { q: "What does 'PRN' mean?", options: ["As needed", "Every morning", "After meals", "Immediately"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "PRN = pro re nata = as needed." },
    { q: "'QHS' indicates medication should be taken:", options: ["At bedtime", "Every hour", "Four times daily", "With breakfast"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "QHS = quaque hora somni = every night at bedtime." },
    { q: "What does 'QID' mean?", options: ["Four times daily", "Every other day", "Twice daily", "Once daily"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "QID = quater in die = four times daily." },
    { q: "The abbreviation 'AC' means:", options: ["Before meals", "After meals", "At bedtime", "With water"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "AC = ante cibum = before meals." },
    { q: "What does 'PC' mean?", options: ["After meals", "Before meals", "As needed", "At night"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "PC = post cibum = after meals." },
    { q: "'PO' indicates which route of administration?", options: ["By mouth", "Intravenous", "Subcutaneous", "Intramuscular"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "PO = per os = by mouth." },
    { q: "What does 'SL' mean for administration?", options: ["Sublingual (under the tongue)", "Slowly", "Single layer", "Small amount"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "SL = sublingual = under the tongue." },
    { q: "'UD' or 'ut dict' on a prescription means:", options: ["As directed", "Until done", "Urgent delivery", "Use daily"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "UD (ut dictum) = as directed by the prescriber." },
    { q: "What does 'Q8H' mean?", options: ["Every 8 hours", "8 times daily", "Every 8 days", "At 8 PM"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "Q8H = every 8 hours." },
    { q: "'TID' means:", options: ["Three times daily", "Twice daily", "Take in daytime", "Three doses only"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "TID = ter in die = three times daily." },
    { q: "The abbreviation 'IM' refers to:", options: ["Intramuscular injection", "Immediately", "In morning", "Internal medicine"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "IM = intramuscular = injection into muscle tissue." },
    { q: "'SC' or 'SQ' refers to:", options: ["Subcutaneous injection", "Safely crush", "Single quantity", "Special care"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "SC/SQ = subcutaneous = injection under the skin." },
    { q: "Which abbreviation should be avoided according to ISMP?", options: ["QD (use 'daily' instead)", "BID", "TID", "PRN"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "QD can be confused with QID or QOD. 'Daily' should be written out." },
    { q: "'DAW' on a prescription means:", options: ["Dispense as written (no generic substitution)", "Discontinue and wait", "Double all weeks", "Delivered at workplace"] as [string, string, string, string], correct: 0 as const, sub: "4.1", exp: "DAW = dispense as written = brand required, no generic substitution." },
  ];
  
  for (const q of calculationQuestions) {
    addQuestion("order_entry", q.sub, q.q, q.options, q.correct, q.exp, q.calc || false);
  }
  
  // Equipment and supplies
  const equipmentQuestions = [
    { q: "Which needle gauge has the largest bore (diameter)?", options: ["18 gauge", "22 gauge", "25 gauge", "30 gauge"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Lower gauge numbers indicate larger bore. 18G is larger than 22G, 25G, or 30G." },
    { q: "Insulin is typically administered with which needle gauge?", options: ["28-31 gauge", "18 gauge", "14 gauge", "20 gauge"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Insulin needles are fine gauge (28-31G) for subcutaneous injection comfort." },
    { q: "A counting tray is used to:", options: ["Count tablets and capsules", "Measure liquids", "Store medications", "Compound creams"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Counting trays allow technicians to count pills using a spatula." },
    { q: "An amber vial is used to protect medications from:", options: ["Light", "Heat", "Moisture", "Air"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Amber (brown) vials protect light-sensitive medications from degradation." },
    { q: "A graduated cylinder is used to:", options: ["Measure liquid volumes accurately", "Count tablets", "Crush pills", "Label medications"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Graduated cylinders provide accurate liquid volume measurements for compounding." },
    { q: "Which filter size removes bacteria?", options: ["0.22 micron", "5 micron", "10 micron", "1 mm"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "0.22 micron filters are sterilizing filters that remove bacteria from solutions." },
    { q: "A mortar and pestle are used for:", options: ["Grinding and mixing solid ingredients", "Measuring liquids", "Labeling bottles", "Storing medications"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Mortar and pestle are used to grind, crush, and mix solid compounds." },
    { q: "Oral syringes differ from regular syringes in that they:", options: ["Cannot accept needles", "Are larger", "Are sterile", "Are disposable"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Oral syringes have tips incompatible with needles to prevent parenteral administration errors." },
    { q: "A class A prescription balance is accurate to:", options: ["6 mg", "100 mg", "1 g", "1 mg"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "Class A balances are accurate to 6 mg with a minimum weighable quantity of 120 mg." },
    { q: "For IV administration, solutions should be:", options: ["Sterile and pyrogen-free", "Colored for identification", "Thick and viscous", "Room temperature only"] as [string, string, string, string], correct: 0 as const, sub: "4.2", exp: "IV solutions must be sterile, pyrogen-free, and particulate-free." },
    
    // Lot numbers, NDC, expiration
    { q: "The NDC number consists of how many segments?", options: ["3 segments (labeler, product, package)", "2 segments", "4 segments", "5 segments"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "NDC has 3 segments: labeler code, product code, and package code." },
    { q: "A lot number is used to:", options: ["Track a specific batch of medication for recalls", "Identify the patient", "Calculate copays", "Determine generic equivalence"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "Lot numbers allow tracking of specific production batches for quality control and recalls." },
    { q: "If a medication expires on 07/2026, when is the last day it can be dispensed?", options: ["July 31, 2026", "July 1, 2026", "June 30, 2026", "August 1, 2026"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "Expiration dates mean the last day of the month (July 31, 2026 for 07/2026)." },
    { q: "Beyond Use Date (BUD) differs from expiration date in that BUD:", options: ["Is assigned after compounding or opening", "Is set by manufacturer", "Is always longer", "Only applies to liquids"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "BUD is assigned after preparation/opening; expiration date is manufacturer-assigned for intact products." },
    { q: "The first segment of an NDC number identifies:", options: ["The labeler/manufacturer", "The product", "The package size", "The drug class"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "The first NDC segment (4-5 digits) identifies the labeler/manufacturer." },
    { q: "Which medication would have the earliest expiration date?", options: ["Reconstituted antibiotic suspension", "Unopened tablets", "Sealed IV solution", "Original packaging cream"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "Reconstituted suspensions typically expire within 7-14 days, much sooner than intact products." },
    { q: "FEFO stands for:", options: ["First Expired, First Out", "First Entered, First Out", "Fast Expiring, For Order", "Final Entry, Final Output"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "FEFO = First Expired, First Out. Dispense medications expiring soonest first to minimize waste." },
    { q: "The middle segment of an NDC identifies:", options: ["The specific drug product (strength, dosage form)", "The manufacturer", "The package size", "The DEA schedule"] as [string, string, string, string], correct: 0 as const, sub: "4.3", exp: "The middle NDC segment (3-4 digits) identifies the specific product, strength, and dosage form." },
    
    // Returns and reverse distribution
    { q: "Medications past expiration should be:", options: ["Removed from stock and returned to reverse distributor", "Sold at a discount", "Given to patients for free", "Left on shelf until used"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Expired medications must be removed and returned to a reverse distributor for proper disposal/credit." },
    { q: "A reverse distributor is:", options: ["A company that handles pharmaceutical returns and disposal", "A customer who returns medications", "A type of wholesaler", "A pharmacy robot"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Reverse distributors process pharmaceutical returns, credits, and proper disposal." },
    { q: "Recalled medications should be:", options: ["Immediately quarantined and processed according to recall instructions", "Returned to the patient", "Sold at discount", "Destroyed on site"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Recalled products must be immediately removed, quarantined, and handled per recall instructions." },
    { q: "Controlled substance returns require:", options: ["Special DEA procedures through authorized reverse distributors", "Standard return procedures", "No documentation", "Patient permission"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Controlled substance returns must use DEA-registered reverse distributors with proper documentation." },
    { q: "Credit for returned medications is typically issued:", options: ["After the reverse distributor processes returns", "Immediately upon shipping", "Before expiration", "On annual basis"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Credit is issued after the reverse distributor receives and processes returned medications." },
    { q: "Which medications typically cannot be returned for credit?", options: ["Refrigerated items, opened packages, C-II substances", "Any prescription medication", "OTC medications", "All brand name medications"] as [string, string, string, string], correct: 0 as const, sub: "4.4", exp: "Refrigerated, opened, damaged, or C-II substances often cannot be returned for credit." },
  ];
  
  for (const q of equipmentQuestions) {
    addQuestion("order_entry", q.sub, q.q, q.options, q.correct, q.exp);
  }
}

// Generate all questions
generateMedicationQuestions();
generateFederalQuestions();
generatePatientSafetyQuestions();
generateOrderEntryQuestions();

// Output stats and save
console.log("\nQuestion generation complete!");
console.log(`Total questions: ${questions.length}`);
console.log("\nBy domain:");
const byDomain: Record<string, number> = {};
for (const q of questions) {
  byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
}
for (const [domain, count] of Object.entries(byDomain)) {
  console.log(`  ${domain}: ${count}`);
}

// Save to file
fs.writeFileSync("./data/questions.json", JSON.stringify(questions, null, 2));
console.log("\nSaved to ./data/questions.json");
