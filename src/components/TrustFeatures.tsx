import {
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export default function TrustFeatures() {
  const features = [
    {
      icon: <ShieldCheckIcon className="w-6 h-6 text-blue-600" />,
      title: "100% Verified Deals",
      desc: "Curated directly from verified top product listings.",
    },
    {
      icon: <TruckIcon className="w-6 h-6 text-amber-500" />,
      title: "Express Delivery Eligible",
      desc: "Enjoy free 1-day or 2-day delivery on eligible items.",
    },
    {
      icon: <TagIcon className="w-6 h-6 text-emerald-600" />,
      title: "Real Price Drops",
      desc: "Instant tracking of price drops, coupons, and lightning sales.",
    },
    {
      icon: <ArrowPathIcon className="w-6 h-6 text-purple-600" />,
      title: "Hassle-Free Returns",
      desc: "Standard 7-30 days replacement & refund handled directly by verified stores.",
    },
  ];

  return (
    <div className="w-full px-3 sm:px-6 lg:px-12 py-8 font-poppins">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition duration-200"
          >
            <div className="p-2.5 rounded-xl bg-gray-50 flex-shrink-0">
              {f.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">{f.title}</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
