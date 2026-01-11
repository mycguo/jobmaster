import React from 'react';
import Link from 'next/link';

export default function HowItWorks() {
  return (
    <main className="max-w-4xl mx-auto p-6 lg:p-12 prose prose-lg dark:prose-invert">
      <h1 className="text-4xl font-bold mb-6">How JobMaster Works</h1>
      
      <p className="lead text-xl text-muted-foreground mb-12">
        JobMaster streamlines your job search by connecting your LinkedIn browsing directly to a 
        powerful AI-driven dashboard. Here is how to get started in 5 minutes.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Install the Chrome Extension
        </h2>
        <div className="bg-muted p-6 rounded-lg border">
          <p className="mb-4">
            Since the extension is in private beta, you will install it manually from a ZIP file.
          </p>
          <ol className="space-y-3">
            <li>
              <strong>Download and Unzip</strong>: Download the <a href="https://drive.google.com/file/d/14mMne50vqIfCXKAhQyi8NiQf3WIueSgU/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-primary underline">extension.zip</a> file, and extract it to a folder.
            </li>
            <li>
              <strong>Open Extensions</strong>: In Chrome, go to <code>chrome://extensions</code>.
            </li>
            <li>
              <strong>Enable Developer Mode</strong>: Toggle the switch in the top-right corner.
            </li>
            <li>
              <strong>Load Unpacked</strong>: Click the button that appears, and select the <strong>folder</strong> you just extracted (not the zip file itself).
            </li>
          </ol>
          <p className="text-sm text-muted-foreground mt-4">
            <em>Tip: Pin the &quot;Job Tracker&quot; icon to your toolbar for easy access.</em>
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Configure the Extension
        </h2>
        <ul className="space-y-2">
          <li>Click the <strong>Job Tracker</strong> icon in your Chrome toolbar.</li>
          <li>Click the <strong>Settings (Gear)</strong> icon in the sidebar.</li>
          <li>Enter your <strong>LinkedIn Email</strong> (or the email you used to sign up for JobMaster).</li>
          <li>Click <strong>Save</strong>.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Capture Jobs
        </h2>
        <p>
          Navigate to any job posting on <strong>LinkedIn</strong>. The JobMaster side card will appear automatically.
        </p>
        <ul className="space-y-2">
          <li>Wait for the status to show <strong>&quot;Ready&quot;</strong>.</li>
          <li>Click <strong>&quot;Send to JobMaster&quot;</strong>.</li>
          <li>The extension uses advanced background fetching to capture the full job description, even if the page is laggy.</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          Manage Your Pipeline
        </h2>
        <p>
          Log in to the web dashboard to see your saved jobs.
        </p>
        <div className="flex gap-4 mt-6">
          <Link 
            href="/login"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Log In to Dashboard
          </Link>
          <Link 
            href="/privacy"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Privacy Policy
          </Link>
        </div>
      </section>
    </main>
  );
}
