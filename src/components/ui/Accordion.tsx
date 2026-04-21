'use client';

type AccordionProps = {
  items: { question: string; answer: string }[];
};

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all hover:border-slate-300"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-[15px] font-semibold text-slate-900 select-none [&::-webkit-details-marker]:hidden list-none">
            {item.question}
            <svg
              className="h-5 w-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-45"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </summary>
          <div className="px-6 pb-5 -mt-1">
            <p className="text-[14px] leading-relaxed text-slate-500">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
