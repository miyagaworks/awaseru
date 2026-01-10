// app/api/responses/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eventOperations } from "@/lib/db";
import type { ResponseStatus } from "@/types/database";

export async function GET(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const eventId = context.params.eventId;
    const responses = await eventOperations.getResponses(eventId);
    return NextResponse.json(responses);
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

    const response = await eventOperations.updateResponse({
      event_id: eventId,
      participant_name: body.participant_name,
      date: body.date,
      status: body.status as ResponseStatus,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in PATCH /responses/[eventId]:", error);
    return NextResponse.json(
      { error: "レスポンスの更新に失敗しました" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
