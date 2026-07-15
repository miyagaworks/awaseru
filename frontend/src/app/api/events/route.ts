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

    const event = await eventOperations.getEvent(eventId);
    return NextResponse.json(event);
  } catch (error) {
    console.error("Error in GET events:", error);
    if (error instanceof Error && error.message === "Event not found") {
      return NextResponse.json(
        { error: "指定されたイベントが見つかりません" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "イベントの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // k: オーナー専用リンクの合言葉（保存はしない。上限判定にのみ使用）
    const { title, description, dates, participants, k } = body;

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

    // 参加者数の上限判定（必ずサーバー側で検証する。クライアントの制限は回避可能なため）
    // - 通常利用者: 最大10名
    // - オーナー専用リンク（合言葉 k が OWNER_UNLOCK_KEY と一致）: 最大30名
    // - 合言葉が未設定 or 不一致: 安全側にロックして最大10名として扱う
    const DEFAULT_MAX_PARTICIPANTS = 10;
    const OWNER_MAX_PARTICIPANTS = 30;
    const ownerUnlockKey = process.env.OWNER_UNLOCK_KEY;
    const isOwnerUnlocked =
      typeof ownerUnlockKey === "string" &&
      ownerUnlockKey.length > 0 &&
      typeof k === "string" &&
      k === ownerUnlockKey;
    const maxParticipants = isOwnerUnlocked
      ? OWNER_MAX_PARTICIPANTS
      : DEFAULT_MAX_PARTICIPANTS;

    if (!participants?.length || participants.length > maxParticipants) {
      return NextResponse.json(
        {
          error: `参加者は1名以上${maxParticipants}名以下で設定してください`,
        },
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
