import type { ReactNode } from 'react';
import { useParams } from 'react-router';
import { CircleHelp } from 'lucide-react';
import { Accordion, Breadcrumbs, ButtonLink, Card, DemoNotice, EmptyState, PageHeader } from '@/components/ui';
import { DELIVERY_PARTNERS } from '@shobdox/shared-mock-data';
import { SUPPORT_PHONE } from '@/lib/constants';

/**
 * Static Bangla help centre for `/help/:topic`.
 *
 * Copy lives as plain data below and is rendered by a single small renderer:
 * the demo has no CMS and no support team behind the contact page, so these
 * hand-written strings are the source of truth.
 */

interface HelpSection {
  id: string;
  title: string;
  /** Paragraph text; JSX only where inline styling (e.g. numeric font) matters. */
  body?: ReactNode;
  bullets?: string[];
}

interface HelpTopic {
  title: string;
  description: string;
  sections: HelpSection[];
  notice?: { title: string; body?: string };
}

const TOPIC_LABELS: Array<{ id: string; label: string }> = [
  { id: 'delivery', label: 'ডেলিভারি' },
  { id: 'returns', label: 'রিটার্ন ও রিফান্ড' },
  { id: 'payment', label: 'পেমেন্ট' },
  { id: 'about', label: 'আমাদের সম্পর্কে' },
  { id: 'contact', label: 'যোগাযোগ' },
  { id: 'privacy', label: 'গোপনীয়তা' },
  { id: 'terms', label: 'শর্তাবলি' },
  { id: 'faq', label: 'সাধারণ জিজ্ঞাসা' },
  { id: 'seller-policy', label: 'সেলার নীতি' },
];

const TOPICS: Record<string, HelpTopic> = {
  delivery: {
    title: 'ডেলিভারি তথ্য',
    description: 'সারা বাংলাদেশে ডেলিভারি সময়, চার্জ ও ফ্রি ডেলিভারির নিয়ম।',
    sections: [
      {
        id: 'delivery-dhaka',
        title: 'ঢাকার ভেতরে কত দিনে?',
        body: 'স্ট্যান্ডার্ড ডেলিভারি ১–৩ দিন (৬০৳), এক্সপ্রেস ১–২ দিন (১২০৳) এবং একই দিনে ডেলিভারি ২০০৳ — শেষটি শুধু ঢাকা সিটির ভেতরে প্রযোজ্য। চেকআউটে আপনার এলাকার ভিত্তিতে সম্ভাব্য তারিখ দেখানো হয়।',
      },
      {
        id: 'delivery-outside',
        title: 'ঢাকার বাইরে?',
        body: 'ঢাকার বাইরে স্ট্যান্ডার্ড ৩–৫ দিন এবং এক্সপ্রেস ২–৩ দিন সময় নেয়। স্ট্যান্ডার্ড ও এক্সপ্রেসে অতিরিক্ত ৬০৳ সারচার্জ যোগ হয়, আর একই দিনে ডেলিভারি পাওয়া যায় না।',
      },
      {
        id: 'delivery-free',
        title: 'ফ্রি ডেলিভারি',
        body: '৫,০০০৳ বা তার বেশি অর্ডারে স্ট্যান্ডার্ড ডেলিভারি ফ্রি। এছাড়া FREESHIP কুপন ব্যবহার করলে স্ট্যান্ডার্ড ডেলিভারির চার্জ মাফ হয়। কার্টে অগ্রগতি বার দেখে বোঝা যায় আর কত টাকা যোগ করলে ফ্রি হবে।',
      },
      {
        id: 'delivery-partners',
        title: 'ডেলিভারি পার্টনার',
        body: `ডেমোতে দেখানো পার্টনার নামগুলো: ${DELIVERY_PARTNERS.join(' · ')} (শুধু উপস্থাপনার জন্য)।`,
      },
    ],
  },
  returns: {
    title: 'রিটার্ন ও রিফান্ড নীতি',
    description: '৭ দিনের মধ্যে অমিল বা ক্ষতিগ্রস্ত পণ্য ফেরত দেওয়ার নিয়ম।',
    sections: [
      {
        id: 'returns-window',
        title: '৭ দিনের রিটার্ন সুযোগ',
        body: 'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে অমিল, ক্ষতিগ্রস্ত বা ভুল পণ্য ফেরত দেওয়া যায়। পণ্য অব্যবহৃত, ট্যাগসহ ও আসল প্যাকেজিংয়ে থাকতে হবে।',
      },
      {
        id: 'returns-how',
        title: 'কীভাবে রিটার্ন করবেন?',
        bullets: [
          '“অর্ডার হিস্ট্রি” থেকে অর্ডারটি খুলুন।',
          'ডেমোতে রিটার্ন রিকোয়েস্ট বোতামটি শুধু অনুরোধ রেকর্ড করে — কোনো কুরিয়ার আসবে না।',
          'অনুরোধে কারণ ও ছবির বর্ণনা লিখুন।',
        ],
      },
      {
        id: 'returns-refund',
        title: 'রিফান্ড',
        body: 'এই ডেমোতে কোনো প্রকৃত রিফান্ড হয় না — পেমেন্টই হয়নি। ডেমো রেকর্ডে রিফান্ড স্ট্যাটাস শুধু দেখানোর জন্য বদলানো যায়।',
      },
    ],
  },
  payment: {
    title: 'পেমেন্ট',
    description: 'ক্যাশ অন ডেলিভারি ও ডেমো ওয়ালেট অপশন সম্পর্কে।',
    notice: {
      title: 'সব পেমেন্ট শুধু ডেমো',
      body: 'কোনো গেটওয়ে সংযুক্ত নেই, কোনো টাকা কাটা হয় না এবং কার্ড/মোবাইল ব্যাংকিং তথ্য কখনো চাওয়া হয় না।',
    },
    sections: [
      {
        id: 'payment-cod',
        title: 'ক্যাশ অন ডেলিভারি',
        body: 'পণ্য হাতে পেয়ে টাকা পরিশোধের সুবিধা চেকআউটে বেছে নেওয়া যায়। ডেমোতে নগদ লেনদেন হয় না।',
      },
      {
        id: 'payment-wallets',
        title: 'বিকাশ / নগদ / রকেট',
        body: 'এগুলো শুধু ডেমো ইন্টারফেস — চেকআউটে কোনো নম্বর, পিন বা OTP ইনপুট নেই। পদ্ধতি বেছে নিলে অর্ডারে “ডেমো নির্বাচন” হিসেবে রেকর্ড হয়, পেমেন্ট সম্পন্ন হিসেবে নয়।',
      },
      {
        id: 'payment-safety',
        title: 'নিরাপত্তা',
        body: 'ডেমো কখনো কার্ড নম্বর, সিভিভি, ওয়ালেট পিন বা OTP চায় না। কেউ চাইলে বুঝবেন এটি ডেমো নয় — এই সাইটে এমন কোনো ফর্ম নেই।',
      },
    ],
  },
  about: {
    title: 'আমাদের সম্পর্কে',
    description: 'SHOBDOX ডেমো মার্কেটপ্লেস কী এবং কেন তৈরি।',
    sections: [
      {
        id: 'about-what',
        title: 'SHOBDOX কী?',
        body: 'SHOBDOX একটি ডেমো বাংলাদেশি অনলাইন মার্কেটপ্লেস — ফ্যাশন, ইলেকট্রনিক্স, হোম, বিউটি, গ্রোসারি ও বই এক জায়গায়। এটি একটি প্রযুক্তি ডেমো, প্রকৃত ব্যবসা নয়।',
      },
      {
        id: 'about-mission',
        title: 'লক্ষ্য',
        body: 'বাংলা-ফার্স্ট কেনাকাটার অভিজ্ঞতা, ক্যাশ অন ডেলিভারি ও ৬৪ জেলায় ডেলিভারির মতো স্থানীয় চাহিদাগুলো একটি পূর্ণ ওয়েব + মোবাইল অভিজ্ঞতায় দেখানো।',
      },
      {
        id: 'about-demo',
        title: 'ডেমো নোট',
        body: 'ব্যবহৃত সব ব্র্যান্ড নাম, পণ্য ও পরিসংখ্যান শুধু উপস্থাপনার জন্য — প্রকৃত দাম বা স্টক নয়।',
      },
    ],
  },
  contact: {
    title: 'যোগাযোগ',
    description: 'ডেমো সাপোর্ট চ্যানেলের নমুনা তথ্য।',
    notice: { title: 'এই যোগাযোগের তথ্য নমুনা — কোনো সাপোর্ট টিম নেই' },
    sections: [
      {
        id: 'contact-hotline',
        title: 'হটলাইন',
        body: (
          <>
            নমুনা হটলাইন: <span className="font-num">{SUPPORT_PHONE}</span> — এই নম্বরে কোনো কল যায় না।
          </>
        ),
      },
      {
        id: 'contact-email',
        title: 'ইমেইল',
        body: 'নমুনা ইমেইল: support@shobdox.example — কোনো ইমেইল পড়া হয় না বা উত্তর দেওয়া হয় না।',
      },
      {
        id: 'contact-address',
        title: 'ঠিকানা',
        body: 'ডেমো ঠিকানা: ঢাকা, বাংলাদেশ (কোনো অফিস বা সাপোর্ট ডেস্ক নেই)।',
      },
    ],
  },
  privacy: {
    title: 'গোপনীয়তা নীতি',
    description: 'ডেমো সাইটে আপনার তথ্য কোথায় থাকে।',
    sections: [
      {
        id: 'privacy-storage',
        title: 'ডেটা কোথায় থাকে?',
        body: 'সব ডেমো ডেটা (কার্ট, উইশলিস্ট, অর্ডার, প্রোফাইল) আপনার ব্রাউজারের localStorage-এ থাকে। কোথাও পাঠানো হয় না, কোনো অ্যাকাউন্ট সার্ভার নেই।',
      },
      {
        id: 'privacy-what',
        title: 'কী সংরক্ষিত হয়?',
        bullets: [
          'কার্টের পণ্য ও বাছাই, কুপন কোড ও ডেলিভারি/পেমেন্ট পছন্দ।',
          'উইশলিস্টের পণ্য আইডি।',
          'ডেমো অর্ডার ও ট্র্যাকিং ইতিহাস।',
        ],
      },
      {
        id: 'privacy-delete',
        title: 'ডেটা মুছবেন কীভাবে?',
        body: 'ফুটারের “ডেমো ডেটা রিসেট করুন” বোতাম চাপলে সব স্থানীয় ডেটা মুছে প্রাথমিক অবস্থায় ফিরে যায়।',
      },
    ],
  },
  terms: {
    title: 'শর্তাবলি',
    description: 'ডেমো সাইট ব্যবহারের সাধারণ শর্ত।',
    sections: [
      {
        id: 'terms-demo',
        title: 'এটি একটি ডেমো',
        body: 'SHOBDOX প্রকৃত ই-কমার্স সেবা নয়। কোনো অর্ডার প্রক্রিয়া, পেমেন্ট বা ডেলিভারি বাস্তবে সম্পন্ন হয় না; অর্ডারগুলো শুধু ডেমো রেকর্ড।',
      },
      {
        id: 'terms-orders',
        title: 'অর্ডার ও মূল্য',
        body: 'দাম, স্টক ও কুপন ডেমো ডেটাসেট থেকে হিসাব হয় এবং যেকোনো সময় বদলাতে পারে। কোনো চুক্তি বা দায়বদ্ধতা তৈরি হয় না।',
      },
      {
        id: 'terms-liability',
        title: 'দায়সীমা',
        body: 'ডেমো ব্যবহারে কোনো লোকসান বা ক্ষতির জন্য দায় নেওয়া হয় না। এটি শেখা ও প্রদর্শনের উদ্দেশ্যে।',
      },
    ],
  },
  faq: {
    title: 'সাধারণ জিজ্ঞাসা',
    description: 'ডেমো SHOBDOX ব্যবহার নিয়ে বারবার আসা প্রশ্ন।',
    sections: [
      {
        id: 'faq-payment',
        title: 'আমার কি সত্যিই টাকা কাটা হবে?',
        body: 'না। কোনো গেটওয়ে নেই, কোনো পেমেন্ট তথ্য চাওয়া হয় না এবং কোনো টাকা কোথাও যায় না।',
      },
      {
        id: 'faq-order',
        title: 'ডেমো অর্ডার নম্বর কীভাবে পাব?',
        body: 'চেকআউট নিশ্চিত করলে SDX-DEMO-… ফরম্যাটে একটি নম্বর তৈরি হয় এবং অর্ডার নিশ্চিতকরণ পেজে দেখানো হয়। পরে ট্র্যাক পেজে সেই নম্বর দিয়ে খোঁজা যায়।',
      },
      {
        id: 'faq-account',
        title: 'লগ ইন করা কি বাধ্যতামূলক?',
        body: 'না। অতিথি হিসেবেও কেনাকাটা করা যায়। ডেমো একাউন্ট দিয়ে লগ ইন করলে সেভ করা ঠিকানা ও অর্ডার ইতিহাস ব্যবহার করা যায়।',
      },
      {
        id: 'faq-reset',
        title: 'সব মুছে আবার শুরু করব কীভাবে?',
        body: 'ফুটারের “ডেমো ডেটা রিসেট করুন” চাপুন — কার্ট, উইশলিস্ট ও এডিট করা ডেটা প্রাথমিক অবস্থায় ফিরবে।',
      },
      {
        id: 'faq-mobile',
        title: 'মোবাইলে ব্যবহার করা যাবে?',
        body: 'হ্যাঁ। পেজগুলো ৩২০ পিক্সেল থেকে শুরু করে সব স্ক্রিনে ব্যবহারযোগ্য, নিচে মোবাইল ট্যাব বারসহ।',
      },
    ],
  },
  'seller-policy': {
    title: 'সেলার নীতি',
    description: 'ডেমোতে সেলার পোর্টাল কীভাবে কাজ করে।',
    sections: [
      {
        id: 'seller-join',
        title: 'সেলার হোন',
        body: 'ডেমোতে “সেলার হোন” লিংক একটি সেলার ড্যাশবোর্ড খোলে — সেখানে নিজের দোকান, পণ্য, অর্ডার ও আয়ের মডেল দেখা যায়। প্রকৃত অনবোর্ডিং হয় না।',
      },
      {
        id: 'seller-commission',
        title: 'কমিশন',
        body: 'কমিশন হার ডেমো টিয়ার অনুযায়ী হিসাব হয় (বিক্রয় বাড়লে হার কমে)। হিসাব শেয়ারড বিজনেস লজিকের ফর্মুলা থেকে আসে।',
      },
      {
        id: 'seller-orders',
        title: 'অর্ডার ও পেআউট',
        body: 'পেআউট শুধু ডেমো রেকর্ড — কোনো প্রকৃত ব্যাংক বা মোবাইল ওয়ালেট ট্রান্সফার হয় না।',
      },
    ],
  },
};

/** One accordion panel: optional paragraph plus optional bullet list. */
function SectionBody({ section }: { section: HelpSection }) {
  return (
    <>
      {section.body ? <p>{section.body}</p> : null}
      {section.bullets ? (
        <ul className="list-disc space-y-1 pl-4">
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default function InfoPage() {
  const { topic: topicId } = useParams<{ topic: string }>();
  const topic = topicId ? TOPICS[topicId] : undefined;

  const breadcrumbs = (
    <Breadcrumbs
      items={[{ label: 'হোম', href: '/' }, { label: 'সহায়তা', href: '/help/faq' }, { label: topic?.title ?? 'সহায়তা' }]}
    />
  );

  if (!topic) {
    return (
      <>
        <PageHeader title="সহায়তা" breadcrumbs={breadcrumbs} />
        <EmptyState
          title="এই সহায়তা পৃষ্ঠাটি পাওয়া যায়নি"
          description="আপনার খোঁজা টপিকটি নেই। সাধারণ জিজ্ঞাসা থেকে শুরু করুন — সেখান থেকে সব সহায়তা পৃষ্ঠায় যাওয়া যায়।"
          icon={<CircleHelp aria-hidden className="size-6" />}
          action={<ButtonLink to="/help/faq">সাধারণ জিজ্ঞাসা দেখুন</ButtonLink>}
        />
      </>
    );
  }

  const defaultOpenIds = topic.sections[0] ? [topic.sections[0].id] : [];

  return (
    <>
      <PageHeader title={topic.title} description={topic.description} breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-3xl space-y-4">
        {topic.notice ? <DemoNotice title={topic.notice.title}>{topic.notice.body}</DemoNotice> : null}

        <Accordion
          items={topic.sections.map((section) => ({
            id: section.id,
            title: section.title,
            content: <SectionBody section={section} />,
          }))}
          defaultOpenIds={defaultOpenIds}
        />

        <Card>
          <h2 className="text-lg font-bold text-text-primary">আরও সহায়তা</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TOPIC_LABELS.filter((entry) => entry.id !== topicId).map((entry) => (
              <li key={entry.id}>
                <ButtonLink to={`/help/${entry.id}`} variant="outline" size="sm">
                  {entry.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </Card>

        <DemoNotice title="ডেমো সহায়তা কেন্দ্র">
          এখানকার লেখা শুধু ডেমো সাইটের নমুনা নীতি — কোনো প্রকৃত আইনি নথি নয়।
        </DemoNotice>
      </div>
    </>
  );
}
