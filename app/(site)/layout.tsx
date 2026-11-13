import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MainNav from "@/components/MainNav";
import { getSiteNav } from "@/lib/nav";

/** Shared chrome for every public page: masthead, navigation, footer. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const items = await getSiteNav();

  return (
    <>
      <Header />
      <MainNav items={items} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
