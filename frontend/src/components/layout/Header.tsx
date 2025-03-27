// src/components/layout/Header.tsx
import Image from 'next/image';
import Link from 'next/link';

export const Header = () => {
  return (
    <header className="bg-white h-[60px] fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
        <Link href="/" className="flex items-center h-full py-2">
          <Image
            src="/icons/logo.svg"
            alt="アワセル"
            width={160}
            height={40}
            style={{
              width: 'auto',
              height: '100%'
            }}
            priority
          />
        </Link>
      </div>
    </header>
  );
};