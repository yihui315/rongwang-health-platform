type SectionHeaderProps = {
  title: string;
  description?: string;
};

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold">{title}</h2>
      {description ? <p className="mt-3 text-slate-500">{description}</p> : null}
    </div>
  );
}
