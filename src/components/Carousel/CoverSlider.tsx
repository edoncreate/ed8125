import { A11y, Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Image } from '../../data/types'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/a11y'
import './Carousel.css'

type Props = {
  images: Image[]
  className?: string
  'data-ref'?: string
}

/**
 * Elementor image carousel with one slide per view: dots, 10s autoplay that
 * pauses on hover/interaction, infinite loop. A single image renders static.
 */
export function CoverSlider({ images, className, ...rest }: Props) {
  const multiple = images.length > 1
  return (
    <Swiper
      className={['carousel', 'carousel--single', className].filter(Boolean).join(' ')}
      modules={[A11y, Pagination, Autoplay]}
      slidesPerView={1}
      speed={500}
      loop={multiple}
      pagination={multiple ? { clickable: true } : false}
      autoplay={multiple ? { delay: 10000, pauseOnMouseEnter: true, disableOnInteraction: true } : false}
      allowTouchMove={multiple}
      {...rest}
    >
      {images.map((img) => (
        <SwiperSlide key={img.src}>
          <img className="carousel__img" src={img.src} alt={img.alt} width={img.width} height={img.height} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
