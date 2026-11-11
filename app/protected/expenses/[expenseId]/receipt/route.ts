import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ expenseId: string }> }) {
  const { expenseId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(expenseId)) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims) return NextResponse.json({ error: "Sign in to view this receipt" }, { status: 401 });
  const { data: expense, error } = await supabase.from("expenses").select("id, project_id, receipt_path").eq("id", expenseId).maybeSingle();
  if (error || !expense?.receipt_path || !expense.receipt_path.startsWith(`${expense.project_id}/`)) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  const { data, error: signedUrlError } = await supabase.storage.from("expense-receipts").createSignedUrl(expense.receipt_path, 60);
  if (signedUrlError || !data?.signedUrl) return NextResponse.json({ error: "Receipt is unavailable" }, { status: 404 });
  return NextResponse.redirect(data.signedUrl, 302);
}
