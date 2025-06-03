import React from "react";
import * as LucideIcons from "lucide-react";

const Section = ({ title, children, icon }) => {
  const IconComponent = icon || LucideIcons.FileText;
  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center mb-3 md:mb-4">
        <div className="p-2 bg-green-100/70 rounded-full mr-3">
          <IconComponent
            size={20}
            className="text-[#2e8b57]"
            strokeWidth={2.5}
          />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
          {title}
        </h2>
      </div>
      <div className="prose prose-sm sm:prose-base prose-slate max-w-none prose-headings:font-semibold prose-headings:text-slate-800 prose-a:text-[#2e8b57] prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-strong:text-slate-700 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1">
        {children}
      </div>
    </section>
  );
};

export default function TermsOfServicePage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="py-10 md:py-12">
        <div className="container mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-3 bg-green-100/80 rounded-xl mb-4">
            <LucideIcons.FileArchiveIcon
              size={32}
              className="text-[#2e8b57]"
              strokeWidth={2}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </header>

      <main className="pb-10 container mx-auto px-5">
        <div className="max-w-5xl mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg border border-slate-200/70">
          <Section
            title="1. Introduction & Acceptance"
            icon={LucideIcons.Sparkles}
          >
            <p>
              Welcome to <strong>Hyperpitch.io</strong> (the "
              <strong>Service</strong>"), operated by{" "}
              <strong>Hyperpitch Inc.</strong> ("Hyperpitch," "we," "us," or
              "our"). These <strong>Terms of Service</strong> ("
              <strong>Terms</strong>") govern your access to and use of our
              website, applications, and services. By accessing or using the
              Service, you agree to be bound by these Terms and our{" "}
              <strong>Privacy Policy</strong>.
            </p>
            <p>
              If you <strong>do not agree</strong> to these Terms, please do not
              use the Service. We may revise these Terms from time to time, and
              the <strong>most current version</strong> will always be posted on
              our website.
            </p>
          </Section>

          <Section
            title="2. User Accounts & Responsibilities"
            icon={LucideIcons.Users}
          >
            <p>
              To access certain features of the Service, you may be required to
              create an <strong>account</strong>. You are responsible for
              maintaining the <strong>confidentiality</strong> of your account
              credentials and for <strong>all activities</strong> that occur
              under your account. You agree to notify us{" "}
              <strong>immediately</strong> of any{" "}
              <strong>unauthorized use</strong> of your account.
            </p>
            <p>
              You must provide{" "}
              <strong>accurate and complete information</strong> when creating
              your account and keep this information up-to-date. You are
              responsible for your conduct and any data, text, information,
              graphics, photos, profiles, audio and video clips, links ("
              <strong>Content</strong>") that you submit, post, and display on
              the Service.
            </p>
          </Section>

          <Section title="3. Use of the Service" icon={LucideIcons.Zap}>
            <p>
              You agree to use the Service only for{" "}
              <strong>lawful purposes</strong> and in accordance with these
              Terms. You agree <strong>not to use</strong> the Service:
            </p>
            <ul>
              <li>
                In any way that violates any applicable{" "}
                <strong>federal, state, local, or international law</strong> or
                regulation.
              </li>
              <li>
                To <strong>exploit, harm</strong>, or attempt to exploit or harm
                minors in any way.
              </li>
              <li>
                To transmit, or procure the sending of, any{" "}
                <strong>advertising or promotional material</strong>, including
                any "junk mail," "chain letter," "spam," or any other similar
                solicitation.
              </li>
              <li>
                To <strong>impersonate</strong> or attempt to impersonate
                Hyperpitch, a Hyperpitch employee, another user, or any other
                person or entity.
              </li>
            </ul>
          </Section>

          <Section
            title="4. Intellectual Property Rights"
            icon={LucideIcons.ShieldCheck}
          >
            <p>
              The Service and its entire contents, features, and functionality
              (including but not limited to all information, software, text,
              displays, images, video, and audio, and the design, selection, and
              arrangement thereof) are <strong>owned by Hyperpitch</strong>, its
              licensors, or other providers of such material and are protected
              by <strong>copyright, trademark, patent, trade secret</strong>,
              and other intellectual property or proprietary rights laws.
            </p>
            <p>
              You retain <strong>ownership</strong> of any Content you submit to
              the Service. By submitting Content, you grant Hyperpitch a{" "}
              <strong>
                worldwide, non-exclusive, royalty-free, sublicensable, and
                transferable license
              </strong>{" "}
              to use, reproduce, distribute, prepare derivative works of,
              display, and perform the Content in connection with the Service
              and Hyperpitch's (and its successors' and affiliates') business.
            </p>
          </Section>

          <Section
            title="5. Subscription, Fees, and Payment"
            icon={LucideIcons.CreditCard}
          >
            <p>
              Certain features of the Service may be subject to{" "}
              <strong>fees</strong> as described on our pricing page. All fees
              are <strong>non-refundable</strong> except as required by law or
              as explicitly stated in our refund policy. We reserve the right to
              change our fees or billing methods at any time.
            </p>
            <p>
              If you subscribe to a paid plan, you agree to{" "}
              <strong>pay all applicable fees</strong>. Your subscription will{" "}
              <strong>automatically renew</strong> unless you cancel it before
              the end of the current billing period.
            </p>
          </Section>

          <Section title="6. Termination" icon={LucideIcons.Ban}>
            <p>
              We may <strong>terminate or suspend</strong> your access to all or
              part of the Service, without prior notice or liability, for any
              reason whatsoever, including without limitation if you{" "}
              <strong>breach these Terms</strong>.
            </p>
            <p>
              Upon termination, your right to use the Service will{" "}
              <strong>immediately cease</strong>. If you wish to terminate your
              account, you may simply discontinue using the Service or contact
              us to request account deletion.
            </p>
          </Section>

          <Section
            title="7. Disclaimers and Limitation of Liability"
            icon={LucideIcons.AlertTriangle}
          >
            <p>
              THE SERVICE IS PROVIDED ON AN{" "}
              <strong>"AS IS" AND "AS AVAILABLE"</strong> BASIS. HYPERPITCH
              MAKES <strong>NO WARRANTIES</strong>, EXPRESS OR IMPLIED,
              REGARDING THE SERVICE. TO THE FULLEST EXTENT PERMITTED BY LAW,
              HYPERPITCH <strong>DISCLAIMS ALL WARRANTIES</strong>, INCLUDING,
              BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              IN <strong>NO EVENT</strong> SHALL HYPERPITCH, ITS AFFILIATES,
              DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY{" "}
              <strong>
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES
              </strong>
              , INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS
              TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
            </p>
          </Section>

          <Section title="8. Governing Law" icon={LucideIcons.Scale}>
            <p>
              These Terms shall be <strong>governed and construed</strong> in
              accordance with the laws of{" "}
              <strong>[Your Jurisdiction, e.g., State of Delaware, USA]</strong>
              , without regard to its conflict of law provisions.
            </p>
          </Section>

          <Section title="9. Changes to Terms" icon={LucideIcons.RefreshCw}>
            <p>
              We reserve the right, at our sole discretion, to{" "}
              <strong>modify or replace</strong> these Terms at any time. If a
              revision is <strong>material</strong>, we will provide at least{" "}
              <strong>30 days' notice</strong> prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>
          </Section>

          <Section title="10. Contact Information" icon={LucideIcons.Mail}>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Hyperpitch Inc.</strong>
              <br />
              Email:{" "}
              <a href="mailto:legal@hyperpitch.io">legal@hyperpitch.io</a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
