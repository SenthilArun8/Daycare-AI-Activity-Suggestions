// the default titles can be overridden by passing props to the Hero component
import { Link } from 'react-router-dom';

const Hero = ({
  title = 'Become a React Dev', // Default title
  subtitle = 'Find the React job that fits your skill set', // Default subtitle
}) => {
  return (
      // <!-- Hero Section -->
  <section className="bg-emerald-600 min-h-screen flex flex-col justify-center items-center px-6 text-center">
    <h1 className="text-white text-5xl md:text-6xl font-extrabold mb-6 max-w-4xl leading-tight drop-shadow-lg">
      {title}
    </h1>
    <p className="text-indigo-200 text-lg md:text-xl max-w-xl mb-10 drop-shadow-sm">
      {subtitle}
    </p>
    <Link to="/add-student" className="inline-block bg-white text-indigo-700 font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-indigo-50 transition">
      Get Started
    </Link>
  </section>
  );
};
export default Hero;