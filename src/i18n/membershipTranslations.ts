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
    dramas: { en: 'Dramas', ur: 'ڈرامے' },
    membership: { en: 'Membership', ur: 'ممبرشپ' },
    about: { en: 'About Us', ur: 'ہمارے بارے میں' },
    login: { en: 'Login', ur: 'لاگ ان' },
    startProject: { en: 'Start a Project', ur: 'پروجیکٹ شروع کریں' },
    allDramas: { en: 'All Turkish Dramas', ur: 'تمام ترکی ڈرامے' },
    premiumMembership: { en: 'FEVIQO Premium Membership', ur: 'فیویکو پریمیم ممبرشپ' },
  },

  footer: {
    tagline: {
      en: 'Unlimited professional video editing studio for creators, brands, and performance agencies—plus Turkish dramas in Urdu HD.',
      ur: 'کریئیٹرز، برانڈز اور پرفارمنس ایجنسیز کے لیے پروفیشنل ویڈیو ایڈیٹنگ اسٹوڈیو—اور ترکی ڈرامے اردو میں۔',
    },
    servicesHeading: { en: 'Services & Platform', ur: 'خدمات اور پلیٹ فارم' },
    solutionsHeading: { en: 'Solutions', ur: 'سولیوشنز' },
    dramasHeading: { en: 'Turkish Dramas (Urdu)', ur: 'ترکی ڈرامے (اردو)' },
    supportHeading: { en: 'Resources & Legal', ur: 'مدد اور قانونی معلومات' },
    membershipLink: { en: 'Premium Membership', ur: 'پریمیم ممبرشپ' },
    privacyPolicy: { en: 'Privacy Policy', ur: 'پرائیویسی پالیسی' },
    termsOfService: { en: 'Terms of Use', ur: 'استعمال کی شرائط' },
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
      en: 'Choose the exact series you follow—from 1 drama on Starter or Standard, 2 dramas on Plus, or 3 dramas on VIP with Urdu dubbing—built for smooth, high-definition viewing.',
      ur: 'اپنے پسندیدہ ترکی ڈرامے منتخب کریں—اسٹارٹر اور اسٹینڈرڈ میں 1، پلس میں 2، یا VIP میں 3 ڈرامے اردو ڈبنگ کے ساتھ ہائی کوالٹی میں دیکھیں۔',
    },
    exploreMemberships: { en: 'Explore Memberships', ur: 'ممبرشپ پلانز دیکھیں' },
    exploreDramas: { en: 'Explore Dramas', ur: 'ڈرامے دیکھیں' },
  },

  howItWorks: {
    eyebrow: { en: 'How Membership Works', ur: 'ممبرشپ کیسے کام کرتی ہے' },
    heading: { en: 'Your Membership. Your Choice.', ur: 'آپ کی ممبرشپ، آپ کا انتخاب۔' },
    step1Title: { en: '01 — Choose Your Dramas', ur: '01 — اپنے ڈرامے منتخب کریں' },
    step1Desc: {
      en: 'Pick the membership tier that matches how you watch, then choose 1, 2, or 3 Turkish dramas from our Urdu-dubbed catalogue.',
      ur: 'اپنی پسند کا پلان منتخب کریں، پھر اردو ڈبنگ کیٹلاگ سے 1، 2 یا 3 ترکی ڈرامے چنیں۔',
    },
    step2Title: { en: '02 — Pay via QR & Upload Proof', ur: '02 — QR سے ادائیگی اور ثبوت اپ لوڈ کریں' },
    step2Desc: {
      en: 'Pay in PKR via Pakistani Bank QR or internationally in USD via Binance QR, then upload your payment confirmation screenshot for team verification.',
      ur: 'پاکستان میں بینک QR کے ذریعے PKR میں یا بین الاقوامی طور پر Binance QR کے ذریعے USD میں ادائیگی کریں اور اسکرین شاٹ اپ لوڈ کریں۔',
    },
    step3Title: { en: '03 — Verified Activation & New Episodes', ur: '03 — تصدیق کے بعد ایکٹیویشن اور نئی اقساط' },
    step3Desc: {
      en: 'Once our team verifies your receipt, your 15-day or 30-day membership activates with instant access to all eligible current and upcoming episodes across drama pages.',
      ur: 'ہماری ٹیم کی تصدیق کے بعد آپ کی 15 یا 30 دن کی ممبرشپ فعال ہو جاتی ہے اور تمام ڈرامہ صفحات پر متعلقہ اقساط خودکار طور پر کھل جاتی ہیں۔',
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
    regionLabel: { en: 'Payment Region & Currency', ur: 'ادائیگی کا خطہ اور کرنسی' },
    regionPakistan: { en: 'Pakistan — Pay in PKR (Bank QR)', ur: 'پاکستان — PKR میں ادائیگی (بینک QR)' },
    regionInternational: { en: 'International — Pay in USD (Binance QR)', ur: 'انٹرنیشنل — USD میں ادائیگی (Binance QR)' },
    autoDetectedCountry: { en: 'Detected region:', ur: 'خودکار خطہ:' },
    indicativeNotice: {
      en: 'Local currency shown is approximate only. For International Binance payments, the exact payable amount is strictly USD as shown.',
      ur: 'مقامی کرنسی صرف اندازے کے لیے دکھائی گئی ہے۔ انٹرنیشنل Binance ادائیگی کے لیے ہمیشہ مقررہ USD رقم ہی ادا کرنی ہو گی۔',
    },
    approxLocalPrefix: { en: 'Approx.', ur: 'تقریباً' },
    exactUsdPayable: { en: 'Exact payable via Binance:', ur: 'Binance پر اصل واجب الادا رقم:' },
    renewalBannerTitle: { en: 'Renewing Existing Membership', ur: 'موجودہ ممبرشپ کی تجدید' },
    renewalBannerActiveNote: {
      en: 'Renewing early adds the full plan duration directly onto your current expiry date without losing remaining days.',
      ur: 'وقت سے پہلے تجدید کرنے پر پورے دن آپ کی موجودہ آخری تاریخ کے آگے شامل ہو جائیں گے، کوئی دن ضائع نہیں ہو گا۔',
    },
    renewalBannerExpiredNote: {
      en: 'Your previous membership has expired. Completing payment will restore access on your existing account immediately upon approval.',
      ur: 'آپ کی پچھلی ممبرشپ کی میعاد ختم ہو چکی ہے۔ ادائیگی کی منظوری پر اسی اکاؤنٹ پر رسائی بحال ہو جائے گی۔',
    },
    cancelRenewalMode: { en: 'Switch to New Membership', ur: 'نئی ممبرشپ پر جائیں' },
    additionalDramaNote: {
      en: 'You already have active access on another drama. Purchasing a plan for a new drama keeps your existing active membership intact.',
      ur: 'آپ کی ایک اور ڈرامے کی ممبرشپ پہلے سے فعال ہے۔ نیا ڈرامہ لینے سے آپ کی موجودہ ممبرشپ متاثر نہیں ہو گی۔',
    },
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
        inclusionText: { en: '3 dramas included', ur: '3 ڈرامے شامل' },
        summary: {
          en: 'Select any three Turkish series from the catalogue for 30 continuous days.',
          ur: 'مسلسل 30 دن کے لیے کیٹلاگ سے کوئی سے تین ترکی ڈرامے منتخب کریں۔',
        },
        ctaLabel: { en: 'Choose VIP', ur: 'وی آئی پی منتخب کریں' },
      },
    },
  },

  dramaSelection: {
    stepEyebrow: { en: 'Step 2', ur: 'مرحلہ 2' },
    allVipHeading: {
      en: 'Select 3 Dramas for Your VIP Membership',
      ur: 'اپنی VIP ممبرشپ کے لیے 3 ڈرامے منتخب کریں',
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
      en: 'Your VIP plan includes 3 selected Turkish dramas for 30 days.',
      ur: 'آپ کے VIP پلان میں 30 دن کے لیے 3 منتخب ترکی ڈرامے شامل ہیں۔',
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
      en: 'Sign in or create your FEVIQO account next to proceed to QR payment.',
      ur: 'QR ادائیگی کے لیے اگلے مرحلے میں سائن ان یا نیا اکاؤنٹ بنائیں۔',
    },
    proceedToPaymentPkr: { en: 'Continue to Bank QR Payment (PKR)', ur: 'بینک QR ادائیگی (PKR) پر جائیں' },
    proceedToPaymentUsd: { en: 'Continue to Binance QR Payment (USD)', ur: 'Binance QR ادائیگی (USD) پر جائیں' },
    proceedToPayment: { en: 'Continue to QR Payment', ur: 'QR ادائیگی پر جائیں' },
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
      en: 'Your chosen plan and selected drama(s) are saved and will carry straight to the QR payment screen.',
      ur: 'آپ کا منتخب پلان اور ڈرامے محفوظ ہیں اور سائن ان کے فوراً بعد QR ادائیگی پر جائیں گے۔',
    },
    subtitleGeneral: {
      en: 'Access your FEVIQO Premium Membership, selected dramas, renewal alerts, and payment history.',
      ur: 'اپنی فیویکو پریمیم ممبرشپ، منتخب ڈرامے، تجدید الرٹس اور ادائیگی کی تفصیلات دیکھیں۔',
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
    googlePhoneTitle: {
      en: 'Add Your Phone / WhatsApp Number',
      ur: 'اپنا فون / واٹس ایپ نمبر درج کریں',
    },
    googlePhoneDesc: {
      en: 'Required after Google Sign-In or account creation so our team can reach you about your membership verification, billing, or unfinished orders.',
      ur: 'گوگل سائن ان یا نیا اکاؤنٹ مکمل کرنے کے لیے اپنا فون / واٹس ایپ نمبر درج کرنا لازمی ہے تاکہ ادائیگی کی تصدیق یا نامکمل آرڈر کی صورت میں ہماری ٹیم آپ سے رابطہ کر سکے۔',
    },
    googlePhoneHint: {
      en: 'After continuing with Google, you will be asked to add your phone / WhatsApp number.',
      ur: 'گوگل کے ساتھ جاری رکھنے کے بعد آپ سے اپنا فون / واٹس ایپ نمبر درج کرنے کو کہا جائے گا۔',
    },
    googlePhoneSaveBtn: {
      en: 'Save Phone & Continue',
      ur: 'نمبر محفوظ کریں اور آگے بڑھیں',
    },
    googlePhoneSaving: {
      en: 'Saving phone number...',
      ur: 'فون نمبر محفوظ ہو رہا ہے...',
    },
    googlePhoneSwitchAccount: {
      en: 'Sign out & cancel',
      ur: 'لاگ آؤٹ کریں',
    },
  },

  payment: {
    stepTitle: { en: 'Complete Your Bank QR Payment', ur: 'بینک QR کے ذریعے ادائیگی مکمل کریں' },
    stepTitleBinance: { en: 'Complete Your Binance QR Payment (USD)', ur: 'Binance QR (USD) کے ذریعے ادائیگی مکمل کریں' },
    orderSummaryHeading: { en: 'Payment Details', ur: 'ادائیگی کی تفصیلات' },
    orderTypeLabel: { en: 'Order Type', ur: 'آرڈر کی قسم' },
    orderTypeNew: { en: 'New Membership', ur: 'نئی ممبرشپ' },
    orderTypeRenewal: { en: 'Membership Renewal', ur: 'ممبرشپ تجدید' },
    paymentMethodLabel: { en: 'Payment Method', ur: 'ادائیگی کا طریقہ' },
    methodBankQr: { en: 'Pakistan Bank QR (PKR)', ur: 'پاکستان بینک QR (PKR)' },
    methodBinanceQr: { en: 'International Binance QR (USD)', ur: 'انٹرنیشنل Binance QR (USD)' },
    planLabel: { en: 'Selected Plan', ur: 'منتخب پلان' },
    dramasLabel: { en: 'Selected Drama(s)', ur: 'منتخب ڈرامے' },
    totalAmountLabel: { en: 'Exact Payable Amount', ur: 'اصل واجب الادا رقم' },
    indicativeLocalLabel: { en: 'Approx. Local Equivalent', ur: 'تقریباً مقامی قیمت' },
    durationLabel: { en: 'Duration', ur: 'مدت' },
    customerNameLabel: { en: 'Customer Name', ur: 'کسٹمر کا نام' },
    customerEmailLabel: { en: 'Customer Email', ur: 'کسٹمر ای میل' },
    paymentStatusLabel: { en: 'Payment Status', ur: 'ادائیگی کی کیفیت' },
    requestIdLabel: { en: 'Payment Request ID', ur: 'ریکویسٹ آئی ڈی' },
    qrHeading: { en: 'Scan Bank QR Code', ur: 'بینک QR کوڈ اسکین کریں' },
    binanceQrHeading: { en: 'Scan Binance Pay QR Code (USD)', ur: 'Binance Pay QR کوڈ اسکین کریں (USD)' },
    binanceQrMissing: {
      en: 'The administrator has not uploaded the Binance QR code for this plan yet. Please check back shortly or switch to Pakistan Bank QR.',
      ur: 'اس پلان کے لیے ایڈمن نے ابھی Binance QR کوڈ اپ لوڈ نہیں کیا۔ براہ کرم تھوڑی دیر بعد چیک کریں یا بینک QR استعمال کریں۔',
    },
    downloadQr: { en: 'Save / Download QR Code', ur: 'QR کوڈ محفوظ / ڈاؤن لوڈ کریں' },
    scanInstructionEn: 'Scan this QR code using your banking app and pay the exact amount shown.',
    scanInstructionUr: 'اپنی بینکنگ ایپ سے اس QR کوڈ کو اسکین کریں اور بالکل اتنی ہی رقم ادا کریں جتنی یہاں درج ہے۔',
    binanceInstructionEn:
      'Open the Binance app → Tap Pay / Scan QR → Send the EXACT USD amount shown for this plan → Upload a clear screenshot of your Binance payment receipt below.',
    binanceInstructionUr:
      'Binance ایپ کھولیں → Pay / QR اسکین پر ٹیپ کریں → اس پلان کی بالکل مقررہ USD رقم بھیجیں → نیچے Binance ادائیگی کی رسید کا واضح اسکرین شاٹ اپ لوڈ کریں۔',
    mobileNoteEn:
      'Paying from the same mobile phone? Save/download this QR code and open it inside your banking or Binance app from your photo gallery, or scan it using a second device.',
    mobileNoteUr:
      'اگر آپ اسی موبائل فون سے ادائیگی کر رہے ہیں تو یہ QR کوڈ محفوظ/ڈاؤن لوڈ کریں اور اپنی بینکنگ یا Binance ایپ کے گیلری QR اسکین فیچر سے کھولیں، یا کسی دوسرے فون سے اسکین کریں۔',
    proofHeading: { en: 'Upload Payment Proof', ur: 'ادائیگی کا ثبوت (اسکرین شاٹ) اپ لوڈ کریں' },
    uploadInstructionEn: 'After paying, please upload a clear screenshot of your payment confirmation. Our team verifies every receipt before activation.',
    uploadInstructionUr: 'ادائیگی کے بعد، براہ کرم ادائیگی کی تصدیق کا واضح اسکرین شاٹ اپ لوڈ کریں۔ ہماری ٹیم کی تصدیق کے بعد ممبرشپ فعال ہو گی۔',
    allowedFormats: {
      en: 'Accepted formats: JPG, JPEG, PNG, WebP (Max 8 MB)',
      ur: 'منظور شدہ فارمیٹس: JPG, JPEG, PNG, WebP (زیادہ سے زیادہ 8 MB)',
    },
    chooseScreenshot: { en: 'Choose Payment Screenshot', ur: 'اسکرین شاٹ منتخب کریں' },
    replaceScreenshot: { en: 'Replace Screenshot', ur: 'اسکرین شاٹ تبدیل کریں' },
    noteLabel: { en: 'Transaction / Binance Pay ID or Note (Optional)', ur: 'ٹرانزیکشن / Binance Pay آئی ڈی یا نوٹ (اختیاری)' },
    notePlaceholder: {
      en: 'Optional: Bank / Binance Pay Order ID or reference',
      ur: 'اختیاری: بینک یا Binance Pay آرڈر آئی ڈی / ریفرنس',
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

  episodeGate: {
    premiumBadge: { en: 'Premium Episode', ur: 'پریمیم قسط' },
    urduPremiumTag: { en: 'Urdu Dubbed — Premium Access', ur: 'اردو ڈبنگ — پریمیم رسائی' },
    unlockPrompt: { en: 'Unlock with FEVIQO Premium', ur: 'فیویکو پریمیم سے ان لاک کریں' },
    unlockedBadge: { en: 'Unlocked with Membership', ur: 'ممبرشپ کے ساتھ ان لاک' },
    checkingAccess: { en: 'Checking your FEVIQO Premium access...', ur: 'آپ کی ممبرشپ رسائی چیک کی جا رہی ہے...' },
    caseATitle: {
      en: 'Enjoy this episode with FEVIQO Premium.',
      ur: 'فیویکو پریمیم کے ساتھ اس قسط سے لطف اندوز ہوں۔',
    },
    caseADesc: {
      en: 'Subscribe to unlock Urdu-dubbed episodes of your favourite dramas. Already have an account? Sign in to unlock automatically.',
      ur: 'اپنے پسندیدہ ترکی ڈراموں کی اردو ڈب شدہ اقساط دیکھنے کے لیے ممبرشپ حاصل کریں، یا اگر اکاؤنٹ موجود ہے تو سائن ان کریں۔',
    },
    caseBTitle: {
      en: 'Unlock this Premium Episode',
      ur: 'یہ پریمیم قسط ان لاک کریں',
    },
    caseBDesc: {
      en: 'You are signed in, but you do not have an active membership covering this drama yet.',
      ur: 'آپ سائن ان ہیں، لیکن اس ڈرامے کے لیے آپ کی کوئی فعال ممبرشپ موجود نہیں ہے۔',
    },
    caseDTitle: {
      en: 'This Drama Is Not in Your Current Plan',
      ur: 'یہ ڈرامہ آپ کے موجودہ پلان میں شامل نہیں',
    },
    caseDDescPrefix: {
      en: 'Your active membership covers:',
      ur: 'آپ کی موجودہ فعال ممبرشپ میں شامل ہیں:',
    },
    caseDKeepIntactNote: {
      en: 'Adding a new plan for this drama or choosing VIP will keep your existing active membership and remaining days untouched.',
      ur: 'اس ڈرامے کا نیا پلان لینے یا VIP منتخب کرنے سے آپ کی موجودہ فعال ممبرشپ اور باقی دن محفوظ رہیں گے۔',
    },
    caseETitle: {
      en: 'Your FEVIQO Membership Has Expired',
      ur: 'آپ کی فیویکو ممبرشپ کی میعاد ختم ہو گئی ہے',
    },
    caseEDesc: {
      en: 'Renew your membership on your existing account to unlock this episode immediately after verification.',
      ur: 'اسی اکاؤنٹ پر اپنی ممبرشپ تجدید کریں تاکہ تصدیق کے فوراً بعد یہ قسط دوبارہ کھل جائے۔',
    },
    explorePlansBtn: { en: 'Explore Membership Plans', ur: 'ممبرشپ پلانز دیکھیں' },
    signInBtn: { en: 'Sign In / Create Account', ur: 'سائن ان / نیا اکاؤنٹ' },
    renewNowBtn: { en: 'Renew Membership', ur: 'ممبرشپ تجدید کریں' },
    addPlanBtn: { en: 'Choose Plan for This Drama', ur: 'اس ڈرامے کا پلان منتخب کریں' },
    closeBtn: { en: 'Back to Episode List', ur: 'اقساط کی فہرست پر واپس جائیں' },
    returnBannerTitle: { en: 'Continue Watching:', ur: 'دیکھنا جاری رکھیں:' },
    returnBannerBtn: { en: 'Back to Episode', ur: 'قسط پر واپس جائیں' },
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
      en: 'Your payment request is saved and awaiting your QR transfer and screenshot upload.',
      ur: 'آپ کی ادائیگی کی درخواست محفوظ ہے، QR ادائیگی اور اسکرین شاٹ اپ لوڈ کا انتظار ہے۔',
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
    addAnotherDrama: { en: 'Add Another Drama Plan', ur: 'ایک اور ڈرامے کا پلان شامل کریں' },
    chooseMembership: { en: 'Choose Your Membership', ur: 'اپنی ممبرشپ منتخب کریں' },
    daysRemaining: { en: 'days remaining', ur: 'دن باقی' },
    hoursRemaining: { en: 'hours remaining', ur: 'گھنٹے باقی' },
    countdownLabel: { en: 'Time Remaining:', ur: 'باقی وقت:' },
    activatedOn: { en: 'Activated:', ur: 'آغاز:' },
    expiresOn: { en: 'Expires:', ur: 'میعاد ختم:' },
    selectedDramasLabel: { en: 'Selected Dramas:', ur: 'منتخب ڈرامے:' },
    activeMembershipsHeading: { en: 'Your Active & Past Memberships', ur: 'آپ کی فعال اور سابقہ ممبرشپس' },
    renewalHistoryLabel: { en: 'Renewal History', ur: 'تجدید کا ریکارڈ' },
    notificationsHeading: { en: 'Notifications & Renewal Alerts', ur: 'نوٹیفیکیشنز اور تجدید کے الرٹس' },
    markAllRead: { en: 'Mark all as read', ur: 'سب کو پڑھا ہوا نشان زد کریں' },
    markRead: { en: 'Mark read', ur: 'پڑھا ہوا' },
    noNotifications: {
      en: 'No notifications right now. Renewal reminders and approval updates appear here.',
      ur: 'فی الحال کوئی نیا نوٹیفیکیشن نہیں ہے۔ تجدید کی یاددہانی اور منظوری کے پیغامات یہاں آئیں گے۔',
    },
    verificationHistory: { en: 'Payment Verification Requests', ur: 'ادائیگی کی تصدیق کا ریکارڈ' },
    membershipHistory: { en: 'Membership Activity History', ur: 'ممبرشپ ہسٹری' },
    unlockedLibrary: { en: 'Your Unlocked Dramas & Episodes', ur: 'آپ کے ان لاک شدہ ڈرامے اور اقساط' },
    watchEpisode: { en: 'Watch Episode', ur: 'قسط دیکھیں' },
    openDramaPage: { en: 'Open Drama Page', ur: 'ڈرامہ پیج کھولیں' },
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
          en: 'Bank QR (PKR) and Binance QR (USD) transfers are manually verified by the FEVIQO team from your submitted payment screenshot before activation.',
          ur: 'بینک QR (PKR) اور Binance QR (USD) ادائیگی آپ کے جمع کردہ اسکرین شاٹ سے ٹیم کی تصدیق کے بعد فعال کی جاتی ہے۔',
        },
      },
      {
        id: 'renewal',
        title: { en: 'Early & Expiry Renewals', ur: 'قبل از وقت اور بعد از میعاد تجدید' },
        description: {
          en: 'Renew early at any time without losing remaining days—newly approved days stack directly onto your existing expiry date. Expired plans can be renewed on the same account.',
          ur: 'میعاد ختم ہونے سے پہلے تجدید کرنے پر باقی دن ضائع نہیں ہوتے بلکہ نئے دن آگے شامل ہو جاتے ہیں، اور میعاد ختم ہونے کے بعد بھی اسی اکاؤنٹ سے تجدید ممکن ہے۔',
        },
      },
      {
        id: 'drama-selection',
        title: { en: 'Drama Selection', ur: 'ڈراموں کا انتخاب' },
        description: {
          en: 'Starter and Standard include 1 chosen series, Plus includes 2 chosen series, and VIP includes 3 chosen series.',
          ur: 'اسٹارٹر اور اسٹینڈرڈ میں 1، پلس میں 2، اور VIP میں 3 منتخب ڈرامے شامل ہوتے ہیں۔',
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
          en: 'A FEVIQO Premium Membership gives your personal account access to Urdu-dubbed Turkish drama episodes directly across all eligible drama pages, with automatic unlocking once approved.',
          ur: 'فیویکو پریمیم ممبرشپ آپ کے ذاتی اکاؤنٹ پر منتخب پلان کے مطابق اردو ڈبنگ میں ترکی ڈراموں تک تمام ڈرامہ صفحات پر براہ راست رسائی دیتی ہے۔',
        },
      },
      {
        id: 'q2',
        question: {
          en: 'Q2. How do Starter, Standard, Plus, and VIP plans differ?',
          ur: 'سوال 2: اسٹارٹر، اسٹینڈرڈ، پلس اور VIP پلانز میں کیا فرق ہے؟',
        },
        answer: {
          en: 'Starter covers 1 selected drama for 15 days. Standard covers 1 selected drama for 30 days. Plus covers any 2 dramas for 30 days. VIP covers any 3 selected dramas for 30 days.',
          ur: 'اسٹارٹر 15 دن کے لیے 1 ڈرامہ، اسٹینڈرڈ 30 دن کے لیے 1 ڈرامہ، پلس 30 دن کے لیے 2 ڈرامے اور VIP 30 دن کے لیے 3 منتخب ڈرامے کھولتا ہے۔',
        },
      },
      {
        id: 'q3',
        question: {
          en: 'Q3. How do I pay from Pakistan vs. internationally?',
          ur: 'سوال 3: پاکستان اور بیرونِ ملک سے ادائیگی کیسے کی جاتی ہے؟',
        },
        answer: {
          en: 'In Pakistan, pay the exact PKR amount via Pakistani Bank QR. Outside Pakistan, switch to International — Pay in USD and scan the plan-specific Binance Pay QR code to pay the exact USD amount shown.',
          ur: 'پاکستان میں بینک QR کے ذریعے PKR میں اور بیرونِ ملک سے انٹرنیشنل آپشن منتخب کر کے Binance QR کے ذریعے مقررہ USD رقم ادا کریں۔',
        },
      },
      {
        id: 'q4',
        question: {
          en: 'Q4. When does my membership activate?',
          ur: 'سوال 4: میری ممبرشپ کب فعال ہو گی؟',
        },
        answer: {
          en: 'Submitting your screenshot places your request into Pending Verification. Once an authorized FEVIQO administrator verifies your payment receipt, your 15-day or 30-day term begins immediately.',
          ur: 'اسکرین شاٹ جمع کروانے کے بعد آپ کی درخواست تصدیق کے مرحلے میں جاتی ہے۔ فیویکو ٹیم کی تصدیق کے فوراً بعد آپ کی ممبرشپ فعال ہو جاتی ہے۔',
        },
      },
      {
        id: 'q5',
        question: {
          en: 'Q5. Can I renew early without losing my remaining days?',
          ur: 'سوال 5: کیا وقت سے پہلے تجدید کرنے پر باقی دن ضائع تو نہیں ہوں گے؟',
        },
        answer: {
          en: 'Never. Your current membership keeps running while your renewal is reviewed, and upon approval the full new duration is added onto your existing expiry date.',
          ur: 'ہرگز نہیں۔ تصدیق کے دوران آپ کی موجودہ ممبرشپ چلتی رہتی ہے اور منظوری پر نئے دن آپ کی موجودہ آخری تاریخ کے آگے شامل ہو جاتے ہیں۔',
        },
      },
      {
        id: 'q6',
        question: {
          en: 'Q6. Do I need to enter a code on drama pages to watch unlocked episodes?',
          ur: 'سوال 6: کیا ڈرامہ پیج پر قسط دیکھنے کے لیے کوئی کوڈ درج کرنا ہو گا؟',
        },
        answer: {
          en: 'No. Simply visit any drama page while signed in and click a premium episode—your entitlement is verified automatically on the server and playback starts immediately.',
          ur: 'نہیں۔ بس اپنے اکاؤنٹ میں سائن ان رہتے ہوئے کسی بھی ڈرامہ پیج پر پریمیم قسط پر کلک کریں، سرور آپ کی ممبرشپ خودکار طور پر تصدیق کر کے ویڈیو چلا دے گا۔',
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

  promo: {
    sectionTitle: { en: 'Promo Code & Credits', ur: 'پرومو کوڈ اور اکاؤنٹ کریڈٹس' },
    inputLabel: { en: 'Have a promo code?', ur: 'کیا آپ کے پاس پرومو کوڈ ہے؟' },
    inputPlaceholder: { en: 'Enter code e.g. SAVE20', ur: 'کوڈ درج کریں مثلاً SAVE20' },
    applyBtn: { en: 'Apply', ur: 'لاگو کریں' },
    applyingBtn: { en: 'Checking...', ur: 'تصدیق ہو رہی ہے...' },
    removeBtn: { en: 'Remove', ur: 'ہٹائیں' },
    appliedBadge: { en: 'Promo Applied', ur: 'پرومو لاگو ہو گیا' },
    applyCreditsLabel: { en: 'Apply Referral Wallet Credits', ur: 'ریفرل والٹ کریڈٹس استعمال کریں' },
    availableCreditsLabel: { en: 'Available balance:', ur: 'دستیاب بیلنس:' },
    referralFirstOrderBadge: { en: 'Invited Friend First-Order Discount', ur: 'دوست کی دعوت پر پہلا آرڈر ڈسکاؤنٹ' },
    originalPrice: { en: 'Plan Price', ur: 'پلان کی اصل قیمت' },
    promoDiscount: { en: 'Promo Discount', ur: 'پرومو ڈسکاؤنٹ' },
    referralDiscount: { en: 'Referral Welcome Discount', ur: 'ریفرل خوش آمدید ڈسکاؤنٹ' },
    walletCredits: { en: 'Referral Credits Used', ur: 'استعمال شدہ کریڈٹس' },
    netPayable: { en: 'Final Payable Amount', ur: 'حتمی واجب الادا رقم' },
    zeroBalanceTitle: { en: '100% Covered — Zero Payment Needed!', ur: '100% رعایت — کوئی ادائیگی درکار نہیں!' },
    zeroBalanceDesc: {
      en: 'Your promo code / referral credits cover the entire plan price. Submit below for fast team activation without uploading a payment screenshot.',
      ur: 'آپ کا پرومو کوڈ / ریفرل کریڈٹ مکمل قیمت پر لاگو ہو گیا ہے۔ اسکرین شاٹ کے بغیر فوری منظوری کے لیے نیچے آرڈر جمع کروائیں۔',
    },
    zeroBalanceBtn: { en: 'Confirm Free Order & Activate', ur: 'مفت آرڈر کی تصدیق اور ایکٹیویشن' },
    confirmingFreeBtn: { en: 'Submitting Order...', ur: 'آرڈر جمع ہو رہا ہے...' },
    authReferralLabel: { en: 'Referral Code (Optional)', ur: 'ریفرل کوڈ (اختیاری)' },
    authReferralPlaceholder: { en: 'e.g. FEV12345', ur: 'مثلاً FEV12345' },
    authReferralAppliedNote: {
      en: 'Invited via referral code — your friend earns rewards once your first plan is approved.',
      ur: 'ریفرل کوڈ شامل کر لیا گیا ہے — آپ کا پہلا پلان منظور ہونے پر آپ کے دوست کو انعام ملے گا۔',
    },
  },

  referral: {
    heading: { en: 'Refer & Earn Rewards', ur: 'دوستوں کو مدعو کریں اور انعام پائیں' },
    subheading: {
      en: 'Share your personal referral link or code. You earn verified account credits or discount promos whenever an invited friend’s membership payment is approved.',
      ur: 'اپنا ذاتی ریفرل لنک یا کوڈ شیئر کریں۔ جب بھی آپ کے دوست کی ممبرشپ ادائیگی منظور ہو گی، آپ کو کریڈٹ یا ڈسکاؤنٹ ملے گا۔',
    },
    yourCodeLabel: { en: 'Your Referral Code', ur: 'آپ کا ریفرل کوڈ' },
    yourLinkLabel: { en: 'Your Shareable Link', ur: 'آپ کا ریفرل لنک' },
    copyCode: { en: 'Copy Code', ur: 'کوڈ کاپی کریں' },
    copyLink: { en: 'Copy Link', ur: 'لنک کاپی کریں' },
    copied: { en: 'Copied!', ur: 'کاپی ہو گیا!' },
    walletTitle: { en: 'Available Referral Credits', ur: 'دستیاب ریفرل کریڈٹس' },
    walletHint: {
      en: 'Use your PKR or USD credits at checkout to reduce any membership plan price.',
      ur: 'چیک آؤٹ کے وقت اپنی PKR یا USD کریڈٹ رقم سے کسی بھی پلان کی قیمت کم کریں۔',
    },
    useCreditsCheckoutBtn: { en: 'Spend Credits on a Plan', ur: 'کریڈٹس کے ساتھ پلان لیں' },
    kpiTotalReferrals: { en: 'Invited Signups', ur: 'مدعو اکاؤنٹس' },
    kpiCompletedPurchases: { en: 'Approved Purchases', ur: 'مکمل خریداریاں' },
    kpiPendingReferrals: { en: 'Awaiting Purchase', ur: 'خریداری کے منتظر' },
    kpiTotalEarned: { en: 'Total Rewards Earned', ur: 'کل حاصل شدہ انعام' },
    historyHeading: { en: 'Referred Friends Activity', ur: 'مدعو دوستوں کی تفصیل' },
    ledgerHeading: { en: 'Credit Wallet Activity', ur: 'کریڈٹ والٹ ہسٹری' },
    personalCodesHeading: { en: 'Your Personal Reward Promo Codes', ur: 'آپ کے ذاتی ریوارڈ پرومو کوڈز' },
    noReferralsYet: {
      en: 'No referrals yet. Share your link above with friends who love Turkish dramas!',
      ur: 'ابھی تک کوئی ریفرل موجود نہیں۔ اپنے دوستوں کے ساتھ اوپر دیا گیا لنک شیئر کریں!',
    },
    noLedgerYet: {
      en: 'No credit transactions recorded yet.',
      ur: 'ابھی تک کریڈٹ والٹ میں کوئی لین دین نہیں ہوا۔',
    },
    statusSignedUp: { en: 'Signed Up', ur: 'اکاؤنٹ بن گیا' },
    statusConverted: { en: 'Rewarded', ur: 'انعام مل گیا' },
    statusBlocked: { en: 'Ineligible', ur: 'نااہل' },
  },
} as const;
