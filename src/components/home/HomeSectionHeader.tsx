type HomeSectionHeaderProps = {
  title: string;
  eyebrow?: string;
  note?: string;
};

export default function HomeSectionHeader({ title, eyebrow, note }: HomeSectionHeaderProps) {
  return (
    <div className="home-section-header">
      {eyebrow ? <p className="home-eyebrow">{eyebrow}</p> : null}
      <div className="home-section-title-row">
        <h2>{title}</h2>
        {note ? <p>{note}</p> : null}
      </div>
    </div>
  );
}
