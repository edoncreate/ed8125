import { Reveal } from '../../components/Reveal/Reveal'
import { InstagramIcon, PlayIcon } from '../../components/icons'
import { instagramHandle, instagramPosts } from '../../data/instagram'
import { site } from '../../data/site'

/** Static replica of the Smash Balloon Instagram feed block. */
function InstagramFeed() {
  return (
    <div className="ig" data-ref="social-feed">
      <div className="ig__header">
        <a href={site.social.instagram} className="ig__profile">
          <span className="ig__avatar">
            <InstagramIcon />
          </span>
          <h3 className="ig__handle">{instagramHandle}</h3>
        </a>
      </div>
      <div className="ig__grid">
        {instagramPosts.map((post) => (
          <div key={post.href} className="ig__item">
            <a className="ig__photo" href={post.href} target="_blank" rel="noopener noreferrer">
              <img src={post.image} alt={`Instagram post by ${instagramHandle}`} loading="lazy" />
              {post.isVideo && (
                <span className="ig__play" aria-hidden="true">
                  <PlayIcon />
                </span>
              )}
            </a>
          </div>
        ))}
      </div>
      <div className="ig__footer">
        <a className="ig__follow" href={site.social.instagram} target="_blank" rel="noopener noreferrer">
          <InstagramIcon />
          Follow
        </a>
      </div>
    </div>
  )
}

export function Social() {
  return (
    <section className="section social" data-ref="section-social">
      <div className="container container--padded">
        <Reveal as="h2" className="section-heading" data-ref="social-heading">
          Social
        </Reveal>
        <InstagramFeed />
      </div>
    </section>
  )
}
