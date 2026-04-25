import './globals.css';
import 'antd/dist/reset.css';
import { Providers } from '@/context/provider';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Montserrat, Outfit } from 'next/font/google';
import AntdConfigProvider from '@/context/AntdConfigProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit-next',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/images/favicon.svg" />
      </head>
      <body className={`${montserrat.className} ${outfit.variable} dark:bg-gray-900`}>
        <Providers>
          <ThemeProvider>
            <AntdConfigProvider>
              <AntdRegistry>
                <SidebarProvider>{children}</SidebarProvider>
              </AntdRegistry>
            </AntdConfigProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
