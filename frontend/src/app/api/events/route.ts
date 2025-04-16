// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: body.title || "日程調整",
        description: body.description,
        dates: body.dates,
        participants: body.participants,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /events:", error);
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 }
    );
  }
}