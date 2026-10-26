import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { trackEvent } from "../utils/tracking";

export default function ContactPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent("Contact", { method: "contact_form", subject: "general_inquiry" }, undefined, {
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-gray-800 font-poppins flex flex-col">
      <header className="bg-[#1A222D] text-white py-4 px-4 sm:px-8 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <span className="text-sm font-bold tracking-tight">Contact & Support</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Get in Touch</h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Have questions about a verified deal, partnership opportunities, or technical feedback? Our team is here to assist.
              </p>
            </div>

            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-gray-800">Email Support</span>
                  <span>support@yearnit.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-gray-800">Support Hours</span>
                  <span>Monday – Saturday (9:00 AM – 7:00 PM IST)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-gray-800">Location</span>
                  <span>Chennai, Tamil Nadu, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <CheckCircleIcon className="w-14 h-14 text-emerald-500" />
                <h3 className="text-lg font-bold text-gray-900">Message Received!</h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Thank you for reaching out. A support representative will review your message and reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you today?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Yearnit (yearnit.in). All rights reserved.</p>
      </footer>
    </div>
  );
}
