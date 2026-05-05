import Providers from "@/layouts/Providers";
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
    <html lang="en" suppressHydrationWarning={isDev}>
      <head>
        <meta name="keywords" content="Global CXO Circle, executive ecosystem, CXO network, CIO circle, leadership, enterprise outcomes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" type="image/png" href="/public/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/public/favicon.svg" />
        <link rel="shortcut icon" href="/public/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/public/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Global CXO" />
        <link rel="manifest" href="/public/site.webmanifest" />
      </head>
      <body className={poppins.className} suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}