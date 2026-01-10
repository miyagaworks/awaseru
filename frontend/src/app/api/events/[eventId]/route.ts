// src/app/api/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eventOperations } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const exists = await eventOperations.checkEventExists(eventId);

    if (!exists) {
      return NextResponse.json(
        { error: "指定されたイベントが見つかりません" },
        { status: 404 }
      );
    }

    const event = await eventOperations.getEvent(eventId);
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error in GET /events/[eventId]:", error);
    return NextResponse.json(
      { error: "イベントの取得に失敗しました" },
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
    const body = await request.json();
    const { dates, participants } = body;

    if (!dates || !participants) {
      return NextResponse.json(
        { error: "日程と参加者は必須です" },
        { status: 400 }
      );
    }

    await eventOperations.updateEvent(eventId, { dates, participants });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /events/[eventId]:", error);
    return NextResponse.json(
      { error: "イベントの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
