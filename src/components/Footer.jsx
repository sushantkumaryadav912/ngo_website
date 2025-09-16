const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold">SURYODAY OLD AGE HOME</h3>
            <p className="mt-2 text-gray-400">
              Providing a life of dignity and care for our elders.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold">Quick Links</h3>
            <ul className="mt-2 space-y-1">
              <li><a href="#about" className="hover:text-blue-400">About Us</a></li>
              <li><a href="#services" className="hover:text-blue-400">Services</a></li>
              <li><a href="#gallery" className="hover:text-blue-400">Gallery</a></li>
              <li><a href="#contact" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </div>
          {/* Social */}
          <div>
            <h3 className="text-lg font-bold">Follow Us</h3>
            <div className="flex justify-center md:justify-start mt-2 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">FB</a>
              <a href="#" className="text-gray-400 hover:text-white">TW</a>
              <a href="#" className="text-gray-400 hover:text-white">IN</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Suryoday Old Age Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
