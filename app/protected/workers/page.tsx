import { Users } from "lucide-react";
import { ModuleFoundation } from "@/components/module-foundation";

export default function WorkersPage() {
  return <ModuleFoundation title="Workers" description="Maintain a clear directory of people and connect them to the construction projects they support." icon={Users} ready={["Tenant-aware worker records", "Organization-scoped row security", "Optional link to an app account"]} next="Worker search, profile editing, and project assignment screens are the next steps for this module." />;
}
