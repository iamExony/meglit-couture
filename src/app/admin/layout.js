import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Meglit Admin",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
