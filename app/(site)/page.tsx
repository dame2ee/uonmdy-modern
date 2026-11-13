import Announcements from "@/components/Announcements";
import HeroSlider from "@/components/HeroSlider";
import NavHelper from "@/components/NavHelper";
import PhotoGallery from "@/components/PhotoGallery";
import SpotlightOne from "@/components/SpotlightOne";
import SpotlightTwo from "@/components/SpotlightTwo";
import {
  getAnnouncements,
  getCampusStats,
  getGalleryImages,
  getNews,
  getRectors,
  getSlides,
} from "@/lib/content";

export default async function Home() {
  const [slides, announcements, news, rectors, gallery, stats] = await Promise.all([
    getSlides(),
    getAnnouncements(),
    getNews(3),
    getRectors(),
    getGalleryImages(),
    getCampusStats(),
  ]);

  return (
    <>
      <HeroSlider slides={slides} />
      <Announcements items={announcements} />
      <SpotlightOne news={news} rectors={rectors} />
      <PhotoGallery images={gallery} />
      <SpotlightTwo />
      <NavHelper stats={stats} />
    </>
  );
}
