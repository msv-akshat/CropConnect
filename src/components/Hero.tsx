import { Button } from "@/components/ui/button";
import Logo from "@/assets/crop-connect-logo.png";

const Hero = () => {
  return (
    <div className="bg-[#FFF8E7] pt-12 pb-4 text-center"> {/* reduced top and bottom padding */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <img
            src={Logo}
            alt="Crop Connect Logo"
            className="w-40 h-auto mb-2" // smaller space below logo
          />
          <h1 className="text-4xl md:text-5xl font-bold text-[#333] mb-1"> {/* reduced mb */}
            Welcome to Crop Connect
          </h1>
          <p className="text-lg md:text-xl text-[#5A5A5A] max-w-xl mx-auto mb-2"> {/* reduced mb */}
            Seamless communication between farmers, employees, and admins—designed for better agriculture.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
