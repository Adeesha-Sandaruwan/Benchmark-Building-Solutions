import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { AuthShell } from "@/components/auth-shell";

export default function Page() {
  return (
    <AuthShell eyebrow="ACCOUNT RECOVERY" title="Get back to the work that matters." description="We’ll help you securely restore access to your project workspace."><ForgotPasswordForm /></AuthShell>
  );
}
