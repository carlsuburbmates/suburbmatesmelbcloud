
export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-20 px-4">
        <div className="container mx-auto max-w-3xl prose prose-slate">
            <h1>Privacy Policy</h1>
            <p className="lead">Your privacy matters. We are a "Local First" platform, which means we treat your data with the respect a neighbour would.</p>
            
            <h3>Data We Collect</h3>
            <p>We collect information you provide (name, email, payment info) and usage data to improve the service.</p>

            <h3>How We Use Data</h3>
            <p>To facilitate transactions, verify identity (ABN checks), and prevent fraud.</p>
            
            <h3>Data Sharing</h3>
            <p>We do not sell your data. We share strict necessities with partners like Stripe (for payments) and Mapbox (for location services).</p>

            {/* ... More privacy ... */}
        </div>
    </main>
  );
}
