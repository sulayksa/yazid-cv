# يزيد يعقوب إلياس — Portfolio 3D

موقع ثابت (Static) بتصميم فاخر ثلاثي الأبعاد: three.js للمشاهد، وحركات ظهور عند التمرير بنفس نظام موقع تاور لاند.

## النشر على Cloudflare Pages (مجاني على pages.dev)
1. dash.cloudflare.com → Workers & Pages → Create → Pages → **Connect to Git**.
2. اختر المستودع `sulayksa/yazid-cv` والفرع `portfolio-3d`.
3. Framework preset: **None** · Build command: **(فارغ)** · Build output directory: **/**
4. اسم المشروع يحدد الرابط: مثلاً `yazeed-elias-cv` → `https://yazeed-elias-cv.pages.dev`

## البنية
- `index.html` — كل الأقسام
- `assets/css/style.css` — التصميم ونظام الحركة
- `assets/js/main.js` — الظهور عند التمرير، العدادات، الميلان 3D، الشهادات، المعرض
- `assets/js/scene.js` — مشاهد WebGL (البطل + قسم التواصل)
- `assets/vendor/` — three.js r160 (MIT)
