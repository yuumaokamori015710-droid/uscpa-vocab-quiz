import type { StudyTrack } from "@/types";

export const studyTracks: StudyTrack[] = [
  {
    id: "FAR",
    label: "FAR",
    description: "Financial Accounting and Reporting",
    units: ["Concepts", "Assets", "Liabilities", "Equity", "Revenue", "Leases", "Consolidation", "Cash Flows"]
  },
  {
    id: "AUD",
    label: "AUD",
    description: "Auditing and Attestation",
    units: ["Planning", "Risk Assessment", "Internal Control", "Evidence", "Sampling", "Reporting", "Reviews", "Ethics"]
  },
  {
    id: "REG",
    label: "REG",
    description: "Taxation and Regulation",
    units: ["Individual Tax", "Entity Tax", "Property Transactions", "Business Law", "Contracts", "Agency", "Secured Transactions", "Bankruptcy"]
  },
  {
    id: "BAR",
    label: "BAR",
    description: "Business Analysis and Reporting",
    units: ["Cost Accounting", "Budgeting", "Performance", "Finance", "Working Capital", "NPV", "Risk Management", "Data Analytics"]
  }
];
