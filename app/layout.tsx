import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalLoadingProvider } from "@/components/global-loading-provider"
import { NavigationWrapper } from "@/components/navigation-wrapper"
import { QueryProvider } from "@/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PhlexiLeads - Lead management Platform",
  description: ""
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <GlobalLoadingProvider>
              <NavigationWrapper>{children}</NavigationWrapper>
            </GlobalLoadingProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
