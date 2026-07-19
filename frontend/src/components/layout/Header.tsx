// src/components/layout/Header.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// 端末に合言葉を記憶するキー名（create ページ側の解錠判定と同じキーを使う）
const OWNER_KEY_STORAGE = 'awaseru_owner_key';

export const Header = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニューは外側タップ / ESC で閉じる
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const openLoginDialog = () => {
    setMenuOpen(false);
    setPassword('');
    setError(null);
    setDialogOpen(true);
  };

  // 閉じるときは入力・エラーをリセットしておく（次に開いたとき残さない）
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setPassword('');
      setError(null);
    }
  };

  const handleLogin = async () => {
    const value = password.trim();
    if (!value || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      // URL には合言葉を載せない（履歴に残さないため POST で確認する）
      const res = await fetch('/api/owner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k: value }),
      });

      if (!res.ok) {
        setError('確認に失敗しました。通信環境をご確認ください');
        return;
      }

      const data = await res.json();
      if (data?.ok === true) {
        try {
          // 解錠キーを端末に保存（PWA でも 30 名まで登録できるようにする）
          window.localStorage.setItem(OWNER_KEY_STORAGE, value);
        } catch {
          // プライベートモード等で localStorage が使えなくても画面は壊さない
        }
        setDialogOpen(false);
        setPassword('');
        router.push('/create');
      } else {
        setError('合言葉が違います');
      }
    } catch {
      setError('確認に失敗しました。通信環境をご確認ください');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <header className="bg-white h-[60px] fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center h-full py-2">
          <Image
            src="/icons/logo.svg"
            alt="アワセル"
            width={160}
            height={40}
            style={{
              width: 'auto',
              height: '100%',
            }}
            priority
          />
        </Link>

        {/* ハンバーガーメニュー */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="メニュー"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center justify-center h-10 w-10 rounded-md text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Menu className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openLoginDialog}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                管理者ログイン
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 管理者ログインダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="w-[calc(100%-40px)] sm:w-[425px] bg-white rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">管理者ログイン</DialogTitle>
            <DialogDescription>
              オーナー用の合言葉を入力すると、参加者を最大30名まで登録できます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLogin();
                }
              }}
              placeholder="合言葉を入力"
              autoComplete="current-password"
              disabled={submitting}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleLogin}
              disabled={submitting || password.trim().length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? '確認中...' : 'ログイン'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
