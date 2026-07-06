import Providers from "@/layouts/Providers";
import "../styles/tailwind.css";
import "../styles/index.scss";
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  display: "swap",
  weight: ['300', '400', '500', '600', '700', '800',],
});

export const metadata = {
  title: "Global CXO Circle | From Conversations To Outcomes",
  description: "Where CXOs Connect, Align, and Execute Together. A CXO-led platform that enables structured access to enterprise leaders, advisory engagement, and outcome-driven relationships.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning={isDev} data-scroll-behavior="smooth">
      <head>
        <meta name="keywords" content="Global CXO Circle, executive ecosystem, CXO network, CIO circle, leadership, enterprise outcomes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Files in public/ are served from the site root — a /public/ prefix 404s.
            Only link icons that actually exist in public/. */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16.png" sizes="16x16" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-title" content="Global CXO" />
      </head>
      <body className={poppins.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}