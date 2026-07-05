import type { DomainId } from "@/types/question";

export interface SubArea {
  id: string;
  title: string;
}

export interface DomainConfig {
  id: DomainId;
  label: string;
  shortLabel: string;
  examWeight: number;
  bankTarget1050: number;
  mockExamCount90: number;
  color: string;
  bgColor: string;
  accent: string;
  gradient: string;
  subAreas: SubArea[];
}

export const DOMAINS: DomainConfig[] = [
  {
    id: "medications",
    label: "Medications",
    shortLabel: "Meds",
    examWeight: 0.35,
    bankTarget1050: 368,
    mockExamCount90: 32,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    accent: "#2563eb",
    gradient: "from-blue-500 to-cyan-500",
    subAreas: [
      { id: "1.1", title: "Generic/brand names and classifications" },
      { id: "1.2", title: "Therapeutic duplications" },
      { id: "1.3", title: "Drug interactions and contraindications" },
      { id: "1.4", title: "Strengths, doses, forms, and routes" },
      { id: "1.5", title: "Side effects, adverse effects, and allergies" },
      { id: "1.6", title: "Indications of medications" },
      { id: "1.7", title: "Drug stability" },
      { id: "1.8", title: "Proper storage of medications" },
    ],
  },
  {
    id: "federal",
    label: "Federal Requirements",
    shortLabel: "Federal",
    examWeight: 0.1875,
    bankTarget1050: 197,
    mockExamCount90: 17,
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    accent: "#9333ea",
    gradient: "from-purple-500 to-fuchsia-500",
    subAreas: [
      { id: "2.1", title: "Storage, handling, and disposal requirements" },
      { id: "2.2", title: "Controlled substance prescriptions and DEA schedules" },
      { id: "2.3", title: "Controlled substance inventory and dispensing" },
      { id: "2.4", title: "Restricted drug programs (REMS, pseudoephedrine)" },
      { id: "2.5", title: "FDA medication recalls" },
      { id: "2.6", title: "DSCSA serialization and tracking" },
    ],
  },
  {
    id: "patient_safety",
    label: "Patient Safety & QA",
    shortLabel: "Safety",
    examWeight: 0.2375,
    bankTarget1050: 249,
    mockExamCount90: 21,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    accent: "#059669",
    gradient: "from-emerald-500 to-teal-500",
    subAreas: [
      { id: "3.1", title: "High-alert and LASA medications" },
      { id: "3.2", title: "Error prevention strategies" },
      { id: "3.3", title: "Pharmacist intervention issues" },
      { id: "3.4", title: "Event reporting procedures" },
      { id: "3.5", title: "Types of prescription errors" },
      { id: "3.6", title: "Infection prevention and cleaning" },
    ],
  },
  {
    id: "order_entry",
    label: "Order Entry & Processing",
    shortLabel: "Orders",
    examWeight: 0.225,
    bankTarget1050: 236,
    mockExamCount90: 20,
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    accent: "#d97706",
    gradient: "from-amber-500 to-orange-500",
    subAreas: [
      { id: "4.1", title: "Calculations, sig codes, and abbreviations" },
      { id: "4.2", title: "Equipment and supplies for administration" },
      { id: "4.3", title: "Lot numbers, expiration dates, and NDC" },
      { id: "4.4", title: "Returns and reverse distribution" },
    ],
  },
];

export const DOMAIN_MAP = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d])
) as Record<DomainId, DomainConfig>;

export const TOTAL_BANK_TARGET = 1050;
export const MOCK_EXAM_SIZE = 90;
export const MOCK_EXAM_TIME_SECONDS = 110 * 60;

export function getDomainConfig(id: DomainId): DomainConfig {
  return DOMAIN_MAP[id];
}

export function getSubAreaTitle(domainId: DomainId, subAreaId: string): string {
  const domain = DOMAIN_MAP[domainId];
  return domain.subAreas.find((s) => s.id === subAreaId)?.title ?? subAreaId;
}

export function getSubAreaBankTarget(domainId: DomainId): Record<string, number> {
  const domain = DOMAIN_MAP[domainId];
  const perSubArea = Math.floor(domain.bankTarget1050 / domain.subAreas.length);
  const remainder = domain.bankTarget1050 % domain.subAreas.length;
  const targets: Record<string, number> = {};

  domain.subAreas.forEach((subArea, index) => {
    targets[subArea.id] = perSubArea + (index < remainder ? 1 : 0);
  });

  return targets;
}
