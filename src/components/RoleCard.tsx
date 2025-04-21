
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onSelect: () => void;
  isSelected: boolean;
}

const RoleCard = ({ title, description, icon: Icon, color, onSelect, isSelected }: RoleCardProps) => {
  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
        isSelected ? 'ring-2 ring-[#FFB000] shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};

export default RoleCard;
