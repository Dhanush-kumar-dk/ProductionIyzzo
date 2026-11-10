import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { updateSEO } from "../utils/seo";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    updateSEO({
      title: "Privacy Policy | Yearnit",
      description:
        "This Privacy Policy describes Yearnit's policies and procedures on the collection, use and disclosure of your information when you use the Service (yearnit.in).",
      url: "https://yearnit.in/privacy-policy",
      type: "website",
      keywords: [
        "Yearnit Privacy Policy",
        "Privacy Policy yearnit.in",
        "Data Protection",
        "Cookies Policy",
        "TermsFeed Privacy Policy",
        "Tamil Nadu India",
      ],
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-poppins flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Sticky Top Bar */}
      <header className="bg-[#0F172A] text-white py-3.5 px-4 sm:px-8 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-amber-400 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-200">
              Yearnit Legal Compliance
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-200/80 space-y-8">
          
          {/* Header Section */}
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-bold tracking-widest uppercase mb-3">
              <DocumentTextIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>OFFICIAL LEGAL NOTICE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Last updated: <strong>November 10, 2026</strong> • Effective for{" "}
              <a
                href="https://yearnit.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:underline font-semibold"
              >
                yearnit.in
              </a>
            </p>
          </div>

          {/* Introduction */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60">
            <p>
              This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
            </p>
            <p>
              We use Your Personal Data to provide and improve the Service. We collect, use, and disclose Your information as described in this Privacy Policy and, where required by applicable law, only where We have a valid legal basis to do so, including Your consent (where consent is required). This Privacy Policy has been created with the help of the{" "}
              <a
                href="https://www.termsfeed.com/privacy-policy-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 font-semibold underline hover:text-amber-700"
              >
                Privacy Policy Generator
              </a>
              .
            </p>
          </div>

          {/* Section 1: Interpretation and Definitions */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Interpretation and Definitions
            </h2>
            
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Interpretation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Definitions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                For the purposes of this Privacy Policy:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Account</strong> means a unique account created for You to access Our Service or parts of Our Service.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Privacy Policy) refers to <strong>yearnit.in</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website, among its many uses.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Country/State</strong> refers to: <strong>Tamil Nadu, India</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Device</strong> means any device that can access the Service, such as a computer, a cell phone or a digital tablet.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Personal Data</strong> (or "Personal Information") is any information that relates to an identified or identifiable individual. We use "Personal Data" and "Personal Information" interchangeably unless a law uses a specific term.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Service</strong> refers to the Website.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>User</strong> means any individual who accesses or uses the Service.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Website</strong> refers to yearnit.in, accessible from{" "}
                    <a
                      href="http://yearnit.in/"
                      rel="external nofollow noopener noreferrer"
                      target="_blank"
                      className="text-amber-600 underline font-semibold"
                    >
                      http://yearnit.in/
                    </a>
                    .
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Collecting and Using Your Personal Information */}
          <section className="space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Collecting and Using Your Personal Information
            </h2>

            {/* Types of Data Collected */}
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Types of Data Collected
              </h3>

              {/* Personal Data */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Personal Data
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-2">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                </ul>
              </div>

              {/* Usage Data */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Usage Data
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Usage Data is collected automatically when using the Service.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of Our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device's unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We may also collect information that Your browser sends whenever You visit Our Service or when You access the Service by or through a mobile device.
                </p>
              </div>

              {/* Tracking Technologies and Cookies */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Tracking Technologies and Cookies
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We use tracking technologies (such as cookies) to track the activity and to improve Our Service. The technologies We use may include:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-2 pl-2">
                  <li>
                    <strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of Our Service.
                  </li>
                  <li>
                    <strong>Web Beacons.</strong> Certain sections of Our Service may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).
                  </li>
                </ul>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where required by law, We use non-essential cookies (that is, Cookies other than the Necessary / Essential Cookies described below) only with Your consent. You can withdraw or change Your consent at any time using Our cookie preferences tool (if available) or through Your browser/device settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.
                </p>

                <p className="text-xs sm:text-sm text-slate-600 font-semibold pt-1">
                  We use both Session and Persistent Cookies for the purposes set out below:
                </p>

                <div className="space-y-3 pt-1">
                  {/* Cookie 1 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm space-y-1.5">
                    <p className="font-bold text-slate-900">
                      Necessary / Essential Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Type:</strong> Session Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Administered by:</strong> Us
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Purpose:</strong> These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.
                    </p>
                  </div>

                  {/* Cookie 2 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm space-y-1.5">
                    <p className="font-bold text-slate-900">
                      Cookies Policy / Notice Acceptance Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Type:</strong> Persistent Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Administered by:</strong> Us
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Purpose:</strong> These Cookies identify whether users have accepted the use of cookies on the Website and record the consent choices You have made, so that We can honor those choices on future visits.
                    </p>
                  </div>

                  {/* Cookie 3 */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs sm:text-sm space-y-1.5">
                    <p className="font-bold text-slate-900">
                      Functionality Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Type:</strong> Persistent Cookies
                    </p>
                    <p className="text-slate-600">
                      <strong>Administered by:</strong> Us
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Purpose:</strong> These Cookies allow Us to remember choices You make when You use the Website, such as remembering Your Account login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter Your preferences every time You use the Website.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Use of Your Personal Data */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Use of Your Personal Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                The Company may use Personal Data for the following purposes:
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>To provide and maintain Our Service</strong>, including to monitor the usage of Our Service.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>To provide You</strong> with news, special offers, and general information about other goods, services and events which We offer that are similar to those that You have already purchased or inquired about. We send such marketing communications only where permitted by applicable law: where prior consent is required (for example, under the laws applicable in the EEA and the UK), We will send them only with Your consent; otherwise, We may send them until You opt out. You may opt out or withdraw Your consent at any time by using the unsubscribe link in any marketing email We send or by contacting Us.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>To manage Your requests:</strong> To attend and manage Your requests to Us.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>For business transfers:</strong> We may use Your Personal Data to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about Our Service users is among the assets transferred.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of Our promotional campaigns, and evaluating and improving Our Service, products, services, marketing and Your experience.
                  </div>
                </li>
              </ul>

              <p className="text-xs sm:text-sm text-slate-600 font-semibold pt-3">
                We may share Your Personal Data in the following situations:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2 leading-relaxed">
                <li>
                  <strong>With Service Providers:</strong> We may share Your Personal Data with Service Providers to monitor and analyze the use of Our Service, and to contact You.
                </li>
                <li>
                  <strong>For business transfers:</strong> We may share or transfer Your Personal Data in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.
                </li>
                <li>
                  <strong>With Affiliates:</strong> We may share Your Personal Data with Our affiliates, in which case We will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.
                </li>
                <li>
                  <strong>With other users:</strong> If Our Service offers public areas, when You share Personal Data or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside the Service.
                </li>
                <li>
                  <strong>With Your consent</strong>: We may disclose Your Personal Data for any other purpose with Your consent.
                </li>
              </ul>
            </div>

            {/* Text Messages Privacy Notice */}
            <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <h4 className="text-sm font-bold text-amber-950">
                  Text Messages Privacy Notice
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                You have the option to receive text (SMS) messages from Us. If You opt in to text messages, We will send You updates, notifications, and other communications as described below. When You opt in, We will collect and store the information You provide in connection with text messaging, such as Your phone number, the date and method of Your consent, and message delivery and read information.
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                No mobile information will be shared with or sold to third parties or affiliates for marketing or promotional purposes. The phone numbers and consent records We collect for texting are never shared with anyone for any purpose, except the Service Providers that technically have to handle them to deliver the texts.
              </p>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Consent to receive text messages is not a condition of any purchase or use of Our Service. If You consent to receive SMS from Us, You agree to receive text messages from Us related to:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1 pl-2">
                <li>Customer care and support</li>
                <li>Account notifications, such as activity, status, or renewal reminders</li>
                <li>Delivery notifications and updates on the status of a delivery</li>
                <li>Authentication messages, such as one-time passwords (OTP) and passcodes</li>
                <li>Security alerts, such as suspicious login attempts or unusual account activity</li>
                <li>Marketing and promotional offers, discounts, and other promotional content</li>
              </ul>
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                <strong>Opt-Out & Support:</strong> Reply <strong>STOP</strong> to opt-out. Reply <strong>HELP</strong> for support. Message & data rates may apply. Messaging frequency may vary. Carriers are not liable for delayed or undelivered messages.
              </div>
            </div>

            {/* Retention of Your Personal Data */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Retention of Your Personal Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with Our legal obligations (for example, if We are required to retain Your data to comply with applicable laws), resolve disputes, and enforce Our legal agreements and policies.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Where possible, We apply shorter retention periods and/or reduce identifiability by deleting, aggregating, or anonymizing data. Unless otherwise stated, the retention periods below are maximum periods ("up to") and We may delete or anonymize data sooner when it is no longer needed for the relevant purpose. We apply different retention periods to different categories of Personal Data based on the purpose of processing and legal obligations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Account Information</p>
                  <p className="text-slate-600 leading-relaxed">
                    User Accounts: retained for the duration of Your Account relationship plus <strong>up to 24 months</strong> after account closure to handle any post-termination issues or resolve disputes.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Customer Support Data</p>
                  <p className="text-slate-600 leading-relaxed">
                    Support tickets and correspondence: <strong>up to 24 months</strong> from closure. Chat transcripts: <strong>up to 24 months</strong> for quality assurance and training.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">Usage Data</p>
                  <p className="text-slate-600 leading-relaxed">
                    Website analytics (cookies, IPs, device IDs): <strong>up to 24 months</strong>. Server logs: <strong>up to 24 months</strong> for security monitoring and troubleshooting.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                Usage Data is retained in accordance with the retention periods described above, and may be retained longer only where necessary for security, fraud prevention, or legal compliance.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We may retain Personal Data beyond the periods stated above for different reasons:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-2">
                <li><strong>Legal obligation:</strong> We are required by law to retain specific data (e.g., financial records for tax authorities).</li>
                <li><strong>Legal claims:</strong> Data is necessary to establish, exercise, or defend legal claims.</li>
                <li><strong>Your explicit request:</strong> You ask Us to retain specific information.</li>
                <li><strong>Technical limitations:</strong> Data exists in backup systems that are scheduled for routine deletion.</li>
              </ul>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You may request information about how long We will retain Your Personal Data by contacting Us.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When retention periods expire, We securely delete or anonymize Personal Data according to the following procedures:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-2">
                <li><strong>Deletion:</strong> Personal Data is removed from Our systems and no longer actively processed.</li>
                <li><strong>Backup retention:</strong> Residual copies may remain in encrypted backups for a limited period consistent with Our backup retention schedule and are not restored except where necessary for security, disaster recovery, or legal compliance.</li>
                <li><strong>Anonymization:</strong> In some cases, We convert Personal Data into anonymous statistical data that cannot be linked back to You. This anonymized data may be retained indefinitely for research and analytics.</li>
              </ul>
            </div>

            {/* Transfer of Your Personal Data */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Transfer of Your Personal Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. This means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of Your jurisdiction.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Where required by applicable law, We will ensure that international transfers of Your Personal Data are subject to appropriate safeguards and, where relevant, supplementary measures. The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place, including the security of Your data and other personal information.
              </p>
            </div>

            {/* Delete Your Personal Data */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Delete Your Personal Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our Service may give You the ability to delete certain information about You from within the Service.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You may update, amend, or delete Your information at any time by signing in to Your Account, if You have one, and visiting the account settings section that allows You to manage Your personal information. You may also contact Us to request access to, correct, or delete any Personal Data that You have provided to Us.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Please note, however, that We may need to retain certain information when We have a legal obligation or lawful basis to do so.
              </p>
            </div>

            {/* Disclosure of Your Personal Data */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Disclosure of Your Personal Data
              </h3>

              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Business Transactions
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Law Enforcement
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Under certain circumstances, the Company may disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-xs sm:text-sm font-bold text-slate-700">
                  Other Legal Requirements
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The Company may disclose Your Personal Data in the good-faith belief that such action is necessary to:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-2">
                  <li>Comply with a legal obligation</li>
                  <li>Protect and defend the rights or property of the Company</li>
                  <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                  <li>Protect the personal safety of Users of the Service or the public</li>
                  <li>Protect against legal liability</li>
                </ul>
              </div>
            </div>

            {/* Security of Your Personal Data */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                Security of Your Personal Data
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While We strive to use commercially reasonable means to protect Your Personal Data, We cannot guarantee its absolute security.
              </p>
            </div>
          </section>

          {/* Section 3: Children's and Minors' Privacy */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Children's and Minors' Privacy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The Service is not directed to, and We do not knowingly collect Personal Information from, anyone under the age of 16.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If You are a parent or guardian and You believe Your child has provided Us with Personal Information, please contact Us. If We become aware that We have collected Personal Information from anyone under the age of 16, We will take steps to remove that information from Our servers as soon as reasonably possible.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Some countries and states set a higher age at which an individual can consent to the processing of their own Personal Information. Where We rely on consent as a legal basis and the law applicable to a User sets an age higher than 16, We may require the consent of that User's parent or guardian before We collect and use their Personal Information.
            </p>
          </section>

          {/* Section 4: Links to Other Websites */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Links to Other Websites
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our Service may contain links to other websites that are not operated by Us. If You click on a third-party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services.
            </p>
            
            {/* Amazon Associates Transparent Notice */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-amber-600" />
                <span>Affiliate Link Disclosure (Amazon Associates Program)</span>
              </p>
              <p className="text-slate-700 leading-relaxed">
                As part of our independent review service, Yearnit participates in the Amazon Associates Program. Outbound product links may place tracking cookies via Amazon to verify qualifying referral purchases. These cookies do not store personal banking or credit card details on our platform.
              </p>
            </div>
          </section>

          {/* Section 5: Changes to this Privacy Policy */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Changes to this Privacy Policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Section 6: Contact Us */}
          <section className="space-y-4 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
              Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If You have any questions about this Privacy Policy, You can contact Us:
            </p>
            
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1A222D] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Yearnit Privacy & Compliance
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Jurisdiction: Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">By email:</span>
                  <a
                    href="mailto:dhanushkumark62@gmail.com"
                    className="text-amber-400 font-semibold underline hover:text-amber-300"
                  >
                    dhanushkumark62@gmail.com
                  </a>
                </div>
                <div className="text-slate-400">
                  Website:{" "}
                  <a
                    href="https://yearnit.in"
                    className="text-slate-200 underline hover:text-white"
                  >
                    https://yearnit.in
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Yearnit (yearnit.in). All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="/terms" className="hover:text-slate-900 hover:underline">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/about" className="hover:text-slate-900 hover:underline">
              About Yearnit
            </a>
            <span>•</span>
            <a href="/contact" className="hover:text-slate-900 hover:underline">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
