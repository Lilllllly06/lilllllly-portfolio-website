import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex flex-grow items-center bg-[#f7fbfe] py-20">
        <div className="section-shell">
          <p className="section-kicker">404</p>
          <h1 className="text-4xl font-semibold text-navy sm:text-5xl">This page does not exist.</h1>
          <p className="mt-4 max-w-lg leading-7 text-slate-600">
            The link may have moved, or the address may be incomplete.
          </p>
          <Link to="/" className="subtle-link mt-7">
            <ArrowLeft className="h-4 w-4" />
            Return home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
