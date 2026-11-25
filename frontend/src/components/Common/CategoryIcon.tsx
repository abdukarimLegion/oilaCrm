import React from 'react';
import {
  Briefcase,
  Store,
  Laptop,
  Home,
  PlusCircle,
  ShoppingCart,
  Zap,
  Car,
  GraduationCap,
  HeartPulse,
  Shirt,
  Utensils,
  Smartphone,
  MoreHorizontal,
  Compass,
  ShieldCheck,
  CreditCard,
  Banknote,
  PiggyBank,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', style }) => {
  switch (name) {
    case 'Briefcase':
      return <Briefcase className={className} style={style} />;
    case 'Store':
      return <Store className={className} style={style} />;
    case 'Laptop':
      return <Laptop className={className} style={style} />;
    case 'Home':
      return <Home className={className} style={style} />;
    case 'PlusCircle':
      return <PlusCircle className={className} style={style} />;
    case 'ShoppingCart':
      return <ShoppingCart className={className} style={style} />;
    case 'Zap':
      return <Zap className={className} style={style} />;
    case 'Car':
      return <Car className={className} style={style} />;
    case 'GraduationCap':
      return <GraduationCap className={className} style={style} />;
    case 'HeartPulse':
      return <HeartPulse className={className} style={style} />;
    case 'Shirt':
      return <Shirt className={className} style={style} />;
    case 'Utensils':
      return <Utensils className={className} style={style} />;
    case 'Smartphone':
      return <Smartphone className={className} style={style} />;
    case 'Compass':
      return <Compass className={className} style={style} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} style={style} />;
    case 'CreditCard':
      return <CreditCard className={className} style={style} />;
    case 'Banknote':
      return <Banknote className={className} style={style} />;
    case 'PiggyBank':
      return <PiggyBank className={className} style={style} />;
    default:
      return <MoreHorizontal className={className} style={style} />;
  }
};
