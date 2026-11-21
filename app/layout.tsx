import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'SNG Learning — Global Grade 1–12 & Live Interactive LMS',
  description:
    'Global Grade 1-12 and topic-wise learning management system by S&G Tutorial Services featuring curated video lectures, instant quizzes, downloadable student notes, student boards, and live teacher classrooms.',
  openGraph: {
    title: 'SNG Learning — Global Grade 1–12 & Live Interactive LMS',
    description:
      'Curated internet video lectures, video-linked quizzes, downloadable student notes, personal student boards, and interactive teacher live classrooms.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SNG Learning — Global Grade 1–12 & Live Interactive LMS',
    description:
      'Global Grade 1-12 and topic-wise LMS by S&G Tutorial Services.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <body
        className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-indigo-100 selection:text-indigo-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
