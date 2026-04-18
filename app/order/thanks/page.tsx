import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center px-4">
      <div className="menu-card max-w-xl w-full p-8 md:p-10 text-center">
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-great-vibes)] text-gray-900 leading-tight mb-4">
          Ellen and Hershal have received your order!
        </h1>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-2">
          Please watch the counter — we&apos;ll have it ready for pickup shortly.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Mahalo for ordering with us. 🌺
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#5a6f8e] hover:bg-[#4d6180] text-white text-sm font-semibold transition-colors"
        >
          Back to menu
        </Link>
      </div>
    </div>
  );
}
