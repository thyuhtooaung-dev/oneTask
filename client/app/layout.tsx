import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const firaSans = Fira_Sans({
	variable: "--font-app-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "oneTask | Event-Driven Platform",
	description: "Collaborative Event-Driven Management System",
};

import { Toaster } from "@/shared/ui/sonner/Sonner";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${firaSans.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
				<Providers>{children}</Providers>
				<Toaster position="bottom-right" duration={5000} />
			</body>
		</html>
	);
}
