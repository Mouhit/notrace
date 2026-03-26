import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadView from "@/components/ReadView";

export default function SecretPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-12 sm:py-16">
        <ReadView id={params.id} />
      </main>
      <Footer />
    </div>
  );
}
