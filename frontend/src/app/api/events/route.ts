// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eventOperations } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "イベントIDは必須です" },
        { status: 400 }
      );
    }

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
    console.error("Error in GET events:", error);
    return NextResponse.json(
      { error: "イベントの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dates, participants } = body;

    // バリデーション
    if (!title) {
      return NextResponse.json(
        { error: "タイトルは必須です" },
        { status: 400 }
      );
    }
    if (!dates?.length) {
      return NextResponse.json(
        { error: "少なくとも1つの日程を設定してください" },
        { status: 400 }
      );
    }
    if (!participants?.length || participants.length > 10) {
      return NextResponse.json(
        { error: "参加者は1名以上10名以下で設定してください" },
        { status: 400 }
      );
    }

    const event = await eventOperations.createEvent({
      title,
      description,
      dates,
      participants,
    });

    // レスポンスの初期データを作成
    const responses = eventOperations.generateInitialResponses(
      event.id,
      participants,
      dates
    );

    await eventOperations.insertResponses(responses);

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
