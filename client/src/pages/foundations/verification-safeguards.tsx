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
            ReCircle is designed to recognize verified sustainable transportation activity while minimizing abuse, farming, and low-quality submissions. This page explains how verification works and the safeguards in place today.
          </p>

          <h2>What ReCircle Supports</h2>
          <p>
            ReCircle currently supports transportation receipts such as:
          </p>
          <ul>
            <li>Rideshare (e.g., Uber/Lyft)</li>
            <li>Public transit (bus, rail, etc.)</li>
            <li>EV rentals</li>
            <li>Shared micromobility (scooters, bikes)</li>
          </ul>
          <p>
            The goal is to recognize choices many people already make, without requiring behavior change or "gamified" activity loops.
          </p>

          <h2>How Verification Works</h2>
          <p>
            When a receipt is submitted, ReCircle extracts key details such as merchant/service, date, amount, and category. If verification is uncertain, the receipt is routed to manual review rather than being automatically approved. ReCircle is intentionally conservative: if a receipt cannot be verified with sufficient confidence, it is not automatically rewarded.
          </p>

          <h2>Anti-Abuse Safeguards</h2>
          <p>
            ReCircle uses multiple layers of protection to reduce farming and abuse:
          </p>
          <ul>
            <li>Duplicate and replay prevention (prevents re-submissions and near-duplicates)</li>
            <li>Conservative limits and throttling to reduce spam patterns</li>
            <li>Manual review routing for uncertain or suspicious cases</li>
          </ul>

          <h2>Internal Safeguards</h2>
          <p>
            In addition to ecosystem-level screening, ReCircle maintains app-level safeguards, including internal wallet restrictions that can block rewards or route activity to manual review when patterns indicate abuse. These controls are used conservatively and prioritize verification quality over volume.
          </p>

          <h2>Bot / Bad-Actor Screening</h2>
          <p>
            Where applicable on mainnet, ReCircle checks VeBetterDAO's VePassport signals before rewarding. If a wallet is flagged as a known bad actor, rewards are blocked.
          </p>

          <h2>Transparency & Auditability</h2>
          <p>
            ReCircle maintains an auditable trail of receipt outcomes and reward history. Operational logging supports investigations and debugging so safeguards can improve over time without relying on guesswork.
          </p>

          <h2>Data Retention</h2>
          <p>
            Receipt images are retained for a limited period and automatically cleaned up under a retention policy (currently 30 days), balancing verification needs with responsible data handling.
          </p>

          <h2>Reliability & Fail-Safes</h2>
          <p>
            ReCircle is built with failure modes in mind. If external services time out or network conditions degrade, receipts are routed safely (for example, to manual review) rather than silently failing.
          </p>

          <h2>Closing</h2>
          <p>
            The VeBetterDAO ecosystem is strongest when rewards correspond to real activity and users can trust that incentives are not dominated by low-quality or abusive behavior. ReCircle's posture is simple: recognize verified transportation receipts, keep safeguards conservative, and improve controls iteratively as the ecosystem evolves.
          </p>
          <p>
            If you have feedback on verification quality or safeguards, constructive input is welcome.
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
