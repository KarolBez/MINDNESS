import Navbar from '../components/Navbar'
import InfoCard from '../components/ InfoCard'
import Slideshow from '../components/Slideshow'
import HomeContent from '@/components/HomeContent';

export default function Home() {
  return (
    <>
      <Navbar />
      <InfoCard />
      <Slideshow />
        <HomeContent />
    </>
  )
}
