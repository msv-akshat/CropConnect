
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, UserCheck, Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleCard from '@/components/RoleCard';
import Hero from '@/components/Hero';

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Farmer',
      description: 'Upload and manage your crop details',
      icon: Home,
      color: 'bg-[#7C9070]'
    },
    {
      title: 'Employee',
      description: 'Verify and process farmer submissions',
      icon: UserCheck,
      color: 'bg-[#8B7355]'
    },
    {
      title: 'Admin',
      description: 'Manage system settings and users',
      icon: Shield,
      color: 'bg-[#FFB000]'
    }
  ];

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <Button onClick={() => navigate('/login')} className="flex items-center gap-2">
            <LogIn size={18} />
            Login / Register
          </Button>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Learn About Our Roles</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role) => (
            <RoleCard
              key={role.title}
              {...role}
              onSelect={() => handleRoleSelect(role.title)}
              isSelected={selectedRole === role.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
