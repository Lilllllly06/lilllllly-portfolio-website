
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-gray-100">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Yuezhen (Lily) Dong
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Engineering Portfolio
          </p>
          <p className="text-gray-600 mb-8">
            BSc in Electrical Engineering with expertise in research, data analysis, 
            and experimental design. Focused on electromagnetics, fluid dynamics, 
            and photovoltaic systems.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-navy hover:bg-navy-dark">
              <Link to="/projects">
                View Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Me</Link>
            </Button>
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img 
              src="/placeholder.svg"
              alt="Yuezhen (Lily) Dong"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
