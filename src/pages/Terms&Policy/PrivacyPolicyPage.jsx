// PrivacyPolicyPage.js
import React from 'react';
import * as LucideIcons from 'lucide-react';

const SectionContent = ({ children }) => (
  <div className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-a:text-[#2e8b57] prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-slate-700 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
    {children}
  </div>
);

const TimelineSectionWrapper = ({ children, icon, isLast = false }) => {
  const IconComponent = icon || LucideIcons.ChevronRightCircle; 
  return (
    <div className="relative pl-10 pt-4"> 
      <div className="absolute left-0 flex flex-col items-center h-[calc(100%_+_13px)]">
        <div className="w-9 h-9 rounded-full bg-green-100 border-2 border-white shadow-lg flex items-center justify-center z-10 text-[#2e8b57]"> {/* Slightly bigger background */}
          <IconComponent size={22} strokeWidth={2.5} />
        </div>
        {!isLast && <div className="w-[1.5px] flex-grow bg-slate-300 mt-1.5"></div>}
      </div>
      <div className="ml-5"> 
        {children}
      </div>
    </div>
  );
};


export default function PrivacyPolicyPage() {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sectionsData = [
    { 
      id: 1, title: "1. Information Collection and Use", icon: LucideIcons.DatabaseZap,
      content: (
        <SectionContent>
          <p>We collect several different types of information for various purposes to <strong>provide and improve</strong> our Service to you.</p>
          <h3>Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using our Service, we may ask you to provide us with certain <strong>personally identifiable information</strong> that can be used to contact or identify you ("<strong>Personal Data</strong>"). Personally identifiable information may include, but is not limited to: <strong>Email address</strong>, <strong>First name and last name</strong>, Phone number, Address, State, Province, ZIP/Postal code, City, Cookies and <strong>Usage Data</strong>.</p>
          <h4>Usage Data</h4>
          <p>We may also collect information on how the Service is accessed and used ("<strong>Usage Data</strong>"). This Usage Data may include information such as your computer's <strong>Internet Protocol address</strong> (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 2, title: "2. Use of Data", icon: LucideIcons.Settings2,
      content: (
        <SectionContent>
          <p><strong>Hyperpitch Inc.</strong> uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our <strong>Service</strong></li>
            <li>To notify you about <strong>changes</strong> to our Service</li>
            <li>To allow you to participate in <strong>interactive features</strong> of our Service when you choose to do so</li>
            <li>To provide <strong>customer support</strong></li>
            <li>To gather analysis or valuable information so that we can <strong>improve</strong> our Service</li>
            <li>To monitor the <strong>usage</strong> of our Service</li>
            <li>To detect, prevent and address <strong>technical issues</strong></li>
          </ul>
        </SectionContent>
      ) 
    },
    { 
      id: 3, title: "3. Disclosure Of Data", icon: LucideIcons.Share2,
      content: (
         <SectionContent>
          <h3>Legal Requirements</h3>
          <p><strong>Hyperpitch Inc.</strong> may disclose your <strong>Personal Data</strong> in the good faith belief that such action is necessary to: To comply with a <strong>legal obligation</strong>, To protect and defend the <strong>rights or property</strong> of Hyperpitch Inc., To prevent or investigate possible <strong>wrongdoing</strong> in connection with the Service, To protect the <strong>personal safety</strong> of users of the Service or the public, To protect against <strong>legal liability</strong>.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 4, title: "4. Security Of Data", icon: LucideIcons.LockKeyhole,
      content: (
        <SectionContent>
          <p>The <strong>security of your data</strong> is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is <strong>100% secure</strong>. While we strive to use commercially acceptable means to protect your <strong>Personal Data</strong>, we cannot guarantee its <strong>absolute security</strong>.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 5, title: "5. Service Providers", icon: LucideIcons.UsersRound,
      content: (
        <SectionContent>
          <p>We may employ <strong>third party companies</strong> and individuals to facilitate our Service ("<strong>Service Providers</strong>"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your <strong>Personal Data</strong> only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 6, title: "6. Children's Privacy", icon: LucideIcons.Baby,
      content: (
        <SectionContent>
          <p>Our Service does not address anyone under the age of <strong>13</strong> ("<strong>Children</strong>"). We do not knowingly collect <strong>personally identifiable information</strong> from anyone under the age of 13. If you are a parent or guardian and you are aware that your Children has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from children without verification of <strong>parental consent</strong>, we take steps to remove that information from our servers.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 7, title: "7. Changes To This Privacy Policy", icon: LucideIcons.History,
      content: (
        <SectionContent>
          <p>We may <strong>update</strong> our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via <strong>email</strong> and/or a prominent notice on our Service, prior to the change becoming effective and update the "<strong>effective date</strong>" at the top of this Privacy Policy.</p>
          <p>You are advised to review this Privacy Policy <strong>periodically</strong> for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        </SectionContent>
      ) 
    },
    { 
      id: 8, title: "8. Contact Us", icon: LucideIcons.MailQuestion,
      content: (
        <SectionContent>
          <p>If you have any questions about this <strong>Privacy Policy</strong>, please contact us:</p>
          <p>By email: <a href="mailto:privacy@hyperpitch.io">privacy@hyperpitch.io</a></p>
        </SectionContent>
      ) 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="py-10 md:py-12">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-green-100/80 rounded-xl mb-4">
            <LucideIcons.ShieldCheck size={32} className="text-[#2e8b57]" strokeWidth={2}/>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Last Updated: {today}
          </p>
        </div>
      </header>

      <main className="pb-10 container mx-auto px-5">
        <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-lg border border-slate-200/60">
          
          <p className="text-sm text-slate-600 mb-6">
            <strong>Hyperpitch Inc.</strong> ("us", "we", or "our") operates the <strong>Hyperpitch.io</strong> website and the Hyperpitch.io mobile application (hereinafter referred to as the "<strong>Service</strong>"). This page informs you of our policies regarding the collection, use, and disclosure of <strong>personal data</strong> when you use our Service and the choices you have associated with that data. We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          <div className="space-y-4">
            {sectionsData.map((section, index) => (
              <TimelineSectionWrapper 
                key={section.id} 
                icon={section.icon}
                isLast={index === sectionsData.length - 1}
              >
                <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-2">{section.title}</h2>
                {section.content}
              </TimelineSectionWrapper>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}