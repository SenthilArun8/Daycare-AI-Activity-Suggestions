import { Link } from 'react-router-dom';
import UnderConstructionPage from '../Pages/UnderConstructionPage';

const Footer = () => {
  const business = {
    name: 'ClassWeave',
    email: 'senthilarun08@gmail.com',
    // Google Maps Embed URL - IMPORTANT: Steps
    // To get this:
    // 1. Go to Google Maps (maps.google.com)
    // 2. Search for your business location.
    // 3. Click "Share" -> "Embed a map" -> "COPY HTML".
    // 4. Copy the `src` attribute value from the `<iframe>` tag you get.
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.117195439589!2d77.73041492576137!3d11.34999518884976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba96f4e3a7c4907%3A0xa832bdd570043c18!2sPari%20Complex!5e0!3m2!1sen!2sca!4v1717757049449!5m2!1sen!2sca"
  };

  return (
    <footer className="bg-[#162114] text-[#FFEDD2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Business Details */}
        <div className="col-span-1">
          <h3 className="text-xl font-bold mb-4 text-[#FFEDD2]">Contact Us</h3>
          <p className="mb-2">{business.name}</p>
          {/* <p className="mb-2">{business.address}</p> */}
          {/* <p className="mb-2">Phone: <a href={`tel:${business.phone}`} className="hover:text-[#FFBBA6]">{business.phone}</a></p> */}
          <p className="mb-2">Email: <a href={`mailto:${business.email}`} className="hover:text-[#FFBBA6]">{business.email}</a></p>
        </div>

        {/* Quick Links (Optional - adjust as needed) */}
        <div className="col-span-1">
          <h3 className="text-xl font-bold mb-4 text-[#FFEDD2]">Quick Links</h3>
          <ul>
            <li className="mb-2">
              <Link to="/" className="hover:text-[#FFBBA6]">Home</Link>
            </li>
            <li className="mb-2">
              <Link to="/under-construction" className="hover:text-[#FFBBA6]">About Us</Link>
            </li>
            {/* <li className="mb-2">
              <Link to="/services" className="hover:text-[#FFBBA6]">Services</Link>
            </li> */}
            <li className="mb-2">
              <Link to="/under-construction" className="hover:text-[#FFBBA6]">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Replaced Google Maps Embed with an "About Us" blurb */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <h3 className="text-xl font-bold mb-4 text-[#FFEDD2]">About ClassWeave</h3>
          <p className="text-sm">
            ClassWeave is dedicated to providing innovative and engaging learning experiences.
            Giving a leg up for educators and easing their process to provide for students.
            Our platform offers a seamless and interactive environment for both educators and parents.
          </p>
        </div>

      </div>
      <div className="mt-10 pt-6 border-t border-[#294122] text-center text-sm text-[#FFEDD2] opacity-75">
        © {new Date().getFullYear()} {business.name}. All rights reserved. Developed by Senthil Kirthieswar
      </div>
    </footer>
  );
};

export default Footer;