// src/app/api/events/[eventId]/responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching responses:", error);
      return NextResponse.json(
        { error: "レスポンスの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET responses:", error);
    return NextResponse.json(
      { error: "レスポンスの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const { participant_name, date, status } = await request.json();

    if (!participant_name || !date || !status) {
      return NextResponse.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("responses")
      .upsert({
        event_id: eventId,
        participant_name,
        date,
        status,
      })
      .select();

    if (error) {
      console.error("Error updating response:", error);
      return NextResponse.json(
        { error: "レスポンスの更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error updating response:", error);
    return NextResponse.json(
      { error: "レスポンスの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const responses = await request.json();

    if (!Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: "有効なレスポンスデータが必要です" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("responses")
      .upsert(responses)
      .select();

    if (error) {
      console.error("Error updating responses batch:", error);
      return NextResponse.json(
        { error: "レスポンスの一括更新に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in batch update responses:", error);
    return NextResponse.json(
      { error: "レスポンスの一括更新に失敗しました" },
      { status: 500 }
    );
  }
}