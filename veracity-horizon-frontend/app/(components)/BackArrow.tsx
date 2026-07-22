import Link from "next/link";

interface BackArrowProps {
  href?: string;
  className?: string;
}

export default function BackArrow({ href, className = "" }: BackArrowProps) {
  const baseClasses = `p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
    );
  }

  return (
    <button onClick={() => window.history.back()} className={baseClasses}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}