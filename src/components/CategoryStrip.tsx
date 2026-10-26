interface Category {
  id: string;
  name: string;
  icon: string;
  badge?: string;
}

const categories: Category[] = [
  { id: "all", name: "All Deals", icon: "🔥", badge: "Hot" },
  { id: "electronics", name: "Electronics", icon: "💻", badge: "-40%" },
  { id: "clothing", name: "Fashion", icon: "👕", badge: "Trend" },
  { id: "home", name: "Home & Kitchen", icon: "🏠" },
  { id: "gadgets", name: "Gadgets & Audio", icon: "🎧", badge: "New" },
  { id: "footwear", name: "Footwear", icon: "👟" },
  { id: "beauty", name: "Beauty & Care", icon: "✨" },
  { id: "budget", name: "Under ₹999", icon: "🏷️", badge: "Budget" },
];

interface CategoryStripProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryStrip({
  selectedCategory,
  onSelectCategory,
}: CategoryStripProps) {
  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-6 font-poppins">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>Shop by Category</span>
        </h2>
        <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">
          View All Categories →
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === "all" && !selectedCategory);

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id === "all" ? "" : cat.name)}
              className={`flex-shrink-0 relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-200 text-xs sm:text-sm font-semibold shadow-sm ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
