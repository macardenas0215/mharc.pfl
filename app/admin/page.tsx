import type { Metadata } from "next";
import Inbox from "@/components/admin-inbox";
export const metadata: Metadata = {
  title: "Private inbox",
  robots: { index: false, follow: false },
};
export default function AdminPage() {
  return <Inbox />;
}
