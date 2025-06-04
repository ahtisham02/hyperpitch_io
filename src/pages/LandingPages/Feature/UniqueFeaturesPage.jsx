import React from "react";
import FeaturesPageHeader from "../../../ui-components/LandingPage/FeaturesPage/FeaturesPageHeader"; // Adjust path as needed
import FeatureSectionItem from "../../../ui-components/LandingPage/FeaturesPage/FeatureSectionItem"; // Adjust path as needed

import { 
    Edit3,
    LayoutGrid,
    Puzzle,
    Search,
    ShieldCheck,
    Zap,
    Server
} from "lucide-react";

import builderImage from "../../../assets/img/feature/buld.avif"
import themesImage from "../../../assets/img/feature/4739272.jpg"
import pluginsImage from "../../../assets/img/feature/11423715.jpg"
import seoImage from "../../../assets/img/feature/5287968.jpg"
import securityImage from "../../../assets/img/feature/6505028.jpg"
import performanceImage from "../../../assets/img/feature/performanceImage.avif"
import hostingImage from "../../../assets/img/feature/6477709.jpg"

const allFeaturesData = [
    {
        icon: <Edit3 size={36} className="text-gray-700" />,
        title: "Intuitive Drag & Drop Site Builder",
        description: "Visually craft your website with our powerful yet simple-to-use site builder. Drag elements, customize layouts, and see your changes in real-time without writing a single line of code. Building a professional website has never been more accessible.",
        details: [
            "No-code visual editing for all skill levels.",
            "Live preview across desktop, tablet, and mobile.",
            "Rich library of pre-designed sections and elements.",
            "Full control over spacing, typography, and colors.",
        ],
        image: builderImage,
        imageAlt: "HyperPitch intuitive site builder interface"
    },
    {
        icon: <LayoutGrid size={36} className="text-gray-700" />,
        title: "Extensive Theme Options & Customization",
        description: "Start your project with a stunning, professionally designed theme from our marketplace, or build from scratch. HyperPitch offers deep customization capabilities, allowing you to tailor every aspect of your site's appearance to perfectly match your brand identity.",
        details: [
            "Growing library of responsive, modern themes.",
            "One-click theme activation and switching.",
            "Advanced style editor for fonts, colors, and layouts.",
            "Option to import or develop custom themes (for advanced users).",
        ],
        image: themesImage,
        imageAlt: "Selection of HyperPitch website themes"
    },
    {
        icon: <Puzzle size={36} className="text-gray-700" />,
        title: "Powerful Plugin Architecture",
        description: "Unlock limitless possibilities by extending your website's functionality with our robust plugin system. Similar to WordPress, easily add features like e-commerce, advanced forms, SEO enhancements, social media integration, and much more through our curated plugin directory.",
        details: [
            "One-click install for a wide range of plugins.",
            "Developer-friendly for creating custom plugins.",
            "Secure and vetted plugin marketplace.",
            "Seamless integration with core platform features.",
        ],
        image: pluginsImage,
        imageAlt: "HyperPitch plugin ecosystem illustration"
    },
    {
        icon: <Search size={36} className="text-gray-700" />,
        title: "Comprehensive SEO Tools",
        description: "Get found by your audience with HyperPitch's built-in Search Engine Optimization tools. We provide everything you need to optimize your content, improve your search rankings, and drive organic traffic to your website, from meta tags to sitemaps.",
        details: [
            "Easy meta title and description editing.",
            "Automatic and customizable XML sitemaps.",
            "Clean, SEO-friendly URL structures.",
            "Schema markup support for rich snippets.",
            "Canonical URL management.",
        ],
        image: seoImage,
        imageAlt: "HyperPitch SEO tools and analytics dashboard"
    },
    {
        icon: <ShieldCheck size={36} className="text-gray-700" />,
        title: "Robust Security & Reliability",
        description: "Your website's security is our top priority. HyperPitch is built on a secure foundation with continuous monitoring and updates. We implement industry best practices to protect your data and ensure your site remains online and accessible to your visitors.",
        details: [
            "Automatic SSL certificates (HTTPS) for all sites.",
            "Regular security patching and platform updates.",
            "DDoS mitigation and web application firewall (WAF).",
            "Automated daily backups with easy restore options.",
            "User role permissions for secure access control.",
        ],
        image: securityImage,
        imageAlt: "Data security and protection concept for HyperPitch"
    },
    {
        icon: <Zap size={36} className="text-gray-700" />,
        title: "Blazing Fast Performance",
        description: "Deliver an exceptional user experience with lightning-fast loading times. HyperPitch is optimized for speed at every level, from server infrastructure to clean code output, ensuring your visitors stay engaged and your search rankings improve.",
        details: [
            "Optimized image delivery and next-gen format support.",
            "Advanced asset caching and minification.",
            "Global Content Delivery Network (CDN) integration.",
            "Server-side optimizations for rapid TTFB (Time to First Byte).",
            "Lazy loading for images and videos.",
        ],
        image: performanceImage,
        imageAlt: "Illustration of speed and performance for HyperPitch"
    },
    {
        icon: <Server size={36} className="text-gray-700" />,
        title: "Managed Hosting Details (Bundled)",
        description: "Focus on building your website, not managing servers. HyperPitch offers reliable, scalable, and secure managed hosting as part of our platform. Enjoy peace of mind with our expertly maintained infrastructure, designed for optimal performance and WordPress-like ease.",
        details: [
            "High-availability cloud infrastructure with auto-scaling.",
            "One-click staging environments for safe testing.",
            "Easy domain connection and DNS management.",
            "PHP version control and resource monitoring.",
            "SFTP access and database management tools.",
        ],
        image: hostingImage,
        imageAlt: "Cloud hosting infrastructure for HyperPitch"
    },
];


export default function UniqueFeaturesPage() {
  return (
    <div className="bg-white antialiased">
      <FeaturesPageHeader />
      <main className="divide-y divide-gray-200/70">
        {allFeaturesData.map((feature, index) => (
          <FeatureSectionItem
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            details={feature.details}
            image={feature.image}
            imageAlt={feature.imageAlt}
            reverseOrder={index % 2 !== 0}
          />
        ))}
      </main>
    </div>
  );
}