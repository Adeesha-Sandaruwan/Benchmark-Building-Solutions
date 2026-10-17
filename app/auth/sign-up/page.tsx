import { SignUpForm } from "@/components/sign-up-form";
import { AuthShell } from "@/components/auth-shell";

export default function Page() {
  return (
    <AuthShell eyebrow="JOIN YOUR PROJECT TEAM" title="A stronger project starts with a connected team." description="Set up your account to coordinate work and stay close to what is happening on site."><SignUpForm /></AuthShell>
  );
}
