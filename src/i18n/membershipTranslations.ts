export type SiteLanguage = 'en' | 'ur';

export interface BilingualText {
  en: string;
  ur: string;
}

export const MEMBERSHIP_COPY = {
  // Header & Footer shared labels
  nav: {
    work: { en: 'Work', ur: 'کام' },
    solutions: { en: 'Solutions', ur: 'سروسز' },
    services: { en: 'Services', ur: 'خدمات' },
    pricing: { en: 'Pricing', ur: 'پرائسنگ' },
    resources: { en: 'Resources', ur: 'معلومات' },
    dramas: { en: 'Turkish Dramas', ur: 'ترکی ڈرامے' },
    membership: { en: 'Membership', ur: 'ممبرشپ' },
    about: { en: 'About Us', ur: 'ہمارے بارے میں' },
    login: { en: 'Login', ur: 'لاگ ان' },
    startProject: { en: 'Start a Project', ur: 'پروجیکٹ شروع کریں' },
    allDramas: { en: 'All Turkish Dramas Directory', ur: 'تمام ترکی ڈرامے' },
    premiumMembership: { en: 'FEVIQO Premium Membership', ur: 'فیویکو پریمیم ممبرشپ' },
  },

  footer: {
    tagline: {
      en: 'Unlimited professional video editing service for creators, businesses, and high-growth brands worldwide.',
      ur: 'کریئیٹرز، برانڈز اور ترک ڈراموں کے شائقین کے لیے معیاری ویڈیو اسٹریمنگ اور پروڈکشن پلیٹ فارم۔',
    },
    servicesHeading: { en: 'Services & Platform', ur: 'خدمات اور پلیٹ فارم' },
    solutionsHeading: { en: 'Solutions', ur: 'سولیوشنز' },
    dramasHeading: { en: 'Trending Dramas & Episodes', ur: 'مقبول ترکی ڈرامے اور اقساط' },
    supportHeading: { en: 'Resources & Support', ur: 'مدد اور رابطہ' },
    membershipLink: { en: 'Premium Drama Membership', ur: 'پریمیم ڈرامہ ممبرشپ' },
    privacyPolicy: { en: 'Privacy Policy', ur: 'پرائیویسی پالیسی' },
    termsOfService: { en: 'Terms of Service', ur: 'سروس کی شرائط' },
    adminFlowPortal: { en: 'Admin & Flow Portal', ur: 'ایڈمن اور فلو پورٹل' },
    copyright: {
      en: '© 2026 FEVIQO Ltd. All rights reserved. Registered Creative Production Studio.',
      ur: '© 2026 FEVIQO Ltd. جملہ حقوق محفوظ ہیں۔',
    },
  },

  subbar: {
    membershipTab: { en: 'Membership Plans', ur: 'ممبرشپ پلانز' },
    myAccountTab: { en: 'My Account', ur: 'میرا اکاؤنٹ' },
    signInSignUp: { en: 'Sign In / Create Account', ur: 'سائن ان / نیا اکاؤنٹ بنائیں' },
    signOut: { en: 'Sign Out', ur: 'لاگ آؤٹ' },
  },

  hero: {
    eyebrow: { en: 'FEVIQO PREMIUM MEMBERSHIP', ur: 'فیویکو پریمیم ممبرشپ' },
    title: {
      en: 'Your Favourite Turkish Dramas. In Urdu.',
      ur: 'اپنے پسندیدہ ترکی ڈرامے اردو میں دیکھیں۔',
    },
    subtitleUrLine: 'اپنے پسندیدہ ترکی ڈرامے اردو ڈبنگ میں دیکھیں۔',
    description: {
      en: 'Choose the exact series you follow or unlock the full eligible VIP catalogue with Urdu dubbing—built for smooth, high-definition viewing across Pakistan.',
      ur: 'اپنے پسندیدہ ترکی ڈرامے منتخب کریں یا تمام دستیاب VIP ڈرامے اردو ڈبنگ کے ساتھ ہائی کوالٹی میں دیکھیں۔',
    },
    exploreMemberships: { en: 'Explore Memberships', ur: 'ممبرشپ پلانز دیکھیں' },
    exploreDramas: { en: 'Explore Dramas', ur: 'ڈرامے دیکھیں' },
  },

  howItWorks: {
    eyebrow: { en: 'How Membership Works', ur: 'ممبرشپ کیسے کام کرتی ہے' },
    heading: { en: 'Your Membership. Your Choice.', ur: 'آپ کی ممبرشپ، آپ کا انتخاب۔' },
    step1Title: { en: '01 — Choose Your Dramas', ur: '01 — اپنے ڈرامے منتخب کریں' },
    step1Desc: {
      en: 'Pick the membership tier that matches how you watch, then choose one or two specific Turkish dramas—or unlock all eligible VIP titles at once.',
      ur: 'اپنی پسند کا پلان منتخب کریں، پھر ایک یا دو ترکی ڈرامے چنیں یا تمام دستیاب VIP ڈرامے ان لاک کریں۔',
    },
    step2Title: { en: '02 — Pay via Bank QR & Upload Proof', ur: '02 — بینک QR سے ادائیگی اور ثبوت اپ لوڈ کریں' },
    step2Desc: {
      en: 'Sign in or create your personal FEVIQO account, scan the plan-specific Bank QR code to pay the exact PKR amount, and upload your payment screenshot.',
      ur: 'اپنا ذاتی اکاؤنٹ بنائیں یا سائن ان کریں، پلان کا بینک QR کوڈ اسکین کر کے مقررہ رقم ادا کریں اور ادائیگی کا اسکرین شاٹ اپ لوڈ کریں۔',
    },
    step3Title: { en: '03 — Verified Activation & New Episodes', ur: '03 — تصدیق کے بعد ایکٹیویشن اور نئی اقساط' },
    step3Desc: {
      en: 'Once our team verifies your receipt, your 15-day or 30-day membership activates with instant access to all eligible current and upcoming episodes.',
      ur: 'ہماری ٹیم کی تصدیق کے بعد آپ کی 15 یا 30 دن کی ممبرشپ فعال ہو جاتی ہے اور تمام موجودہ و نئی اقساط کھل جاتی ہیں۔',
    },
  },

  plans: {
    heading: { en: 'Choose Your Membership', ur: 'اپنی ممبرشپ منتخب کریں' },
    subheading: {
      en: 'The right membership for the dramas you want to watch.',
      ur: 'اپنے پسندیدہ ترکی ڈراموں کے لیے بہترین پلان منتخب کریں۔',
    },
    mostPopular: { en: 'Most Popular', ur: 'سب سے مقبول' },
    selectedSuffix: { en: 'Selected', ur: 'منتخب شدہ' },
    items: {
      starter: {
        name: { en: 'Starter', ur: 'اسٹارٹر (Starter)' },
        durationLabel: { en: '15 Days', ur: '15 دن' },
        inclusionText: { en: '1 drama included', ur: '1 ڈرامہ شامل ہے' },
        summary: {
          en: 'Follow one selected Turkish drama with 15 days of member access.',
          ur: '15 دن کے لیے اپنی پسند کے کسی ایک ترکی ڈرامے تک مکمل رسائی حاصل کریں۔',
        },
        ctaLabel: { en: 'Choose Starter', ur: 'اسٹارٹر منتخب کریں' },
      },
      standard: {
        name: { en: 'Standard', ur: 'اسٹینڈرڈ (Standard)' },
        durationLabel: { en: '30 Days', ur: '30 دن' },
        inclusionText: { en: '1 drama included', ur: '1 ڈرامہ شامل ہے' },
        summary: {
          en: 'Full 30-day access to your chosen Turkish series and every new episode added.',
          ur: '30 دن کے لیے اپنے منتخب ترکی ڈرامے اور ہر نئی قسط تک مکمل رسائی۔',
        },
        ctaLabel: { en: 'Choose Standard', ur: 'اسٹینڈرڈ منتخب کریں' },
      },
      plus: {
        name: { en: 'Plus', ur: 'پلس (Plus)' },
        durationLabel: { en: '30 Days', ur: '30 دن' },
        inclusionText: { en: '2 dramas included', ur: '2 ڈرامے شامل ہیں' },
        summary: {
          en: 'Select any two Turkish series from the catalogue for 30 continuous days.',
          ur: 'مسلسل 30 دن کے لیے کیٹلاگ سے کوئی سے دو ترکی ڈرامے منتخب کریں۔',
        },
        ctaLabel: { en: 'Choose Plus', ur: 'پلس منتخب کریں' },
      },
      vip: {
        name: { en: 'VIP', ur: 'وی آئی پی (VIP)' },
        durationLabel: { en: '30 Days', ur: '30 دن' },
        inclusionText: { en: 'All eligible VIP catalogue dramas', ur: 'تمام دستیاب VIP ڈرامے شامل' },
        summary: {
          en: 'Unrestricted 30-day access across the entire eligible VIP Urdu drama catalogue.',
          ur: '30 دن کے لیے اردو ڈبنگ میں تمام دستیاب VIP ترکی ڈراموں تک مکمل رسائی۔',
        },
        ctaLabel: { en: 'Choose VIP', ur: 'وی آئی پی منتخب کریں' },
      },
    },
  },

  dramaSelection: {
    stepEyebrow: { en: 'Step 2', ur: 'مرحلہ 2' },
    allVipHeading: {
      en: 'All Eligible VIP Catalogue Dramas Included',
      ur: 'تمام دستیاب VIP ڈرامے شامل ہیں',
    },
    selectOneHeading: {
      en: 'Select 1 Drama for Your Membership',
      ur: 'اپنی ممبرشپ کے لیے 1 ڈرامہ منتخب کریں',
    },
    selectTwoHeading: {
      en: 'Select 2 Dramas for Your Membership',
      ur: 'اپنی ممبرشپ کے لیے 2 ڈرامے منتخب کریں',
    },
    vipDesc: {
      en: 'Your VIP plan unlocks every eligible Turkish series below for 30 days.',
      ur: 'آپ کا VIP پلان نیچے دیے گئے تمام دستیاب ترکی ڈراموں کو 30 دن کے لیے کھولتا ہے۔',
    },
    chooseCountDesc: {
      en: 'Choose from the official FEVIQO Urdu-dubbed catalogue.',
      ur: 'آفیشل فیویکو اردو ڈبنگ کیٹلاگ سے ڈرامہ منتخب کریں۔',
    },
    includedVip: { en: 'Included with VIP', ur: 'VIP میں شامل' },
    selectedForMembership: { en: 'Selected for Membership', ur: 'ممبرشپ کے لیے منتخب' },
    selectDrama: { en: 'Select Drama', ur: 'ڈرامہ منتخب کریں' },
    episodes: { en: 'Episodes', ur: 'اقساط' },
    urduDubbed: { en: 'Urdu Dubbed', ur: 'اردو ڈبنگ' },
    signedInAs: { en: 'Signed in as', ur: 'سائن ان اکاؤنٹ:' },
    guestCheckoutNote: {
      en: 'Sign in or create your FEVIQO account next to proceed to Bank QR payment.',
      ur: 'بینک QR ادائیگی کے لیے اگلے مرحلے میں سائن ان یا نیا اکاؤنٹ بنائیں۔',
    },
    proceedToPayment: { en: 'Continue to Bank QR Payment', ur: 'بینک QR ادائیگی پر جائیں' },
    continueSignInCheckout: {
      en: 'Continue to Sign In and Checkout',
      ur: 'سائن ان اور چیک آؤٹ جاری رکھیں',
    },
    preparingCheckout: { en: 'Preparing Payment Screen...', ur: 'ادائیگی کا صفحہ تیار ہو رہا ہے...' },
  },

  auth: {
    eyebrow: { en: 'FEVIQO Account', ur: 'فیویکو اکاؤنٹ' },
    createTitle: { en: 'Create your account', ur: 'نیا اکاؤنٹ بنائیں' },
    signInTitle: { en: 'Sign in to FEVIQO', ur: 'فیویکو میں سائن ان کریں' },
    subtitlePending: {
      en: 'Your chosen plan and selected drama(s) are saved and will carry straight to the Bank QR payment screen.',
      ur: 'آپ کا منتخب پلان اور ڈرامے محفوظ ہیں اور سائن ان کے فوراً بعد بینک QR ادائیگی پر جائیں گے۔',
    },
    subtitleGeneral: {
      en: 'Access your FEVIQO Premium Membership, selected dramas, and payment history.',
      ur: 'اپنی فیویکو پریمیم ممبرشپ، منتخب ڈرامے اور ادائیگی کی تفصیلات دیکھیں۔',
    },
    createTab: { en: 'Create Account', ur: 'نیا اکاؤنٹ' },
    signInTab: { en: 'Sign In', ur: 'سائن ان' },
    fullName: { en: 'Full Name', ur: 'مکمل نام' },
    fullNamePlaceholder: { en: 'e.g. Hamza Tariq', ur: 'مثلاً حمزہ طارق' },
    email: { en: 'Email Address', ur: 'ای میل ایڈریس' },
    phone: { en: 'Phone Number', ur: 'فون نمبر' },
    phonePlaceholder: { en: '0300 1234567 or +92 300 1234567', ur: '0300 1234567 یا +92 300 1234567' },
    password: { en: 'Password', ur: 'پاس ورڈ' },
    passwordPlaceholder: { en: 'Minimum 6 characters', ur: 'کم از کم 6 حروف' },
    confirmPassword: { en: 'Confirm Password', ur: 'پاس ورڈ کی تصدیق کریں' },
    confirmPasswordPlaceholder: { en: 'Re-enter your password', ur: 'پاس ورڈ دوبارہ درج کریں' },
    createButton: { en: 'Create Account & Continue', ur: 'اکاؤنٹ بنائیں اور آگے بڑھیں' },
    signInButton: { en: 'Sign In & Continue', ur: 'سائن ان کریں اور آگے بڑھیں' },
    creating: { en: 'Creating account...', ur: 'اکاؤنٹ بن رہا ہے...' },
    signingIn: { en: 'Signing in...', ur: 'سائن ان ہو رہا ہے...' },
  },

  payment: {
    stepTitle: { en: 'Complete Your Bank QR Payment', ur: 'بینک QR کے ذریعے ادائیگی مکمل کریں' },
    orderSummaryHeading: { en: 'Payment Details', ur: 'ادائیگی کی تفصیلات' },
    planLabel: { en: 'Selected Plan', ur: 'منتخب پلان' },
    dramasLabel: { en: 'Selected Drama(s)', ur: 'منتخب ڈرامے' },
    totalAmountLabel: { en: 'Total Amount', ur: 'کل رقم' },
    durationLabel: { en: 'Duration', ur: 'مدت' },
    customerNameLabel: { en: 'Customer Name', ur: 'کسٹمر کا نام' },
    customerEmailLabel: { en: 'Customer Email', ur: 'کسٹمر ای میل' },
    paymentStatusLabel: { en: 'Payment Status', ur: 'ادائیگی کی کیفیت' },
    requestIdLabel: { en: 'Payment Request ID', ur: 'ریکویسٹ آئی ڈی' },
    qrHeading: { en: 'Scan Bank QR Code', ur: 'بینک QR کوڈ اسکین کریں' },
    downloadQr: { en: 'Save / Download QR Code', ur: 'QR کوڈ محفوظ / ڈاؤن لوڈ کریں' },
    scanInstructionEn: 'Scan this QR code using your banking app and pay the exact amount shown.',
    scanInstructionUr: 'اپنی بینکنگ ایپ سے اس QR کوڈ کو اسکین کریں اور بالکل اتنی ہی رقم ادا کریں جتنی یہاں درج ہے۔',
    mobileNoteEn:
      'Paying from the same mobile phone? Save/download this QR code and open it inside a banking or wallet app that supports scanning QR codes from your phone gallery, or scan it using a second device.',
    mobileNoteUr:
      'اگر آپ اسی موبائل فون سے ادائیگی کر رہے ہیں تو یہ QR کوڈ محفوظ/ڈاؤن لوڈ کریں اور اپنی بینکنگ ایپ کے گیلری QR اسکین فیچر سے کھولیں، یا کسی دوسرے فون سے اسکین کریں۔',
    proofHeading: { en: 'Upload Payment Proof', ur: 'ادائیگی کا ثبوت (اسکرین شاٹ) اپ لوڈ کریں' },
    uploadInstructionEn: 'After paying, please upload a clear screenshot of your payment confirmation.',
    uploadInstructionUr: 'ادائیگی کے بعد، براہ کرم ادائیگی کی تصدیق کا واضح اسکرین شاٹ اپ لوڈ کریں۔',
    allowedFormats: {
      en: 'Accepted formats: JPG, JPEG, PNG, WebP (Max 8 MB)',
      ur: 'منظور شدہ فارمیٹس: JPG, JPEG, PNG, WebP (زیادہ سے زیادہ 8 MB)',
    },
    chooseScreenshot: { en: 'Choose Payment Screenshot', ur: 'اسکرین شاٹ منتخب کریں' },
    replaceScreenshot: { en: 'Replace Screenshot', ur: 'اسکرین شاٹ تبدیل کریں' },
    noteLabel: { en: 'Transaction Reference or Note (Optional)', ur: 'ٹرانزیکشن ریفرنس یا نوٹ (اختیاری)' },
    notePlaceholder: {
      en: 'Optional: Bank name or transaction reference ID',
      ur: 'اختیاری: بینک کا نام یا ٹرانزیکشن ریفرنس آئی ڈی',
    },
    submitProof: { en: 'Submit Payment Proof', ur: 'ادائیگی کا ثبوت جمع کروائیں' },
    submittingProof: { en: 'Uploading Proof...', ur: 'ثبوت اپ لوڈ ہو رہا ہے...' },
    pendingConfirmEn:
      'Your payment proof has been submitted and is currently pending verification. Your membership will be activated once verified by our team.',
    pendingConfirmUr:
      'آپ کی ادائیگی کا ثبوت جمع ہو چکا ہے اور اس وقت تصدیق کے مرحلے میں ہے۔ ہماری ٹیم کی تصدیق کے بعد آپ کی ممبرشپ فعال کر دی جائے گی۔',
    whatsappAltHeading: { en: 'Optional Secondary Option', ur: 'متبادل آپشن (واٹس ایپ)' },
    whatsappButton: { en: 'Send Payment Proof via WhatsApp', ur: 'واٹس ایپ کے ذریعے ادائیگی کا ثبوت بھیجیں' },
    whatsappNoteEn:
      'Note: Please upload your screenshot on this page first if possible. If sending via WhatsApp, remember to attach your payment screenshot manually in the chat.',
    whatsappNoteUr:
      'نوٹ: اگر واٹس ایپ کے ذریعے بھیجیں تو چیٹ کھلنے کے بعد ادائیگی کا اسکرین شاٹ خود منسلک کریں۔',
    whatsappUnconfigured: {
      en: 'WhatsApp proof forwarding is not configured yet. Please upload your payment screenshot directly above for verification.',
      ur: 'واٹس ایپ نمبر ابھی سیٹ نہیں کیا گیا۔ براہ کرم تصدیق کے لیے اوپر اسکرین شاٹ براہ راست اپ لوڈ کریں۔',
    },
  },

  statuses: {
    awaiting_payment: { en: 'Awaiting Payment', ur: 'ادائیگی کا انتظار' },
    pending_verification: { en: 'Pending Verification', ur: 'تصدیق زیر التوا' },
    approved: { en: 'Approved', ur: 'منظور شدہ' },
    rejected: { en: 'Rejected', ur: 'مسترد شدہ' },
    expired: { en: 'Expired', ur: 'میعاد ختم' },
    active: { en: 'Active', ur: 'فعال' },
    cancelled: { en: 'Cancelled', ur: 'منسوخ شدہ' },
    inactive: { en: 'Inactive', ur: 'غیر فعال' },
  },

  account: {
    myAccount: { en: 'My Account', ur: 'میرا اکاؤنٹ' },
    viewPlans: { en: 'View Plans', ur: 'پلانز دیکھیں' },
    activeBanner: {
      en: 'Your membership is active. Enjoy your selected dramas.',
      ur: 'آپ کی ممبرشپ فعال ہے۔ اپنے منتخب ڈراموں سے لطف اندوز ہوں۔',
    },
    pendingBanner: {
      en: 'Your payment is awaiting verification.',
      ur: 'آپ کی ادائیگی تصدیق کے انتظار میں ہے۔',
    },
    awaitingPaymentBanner: {
      en: 'Your payment request is saved and awaiting your Bank QR transfer and screenshot upload.',
      ur: 'آپ کی ادائیگی کی درخواست محفوظ ہے، بینک QR ادائیگی اور اسکرین شاٹ اپ لوڈ کا انتظار ہے۔',
    },
    expiredBanner: {
      en: 'Your membership has expired. Renew your membership to continue watching.',
      ur: 'آپ کی ممبرشپ کی میعاد ختم ہو گئی ہے۔ دیکھنے کے لیے اپنی ممبرشپ تجدید کریں۔',
    },
    rejectedBannerPrefix: {
      en: 'Your previous payment submission was not approved.',
      ur: 'آپ کی پچھلی ادائیگی کی درخواست منظور نہیں ہو سکی۔',
    },
    rejectionReasonLabel: { en: 'Reason:', ur: 'وجہ:' },
    reuploadCta: { en: 'Re-upload Payment Proof', ur: 'ادائیگی کا ثبوت دوبارہ اپ لوڈ کریں' },
    renewMembership: { en: 'Renew Membership', ur: 'ممبرشپ تجدید کریں' },
    chooseMembership: { en: 'Choose Your Membership', ur: 'اپنی ممبرشپ منتخب کریں' },
    daysRemaining: { en: 'days remaining', ur: 'دن باقی' },
    hoursRemaining: { en: 'hours remaining', ur: 'گھنٹے باقی' },
    activatedOn: { en: 'Activated:', ur: 'آغاز:' },
    expiresOn: { en: 'Expires:', ur: 'میعاد ختم:' },
    selectedDramasLabel: { en: 'Selected Dramas:', ur: 'منتخب ڈرامے:' },
    verificationHistory: { en: 'Payment Verification Requests', ur: 'ادائیگی کی تصدیق کا ریکارڈ' },
    membershipHistory: { en: 'Membership Activity History', ur: 'ممبرشپ ہسٹری' },
    unlockedLibrary: { en: 'Your Unlocked Dramas & Episodes', ur: 'آپ کے ان لاک شدہ ڈرامے اور اقساط' },
    watchEpisode: { en: 'Watch Episode', ur: 'قسط دیکھیں' },
    verifyingStream: { en: 'Verifying...', ur: 'تصدیق ہو رہی ہے...' },
    cancelMembership: { en: 'Cancel Membership', ur: 'ممبرشپ منسوخ کریں' },
  },

  policies: {
    eyebrow: { en: 'Membership Details', ur: 'ممبرشپ کی تفصیلات' },
    heading: { en: 'Everything You Need to Know', ur: 'ممبرشپ کے اہم قواعد' },
    items: [
      {
        id: 'new-episodes',
        title: { en: 'New Episodes', ur: 'نئی اقساط' },
        description: {
          en: 'Every new eligible episode published for your selected drama(s) during an active membership period is unlocked automatically at no extra charge.',
          ur: 'فعال ممبرشپ کے دوران آپ کے منتخب ڈراموں کی ہر نئی قسط بغیر کسی اضافی فیس کے خودکار طور پر کھل جاتی ہے۔',
        },
      },
      {
        id: 'membership-duration',
        title: { en: 'Membership Duration', ur: 'ممبرشپ کی مدت' },
        description: {
          en: 'Starter provides 15 days of access from the verified activation timestamp, while Standard, Plus, and VIP provide 30 full days.',
          ur: 'اسٹارٹر پلان منظوری کے وقت سے 15 دن اور اسٹینڈرڈ، پلس و VIP پورے 30 دن کی رسائی دیتے ہیں۔',
        },
      },
      {
        id: 'personal-account',
        title: { en: 'Personal Account', ur: 'ذاتی اکاؤنٹ' },
        description: {
          en: 'Memberships are bound to an individual FEVIQO account protected by email and password authentication for personal household viewing.',
          ur: 'ممبرشپ آپ کے ذاتی فیویکو اکاؤنٹ سے منسلک ہوتی ہے تاکہ محفوظ اور بااعتماد رسائی رہے۔',
        },
      },
      {
        id: 'payment-verification',
        title: { en: 'Manual Payment Verification', ur: 'ادائیگی کی دستی تصدیق' },
        description: {
          en: 'Bank QR transfers are manually verified by the FEVIQO team from your submitted payment screenshot before membership activation.',
          ur: 'بینک QR ادائیگی آپ کے جمع کردہ اسکرین شاٹ سے ٹیم کی تصدیق کے بعد فعال کی جاتی ہے۔',
        },
      },
      {
        id: 'renewal',
        title: { en: 'Renewal & Switching', ur: 'تجدید اور تبدیلی' },
        description: {
          en: 'When your 15-day or 30-day term expires, you can renew the same plan or switch tiers and drama selections cleanly from My Account.',
          ur: 'مدت ختم ہونے پر آپ آسانی سے وہی پلان تجدید کر سکتے ہیں یا نیا پلان و ڈرامے منتخب کر سکتے ہیں۔',
        },
      },
      {
        id: 'drama-selection',
        title: { en: 'Drama Selection', ur: 'ڈراموں کا انتخاب' },
        description: {
          en: 'Starter and Standard include 1 chosen series, Plus includes 2 chosen series, and VIP opens all eligible VIP catalogue dramas simultaneously.',
          ur: 'اسٹارٹر اور اسٹینڈرڈ میں 1، پلس میں 2، اور VIP میں تمام دستیاب VIP ڈرامے شامل ہوتے ہیں۔',
        },
      },
    ],
  },

  faq: {
    eyebrow: { en: 'Questions & Answers', ur: 'سوالات و جوابات' },
    heading: { en: 'Frequently Asked Questions', ur: 'اکثر پوچھے جانے والے سوالات' },
    items: [
      {
        id: 'q1',
        question: {
          en: 'Q1. What is included in a FEVIQO Premium Membership?',
          ur: 'سوال 1: فیویکو پریمیم ممبرشپ میں کیا شامل ہے؟',
        },
        answer: {
          en: 'A FEVIQO Premium Membership gives your personal account access to Urdu-dubbed Turkish drama episodes for the dramas included in your chosen plan, with automatic access to newly added eligible episodes while active.',
          ur: 'فیویکو پریمیم ممبرشپ آپ کے ذاتی اکاؤنٹ پر منتخب پلان کے مطابق اردو ڈبنگ میں ترکی ڈراموں اور فعال مدت کے دوران آنے والی تمام نئی اقساط تک رسائی دیتی ہے۔',
        },
      },
      {
        id: 'q2',
        question: {
          en: 'Q2. How do Starter, Standard, Plus, and VIP plans differ?',
          ur: 'سوال 2: اسٹارٹر، اسٹینڈرڈ، پلس اور VIP پلانز میں کیا فرق ہے؟',
        },
        answer: {
          en: 'Starter (PKR 299) covers 1 selected drama for 15 days. Standard (PKR 599) covers 1 selected drama for 30 days. Plus (PKR 899) covers any 2 dramas for 30 days. VIP (PKR 1,299) unlocks all eligible VIP catalogue dramas for 30 days.',
          ur: 'اسٹارٹر (299 روپے) 15 دن کے لیے 1 ڈرامہ، اسٹینڈرڈ (599 روپے) 30 دن کے لیے 1 ڈرامہ، پلس (899 روپے) 30 دن کے لیے 2 ڈرامے اور VIP (1,299 روپے) 30 دن کے لیے تمام دستیاب VIP ڈرامے کھولتا ہے۔',
        },
      },
      {
        id: 'q3',
        question: {
          en: 'Q3. How do I pay using the Bank QR code?',
          ur: 'سوال 3: بینک QR کوڈ سے ادائیگی کیسے کی جاتی ہے؟',
        },
        answer: {
          en: 'Select your plan and drama(s), sign in or create an account, then scan the plan QR code with your banking app, pay the exact PKR amount shown, and upload your screenshot directly on the payment page.',
          ur: 'اپنا پلان اور ڈرامے منتخب کریں، اکاؤنٹ میں سائن ان کریں، بینک QR کوڈ اسکین کر کے مقررہ رقم ادا کریں اور ادائیگی کا اسکرین شاٹ اسی صفحے پر اپ لوڈ کریں۔',
        },
      },
      {
        id: 'q4',
        question: {
          en: 'Q4. When does my membership activate?',
          ur: 'سوال 4: میری ممبرشپ کب فعال ہو گی؟',
        },
        answer: {
          en: 'Submitting your screenshot places your request into Pending Verification. Once an authorized FEVIQO administrator verifies your payment receipt, your 15-day or 30-day term begins immediately from activation.',
          ur: 'اسکرین شاٹ جمع کروانے کے بعد آپ کی درخواست تصدیق کے مرحلے میں جاتی ہے۔ فیویکو ٹیم کی تصدیق کے فوراً بعد آپ کی ممبرشپ اور دنوں کا شمار شروع ہو جاتا ہے۔',
        },
      },
      {
        id: 'q5',
        question: {
          en: 'Q5. What if I am paying from the same mobile phone?',
          ur: 'سوال 5: اگر میں اسی موبائل فون سے ادائیگی کر رہا ہوں تو کیا کروں؟',
        },
        answer: {
          en: 'Use the Save / Download QR Code button below the QR image, then open the saved image inside a banking or wallet app that supports scanning QR codes from your gallery, or scan from a second device.',
          ur: 'QR تصویر کے نیچے موجود محفوظ / ڈاؤن لوڈ بٹن استعمال کریں اور اپنی بینکنگ یا والٹ ایپ میں گیلری سے QR اسکین کرنے کا آپشن استعمال کریں، یا کسی دوسرے فون سے اسکین کریں۔',
        },
      },
      {
        id: 'q6',
        question: {
          en: 'Q6. Will I receive newly uploaded episodes during my active membership?',
          ur: 'سوال 6: کیا ممبرشپ کے دوران آنے والی نئی اقساط بھی شامل ہوں گی؟',
        },
        answer: {
          en: 'Yes. Every newly added eligible episode for the drama(s) in your active membership becomes playable in My Account without any extra fee.',
          ur: 'جی ہاں، آپ کی فعال ممبرشپ کے دوران آپ کے منتخب ڈراموں کی ہر نئی قسط بغیر کسی اضافی چارجز کے آپ کے اکاؤنٹ میں دستیاب ہو گی۔',
        },
      },
    ],
  },

  finalCta: {
    heading: { en: 'Your Next Favourite Story Is Waiting.', ur: 'آپ کی اگلی پسندیدہ کہانی منتظر ہے۔' },
    subtitle: {
      en: 'Join FEVIQO Premium and experience Turkish dramas with Urdu dubbing.',
      ur: 'فیویکو پریمیم جوائن کریں اور ترکی ڈرامے اردو ڈبنگ میں دیکھیں۔',
    },
    cta: { en: 'Choose Your Membership', ur: 'اپنی ممبرشپ منتخب کریں' },
  },
} as const;
