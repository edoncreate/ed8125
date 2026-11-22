import { Reveal } from '../../components/Reveal/Reveal'
import { site } from '../../data/site'

const { bio } = site

export function Bio() {
  return (
    <section id="bio" className="section bio" data-ref="section-bio">
      <div className="container">
        <div className="bio__column">
          <Reveal as="h2" className="section-heading bio__heading" data-ref="bio-heading">
            {bio.heading}
          </Reveal>
          <div className="bio__text" data-ref="bio-text">
            {bio.paragraphs.map((runs, i) => (
              <p key={i}>
                {runs.map((run, j) => (run.bold ? <strong key={j}>{run.text}</strong> : <span key={j}>{run.text}</span>))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
