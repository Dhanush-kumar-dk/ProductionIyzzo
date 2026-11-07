export default function TrustFeatures() {
  const features = [
    {
      icon: "📋",
      title: "Independent Research",
      desc: "Our editorial team evaluates real-world specs, build quality, and honest user tradeoffs.",
    },
    {
      icon: "🛍️",
      title: "Direct Store Links",
      desc: "Every recommendation links directly to official Amazon product pages with full tracking transparency.",
    },
    {
      icon: "✅",
      title: "Unbiased Pros & Cons",
      desc: "We present balanced strengths, limitations, and specific audience recommendations for each item.",
    },
    {
      icon: "🔒",
      title: "Storefront Protection",
      desc: "Official retailers handle order fulfillment, fast shipping, and customer support directly.",
    },
  ];

  return (
    <div className="w-full bg-white px-3 sm:px-6 lg:px-10 py-8 font-poppins">
      <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider mb-5 text-center">Why Choose Yearnit</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center gap-3 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50/40 transition duration-200 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-2xl">
              {f.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{f.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
