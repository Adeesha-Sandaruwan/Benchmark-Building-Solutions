import { Boxes } from "lucide-react";
import { ModuleFoundation } from "@/components/module-foundation";

export default function MaterialsPage() {
  return <ModuleFoundation title="Materials" description="Build a dependable record of the materials required, ordered, received, and used on each project." icon={Boxes} ready={["Organization material catalog schema", "Project material request records", "Quantities and delivery status fields"]} next="Catalog management, request entry, and delivery/usage updates will be added as this module progresses." />;
}
