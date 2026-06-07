import type { AbitusCourse } from "@/types";

const progressBaseUrl = "https://mypage.abitus.co.jp/mypage/user/ProgressList.do";

export const abitusCourses: AbitusCourse[] = [
  {
    id: "FAR1-3",
    label: "FAR1-3",
    coreExamArea: "FAR",
    progressUrl: progressBaseUrl,
    chapters: [
      "Chapter1 Basic Concepts of Financial Accounting and Financial Statements",
      "Chapter2 Presentation and Disclosure of Financial Statements and Concepts of Recognition and Measurement",
      "Chapter3 Current Assets (Cash, Accounts Receivable, Inventory)",
      "Chapter4 Current Liabilities and Contingencies",
      "Chapter5 Property, Plant, and Equipment",
      "Chapter6 Intangible Assets",
      "Chapter7 Time Value of Money",
      "Chapter8 Bonds"
    ]
  },
  {
    id: "FAR4&5",
    label: "FAR4&5",
    coreExamArea: "FAR",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=154`,
    chapters: [
      "Chapter13 Investments",
      "Chapter14 Preparation of Consolidated Financial Statements and Adjustments Subsequent to Combination",
      "Chapter15 Deferred Taxes",
      "Chapter16 Statement of Cash Flows",
      "Chapter17 Accounting Changes and Error Corrections",
      "Chapter18 Miscellaneous Topics",
      "Chapter19 Financial Statement Ratios and Performance Metrics",
      "Chapter20 Nongovernmental Not-for-profit Organizations"
    ]
  },
  {
    id: "AUD",
    label: "AUD",
    coreExamArea: "AUD",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=155`,
    chapters: [
      "Chapter1 Overview of Financial Statements Audits",
      "Chapter2 Important Concepts in Financial Statements Audits",
      "Chapter3 Audit Reporting: Part I",
      "Chapter4 Audit Reporting: Part II",
      "Chapter5 Engagement Planning",
      "Chapter6 Internal Control: Part I",
      "Chapter7 Internal Control: Part II",
      "Chapter8 Substantive Tests: Part I"
    ]
  },
  {
    id: "REG1",
    label: "REG1",
    coreExamArea: "REG",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=156`,
    chapters: [
      "Chapter2 Contracts",
      "Chapter3 Sales",
      "Chapter4 Agency",
      "Chapter5 Real Property",
      "Chapter6 Suretyship",
      "Chapter7 Secured Transaction",
      "Chapter8 Bankruptcy",
      "Chapter9 Business Structure"
    ]
  },
  {
    id: "REG2",
    label: "REG2",
    coreExamArea: "REG",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=157`,
    chapters: [
      "Chapter1 Introduction",
      "Chapter2 Individual Part 1",
      "Chapter3 Individual Part 2",
      "Chapter4 Individual Part 3",
      "Chapter5 Individual Part 4",
      "Chapter6 Transaction in Property",
      "Chapter7 Partnership Part 1",
      "Chapter8 Partnership Part 2"
    ]
  },
  {
    id: "BAR",
    label: "BAR",
    coreExamArea: "BAR",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=158`,
    chapters: [
      "Chapter1 Cost Accounting Fundamentals",
      "Chapter2 Product Costing",
      "Chapter3 Cost Information for Decision",
      "Chapter4 Planning, Budgeting, and Control",
      "Chapter5 Performance Measurement",
      "Chapter6 Introduction to Finance",
      "Chapter7 Working Capital Management",
      "Chapter8 Investment Decisions"
    ]
  },
  {
    id: "ISC",
    label: "ISC",
    coreExamArea: "ISC",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=159`,
    chapters: [
      "Chapter1 Information Systems",
      "Chapter2 IT Governance",
      "Chapter3 Roles and Responsibilities of the Information Systems Department",
      "Chapter4 Internal Control",
      "Chapter5 Risk Management",
      "Chapter6 Business Continuity Plan",
      "Chapter7 Disaster Recovery Plan",
      "Chapter8 Information Security Legislation and Frameworks"
    ]
  },
  {
    id: "TCP",
    label: "TCP",
    coreExamArea: "TCP",
    progressUrl: `${progressBaseUrl}?mode=search&selectedSubjectId=160`,
    chapters: [
      "Chapter1 Individual Part 1 Gross Income and Deductions",
      "Chapter2 Individual Part 2 Loss Limitations",
      "Chapter3 Individual Part 3 Gift and Estate Taxation",
      "Chapter4 Individual Part 4 Financial Planning",
      "Chapter5 Partnership",
      "Chapter6 C Corporation",
      "Chapter7 S Corporation",
      "Chapter8 Entity Formation and Liquidation"
    ]
  }
];
