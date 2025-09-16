import Navbar from './components/Navbar'
import Hero from './components/Hero'
import UrgentNeeds from './components/UrgentNeeds'
import About from './components/About'
import Services from './components/Services'
import Gallery from './components/Gallery'
import VolunteerDashboard from './components/VolunteerDashboard'
import Donation from './components/Donation'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Hero />
        <UrgentNeeds />
        <About />
        <Services />
        <Gallery />
        <VolunteerDashboard />
        <Donation />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
