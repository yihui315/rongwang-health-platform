type AccordionProps = {
  items: { question: string; answer: string }[];
};

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer font-semibold">{item.question}</summary>
          <p className="mt-3 leading-7 text-slate-500">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
