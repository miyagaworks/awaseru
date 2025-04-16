// src/app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ResponseStatus } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "イベントIDは必須です" },
        { status: 400 }
      );
    }

    const { data: exists, error: existsError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .maybeSingle();

    if (existsError) {
      console.error("Error checking event existence:", existsError);
      return NextResponse.json(
        { error: "イベントの確認に失敗しました" },
        { status: 500 }
      );
    }

    if (!exists) {
      return NextResponse.json(
        { error: "指定されたイベントが見つかりません" },
        { status: 404 }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return NextResponse.json(
        { error: "イベントの取得に失敗しました" },
        { status: 500 }
      );
    }

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

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        dates,
        participants,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return NextResponse.json(
        { error: "イベントの作成に失敗しました" },
        { status: 500 }
      );
    }

    // レスポンスの初期データを作成
    const responses = dates.flatMap((date: string) =>
      participants.map((participant_name: string) => ({
        event_id: event.id,
        participant_name,
        date,
        status: "未回答" as ResponseStatus,
      }))
    );

    const { error: responseError } = await supabase
      .from("responses")
      .insert(responses);

    if (responseError) {
      console.error("Error creating initial responses:", responseError);
      // イベント自体は作成されているので、エラーは返さない
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 }
    );
  }
}