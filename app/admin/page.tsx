import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminView from "@/components/AdminView";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-12 sm:py-16">
        <AdminView />
      </main>
      <Footer />
    </div>
  );
}
