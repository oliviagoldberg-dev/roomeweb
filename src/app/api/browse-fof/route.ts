import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.slice(7) ?? null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (!user || authError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const uid = user.id;

    // Get the current user's target city
    const { data: myProfile } = await supabaseAdmin
      .from("profiles")
      .select("city, moveCity")
      .eq("id", uid)
      .single();

    const myCity = myProfile?.moveCity || myProfile?.city;
    if (!myCity) return NextResponse.json({ users: [] });

    // Get my direct friends
    const { data: myFriendships } = await supabaseAdmin
      .from("friendships")
      .select("users")
      .contains("users", [uid]);

    const myFriendIds = new Set<string>(
      (myFriendships ?? []).flatMap((r: any) => r.users).filter((u: string) => u !== uid)
    );

    if (myFriendIds.size === 0) return NextResponse.json({ users: [] });

    // Get friends-of-friends (admin client bypasses RLS so we can read all friendship rows)
    const fofResults = await Promise.all(
      Array.from(myFriendIds).map((friendId) =>
        supabaseAdmin.from("friendships").select("users").contains("users", [friendId])
      )
    );

    const fofIds = new Set<string>();
    for (const { data } of fofResults) {
      for (const row of data ?? []) {
        for (const u of (row as any).users) {
          if (u !== uid && !myFriendIds.has(u)) fofIds.add(u);
        }
      }
    }

    if (fofIds.size === 0) return NextResponse.json({ users: [] });

    // Fetch FOF profiles that match the current user's target city
    const [{ data: byMoveCity }, { data: byCity }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").in("id", Array.from(fofIds)).eq("moveCity", myCity),
      supabaseAdmin.from("profiles").select("*").in("id", Array.from(fofIds)).eq("city", myCity),
    ]);

    const seen = new Set<string>();
    const profiles: any[] = [];
    for (const row of [...(byMoveCity ?? []), ...(byCity ?? [])]) {
      if (!seen.has(row.id)) { seen.add(row.id); profiles.push(row); }
    }

    return NextResponse.json({ users: profiles });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed" }, { status: 500 });
  }
}
