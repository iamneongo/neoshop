import { CheckCircle2 } from "lucide-react";
import { Breadcrumb, Footer, SiteHeader } from "./shared";

type InfoPageProps = {
  active?: "home" | "products" | "guide" | "news" | "contact";
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
    items?: string[];
  }>;
};

export function InfoPage({ active = "home", eyebrow, title, description, sections }: InfoPageProps) {
  return (
    <main>
      <SiteHeader active={active} />
      <div className="container staticPage">
        <Breadcrumb current={title} />
        <section className="staticHero">
          <span>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </section>
        <section className="staticGrid">
          {sections.map((section) => (
            <article className="staticCard" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}
