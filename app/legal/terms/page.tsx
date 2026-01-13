
export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-4">
        <div className="container mx-auto max-w-3xl prose prose-slate">
            <h1>Terms of Service</h1>
            <p className="lead">Effective Date: January 1, 2026</p>
            
            <h3>1. Introduction</h3>
            <p>Welcome to SuburbMates. By using our platform, you agree to these terms. We build trust through verification and local connection.</p>

            <h3>2. User Responsibilities</h3>
            <p>You agree to provide accurate information, including valid ABN details if acting as a business. You are responsible for the quality of services and goods provided.</p>
            
            <h3>3. Payments</h3>
            <p>Payments are processed securely via Stripe. SuburbMates facilitates the transaction but is not a party to the contract between Buyer and Seller.</p>

            <h3>4. Content</h3>
            <p>We do not tolerate hate speech, harassment, or illegal content. We reserve the right to remove any content that violates our community standards.</p>

            {/* ... More terms ... */}
        </div>
    </main>
  );
}
