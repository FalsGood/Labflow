import { Navbar } from "@/components/layout/Navbar";
import { ToastContainer } from "@/components/ui/ToastContainer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
