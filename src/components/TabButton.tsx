interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge?: number;
}

export default function TabButton({ active, onClick, icon, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`tab-button ${active ? 'active' : 'inactive'}`}
    >
      <div className="flex items-center justify-center mb-1">
        <span className="text-lg">{icon}</span>
        {badge && badge > 0 && (
          <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </button>
  );
}
