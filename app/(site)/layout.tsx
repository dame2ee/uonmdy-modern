import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainNav from "@/components/MainNav";

/** Shared chrome for every public page: masthead, navigation, footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MainNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
