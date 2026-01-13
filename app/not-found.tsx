import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 rotate-3">
        <FileQuestion className="w-8 h-8 text-ink-muted" />
      </div>
      <h2 className="text-2xl font-bold text-ink mb-2">Page Not Found</h2>
      <p className="text-ink-muted max-w-xs mb-8">
        We couldn't find the listing or page you're looking for. It may have been removed or claimed.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-ink text-white font-bold rounded-xl hover:bg-ink-light transition-all shadow-lg shadow-ink/10 active:scale-95"
      >
        Return to Directory
      </Link>
    </div>
  );
}
