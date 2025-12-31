import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function VerificationSafeguards() {
  useEffect(() => {
    document.title = "ReCircle — Verification & Safeguards";
    
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const setNameMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('og:title', 'ReCircle — Verification & Safeguards');
    setMetaTag('og:description', 'How ReCircle verifies transportation receipts and reduces farming and abuse while pre-endorsement.');
    setMetaTag('og:type', 'article');
    setMetaTag('og:url', 'https://www.recirclerewards.app/foundations/verification-safeguards');
    setNameMetaTag('twitter:card', 'summary');
    setNameMetaTag('twitter:title', 'ReCircle — Verification & Safeguards');
    setNameMetaTag('twitter:description', 'How ReCircle verifies transportation receipts and reduces farming and abuse while pre-endorsement.');

    return () => {
      document.title = 'ReCircle - Sustainable Transportation Rewards';
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/">
          <a className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ReCircle
          </a>
        </Link>

        <article className="prose prose-lg prose-emerald max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Verification & Safeguards
          </h1>

          <p className="lead text-xl text-gray-600 mb-8">
            ReCircle is designed to recognize verified sustainable transportation activity while minimizing abuse, farming, and low-quality submissions. This page explains how verification works and the safeguards currently in place.
          </p>

          <p className="text-gray-700 mb-8">
            Our approach is intentionally conservative: when verification is uncertain or systems fail, rewards are not issued by default.
          </p>

          <h2>What ReCircle Supports</h2>
          <p>
            ReCircle currently supports verified transportation receipts, including:
          </p>
          <ul>
            <li>Rideshare</li>
            <li>Public transportation (bus, rail, light rail)</li>
            <li>EV rentals</li>
            <li>Shared micromobility (scooters, bikes)</li>
          </ul>
          <p>
            The goal is to recognize real-world transportation choices people already make, without requiring artificial behavior change, gamified loops, or excessive user friction.
          </p>

          <h2>How Verification Works</h2>
          <p>
            When a receipt is submitted, ReCircle extracts key attributes such as the service or merchant, date, amount, and transportation category.
          </p>
          <p>
            Verification is AI-assisted and confidence-based:
          </p>
          <ul>
            <li>Receipts that can be verified with sufficient confidence proceed</li>
            <li>Receipts that are unclear or inconsistent are routed to manual review</li>
            <li>Receipts that fail verification are not rewarded</li>
          </ul>
          <p>
            ReCircle prioritizes verification quality over volume. Unclear submissions are not automatically approved.
          </p>

          <h2>Anti-Abuse & Farming Protections</h2>
          <p>
            ReCircle applies multiple overlapping safeguards to reduce abuse and farming patterns, including:
          </p>
          <ul>
            <li>Duplicate and replay detection to prevent re-submissions</li>
            <li>Pattern-based checks across receipt attributes</li>
            <li>Conservative usage limits to reduce high-frequency abuse</li>
            <li>Submission throttling to deter automated or scripted activity</li>
          </ul>
          <p>
            These controls are designed to deter both obvious and subtle farming without impacting legitimate users.
          </p>

          <h2>Enforcement & Internal Safeguards</h2>
          <p>
            In addition to ecosystem-level screening, ReCircle maintains app-level enforcement controls:
          </p>
          <ul>
            <li>Wallets may be restricted from receiving rewards when patterns indicate abuse</li>
            <li>Some restrictions fully block rewards; others route activity to manual review</li>
            <li>Enforcement is applied before reward distribution, not after</li>
          </ul>
          <p>
            Controls are used conservatively and are based on observed behavior over time rather than single events.
          </p>

          <h2>Bot & Bad-Actor Screening</h2>
          <p>
            Where applicable on mainnet, ReCircle checks VeBetterDAO VePassport signals prior to issuing rewards.
          </p>
          <ul>
            <li>Wallets flagged as known bots or bad actors are blocked from receiving rewards</li>
            <li>These checks supplement, rather than replace, internal safeguards</li>
          </ul>

          <h2>Manual Review</h2>
          <p>
            Certain receipts are intentionally routed to human review, including:
          </p>
          <ul>
            <li>Low-confidence or unclear receipts</li>
            <li>Receipt formats that vary significantly by region or provider</li>
            <li>Submissions associated with elevated risk signals</li>
          </ul>
          <p>
            While under review:
          </p>
          <ul>
            <li>Rewards are not issued</li>
            <li>Approval is required before any distribution occurs</li>
          </ul>
          <p>
            This ensures uncertain cases are handled deliberately rather than automatically.
          </p>

          <h2>Transparency & Auditability</h2>
          <p>
            ReCircle maintains traceability across verification and rewards:
          </p>
          <ul>
            <li>Receipt outcomes are recorded</li>
            <li>Reward distributions are linked to verified actions</li>
            <li>Operational logging supports investigation and iteration</li>
          </ul>
          <p>
            This allows safeguards to improve over time without relying on guesswork.
          </p>

          <h2>Data Retention & Privacy</h2>
          <p>
            Receipt images are retained only as long as necessary for verification and review, then automatically cleaned up under a defined retention policy.
          </p>
          <p>
            This balances verification needs with responsible data handling.
          </p>

          <h2>Reliability & Fail-Safes</h2>
          <p>
            ReCircle is built with failure modes in mind:
          </p>
          <ul>
            <li>If external services time out or fail, receipts are not rewarded</li>
            <li>If network or blockchain operations fail, rewards are not issued</li>
            <li>Errors are surfaced explicitly rather than silently ignored</li>
          </ul>
          <p>
            The system fails closed: rewards are only issued when verification and processing complete successfully.
          </p>

          <h2>Closing</h2>
          <p>
            The VeBetterDAO ecosystem is strongest when rewards correspond to real activity, and users can trust that incentives are not dominated by low-quality or abusive behavior.
          </p>
          <p>
            ReCircle's posture is simple:
          </p>
          <ul>
            <li>Verify conservatively</li>
            <li>Enforce before rewarding</li>
            <li>Fail closed on uncertainty</li>
            <li>Improve safeguards iteratively as real usage grows</li>
          </ul>
          <p>
            Constructive feedback on verification quality or safeguards is welcome.
          </p>
        </article>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-gray-500">
              ReCircle is a sustainability rewards platform built on VeChain.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/foundations/recognizing-everyday-sustainability">
                <a className="text-emerald-600 hover:text-emerald-700">Our Philosophy</a>
              </Link>
              <Link href="/">
                <a className="text-emerald-600 hover:text-emerald-700">Learn more</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
