// app/api/events/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "イベントIDが指定されていません" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (error) {
      console.error("Error checking event existence:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error("Error in GET /events/check:", error);
    return NextResponse.json(
      { error: "イベントの確認に失敗しました" },
      { status: 500 }
    );
  }
}