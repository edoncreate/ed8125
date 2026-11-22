import { Footer } from '../../components/Footer/Footer'
import { HomeHeader } from '../../components/Header/HomeHeader'

export function Home() {
  return (
    <>
      <HomeHeader />
      <main>
        <section id="home" />
        <section id="releases" />
        <section id="social" />
        <section id="bio" />
      </main>
      <Footer />
    </>
  )
}
