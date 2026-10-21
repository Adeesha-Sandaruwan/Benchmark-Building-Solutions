import { Wallet } from "lucide-react";
import { ModuleFoundation } from "@/components/module-foundation";

export default function ExpensesPage() {
  return <ModuleFoundation title="Expenses" description="Keep project costs attributable, reviewable, and supported by private receipt attachments." icon={Wallet} ready={["Project expense and approval-state schema", "Project-scoped access policies", "Private receipt storage bucket rules"]} next="Expense submission, receipt upload, approval actions, and budget summaries are still to be implemented." />;
}
