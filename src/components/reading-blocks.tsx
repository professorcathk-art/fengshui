export function ReadingBlocks({
  sections,
}: {
  sections: { title: string; body: string }[];
}) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="font-display text-3xl">{section.title}</h2>
          {section.body
            .split(/\n+/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={`${section.title}-${index}`} className="mt-3 max-w-3xl text-sm leading-7">
                {paragraph}
              </p>
            ))}
        </section>
      ))}
    </div>
  );
}
