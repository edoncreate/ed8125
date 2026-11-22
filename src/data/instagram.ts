import type { InstagramPost } from './types'

// Static snapshot of the last Instagram feed the old site cached
// (wp-content/uploads/sb-instagram-feed-images). The live feed needs an API token.

export const instagramHandle = 'ed8125'

export const instagramPosts: InstagramPost[] = [
  { image: '/media/img/instagram/post-1.jpg', href: 'https://www.instagram.com/tv/CeHEP9XIYgq/', isVideo: true },
  { image: '/media/img/instagram/post-2.jpg', href: 'https://www.instagram.com/p/CblKyB-orkI/', isVideo: true },
  { image: '/media/img/instagram/post-3.jpg', href: 'https://www.instagram.com/p/Ca3PJYbo1t-/', isVideo: false },
  { image: '/media/img/instagram/post-4.jpg', href: 'https://www.instagram.com/tv/CXOOaFmISUB/', isVideo: true },
]
