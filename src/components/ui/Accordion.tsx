type AccordionProps = {
  items: { question: string; answer: string }[];
};

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-2xl border border-slate-200 bg-white transition hover:border-teal"
        >
          <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold">
            <span>{item.question}</span>
            <span className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 transition group-open:bg-teal group-open:text-white group-open:rotate-180">
              ▼
            </span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-slate-500">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
