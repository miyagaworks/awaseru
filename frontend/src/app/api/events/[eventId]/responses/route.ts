// src/app/api/events/[eventId]/responses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eventOperations } from "@/lib/supabase";
import type { ResponseStatus } from "@/types/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const responses = await eventOperations.getResponses(eventId);
    return NextResponse.json(responses);
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

    const response = await eventOperations.updateResponse({
      event_id: eventId,
      participant_name,
      date,
      status: status as ResponseStatus,
    });

    return NextResponse.json({ success: true, data: response });
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

    const data = await eventOperations.updateResponses(eventId, responses);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in batch update responses:", error);
    return NextResponse.json(
      { error: "レスポンスの一括更新に失敗しました" },
      { status: 500 }
    );
  }
}
