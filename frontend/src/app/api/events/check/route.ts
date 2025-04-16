// src/app/api/events/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
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
      return NextResponse.json(
        { error: "イベントの確認に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error("Error in check event:", error);
    return NextResponse.json(
      { error: "イベントの確認に失敗しました" },
      { status: 500 }
    );
  }
}

// 動的ルートであることを明示
export const dynamic = "force-dynamic";