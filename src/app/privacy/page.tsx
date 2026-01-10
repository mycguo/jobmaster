import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto p-6 prose prose-lg">
      <h1>Privacy Policy</h1>
      <p>Effective date: January 10, 2026</p>
      <p>
        JobMaster ("we", "us", or "our") operates the JobMaster Chrome extension and the associated web
        application (the "Service"). This Privacy Policy explains how we collect, use, disclose, and protect
        your information when you use our Service.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Personal Information</strong>: When you sign in with an email address or a third‑party
          provider (e.g., Google, LinkedIn), we collect your name, email address, and profile picture.
        </li>
        <li>
          <strong>Job Data</strong>: The extension captures job postings you choose to save. This includes the
          job title, company name, location, salary range (if displayed), and the full job description.
        </li>
        <li>
          <strong>Usage Data</strong>: We automatically collect information about how you interact with the
          extension and the web app, such as IP address, browser type, operating system, and timestamps.
        </li>
        <li>
          <strong>Cookies & Local Storage</strong>: We use cookies only for authentication sessions and to
          remember your preferences.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>Provide, maintain, and improve the Service.</li>
        <li>Generate AI‑enhanced summaries, interview questions, and resume recommendations.</li>
        <li>Send you security‑related notifications (e.g., password resets).</li>
        <li>Analyze aggregate usage trends to improve product features.</li>
      </ul>

      <h2>3. Sharing Your Information</h2>
      <ul>
        <li>
          <strong>Service Providers</strong>: We may share data with cloud providers (e.g., Vercel, Supabase) that
          host our infrastructure. They are contractually obligated to keep your data confidential.
        </li>
        <li>
          <strong>Legal Requirements</strong>: We may disclose information if required by law or to protect our
          rights, property, or safety.
        </li>
        <li>We do not sell or rent your personal information to third parties.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <p>
        Your job data and account information are retained until you delete your account or remove
        individual entries. Authentication sessions are cleared after 30 days of inactivity.
      </p>

      <h2>5. Security</h2>
      <p>
        We implement industry‑standard security measures, including encryption in transit (TLS) and at rest,
        regular security audits, and role‑based access controls.
      </p>

      <h2>6. Your Rights</h2>
      <ul>
        <li>Access, correct, or delete your personal data via the Settings page.</li>
        <li>Withdraw consent for non‑essential processing at any time.</li>
        <li>Export your data in a portable format.</li>
      </ul>

      <h2>7. Children’s Privacy</h2>
      <p>
        The Service is not intended for children under 13 years of age. We do not knowingly collect
        personal information from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any material changes by
        posting the new version on this page with an updated effective date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at
        <a href="mailto:mycguo@gmail.com">mycguo@gmail.com</a>.
      </p>
    </main>
  );
}
