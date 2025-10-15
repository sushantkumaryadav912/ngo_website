import Hero from '../components/Hero'
import UrgentNeeds from '../components/UrgentNeeds'
import About from '../components/About'
import Services from '../components/Services'
import Gallery from '../components/Gallery'
import Donation from '../components/Donation'
import Contact from '../components/Contact'

const HomePage = () => {
  return (
    <div>
      <Hero />
      <UrgentNeeds />
      <About />
      <Services />
      <Gallery />
      <Donation />
      <Contact />
    </div>
  )
}

export default HomePage
