export interface Translations {
  nav: {
    home: string
    posts: string
    destinations: string
    series: string
    about: string
    submit: string
    admin: string
  }
  comments: {
    title: string
    noComments: string
    formTitle: string
    name: string
    emailOptional: string
    content: string
    submit: string
    success: string
    error: string
  }
  home: {
    featuredTitle: string
    recentTitle: string
    viewAll: string
    heroSubtitle: string
    exploreMore: string
  }
  post: {
    readingTime: string
    publishedAt: string
    by: string
    backToPosts: string
    share: string
    copyLink: string
    copied: string
    noPostsFound: string
    filterByTag: string
    filterByDestination: string
    allPosts: string
  }
  series: {
    title: string
    subtitle: string
    part: string
    prev: string
    next: string
    comingSoon: string
    backToSeries: string
  }
  destinations: {
    title: string
    subtitle: string
    posts: string
  }
  tags: {
    postsTagged: string
  }
  footer: {
    newsletter: string
    newsletterPlaceholder: string
    subscribe: string
    subscribeSuccess: string
    subscribeError: string
    rights: string
    madeBy: string
  }
  common: {
    loading: string
    error: string
    notFound: string
    lang: {
      vi: string
      en: string
    }
  }
}

const vi: Translations = {
  nav: {
    home: 'Trang chủ',
    posts: 'Bài viết',
    destinations: 'Điểm đến',
    series: 'Series',
    about: 'Về chúng tôi',
    submit: 'Gửi bài',
    admin: 'Quản trị',
  },
  comments: {
    title: 'Bình luận',
    noComments: 'Chưa có bình luận nào. Hãy là người đầu tiên!',
    formTitle: 'Để lại bình luận',
    name: 'Tên',
    emailOptional: 'Email (không bắt buộc)',
    content: 'Nội dung',
    submit: 'Gửi bình luận',
    success: 'Cảm ơn! Bình luận của bạn đã được gửi và đang chờ duyệt.',
    error: 'Có lỗi xảy ra. Vui lòng thử lại.',
  },
  home: {
    featuredTitle: 'Bài viết nổi bật',
    recentTitle: 'Bài viết mới nhất',
    viewAll: 'Xem tất cả',
    heroSubtitle: 'Chia sẻ hành trình, cảm xúc và những khoảnh khắc đáng nhớ',
    exploreMore: 'Khám phá thêm',
  },
  post: {
    readingTime: 'phút đọc',
    publishedAt: 'Đăng ngày',
    by: 'bởi',
    backToPosts: '← Quay lại danh sách',
    share: 'Chia sẻ',
    copyLink: 'Sao chép liên kết',
    copied: 'Đã sao chép!',
    noPostsFound: 'Chưa có bài viết nào.',
    filterByTag: 'Lọc theo tag',
    filterByDestination: 'Lọc theo điểm đến',
    allPosts: 'Tất cả bài viết',
  },
  series: {
    title: 'Travel Series',
    subtitle: 'Các hành trình nhiều phần',
    part: 'Phần',
    prev: '← Phần trước',
    next: 'Phần sau →',
    comingSoon: 'Sắp ra mắt',
    backToSeries: '← Quay lại series',
  },
  destinations: {
    title: 'Điểm đến',
    subtitle: 'Khám phá những nơi chúng tôi đã đi qua',
    posts: 'bài viết',
  },
  tags: {
    postsTagged: 'Bài viết với tag',
  },
  footer: {
    newsletter: 'Nhận thông báo bài viết mới',
    newsletterPlaceholder: 'Email của bạn',
    subscribe: 'Đăng ký',
    subscribeSuccess: 'Đăng ký thành công!',
    subscribeError: 'Có lỗi xảy ra, vui lòng thử lại.',
    rights: 'Bảo lưu mọi quyền.',
    madeBy: 'Tạo bởi Phan Thanh An',
  },
  common: {
    loading: 'Đang tải...',
    error: 'Có lỗi xảy ra',
    notFound: 'Không tìm thấy',
    lang: {
      vi: 'Tiếng Việt',
      en: 'English',
    },
  },
}

export default vi
