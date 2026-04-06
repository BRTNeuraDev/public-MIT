import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY_NAME, COMPANY_LOCATION, GITHUB_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions — BrtNeura Kit",
  description:
    "Terms and conditions for using BrtNeura Kit, a collection of free browser-based utility tools by BRTNeura Technology LLP.",
};

/** Reusable section heading for terms content */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-xl font-semibold text-white">{children}</h2>
  );
}

/**
 * Full Terms & Conditions page with 10 sections covering service usage,
 * data privacy, IP, warranties, liability, and governing law.
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Terms &amp; Conditions
      </h1>
      <p className="mb-10 text-sm text-zinc-500">
        Last updated: April 2026
      </p>

      <div className="space-y-4 text-sm leading-relaxed text-zinc-400">
        {/* 1. Acceptance of Terms */}
        <SectionHeading>1. Acceptance of Terms</SectionHeading>
        <p>
          By accessing or using BrtNeura Kit (<Link href="/" className="text-indigo-400 underline hover:text-indigo-300">kit.brtneura.com</Link>),
          you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of
          these terms, you must not use the service. Continued use of the platform after changes to
          these terms constitutes acceptance of those changes.
        </p>

        {/* 2. Service Description */}
        <SectionHeading>2. Service Description</SectionHeading>
        <p>
          BrtNeura Kit is a collection of free, open-source, browser-based utility tools provided by{" "}
          {COMPANY_NAME}. All tools run entirely in your browser. The service is provided free of
          charge and is intended for personal, educational, and professional use.
        </p>

        {/* 3. Data Privacy & Processing */}
        <SectionHeading>3. Data Privacy &amp; Processing</SectionHeading>
        <p>
          All data processing happens locally in your browser. We do <strong className="text-zinc-300">NOT</strong> collect,
          store, or transmit personal data you input into our tools. Your data never leaves your device.
        </p>
        <p>
          We collect anonymous usage analytics (tool usage counts, browser type, timestamps) via
          Firebase Analytics. No personally identifiable information (PII) is collected.
        </p>
        <p>
          We comply with the <strong className="text-zinc-300">Digital Personal Data Protection Act (DPDP Act), 2023</strong> of India.
          If you have questions about data handling, contact us at the address listed below.
        </p>

        {/* 4. Intellectual Property */}
        <SectionHeading>4. Intellectual Property</SectionHeading>
        <p>
          The tools provided on BrtNeura Kit are released under the{" "}
          <strong className="text-zinc-300">MIT License</strong>. You are free to use, modify, and distribute
          the tool source code in accordance with the MIT License terms.
        </p>
        <p>
          The BrtNeura name, logo, branding, and visual identity remain the exclusive property of{" "}
          {COMPANY_NAME}. Use of our brand assets requires prior written permission.
        </p>

        {/* 5. Disclaimer of Warranties */}
        <SectionHeading>5. Disclaimer of Warranties</SectionHeading>
        <p>
          BrtNeura Kit and all tools are provided <strong className="text-zinc-300">&quot;AS IS&quot;</strong> and{" "}
          <strong className="text-zinc-300">&quot;AS AVAILABLE&quot;</strong> without warranty of any kind,
          express or implied, including but not limited to warranties of merchantability, fitness for a
          particular purpose, and non-infringement.
        </p>
        <p>
          <strong className="text-amber-400">GST Calculator Disclaimer:</strong> The GST Calculator tool is
          provided for informational and estimation purposes only. It should <strong className="text-zinc-300">not</strong> be
          used as the sole basis for tax filing, invoicing, or financial decisions. Always consult a
          qualified tax professional or chartered accountant for official tax computations.
        </p>

        {/* 6. Limitation of Liability */}
        <SectionHeading>6. Limitation of Liability</SectionHeading>
        <p>
          In no event shall {COMPANY_NAME}, its partners, directors, or employees be liable for any
          indirect, incidental, special, consequential, or punitive damages, including without limitation
          loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your access to or use of (or inability to access or use) the service</li>
          <li>Any conduct or content of any third party on the service</li>
          <li>Any content obtained from the service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
        </ul>

        {/* 7. Acceptable Use */}
        <SectionHeading>7. Acceptable Use</SectionHeading>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Use the service for any unlawful purpose or in violation of any applicable laws</li>
          <li>Misrepresent BrtNeura Kit output as certified, official, or legally binding without proper attribution</li>
          <li>Attempt to interfere with or disrupt the service or its infrastructure</li>
          <li>Use automated systems to access the service in a manner that sends more requests than a human can reasonably produce</li>
        </ul>

        {/* 8. Open Source */}
        <SectionHeading>8. Open Source</SectionHeading>
        <p>
          BrtNeura Kit is open source under the{" "}
          <strong className="text-zinc-300">MIT License</strong>. The full source code is available on{" "}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 underline hover:text-indigo-300"
          >
            GitHub
          </a>
          .
        </p>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-xs text-zinc-500 leading-relaxed">
          <p>MIT License</p>
          <p className="mt-2">
            Permission is hereby granted, free of charge, to any person obtaining a copy of this
            software and associated documentation files, to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge, publish, distribute,
            sublicense, and/or sell copies of the Software, subject to the following conditions:
          </p>
          <p className="mt-2">
            The above copyright notice and this permission notice shall be included in all copies or
            substantial portions of the Software.
          </p>
          <p className="mt-2">
            THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND.
          </p>
        </div>

        {/* 9. Modifications */}
        <SectionHeading>9. Modifications</SectionHeading>
        <p>
          We reserve the right to modify or replace these Terms &amp; Conditions at any time. Changes
          will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of
          BrtNeura Kit after any changes constitutes acceptance of the new terms.
        </p>

        {/* 10. Governing Law */}
        <SectionHeading>10. Governing Law</SectionHeading>
        <p>
          These Terms &amp; Conditions shall be governed by and construed in accordance with the
          laws of India. Any disputes arising out of or relating to these terms or the use of
          BrtNeura Kit shall be subject to the exclusive jurisdiction of the courts in{" "}
          <strong className="text-zinc-300">Pune, Maharashtra, India</strong>.
        </p>

        {/* Contact */}
        <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.03] px-5 py-4">
          <h3 className="mb-2 text-base font-semibold text-white">Contact</h3>
          <p>{COMPANY_NAME}</p>
          <p>{COMPANY_LOCATION}</p>
          <p className="mt-2">
            Website:{" "}
            <a
              href="https://brtneura.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              brtneura.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
