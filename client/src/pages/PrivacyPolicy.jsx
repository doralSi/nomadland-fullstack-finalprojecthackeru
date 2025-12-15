import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: December 15, 2025</p>

        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to NomadLand. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Information We Collect</h2>
          <h3>2.1 Account Information</h3>
          <p>
            When you register for an account, we collect your name, email address, and password. 
            This information is necessary to create and manage your account.
          </p>
          
          <h3>2.2 User-Generated Content</h3>
          <p>
            We collect information you provide when creating maps, adding points of interest, uploading images, 
            and posting reviews. This content is stored to provide our mapping and sharing services.
          </p>
          
          <h3>2.3 Usage Data</h3>
          <p>
            We automatically collect information about how you interact with our platform, including your IP address, 
            browser type, pages visited, and actions taken on the site.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To manage your account and authentication</li>
            <li>To display your maps and points of interest to other users</li>
            <li>To send you important updates about the service</li>
            <li>To improve and optimize our platform</li>
            <li>To prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information to third parties. Your data may be shared only in the following circumstances:
          </p>
          <ul>
            <li><strong>Public Content:</strong> Maps, points, and reviews you create are visible to other users as part of our core service</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
            <li><strong>Service Providers:</strong> We use trusted third-party services (e.g., cloud hosting, image storage) that may process your data</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against 
            unauthorized access, alteration, disclosure, or destruction. This includes:
          </p>
          <ul>
            <li>Encrypted password storage using industry-standard hashing</li>
            <li>Secure HTTPS connections for all data transmission</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication mechanisms</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of non-essential communications</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, maintain your session, 
            and remember your preferences (such as dark mode settings). You can control cookie preferences 
            through your browser settings.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children. If you believe we have collected information from a child, 
            please contact us immediately.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify users of significant changes 
            by posting a notice on our platform or sending an email notification.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at:
          </p>
          <p><strong>Email:</strong> privacy@nomadland.com</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
