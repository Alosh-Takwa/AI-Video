import type {Metadata} from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css'; // Global styles

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Video Script & Storyboard Creator',
  description: 'محرر ومولد نصوص سكربتات وفيديوهات احترافية بالذكاء الاصطناعي مع لوحة مشاهد وقنوات تحريك متكاملة',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" className={`${cairo.variable} ${inter.variable}`}>
      <body className="bg-[#0c0e17] text-gray-100 font-cairo min-h-screen antialiased selection:bg-purple-500/30 selection:text-purple-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
