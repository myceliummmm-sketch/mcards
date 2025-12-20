import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Cookies We Use</h2>
            
            <h3 className="text-xl font-medium mb-3">2.1 Essential Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are necessary for the website to function properly:
            </p>
            <div className="bg-muted/20 rounded-lg p-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Cookie Name</th>
                    <th className="text-left py-2 font-medium">Purpose</th>
                    <th className="text-left py-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">sb-*-auth-token</td>
                    <td className="py-2">User authentication session</td>
                    <td className="py-2">Session</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">cookie-consent</td>
                    <td className="py-2">Stores your cookie preferences</td>
                    <td className="py-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="py-2">sidebar:state</td>
                    <td className="py-2">Remembers sidebar open/closed state</td>
                    <td className="py-2">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-medium mb-3">2.2 Analytics Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies help us understand how visitors interact with our website:
            </p>
            <div className="bg-muted/20 rounded-lg p-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Cookie Name</th>
                    <th className="text-left py-2 font-medium">Purpose</th>
                    <th className="text-left py-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">_ga</td>
                    <td className="py-2">Google Analytics - distinguishes users</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">_ga_*</td>
                    <td className="py-2">Google Analytics - maintains session state</td>
                    <td className="py-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="py-2">_gid</td>
                    <td className="py-2">Google Analytics - distinguishes users</td>
                    <td className="py-2">24 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Cookie Consent Banner:</strong> Use our cookie consent banner to accept or decline non-essential cookies</li>
              <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or accept cookies through their settings</li>
              <li><strong>Third-Party Opt-Out:</strong> Visit the opt-out pages for specific services like Google Analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How to Delete Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can delete cookies through your browser settings. Here are links to instructions for common browsers:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Impact of Disabling Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Disabling essential cookies may affect the functionality of our website. You may not be able to log in or use certain features. Disabling analytics cookies will not affect your use of the website but will limit our ability to improve the user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, please contact us at privacy@mycelium.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
