import { Link } from 'react-router-dom'
import { A11y, Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { CoverLink } from '../../data/types'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/a11y'
import './Carousel.css'

type Props = {
  items: CoverLink[]
  className?: string
  'data-ref'?: string
}

/** Beat covers: 2 / 4 (≥768px) / 5 (≥1025px) per view, 20px apart, dots, 10s autoplay, loop. */
export function BeatsCarousel({ items, className, ...rest }: Props) {
  return (
    <Swiper
      className={['carousel', 'carousel--beats', className].filter(Boolean).join(' ')}
      modules={[A11y, Pagination, Autoplay]}
      slidesPerView={2}
      spaceBetween={20}
      breakpoints={{ 768: { slidesPerView: 4 }, 1025: { slidesPerView: 5 } }}
      speed={500}
      loop
      pagination={{ clickable: true }}
      autoplay={{ delay: 10000, pauseOnMouseEnter: true, disableOnInteraction: true }}
      {...rest}
    >
      {items.map((item) => (
        <SwiperSlide key={item.cover}>
          <Link to={item.href} className="carousel__link">
            <img className="carousel__img" src={item.cover} alt={item.alt} width={560} height={560} loading="lazy" />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
