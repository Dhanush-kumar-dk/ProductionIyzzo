interface Category {
  id: string;
  name: string;
  imgUrl: string;
  badge?: string;
  badgeColor?: string;
}

const categories: Category[] = [
  {
    id: "all",
    name: "All Deals",
    imgUrl: "https://img.icons8.com/fluency/48/fire-element.png",
    badge: "HOT",
    badgeColor: "bg-red-500 text-white",
  },
  {
    id: "electronics",
    name: "Electronics",
    imgUrl: "https://img.icons8.com/fluency/48/laptop.png",
    badge: "-40%",
    badgeColor: "bg-blue-500 text-white",
  },
  {
    id: "clothing",
    name: "Fashion",
    imgUrl: "https://img.icons8.com/fluency/48/shopping-bag.png",
    badge: "TREND",
    badgeColor: "bg-pink-500 text-white",
  },
  {
    id: "home",
    name: "Home & Kitchen",
    imgUrl: "https://img.icons8.com/fluency/48/home.png",
  },
  {
    id: "gadgets",
    name: "Gadgets & Audio",
    imgUrl: "https://img.icons8.com/fluency/48/headphones.png",
    badge: "NEW",
    badgeColor: "bg-purple-500 text-white",
  },
  {
    id: "footwear",
    name: "Footwear",
    imgUrl: "https://img.icons8.com/fluency/48/sneaker.png",
  },
  {
    id: "beauty",
    name: "Beauty & Care",
    imgUrl: "https://img.icons8.com/fluency/48/lipstick.png",
  },
  {
    id: "budget",
    name: "Under ₹999",
    imgUrl: "https://img.icons8.com/fluency/48/price-tag.png",
    badge: "BUDGET",
    badgeColor: "bg-orange-500 text-white",
  },
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
    <div className="w-full bg-white px-3 sm:px-6 lg:px-10 py-3 font-poppins border-b border-gray-100">
      {/* Scrollable row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-scroll">
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
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all duration-200 flex-shrink-0 group
                ${
                  isSelected
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                }`}
            >
              {/* Category image icon */}
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 transition-all
                  ${isSelected ? "bg-white/20" : "bg-gray-50"}`}
              >
                <img
                  src={cat.imgUrl}
                  alt={cat.name}
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to a neutral placeholder on error
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Label */}
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap leading-none">
                {cat.name}
              </span>

              {/* Badge */}
              {cat.badge && (
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md leading-none tracking-wide flex-shrink-0
                    ${
                      isSelected
                        ? "bg-white/25 text-white border border-white/30"
                        : cat.badgeColor ?? "bg-gray-100 text-gray-600"
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
