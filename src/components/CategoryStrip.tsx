interface Category {
  id: string;
  name: string;
  icon: string;
  badge?: string;
}

const categories: Category[] = [
  { id: "all", name: "All Deals", icon: "🔥", badge: "Hot" },
  { id: "electronics", name: "Electronics", icon: "⚡", badge: "-40%" },
  { id: "audio", name: "Audio & Wearables", icon: "🎧", badge: "Popular" },
  { id: "mobiles", name: "Mobiles & Tech", icon: "📱", badge: "Trending" },
  { id: "computers", name: "Computers & Tech", icon: "💻" },
  { id: "home", name: "Home & Kitchen", icon: "🏠" },
  { id: "books", name: "Books & Mindset", icon: "📚" },
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
  const currentCategoryClean = (selectedCategory || "").trim().toLowerCase();

  const handleCategoryClick = (cat: Category) => {
    // If clicking "all" or clicking the currently active category, reset to all deals
    const isCurrentlyActive =
      cat.id === "all" ||
      currentCategoryClean === cat.name.toLowerCase() ||
      currentCategoryClean === cat.id.toLowerCase();

    if (isCurrentlyActive) {
      onSelectCategory("");
    } else {
      onSelectCategory(cat.name);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-4 sm:py-5 font-poppins">
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>Shop by Category</span>
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory("")}
            className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <span>Reset to All Deals</span>
            <span>✕</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none touch-scroll pr-4">
        {categories.map((cat) => {
          const isSelected =
            (cat.id === "all" &&
              (!selectedCategory ||
                currentCategoryClean === "all" ||
                currentCategoryClean === "all deals")) ||
            (Boolean(selectedCategory) &&
              (currentCategoryClean === cat.name.toLowerCase() ||
                currentCategoryClean === cat.id.toLowerCase()));

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 text-xs sm:text-sm font-semibold shadow-2xs active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-[#FF6B20] to-[#F15000] border-transparent text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20"
                  : "bg-white border-gray-200/90 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-sm sm:text-base">{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.name}</span>
              {cat.badge && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isSelected
                      ? "bg-white/25 text-white border border-white/30 backdrop-blur-xs"
                      : "bg-red-50 text-red-700 border border-red-200/70"
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
