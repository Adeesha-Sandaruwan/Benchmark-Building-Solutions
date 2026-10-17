import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/protected";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/protected";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    } else {
      redirect("/auth/error?error=This%20verification%20link%20is%20invalid%20or%20has%20expired.%20Request%20a%20new%20one%20and%20try%20again.");
    }
  }

  // redirect the user to an error page with some instructions
  redirect("/auth/error?error=This%20verification%20link%20is%20incomplete.%20Request%20a%20new%20one%20and%20try%20again.");
}
