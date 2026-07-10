import { AppShell } from "@/components/app-shell";

export default function ProtectedDemoLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
