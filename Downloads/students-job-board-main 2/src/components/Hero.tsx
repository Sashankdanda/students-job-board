import { Users, Briefcase, Star } from "lucide-react";
import SmartSearch from "./SmartSearch";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-yellow-300">Student Job</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Discover opportunities that fit your schedule, build your skills, and boost your career
          </p>
          
          {/* Smart Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <SmartSearch />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">2,500+</div>
              <div className="text-white/80">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-white/80">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">10k+</div>
              <div className="text-white/80">Students Hired</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">4.8★</div>
              <div className="text-white/80">Student Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;