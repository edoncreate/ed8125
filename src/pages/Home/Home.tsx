import { Footer } from '../../components/Footer/Footer'
import { HomeHeader } from '../../components/Header/HomeHeader'
import { Beats } from './Beats'
import { Bio } from './Bio'
import { Hero } from './Hero'
import { HeroMobile } from './HeroMobile'
import './Home.css'
import { Releases } from './Releases'
import { Social } from './Social'

export function Home() {
  return (
    <>
      <HomeHeader />
      <main className="home">
        {/* One anchor for both heroes (the original used #home and, on phones, #hom). */}
        <div id="home">
          <Hero />
          <HeroMobile />
        </div>
        <Releases />
        <Social />
        <Beats />
        <Bio />
      </main>
      <Footer />
    </>
  )
}
