import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionsView from "@/components/CollectionsView";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-12 sm:py-16">
        <CollectionsView />
      </main>
      <Footer />
    </div>
  );
}
