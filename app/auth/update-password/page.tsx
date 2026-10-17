import { UpdatePasswordForm } from "@/components/update-password-form";
import { AuthShell } from "@/components/auth-shell";

export default function Page() {
  return (
    <AuthShell eyebrow="SECURE YOUR ACCOUNT" title="Choose a password you can rely on." description="Your new password protects your project workspace and account details."><UpdatePasswordForm /></AuthShell>
  );
}
