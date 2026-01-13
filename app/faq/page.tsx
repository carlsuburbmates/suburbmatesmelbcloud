
export default function FAQPage() {
  const faqs = [
    {
        q: "How do I claim my business?",
        a: "Find your listing in the Directory, click 'Claim this Business', and verify your ABN. Once verified, you'll get access to your Studio dashboard."
    },
    {
        q: "Is it free to list?",
        a: "Yes! Creating basic profile and listing products is completely free. We take a small commission on sales to cover processing fees."
    },
    {
        q: "How do I get paid?",
        a: "We use Stripe Connect. You'll link your bank account during onboarding, and payouts are automatically deposited to your account on a rolling basis."
    },
    {
        q: "What can I sell?",
        a: "SuburbMates is for local services (dog walking, lawn care, tutoring) and digital/physical goods made by locals. Prohibited items include illegal goods, weapons, and adult content."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
            {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600">{faq.a}</p>
                </div>
            ))}
        </div>
      </div>
    </main>
  );
}
