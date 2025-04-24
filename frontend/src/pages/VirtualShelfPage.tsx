
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VirtualBookshelf from "@/components/VirtualBookshelf";

const VirtualShelfPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow bg-cm-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <VirtualBookshelf />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VirtualShelfPage;
