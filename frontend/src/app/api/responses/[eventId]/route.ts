// app/api/responses/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params.eventId;

    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching responses:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /responses/[eventId]:", error);
    return NextResponse.json(
      { error: "レスポンスの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params.eventId;
    const body = await request.json();

    const { data, error } = await supabase
      .from("responses")
      .upsert({
        event_id: eventId,
        participant_name: body.participant_name,
        date: body.date,
        status: body.status,
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating response:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PATCH /responses/[eventId]:", error);
    return NextResponse.json(
      { error: "レスポンスの更新に失敗しました" },
      { status: 500 }
    );
  }
}
