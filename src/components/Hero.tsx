
const Hero = () => {
  return (
    <div className="bg-gradient-to-b from-[#7C9070] to-[#8B7355] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to CropConnect</h1>
          <p className="text-lg md:text-xl mb-8">
            Streamline your agricultural workflow with direct updates between farmers and verifying officers
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="bg-white/20 rounded-full px-4 py-2">Real-time Updates</div>
            <div className="bg-white/20 rounded-full px-4 py-2">Simple Verification</div>
            <div className="bg-white/20 rounded-full px-4 py-2">Efficient Management</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
