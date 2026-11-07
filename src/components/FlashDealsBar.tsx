export default function FlashDealsBar() {
  const features = [
    { icon: "🔗", text: "Shop, Share & Earn" },
    { icon: "📊", text: "Track Cashback Live" },
    { icon: "🏷️", text: "Cashback on eligible purchases" },
    { icon: "👥", text: "Earn when friends buy through your links" },
    { icon: "₹", text: "Get Real Cashback" },
    { icon: "✅", text: "Track every order live" },
    { icon: "+", text: "Daily bonus cash" },
    { icon: "🎁", text: "Refer & Earn Rewards" },
  ];

  return (
    <div className="w-full bg-white border-y border-gray-100 py-2.5 font-poppins overflow-hidden">
      <div className="relative flex overflow-x-hidden">
        {/* Duplicate the list for seamless looping */}
        <div className="flex gap-0 animate-marquee whitespace-nowrap">
          {[...features, ...features].map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-5 text-sm font-medium text-gray-700 flex-shrink-0"
            >
              <span className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
                {item.icon}
              </span>
              <span>{item.text}</span>
              {idx < [...features, ...features].length - 1 && (
                <span className="ml-5 text-gray-200 font-normal">|</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
