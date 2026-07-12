interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  icon?: string;
  icons?: string[];
  iconSize?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, price, icon, icons, iconSize = 10 }) => {

  const iconClassName = `w-${iconSize - 2} h-${iconSize - 2} sm:w-${iconSize} sm:h-${iconSize} text-yellow-500 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`
  return (
    <div className="bg-black border border-gray-800 p-4 sm:p-6 md:p-8 hover:border-yellow-500 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <img
              src={icon}
              alt={title}
              className={iconClassName}
              style={{ filter: 'brightness(0) saturate(100%) invert(81%) sepia(71%) saturate(1423%) hue-rotate(2deg)' }}
            />
          )}
          {icons && icons.length > 0 && (
            <div className="flex gap-2">
              {icons.map((svg, idx) => (
                <img
                  key={idx}
                  src={svg}
                  alt={`${title} icon ${idx + 1}`}
                  className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                  style={{ filter: 'brightness(0) saturate(100%) invert(81%) sepia(71%) saturate(1423%) hue-rotate(2deg)' }}
                />
              ))}
            </div>
          )}
        </div>
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-yellow-500 flex-shrink-0">{price}</span>
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">{title}</h3>
      <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default ServiceCard;
