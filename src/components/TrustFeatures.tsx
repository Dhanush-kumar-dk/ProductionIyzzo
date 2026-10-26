import {
  ShieldCheckIcon,
  ShoppingBagIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function TrustFeatures() {
  const features = [
    {
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />,
      title: "Independent Research",
      desc: "Our editorial team evaluates real-world specifications, build quality, and honest user tradeoffs.",
    },
    {
      icon: <ShoppingBagIcon className="w-6 h-6 text-amber-500" />,
      title: "Direct Store Links",
      desc: "Every recommendation links directly to official Amazon product pages with complete tracking transparency.",
    },
    {
      icon: <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />,
      title: "Unbiased Pros & Cons",
      desc: "We present balanced strengths, limitations, and specific target audience recommendations for each item.",
    },
    {
      icon: <ArrowPathIcon className="w-6 h-6 text-purple-600" />,
      title: "Storefront Protection",
      desc: "Official retailers handle order fulfillment, fast shipping, and customer support directly.",
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
