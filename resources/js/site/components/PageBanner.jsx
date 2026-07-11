import Pearls from './Pearls'

export default function PageBanner({ eyebrow, title, intro, image }) {
  return (
    <section className="page-banner">
      <img src={image} alt="" className="page-banner__img" />
      <div className="page-banner__scrim" />
      <div className="container page-banner__inner">
        <p className="eyebrow page-banner__eyebrow">
          <Pearls /> {eyebrow}
        </p>
        <h1>{title}</h1>
        <p className="page-banner__intro">{intro}</p>
      </div>
    </section>
  )
}
