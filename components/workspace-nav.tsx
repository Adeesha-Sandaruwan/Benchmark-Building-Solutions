import Link from "next/link";
import { Boxes, BriefcaseBusiness, Users, Wallet } from "lucide-react";

const modules = [
  { href: "/protected/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/protected/workers", label: "Workers", icon: Users },
  { href: "/protected/materials", label: "Materials", icon: Boxes },
  { href: "/protected/expenses", label: "Expenses", icon: Wallet },
];

export function WorkspaceNav() {
  return <nav aria-label="Workspace modules" className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">{modules.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-slate-500 transition hover:border-amber-500 hover:text-[#152d4b]"><Icon size={16} />{label}</Link>)}</div></nav>;
}
