import { SITE_NAME } from '@/config/site'

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
  about: {
    title: string
    subtitle: string
    bio: string
    statsTitle: string
    statCountries: string
    statPosts: string
    statYears: string
    mapTitle: string
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
    all: string
    viewOriginal: string
    viewTranslation: string
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
  submit: {
    title: string
    description: string
    sectionAuthor: string
    fieldName: string
    sectionPost: string
    fieldTitle: string
    fieldExcerpt: string
    excerptHint: string
    fieldCover: string
    coverHint: string
    coverDelete: string
    coverUploading: string
    coverChoose: string
    sectionContent: string
    contentHint: string
    buttonSubmit: string
    buttonSubmitting: string
    buttonAnother: string
    successTitle: string
    successMsg: string
    errorRequired: string
    errorTooLarge: string
    errorFailed: string
    errorGeneral: string
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
    about: 'Về tác giả',
    submit: 'Gửi bài',
    admin: 'Quản trị',
  },
  about: {
    title: 'Về tác giả',
    subtitle: 'Phan Thanh An — sinh năm 1993',
    bio: `Xin chào! Mình là Phan Thanh An, sinh năm 1993 tại Việt Nam. ${SITE_NAME} là nơi mình lưu giữ những hành trình, cảm xúc và kỷ niệm đáng nhớ trong những chuyến đi. Mình tin rằng du lịch không chỉ là đến nơi đẹp — mà là khám phá bản thân, hiểu thêm về thế giới và kết nối với con người.`,
    statsTitle: 'Hành trình của mình',
    statCountries: 'Quốc gia đã đến',
    statPosts: 'Bài viết',
    statYears: 'Năm khám phá',
    mapTitle: 'Những nơi đã đặt chân',
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
    all: 'Tất cả',
    viewOriginal: 'Hiển thị nội dung gốc',
    viewTranslation: 'Xem bản dịch',
  },
  series: {
    title: 'Chuỗi hành trình',
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
  submit: {
    title: 'Gửi bài viết',
    description: `Chia sẻ hành trình của bạn với cộng đồng ${SITE_NAME}. Bài viết sẽ được admin xem xét và duyệt trước khi xuất bản.`,
    sectionAuthor: 'Thông tin tác giả',
    fieldName: 'Họ tên',
    sectionPost: 'Bài viết',
    fieldTitle: 'Tiêu đề',
    fieldExcerpt: 'Mô tả ngắn',
    excerptHint: '(tùy chọn — hiện trên trang danh sách)',
    fieldCover: 'Ảnh bìa',
    coverHint: '(tùy chọn — tối đa 5MB)',
    coverDelete: 'Xóa',
    coverUploading: 'Đang tải lên...',
    coverChoose: 'Nhấn để chọn ảnh bìa',
    sectionContent: 'Nội dung bài viết',
    contentHint: 'Viết nội dung bằng tiếng Việt. Bạn có thể chèn ảnh trực tiếp vào bài.',
    buttonSubmit: 'Gửi bài viết',
    buttonSubmitting: 'Đang gửi...',
    buttonAnother: 'Gửi bài viết khác',
    successTitle: 'Gửi bài thành công!',
    successMsg: 'Cảm ơn bạn đã chia sẻ hành trình của mình. Bài viết của bạn đang chờ được admin xem xét và sẽ được xuất bản sớm nhất có thể.',
    errorRequired: 'Vui lòng điền đầy đủ tên, email, tiêu đề và nội dung bài viết.',
    errorTooLarge: 'Ảnh bìa tối đa 5MB.',
    errorFailed: 'Gửi bài thất bại',
    errorGeneral: 'Có lỗi xảy ra, vui lòng thử lại.',
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
