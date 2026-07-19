import fs from "node:fs";

const enPath = "d:/Github/puchidemy/puchi-frontend/messages/en.json";
const viPath = "d:/Github/puchidemy/puchi-frontend/messages/vi.json";

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const vi = JSON.parse(fs.readFileSync(viPath, "utf8"));

function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function flatten(o, p = "") {
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const translations = {
  "Locale.key": "vi",
  "Locale.name": "Tiếng Việt",
  "Locale.siteLanguage": "Ngôn ngữ trang",
  "Error.description":
    "<p>Rất tiếc, đã xảy ra lỗi.</p><p>Bạn có thể thử <retry>tải lại trang</retry> đang xem.</p>",
  "Error.title": "Đã có lỗi xảy ra!",
  "NotFoundPage.description":
    "Hãy kiểm tra lại thanh địa chỉ trình duyệt hoặc dùng điều hướng để đến một trang đã biết.",
  "NotFoundPage.title": "Không tìm thấy trang",
  "Navigation.review": "Ôn tập",
  "Navigation.learn": "Học",
  "Navigation.conversation": "Hội thoại",
  "Navigation.write": "Viết",
  "Navigation.event": "Sự kiện",
  "PublicLayout.title": "Puchi - Thành thạo tiếng Việt. Học mọi lúc mọi nơi.",
  "PublicLayout.description":
    "Puchi là nền tảng tương tác giúp học tiếng Việt vui và cuốn hút. Tham gia để có trải nghiệm học ngôn ngữ dễ chịu.",
  "Hero.continueLearning": "Tiếp tục học",
  "Languages.multiLanguage": "Đa ngôn ngữ",
  "Languages.supportWebsite": "hỗ trợ trên website",
  "Metrics.byThe": "qua những",
  "Metrics.numbers": "con số",
  "Metrics.hoursOfFunContent": "giờ nội dung vui",
  "Metrics.languageCourses": "khóa học ngôn ngữ",
  "Metrics.usersGlobally": "người học toàn cầu",
  "Metrics.fluencyInTwoMonths": "lưu loát sau hai tháng",
  "Reasons.the": "Tương lai",
  "Reasons.future": "của",
  "Reasons.of": "việc",
  "Reasons.learning": "học",
  "Reasons.items": [
    "Học nhanh hơn 5 lần, vui hơn 5 lần",
    "Bài học tùy chỉnh dựa trên khoa học",
    "Thử thách vui để giữ động lực",
    "Dùng Puchi mọi lúc mọi nơi",
  ],
  "Footer.startYourLanguageJourneyHere": "bắt đầu hành trình ngôn ngữ tại đây.",
  "Footer.learnAnytimeLearnAnywhere": "học mọi lúc, học mọi nơi.",
  "Footer.start": "bắt đầu",
  "HelpPage.breadcrumbs.helpCenter": "TRUNG TÂM TRỢ GIÚP",
  "HelpPage.breadcrumbs.home": "TRANG CHỦ",
  "HelpPage.faqTitle": "Câu hỏi thường gặp",
  "HelpPage.sections.usingPuchi": "Dùng Puchi",
  "HelpPage.sections.accountManagement": "Quản lý tài khoản",
  "HelpPage.questions.whatIsStreak": "Streak là gì?",
  "HelpPage.questions.whatAreLeaderboards": "Bảng xếp hạng và giải đấu là gì?",
  "HelpPage.questions.openSourceLibraries": "Puchi có dùng thư viện mã nguồn mở không?",
  "HelpPage.questions.changeUsernameOrEmail":
    "Làm sao đổi tên người dùng hoặc email?",
  "HelpPage.questions.findFollowBlockUsers":
    "Làm sao tìm, theo dõi và chặn người dùng trên Puchi?",
  "HelpPage.answers.whatIsStreak.part1":
    "Streak (biểu tượng ngọn lửa) là số ngày liên tiếp bạn hoàn thành một bài học trên Puchi.",
  "HelpPage.answers.whatIsStreak.part2":
    "Học ngôn ngữ là xây mục tiêu theo thời gian, và streak là cách đã được chứng minh để giữ bạn học và luyện mỗi ngày.",
  "HelpPage.answers.whatIsStreak.part3":
    "Mẹo: Nhắc luyện tập rất hữu ích để nhớ làm bài. Trong cài đặt thông báo bạn có thể bật nhắc luyện và chọn giờ phù hợp.",
  "HelpPage.answers.whatAreLeaderboards.part1":
    "Bảng xếp hạng là cách vui để thi với người học Puchi khác mỗi tuần. Càng kiếm nhiều XP (điểm kinh nghiệm) từ bài học, bạn càng lên hạng. Mỗi tuần bạn sẽ gặp nhóm đối thủ mới. Mở tab Bảng xếp hạng trong ứng dụng để bắt đầu!",
  "HelpPage.answers.openSourceLibraries.part1":
    "Có. Bạn có thể xem ghi nhận mã nguồn mở và tìm hiểu thêm tại",
  "HelpPage.answers.openSourceLibraries.linkText": "trang này",
  "HelpPage.answers.changeUsernameOrEmail.part1":
    "Nếu muốn sửa tên người dùng hoặc email Puchi, hãy vào phần cài đặt",
  "HelpPage.answers.changeUsernameOrEmail.linkText": "vào phần cài đặt",
  "HelpPage.answers.changeUsernameOrEmail.part2":
    "và chỉnh tên người dùng hoặc email. Tên người dùng hiện trên bảng xếp hạng tuần. Nhớ nhấn “Lưu thay đổi” sau khi chỉnh.",
  "HelpPage.answers.findFollowBlockUsers.part1":
    "Bạn có thể kết nối với người học khác trên Puchi!",
  "HelpPage.answers.findFollowBlockUsers.part2":
    "Khi theo dõi ai đó, họ sẽ xuất hiện trong danh sách bạn bè và hai bên có thể cổ vũ nhau giữ mục tiêu ngôn ngữ!!",
  "HelpPage.feedbackPrompt": "Vẫn còn thắc mắc?",
  "HelpPage.sendFeedback": "GỬI PHẢN HỒI",
  "PrivacyPage.title": "Chính sách quyền riêng tư",
  "PrivacyPage.lastRevised":
    "Lưu ý: Chính sách quyền riêng tư được cập nhật lần cuối ngày 10 tháng 11 năm 2024",
  "PrivacyPage.footer": "Cập nhật lần cuối ngày 10 tháng 11 năm 2024",
  "PrivacyPage.sections.general.title": "Chung",
  "PrivacyPage.sections.general.part1":
    "Tại Puchi, chúng tôi coi trọng thông tin cá nhân của bạn, vì vậy đã chuẩn bị Chính sách quyền riêng tư này để giải thích cách chúng tôi thu thập, sử dụng và chia sẻ thông tin.",
  "PrivacyPage.sections.general.part2":
    "Chính sách này áp dụng cho website, ứng dụng di động và các dịch vụ liên quan của Puchi (“Dịch vụ”). Khi dùng Dịch vụ, bạn đồng ý với việc Puchi thu thập, sử dụng và chia sẻ thông tin cá nhân theo các điều khoản của Chính sách này.",
  "PrivacyPage.sections.updates.title": "Cập nhật chính sách",
  "PrivacyPage.sections.updates.part1":
    "Chúng tôi có thể cập nhật Chính sách quyền riêng tư để phản ánh thay đổi trong cách xử lý thông tin.",
  "PrivacyPage.sections.updates.part2":
    "Nếu thay đổi mang tính trọng yếu, chúng tôi sẽ đăng thông báo trên Website ít nhất bảy (7) ngày trước khi áp dụng.",
  "PrivacyPage.sections.retention.title": "Lưu giữ dữ liệu",
  "PrivacyPage.sections.retention.part1":
    "Puchi thường lưu thông tin cá nhân cho đến khi tài khoản bị xóa. Tuy nhiên, Puchi có thể lưu một số thông tin lâu hơn nếu cần để cung cấp Dịch vụ, bảo vệ quyền lợi hợp pháp, tuân thủ pháp luật, giải quyết tranh chấp, điều tra việc lạm dụng hoặc gián đoạn Dịch vụ, hoặc thực hiện thỏa thuận.",
  "PrivacyPage.sections.doNotTrack.title": "Do Not Track",
  "PrivacyPage.sections.doNotTrack.part1":
    "Dịch vụ không được thiết kế để phản hồi tín hiệu “do not track” từ một số trình duyệt.",
  "PrivacyPage.sections.contactUs.title": "Liên hệ",
  "PrivacyPage.sections.contactUs.part1":
    "Puchi, Inc. là bên kiểm soát dữ liệu của bạn theo Quy định Bảo vệ Dữ liệu Chung (“GDPR”) và pháp luật địa phương liên quan.",
  "PrivacyPage.sections.contactUs.part2":
    "Trụ sở Puchi đặt tại Việt Nam:",
  "PrivacyPage.sections.contactUs.part3": "Hà Nội, Việt Nam",
  "PrivacyPage.sections.contactUs.email":
    "Mọi thắc mắc về quyền riêng tư dữ liệu và Chính sách này, vui lòng liên hệ Nhân viên Bảo vệ Dữ liệu tại: lehoan.dev@gmail.com",
  "ProfileActions.actions.title": "Thao tác",
  "ProfileActions.actions.accountSettings.title": "Cài đặt tài khoản",
  "ProfileActions.actions.accountSettings.description":
    "Quản lý thông tin cá nhân và bảo mật",
  "ProfileActions.actions.security.title": "Bảo mật",
  "ProfileActions.actions.security.description":
    "Đổi mật khẩu và xác thực hai bước",
  "ProfileActions.actions.signOut.title": "Đăng xuất",
  "ProfileActions.actions.signOut.description": "Đăng xuất khỏi tài khoản hiện tại",
  "ProfileActions.dangerZone.title": "Vùng nguy hiểm",
  "ProfileActions.dangerZone.deleteAccount.title": "Xóa tài khoản",
  "ProfileActions.dangerZone.deleteAccount.description":
    "Hành động này không thể hoàn tác. Mọi dữ liệu sẽ bị xóa vĩnh viễn.",
  "ProfileActions.deleteAccount.success": "Đã xóa tài khoản thành công",
  "ProfileActions.deleteAccount.error.confirmationRequired":
    "Vui lòng nhập 'DELETE' để xác nhận",
  "ProfileActions.deleteAccount.error.general":
    "Đã xảy ra lỗi khi xóa tài khoản",
  "ProfileActions.deleteAccount.dialog.title": "Xác nhận xóa tài khoản",
  "ProfileActions.deleteAccount.dialog.description":
    "Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn.",
  "ProfileActions.deleteAccount.dialog.confirmation":
    "Để xác nhận, hãy nhập <strong>DELETE</strong> vào ô bên dưới.",
  "ProfileActions.deleteAccount.dialog.confirmationLabel": "Xác nhận",
  "ProfileActions.deleteAccount.dialog.confirmationPlaceholder":
    "Nhập DELETE để xác nhận",
  "ProfileActions.deleteAccount.dialog.cancel": "Hủy",
  "ProfileActions.deleteAccount.dialog.confirm": "Xóa tài khoản",
  "ProfileActions.deleteAccount.dialog.deleting": "Đang xóa...",
  "ProfileHeader.title": "Thông tin cá nhân",
  "ProfileHeader.email": "Email",
  "ProfileHeader.username": "Tên người dùng",
  "ProfileHeader.joinDate": "Ngày tham gia",
  "ProfileHeader.member": "Thành viên",
  "ProfileForm.title": "Chỉnh sửa thông tin",
  "ProfileForm.edit": "Sửa",
  "ProfileForm.save": "Lưu",
  "ProfileForm.firstName": "Tên",
  "ProfileForm.lastName": "Họ",
  "ProfileForm.username": "Tên người dùng",
  "ProfileForm.email": "Email",
  "ProfileForm.emailNote":
    "Không thể đổi email. Vui lòng liên hệ hỗ trợ nếu bạn cần thay đổi.",
  "ProfileForm.bio": "Tiểu sử",
  "ProfileForm.bioPlaceholder": "Giới thiệu bản thân với mọi người...",
  "ProfileForm.bioNote": "Chia sẻ vài dòng để người khác hiểu bạn hơn.",
  "ProfileForm.success": "Đã cập nhật thông tin thành công!",
  "ProfileForm.error": "Đã xảy ra lỗi khi cập nhật thông tin",
  "ProfileStats.learningStats.title": "Thống kê học tập",
  "ProfileStats.progress.title": "Tiến độ học tập",
  "ProfileStats.progress.completedLessons": "Bài đã hoàn thành",
  "ProfileStats.progress.completed": "{count} bài đã hoàn thành",
  "ProfileStats.progress.remaining": "Còn {count} bài",
  "ProfileStats.performance.title": "Hiệu suất học tập",
  "ProfileStats.performance.averageAccuracy": "Độ chính xác trung bình",
  "ProfileStats.performance.excellent": "Xuất sắc",
  "ProfileStats.performance.needsImprovement": "Cần cải thiện",
  "ProfileStats.stats.completedLessons": "Đã hoàn thành",
  "ProfileStats.stats.currentStreak": "Streak hiện tại",
  "ProfileStats.stats.streakDays": "{days} ngày",
  "ProfileStats.stats.totalXP": "Tổng XP",
  "ProfileStats.stats.currentLevel": "Cấp hiện tại",
  "ProfileStats.stats.level": "Cấp {level}",
  "Profile.social.friends": "Bạn bè",
  "Profile.social.followers": "Người theo dõi",
  "Profile.social.following": "Đang theo dõi",
  "Profile.social.leaderboard": "Bảng xếp hạng tuần",
  "Profile.social.friendsList": "Danh sách bạn bè",
};

// Polish AboutPage Vietnamese (full, natural)
const aboutVi = {
  metaTitle: "Về Puchi",
  metaDescription:
    "Tìm hiểu về Puchi: câu chuyện nguồn gốc, tính cách, đặc điểm nhận diện và ý nghĩa của lá tre.",
  brand: "Puchi",
  tagline: "Về Puchi",
  heroHeadline: "Câu chuyện phía sau chú gấu trúc học tiếng Việt.",
  heroLead:
    "Từ khu rừng tre đến từng bài học — Puchi là ai, vì sao chúng mình tạo ra người bạn này, và nhân vật lớn lên cùng bạn thế nào.",
  heroImageAlt: "Puchi — chú gấu trúc đồng hành học tiếng Việt đang đứng vui vẻ",
  ctaStart: "Bắt đầu học",
  communityShort:
    "<facebookLink>Facebook</facebookLink> · <githubLink>GitHub</githubLink>",
  storyEyebrow: "Câu chuyện",
  storyTitle: "Câu chuyện của Puchi",
  storyOrigin:
    "Puchi sinh ra trong một khu rừng tre xanh mát — ánh sáng dịu, lá tre thì thầm, và sự tò mò không ngừng.",
  storyDream:
    "Ước mơ của Puchi là giúp mọi người trên thế giới nói được tiếng Việt và hiểu văn hóa Việt Nam.",
  storyGrowth:
    "Mỗi lần bạn học và tiến bộ, mầm lá trên đầu Puchi lớn thêm — khu rừng tre của bạn cũng xanh hơn.",
  storyImageAlt: "Puchi với hai lá tre — giai đoạn đang học",
  personalityEyebrow: "Tính cách",
  personalityTitle: "Puchi hiện diện thế nào.",
  personalityLead:
    "Sáu tính cách từ hệ thống thương hiệu — giọng nói trong mỗi bài học, lời cổ vũ và cú huých nhẹ nhàng.",
  personality: {
    curious: "Tò mò",
    friendly: "Thân thiện",
    energetic: "Năng động",
    smart: "Thông minh",
    persistent: "Kiên trì",
    humorous: "Hài hước",
  },
  keywordsEyebrow: "Từ khóa thương hiệu",
  keywordsTitle: "Những từ chúng mình thiết kế quanh.",
  keywords: {
    cute: "Dễ thương",
    friendly: "Thân thiện",
    smart: "Thông minh",
    inspiring: "Truyền cảm hứng",
    energetic: "Năng động",
    fun: "Vui nhộn",
  },
  signatureEyebrow: "Đặc điểm nhận diện",
  signatureTitle: "Vì sao Puchi trông như vậy.",
  signatureLead:
    "Mỗi chi tiết từ hệ thống thương hiệu đều mang ý nghĩa — không phải trang trí cho có.",
  signature: {
    leaf: {
      title: "Lá tre trên đầu",
      description:
        "Biểu tượng của sự trưởng thành và tiến bộ. Lá đánh dấu bạn đã đi được bao xa.",
    },
    scarf: {
      title: "Khăn quàng P",
      description: "Dấu hiệu thương hiệu luôn đồng hành cùng Puchi — luôn ở bên bạn.",
    },
    backpack: {
      title: "Balo tre",
      description: "Luôn sẵn sàng khám phá, luyện tập và học điều mới.",
    },
    eyes: {
      title: "Mắt cười",
      description: "Thân thiện, tích cực và luôn khích lệ người học.",
    },
    belly: {
      title: "Bụng tre",
      description: "Tình yêu với thiên nhiên và văn hóa Việt Nam.",
    },
  },
  meetEyebrow: "Gặp Puchi",
  meetTitle: "Bạn đồng hành, không phải bài giảng.",
  meetLead:
    "Cùng một dáng hình, nhiều tâm trạng — chào hỏi, tò mò, tự hào, và bàn chân chỉ đường.",
  poses: {
    wave: { label: "Xin chào", alt: "Puchi vẫy chào" },
    think: {
      label: "Tò mò",
      alt: "Puchi chăm chú lắng nghe với tai nghe",
    },
    celebrate: { label: "Tự hào", alt: "Puchi reo hò vui mừng" },
    guide: { label: "Cùng bạn", alt: "Puchi chỉ đường phía trước" },
  },
  leavesEyebrow: "Lá tre",
  leavesTitle: "Lá lớn lên cùng bạn.",
  leavesLead:
    "Theo hệ thống thương hiệu: mỗi lá tre đánh dấu tiến bộ học — từ lần chào đầu đến lúc vững vàng.",
  leaves: {
    stages: {
      0: {
        title: "Khám phá",
        description: "Vừa mới đến. Không áp lực — chỉ cần tò mò.",
        alt: "Puchi ở giai đoạn khám phá",
      },
      1: {
        title: "Mới bắt đầu",
        description: "Bài đầu tiên. Một chiếc lá nhỏ của tiến bộ.",
        alt: "Puchi học sinh mới bắt đầu",
      },
      2: {
        title: "Đang học",
        description: "Luyện mỗi ngày. Hai lá vững vàng.",
        alt: "Puchi luyện tập hàng ngày",
      },
      3: {
        title: "Vững vàng",
        description: "Cột mốc tốt nghiệp. Áo mũ cử nhân và ba lá rực rỡ.",
        alt: "Puchi mặc áo mũ tốt nghiệp với ba lá tre",
      },
    },
  },
  missionTitle: "Tiếng Việt gắn với đời thật.",
  missionLead:
    "Puchi giúp người học khắp nơi xây dựng tiếng Việt qua luyện tập ngắn, vui — mọi lúc, mọi nơi.",
  creator: "Tạo bởi Lê Công Hoan.",
  community:
    "Tham gia cộng đồng trên <facebookLink>Facebook</facebookLink> hoặc xem mã nguồn trên <githubLink>GitHub</githubLink>.",
  sheetLink: "Xem bảng hệ thống thương hiệu đầy đủ",
  signatureStripAlt:
    "Năm đặc điểm nhận diện của Puchi: lá tre, khăn P, balo, mắt cười, bụng tre",
};

const ef = flatten(en);
const vf = flatten(vi);
let filled = 0;
for (const key of Object.keys(ef)) {
  if (!(key in vf)) {
    if (key in translations) {
      setPath(vi, key, translations[key]);
      filled++;
    } else {
      // Fallback: keep English so runtime never misses a key
      setPath(vi, key, ef[key]);
      filled++;
      console.warn("fallback EN:", key);
    }
  }
}

vi.AboutPage = aboutVi;
vi.Locale = { key: "vi", name: "Tiếng Việt", siteLanguage: "Ngôn ngữ trang" };

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2) + "\n");
console.log("filled/updated keys:", filled);
console.log("vi AboutPage keys:", Object.keys(vi.AboutPage).length);
