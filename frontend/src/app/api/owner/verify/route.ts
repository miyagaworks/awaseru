// src/app/api/owner/verify/route.ts
import { NextRequest, NextResponse } from "next/server";

// オーナー用の合言葉を検証するだけのエンドポイント。
// 合言葉そのものは保存もログ出力もしない（解錠可否のみを返す）。
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // k: オーナー用の合言葉。値はログに出さない（成否のみ判定に使用）
    const { k } = body ?? {};

    // 判定ロジックは src/app/api/events/route.ts と同じ堅さにする。
    // - env 未設定 or 空文字 → 解錠しない
    // - k が文字列でない or 一致しない → 解錠しない
    const ownerUnlockKey = process.env.OWNER_UNLOCK_KEY;
    const isOwnerUnlocked =
      typeof ownerUnlockKey === "string" &&
      ownerUnlockKey.length > 0 &&
      typeof k === "string" &&
      k === ownerUnlockKey;

    // 成否のみ返す（失敗理由の詳細は返さない）。どちらも 200 で返す。
    return NextResponse.json({ ok: isOwnerUnlocked });
  } catch {
    // body が JSON でない等でも解錠しない。合言葉の値はログに出さない。
    return NextResponse.json({ ok: false });
  }
}
