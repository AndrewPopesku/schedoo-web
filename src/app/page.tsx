import Header from "@/components/Header";
import Schedule from "@/components/Schedule";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto p-4">
        <Schedule />
      </div>
    </main>
  );
}
