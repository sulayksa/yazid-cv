/* Certificates gallery data + markup (runs before motion.js so ScrollTrigger sees the cards) */
(() => {
  'use strict';
  /* ---------------- Certificates data ---------------- */
  const CERTS = [
    { cat: 'film', kicker: 'مسار الأفلام والسينما · مختومة رسميًا', title: 'المركز الثالث على منطقة الرياض — فيلم «أثر كلمة»', issuer: 'كمصور وإداري وممنتج للفيلم · وزارتا الثقافة والتعليم', img: 'assets/img/cert/cert-film-athar.webp' },
    { cat: 'service', kicker: 'وسام التميز والتطوع المعتمد · 126 ساعة', title: 'وسام التطوع والتميز المجتمعي (مبادرة كن غيثًا)', issuer: 'مجلس إدارة جمعية التنمية الأهلية بحي الجزيرة', img: 'assets/img/work/jz-honor.jpg' },
    { cat: 'speech', kicker: 'التوستماسترز العالمية للخطابة', title: 'جائزة أفضل خطيب في الخطب الارتجالية — لقاء 414', issuer: 'نادي الصفوة للتوستماسترز · 21 / 8 / 1447هـ', img: 'assets/img/cert/cert-toastmasters-414.webp' },
    { cat: 'speech', kicker: 'التوستماسترز العالمية للخطابة', title: 'جائزة أفضل خطيب في الخطب الارتجالية — لقاء 417', issuer: 'نادي الصفوة للتوستماسترز · 13 / 9 / 1447هـ', img: 'assets/img/cert/cert-toastmasters-417.webp' },
    { cat: 'tech', kicker: 'القيادة التقنية للمناسبات · مختومة رسميًا', title: 'قيادة وإدارة النشاط التقني لحفل التخرج 1447هـ', issuer: 'التخطيط والإشراف على الأنظمة · ثانوية الأندلس', img: 'assets/img/cert/cert-tech-grad.webp' },
    { cat: 'tech', kicker: 'إدارة الأنشطة والبرامج · مختومة رسميًا', title: 'إدارة النشاط المدرسي للعام الدراسي 1447هـ', issuer: 'مسؤولية شاملة وإنجاح الأنشطة · ثانوية الأندلس', img: 'assets/img/cert/cert-school-activity.webp' },
    { cat: 'service', kicker: 'التطوع الميداني وخدمة الضيوف', title: 'خدمة الضيوف وتنظيم فعاليات جمعية تنمية الجزيرة', issuer: 'جمعية التنمية الأهلية بحي الجزيرة بالرياض', img: 'assets/img/work/jz-serve.webp' },
    { cat: 'film', kicker: 'الإخراج والإنتاج الإبداعي · مختومة رسميًا', title: 'إخراج الفيلم القصير والعمل المسرحي واليوم الوطني', issuer: 'إدارة ثانوية الأندلس بالرياض', img: 'assets/img/cert/cert-theater-national.webp' },
    { cat: 'service', kicker: 'التنظيم والتشغيل الميداني · مختومة رسميًا', title: 'تنظيم وإنجاح الدوري المدرسي الرياضي', issuer: 'إدارة الفعاليات الرياضية · ثانوية الأندلس', img: 'assets/img/cert/cert-sports-league.webp' },
    { cat: 'speech', kicker: 'الخطابة وفصاحة المنطق · مختومة رسميًا', title: 'مسابقة «خطيب الأندلس» في فن الإلقاء والخطابة', issuer: 'ثانوية الأندلس بالرياض · 1447هـ', img: 'assets/img/cert/cert-khateeb.webp' },
    { cat: 'speech', kicker: 'فنون الإلقاء والتواصل · مختومة رسميًا', title: 'دورة فن الإلقاء والتأثير الصوتي المتقدم', issuer: 'ثانوية الأندلس بالرياض', img: 'assets/img/cert/cert-public-speaking.webp' },
    { cat: 'excellence', kicker: 'التفوق والتميز الأكاديمي · مختومة رسميًا', title: 'شهادة التفوق الدراسي في جميع المواد الدراسية', issuer: 'مدرسة جعفر بن الزبير · 1444هـ', img: 'assets/img/cert/cert-academic-excellence.webp' },
    { cat: 'excellence', kicker: 'المناسبات والفعاليات الوطنية · مختومة رسميًا', title: 'تفعيل أنشطة اليوم الوطني السعودي 92', issuer: 'رائد النشاط وإدارة المدرسة · الرياض', img: 'assets/img/cert/cert-national-day-92.webp' }
  ];

  const certsEl = document.getElementById('certs');
  if (certsEl) {
    certsEl.innerHTML = CERTS.map((c, i) => `
      <button class="cert glass tilt cert-open" data-reveal="up" data-delay="${(i % 3) * 0.08}" data-cat="${c.cat}" data-full="${c.img}" data-title="${c.title}">
        <span class="cert-num">${i + 1}</span>
        <span class="cert-paper"><img src="${c.img}" alt="${c.title}" loading="lazy" /></span>
        <span class="cert-meta"><small>${c.kicker}</small><strong>${c.title}</strong><em>${c.issuer}</em></span>
      </button>`).join('');
  }

})();
