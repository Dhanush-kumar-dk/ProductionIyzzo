interface Category {
  id: string;
  name: string;
  icon: string;
  badge?: string;
}

const categories: Category[] = [
  { id: "all", name: "Trending", icon: "🔥", badge: "Hot" },
  { id: "all-deals", name: "All", icon: "🛍️" },
  { id: "clothing", name: "Fashion", icon: "👗" },
  { id: "beauty", name: "Beauty", icon: "💄" },
  { id: "grocery", name: "Grocery", icon: "🛒" },
  { id: "electronics", name: "Electronics", icon: "💻" },
  { id: "laptop", name: "Laptop", icon: "🖥️" },
  { id: "mobile", name: "Mobile", icon: "📱" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "health", name: "Health", icon: "🏥" },
  { id: "appliances", name: "Appliances", icon: "🏠" },
];

interface CategoryStripProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryStrip({ selectedCategory, onSelectCategory }: CategoryStripProps) {
  const currentCategoryClean = (selectedCategory || "").trim().toLowerCase();

  const handleCategoryClick = (cat: Category) => {
    const isCurrentlyActive =
      cat.id === "all" ||
      currentCategoryClean === cat.name.toLowerCase() ||
      currentCategoryClean === cat.id.toLowerCase();
    if (isCurrentlyActive) onSelectCategory("");
    else onSelectCategory(cat.name);
  };

  return (
    <div className="w-full bg-white px-3 sm:px-6 lg:px-10 py-4 font-poppins border-b border-gray-100">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Top Cashback Stores</h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory("")}
            className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 transition"
          >
            View All ↗
          </button>
        )}
        {!selectedCategory && (
          <span className="text-xs text-orange-500 font-semibold cursor-pointer hover:text-orange-600 transition">View All ↗</span>
        )}
      </div>

      {/* Category Icons Row */}
      <div className="flex items-start gap-3 sm:gap-5 overflow-x-auto pb-1 scrollbar-none touch-scroll">
        {categories.map((cat) => {
          const isSelected =
            (cat.id === "all" && (!selectedCategory || currentCategoryClean === "all" || currentCategoryClean === "trending")) ||
            (Boolean(selectedCategory) && (currentCategoryClean === cat.name.toLowerCase() || currentCategoryClean === cat.id.toLowerCase()));

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
              type="button"
            >
              {/* Icon Circle */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm
                  ${isSelected
                    ? "bg-orange-500 shadow-orange-200 shadow-md scale-105"
                    : "bg-gray-50 group-hover:bg-orange-50 border border-gray-100 group-hover:border-orange-200"
                  }`}
              >
                <span className="text-2xl sm:text-3xl leading-none">{cat.icon}</span>

                {/* Badge */}
                {cat.badge && (
                  <span className={`absolute -top-1 -right-1 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full leading-none
                    ${isSelected ? "bg-white text-orange-500" : "bg-orange-500 text-white"}`}>
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs font-semibold leading-tight text-center max-w-[64px] transition
                  ${isSelected ? "text-orange-500" : "text-gray-600 group-hover:text-orange-500"}`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
