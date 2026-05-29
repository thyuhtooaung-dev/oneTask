import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const fredoka = Fredoka({
	variable: "--font-app-sans",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "oneTask | Event-Driven Platform",
	description: "Collaborative Event-Driven Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${fredoka.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
