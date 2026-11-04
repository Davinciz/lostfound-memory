const fs = require('fs');
const path = require('path');
const root = __dirname;
const C={bg:'#f9f9f9',ink:'#0b090a',gray:'#e5e5e6',yellow:'#f7fc00',muted:'#474547'};
const slides=[];
const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let parts=[];
function rect(x,y,w,h,fill=C.gray,r=44){parts.push(`<div class="shape" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${fill};border-radius:${r}px"></div>`)}
function line(x,y,w,color=C.yellow,h=7){rect(x,y,w,h,color,0)}
function t(x,y,w,txt,size=30,weight=400,color=C.ink,lh=1.2,extra=''){parts.push(`<div class="txt" style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;font-weight:${weight};color:${color};line-height:${lh};${extra}">${esc(txt).replace(/\n/g,'<br>')}</div>`)}
function circle(x,y,label,fill=C.yellow,ink=C.ink,d=78,size=32){rect(x,y,d,d,fill,d);t(x,y+(d-size*1.2)/2,d,label,size,600,ink,1.2,'text-align:center;')}
function header(n){t(86,58,800,'CAMPUS LOST & FOUND',22,600);t(1360,58,350,'PROGRES PROYEK PBL',22,500);t(1750,58,100,`${String(n).padStart(2,'0')} / 12`,22,500)}
function title(txt,sub,w=550,size=98,x=86,y=160){t(x,y,w,txt,size,700,C.ink,0.98,'letter-spacing:-3px;');const h=txt.split('\n').length*size*.98;line(x,y+h+38,300);if(sub)t(x,y+h+86,w-15,sub,30,400,C.ink,1.3)}
function page(name,seconds,notes,sources,layout,fn){parts=[];header(slides.length+1);fn();slides.push({name,seconds,notes,sources,layout,html:parts.join('\n')})}
function sourceNote(...files){return files.map(f=>'D:\\ObsidianVault\\PBL\\'+f).join('\n')}

page('Judul proyek',25,'Perkenalkan proyek PBL kami, Campus Lost & Found atau CLF. Aplikasi ini membantu warga kampus melaporkan, mencari, dan mengembalikan barang. Presentasi ini menjelaskan fungsi aplikasi dan progres yang tercatat sampai 1 November 2026.',sourceNote('Documents\\RPP.md','Documents\\PRD.md'),'Template 1: judul besar kiri, bidang utama kanan, tiga panel bawah',()=>{
 t(86,151,630,'Lost &\nFound',146,700,C.ink,.96,'letter-spacing:-5px;');line(86,478,300);
 t(110,540,560,'Aplikasi barang hilang\ndan ditemukan di kampus',43,500,C.ink,1.16);rect(86,544,2,100,C.ink,0);
 t(86,700,570,'Penerapan Aplikasi Mobile\nLost & Found (CLF)',31,400);
 rect(86,886,315,135,C.yellow,28);t(116,913,260,'PBL',43,700);t(116,973,265,'PBL-202601-10',25);
 rect(420,886,295,135,C.gray,28);t(450,913,240,'D3',43,700);t(450,973,250,'Teknik Informatika',25);
 rect(792,137,1042,568,C.ink);t(850,190,870,'CAMPUS LOST & FOUND',28,500,C.yellow);
 t(850,270,850,'Lapor. Cari.\nKembalikan.',95,700,C.bg,1.06,'letter-spacing:-2px;');
 line(850,520,920,'#494749',2);t(850,555,870,'Satu tempat untuk laporan barang\ndan komunikasi pemilik dengan penemu.',33,400,C.bg,1.25);
 [[792,309,C.ink,'01','Pelaporan\nbarang'],[1118,309,C.gray,'02','Pencarian\n& claim'],[1444,390,C.yellow,'2026','Progres proyek']].forEach(([x,w,b,num,label])=>{rect(x,724,w,297,b);t(x+38,760,w-76,num,num==='2026'?70:55,700,b===C.ink?C.yellow:C.ink);t(x+38,895,w-70,label,33,600,b===C.ink?C.bg:C.ink,1.12);});
 t(1482,979,320,'1 November',24);
});

page('Anggota kelompok',35,'Tim terdiri atas empat mahasiswa D3 Teknik Informatika. Seluruh anggota tercatat memiliki peran pengembangan, basis data, serta pemrograman UI/UX. Dosen pendamping kami adalah Bapak Amran Yobioktabera. Sebutkan nama anggota secara bergantian bila diperlukan.',sourceNote('Documents\\RPP.md'),'Template 2: judul kiri dan empat kolom tinggi',()=>{
 t(86,180,450,'04',150,700);title('Anggota\nkelompok','D3 Teknik Informatika',470,93,86,490);
 t(86,855,450,'Dosen pendamping',27,600);t(86,903,450,'Amran Yobioktabera,\nS.Kom., M.Kom.',31,500);
 const team=[['Anisa\nAulia','3.34.25.1.04',C.yellow],['Daniel Arvin\nGeovani','3.34.25.1.05',C.gray],['Muhammad\nTsaqif Satria\nFirmansyah','3.34.25.1.18',C.ink],['Steven\nHermawan','3.34.25.1.25',C.gray]];
 team.forEach(([name,nim,b],i)=>{let x=598+i*314;let col=b===C.ink?C.bg:C.ink;rect(x,144,295,860,b);circle(x+38,210,String(i+1).padStart(2,'0'),b===C.ink?C.yellow:C.ink,b===C.ink?C.ink:C.bg,85,32);t(x+34,399,230,name,38,700,col,1.12);line(x+34,639,225,b===C.ink?C.yellow:'#777577',2);t(x+34,685,235,'NIM',25,500,col);t(x+34,737,235,nim,30,500,col);t(x+34,880,230,'Developer, Database,\nUI/UX Programmer',25,400,col,1.25)});
});

page('Deskripsi proyek',40,'CLF adalah aplikasi mobile untuk mahasiswa, dosen, dan karyawan kampus. Pengguna melaporkan barang hilang maupun temuan, lalu mencari laporan yang sesuai. Claim berarti pengajuan terkait barang pada laporan target. Kedua pihak memverifikasi kepemilikan melalui chat dan mencatat serah terima dengan foto. Admin membantu mengelola data.',sourceNote('Documents\\PRD.md','Documents\\TechnicalReference.md'),'Template 4: judul kiri, panel vertikal tengah, daftar abu-abu kanan',()=>{
 title('Deskripsi\nproyek','CLF menyatukan pelaporan, pencarian, dan pengembalian barang di lingkungan kampus.',520,100);
 rect(86,716,520,288,C.ink);t(125,756,440,'Pengguna',36,600,C.yellow);t(125,824,435,'Mahasiswa, dosen, dan karyawan. Admin mengelola data melalui web.',32,400,C.bg,1.25);
 rect(630,150,410,854,C.ink);t(672,205,330,'Alur pengguna',31,600,C.yellow);
 [['01','Buat laporan'],['02','Cari barang'],['03','Ajukan claim'],['04','Verifikasi\nlewat chat'],['05','Serah terima']].forEach(([n,s],i)=>{t(672,300+i*132,80,n,42,600,C.yellow);t(760,306+i*132,245,s,32,500,C.bg,1.12);if(i<4)line(672,393+i*132,300,'#494749',2)});
 rect(1064,150,770,854,C.gray);t(1110,200,680,'Cara aplikasi bekerja',42,700);
 const list=[['Laporan terpusat','Foto, deskripsi, kategori, dan lokasi membantu mengenali barang.'],['Komunikasi langsung','Pemilik dan penemu membahas ciri barang melalui chat.'],['Pengembalian tercatat','Status claim dan foto serah terima menyimpan hasil proses.'],['Mobile dan web admin','Flutter terhubung ke Laravel API. Filament membantu admin mengelola data.']];
 list.forEach(([h,b],i)=>{let y=300+i*166;circle(1110,y+4,String(i+1),C.ink,C.yellow,56,25);t(1190,y,590,h,33,700);t(1190,y+51,585,b,29,400,C.ink,1.22);if(i<3)line(1110,y+145,680,'#bcbcbc',2)});
});

page('Latar belakang',40,'Informasi kehilangan di kampus biasanya tersebar di grup pesan, media sosial, atau pengumuman manual. Pesan mudah tertimbun sehingga orang sulit mencari kembali informasi yang dibutuhkan. Foto dan lokasi juga belum tercatat dengan seragam. Karena itu, proyek ini memusatkan laporan dan menyediakan alur komunikasi serta pengembalian yang lebih jelas.',sourceNote('Documents\\RPP.md','Documents\\PRD.md'),'Template 3: susunan blok kiri, judul dan empat panel kanan',()=>{
 rect(86,145,510,480,C.gray);t(132,194,420,'Informasi\ntersebar',63,700,C.ink,1.03);line(132,370,210);t(132,420,410,'Grup pesan, media sosial, dan pengumuman manual.',33,400,C.ink,1.25);
 rect(86,645,510,358,C.gray);t(132,696,410,'Laporan mudah\ntertimbun pesan.',45,600,C.ink,1.1);t(132,860,410,'Pencarian perlu dilakukan berulang.',31);
 rect(616,145,336,858,C.ink);t(657,210,255,'Perlu satu\npusat\npelaporan\ndi kampus.',48,700,C.bg,1.1);line(657,532,220);t(657,590,255,'Pemilik dan penemu perlu menemukan informasi yang sama.',32,400,C.bg,1.3);
 title('Latar\nbelakang','Proses yang tersebar membuat laporan sulit dicari kembali dan pengembalian sulit ditelusuri.',828,100,1006,150);
 const arr=[['Sulit dicari','Informasi cepat tertutup pesan baru.',C.gray],['Detail berbeda','Foto dan lokasi belum seragam.',C.ink],['Verifikasi terpisah','Pembahasan kepemilikan belum terarah.',C.gray],['Hasil tidak tercatat','Pengembalian perlu jejak yang jelas.',C.yellow]];
 arr.forEach(([h,b,bg],i)=>{let x=1006+(i%2)*420,y=644+Math.floor(i/2)*190;rect(x,y,408,170,bg,40);let col=bg===C.ink?C.bg:C.ink;t(x+30,y+28,350,h,33,700,col);t(x+30,y+81,350,b,28,400,col,1.16)});
});

page('Tujuan dan manfaat',40,'Tujuannya adalah memudahkan pelaporan, pencarian, verifikasi, dan pencatatan pengembalian barang. Bagi pengguna, foto dan titik lokasi membantu menilai apakah barang yang ditemukan sesuai. Chat membantu kedua pihak memeriksa ciri khusus barang. Bagi admin, data yang terkumpul memudahkan pengelolaan laporan dan claim.',sourceNote('Documents\\RPP.md','Documents\\PRD.md'),'Template 6: baris horizontal kiri, judul kanan',()=>{
 const rows=[['Pelaporan terpusat','Pengguna membuat laporan hilang atau temuan di satu aplikasi.'],['Pencarian lebih terarah','Kata kunci dan filter membantu mempersempit laporan yang dicari.'],['Verifikasi kepemilikan','Chat membantu kedua pihak membahas ciri khusus barang.'],['Pengembalian tercatat','Status claim dan foto menjadi catatan proses serah terima.'],['Pengelolaan kampus','Admin memantau laporan, claim, gedung, dan pengguna.']];
 rows.forEach(([h,b],i)=>{let y=160+i*170,bg=i===0?C.ink:C.gray,col=i===0?C.bg:C.ink;rect(86,y,1020,154,bg,42);circle(120,y+37,String(i+1).padStart(2,'0'),C.yellow,C.ink,78,30);t(232,y+31,340,h,35,600,col,1.1);rect(586,y+28,2,96,i===0?'#626062':'#aaa9aa',0);t(625,y+30,435,b,30,400,col,1.22)});
 title('Tujuan dan\nmanfaat','Membantu warga kampus menemukan informasi barang dan menyelesaikan pengembaliannya.',660,97,1174,160);
 rect(1174,676,660,318,C.ink);t(1220,718,570,'Hasil yang diharapkan',33,600,C.yellow);t(1220,790,565,'Laporan lebih mudah ditemukan, komunikasi lebih jelas, dan pengembalian memiliki catatan.',40,500,C.bg,1.18);
});

page('Modul pelaporan dan pencarian',55,'Empat modul pertama mendukung pelaporan dan pencarian. Pengguna masuk dengan akun Google kampus dan melihat profil serta riwayat laporan. Laporan memuat identitas barang, foto, tanggal, dan lokasi. Kamera, galeri, pin peta, serta saran gedung membantu melengkapi laporan. Pencarian kemudian membantu pengguna menemukan laporan yang relevan.',sourceNote('Documents\\PRD.md','Documents\\TechnicalReference.md','DailyChanges\\2026-11-01.md'),'Template 5: judul kiri, satu panel utama dan empat panel kecil kanan',()=>{
 title('Modul\npelaporan &\npencarian','Pengguna dapat mencatat barang dengan jelas dan menemukan laporan yang sesuai.',540,92);
 rect(86,780,540,224,C.ink);t(126,822,460,'Fokus pengguna',31,600,C.yellow);t(126,880,450,'Membuat laporan yang bisa dipahami dan dicari orang lain.',33,400,C.bg,1.2);
 rect(660,145,1174,248,C.ink);circle(704,190,'01',C.yellow,C.ink,100,40);t(846,189,870,'Akun dan profil',45,700,C.bg);line(846,259,220);t(846,294,865,'Masuk dengan Google kampus, melihat identitas akun,\ndan membuka riwayat laporan sendiri.',32,400,C.bg,1.2);
 const mods=[['02','Laporan hilang','Pemilik mencatat barang yang hilang agar pengguna lain dapat mengenalinya.'],['03','Laporan temuan','Penemu membagikan ciri barang agar pemilik dapat mencari dan mengajukan claim.'],['04','Foto dan lokasi','Foto, pin peta, dan saran gedung memperjelas barang serta tempat kejadian.'],['05','Cari dan filter','Kata kunci, jenis, kategori, lokasi, dan waktu membantu pengguna mempersempit pencarian.']];
 mods.forEach(([n,h,b],i)=>{let x=660+(i%2)*600,y=413+Math.floor(i/2)*302;rect(x,y,574,282,C.gray);t(x+36,y+36,420,h,36,700);t(x+485,y+36,65,n,34,500);line(x+36,y+104,200,'#aaa9aa',2);t(x+36,y+136,493,b,30,400,C.ink,1.22)});
});

page('Modul pengembalian dan pengelolaan',55,'Setelah menemukan laporan yang sesuai, pengguna dapat mengajukan claim langsung tanpa wajib membuat laporan sendiri. Chat dipakai untuk membahas ciri kepemilikan dan mengatur pertemuan. Foto serah terima mencatat penyelesaian. Admin mengelola data dan membantu pemantauan. Modul notifikasi bertujuan memberi kabar perubahan proses, tetapi integrasinya masih sebagian.',sourceNote('Documents\\PRD.md','Documents\\TechnicalReference.md','DailyChanges\\2026-11-01.md'),'Template 7: empat kolom proses dan bidang horizontal bawah',()=>{
 title('Modul claim,\nchat & admin','Fungsi lanjutan membantu pemilik, penemu, dan admin menyelesaikan proses barang.',590,86);
 rect(86,790,590,214,C.ink);t(126,832,505,'Claim',38,700,C.yellow);t(126,890,500,'Pengajuan terkait barang pada laporan target.',32,400,C.bg);
 const mods=[['01','Claim &\nserah terima','Ajukan dan proses claim. Foto menjadi catatan serah terima barang.',C.gray],['02','Chat\nverifikasi','Bahas ciri barang dan pertemuan. Kartu laporan menjaga konteks chat.',C.yellow],['03','Dashboard\nadmin','Kelola laporan, claim, gedung, dan pengguna melalui web.',C.gray],['04','Notifikasi','Memberi kabar perubahan claim. Integrasinya masih perlu dilengkapi.',C.yellow]];
 mods.forEach(([n,h,b,bg],i)=>{let x=718+i*282;rect(x,188,264,580,bg,44);circle(x+30,225,n,C.ink,bg===C.yellow?C.yellow:C.bg,80,31);t(x+30,345,205,h,35,700,C.ink,1.06);line(x+30,480,204,'#898889',2);t(x+30,519,205,b,29,400,C.ink,1.22)});
 rect(718,790,1116,214,C.ink);t(758,828,1020,'Alur pengembalian',34,600,C.yellow);['Ajukan claim','Verifikasi chat','Setujui claim','Foto serah terima'].forEach((s,i)=>{circle(758+i*263,900,String(i+1),C.yellow,C.ink,44,22);t(816+i*263,902,200,s,26,500,C.bg)});
});

page('Progres akun, laporan, dan pencarian',50,'Modul inti sudah tersedia. Login mahasiswa pernah diuji pada HP fisik. Pelaporan, foto, dan lokasi sudah digunakan. Perbaikan terbaru memastikan submit laporan tidak membuat aplikasi crash, baik dengan maupun tanpa izin lokasi. Perbaikan pencarian dan pembagian halaman memiliki bukti pengujian backend. Namun, pemeriksaan semua layar dan seluruh jenis akun tetap perlu dilanjutkan.',sourceNote('Documents\\TechnicalReference.md §14','Documents\\Lost&Found Progress.md: Archive dan UI v3','Inbox\\reports\\Ajax-261101-07-fix-location-dispose-crash.md','Inbox\\reports\\Dominic-261101-08-catat-fix-crash-lokasi.md'),'Template 8: judul kiri, dua bidang bertingkat kanan',()=>{
 title('Progres akun,\nlaporan &\npencarian','Fitur inti tersedia. Bukti uji mencakup perangkat, pengujian otomatis, dan konfirmasi pengguna.',585,88);
 rect(86,790,580,214,C.gray);t(126,829,500,'Masih diperiksa',32,700);t(126,886,495,'Semua layar, domain akun lain, dan variasi izin lokasi.',32,400,C.ink,1.25);
 rect(718,150,1116,405,C.ink);t(762,195,1000,'Akun dan laporan',42,700,C.yellow);
 const a=[['Google kampus','Login mahasiswa teruji di HP. Domain akun lain belum seluruhnya terverifikasi.'],['Laporan & riwayat','Laporan hilang/temuan dengan foto dan lokasi tersedia. Riwayat laporan pernah diuji di HP.']];
 a.forEach(([h,b],i)=>{let x=762+i*535;t(x,291,455,h,35,700,C.bg);t(x,353,450,b,31,400,C.bg,1.24)});rect(1272,286,2,215,'#666466',0);
 rect(718,577,1116,427,C.gray);t(762,622,1000,'Lokasi dan pencarian',42,700);
 const b=[['Foto & lokasi','Submit dengan dan tanpa izin lokasi tidak crash, dikonfirmasi 1 November.'],['Pencarian & filter','Perbaikan pencarian dan pembagian halaman tercatat lulus uji backend.']];
 b.forEach(([h,txt],i)=>{let x=762+i*535;t(x,718,460,h,35,700);t(x,781,450,txt,31,400,C.ink,1.24)});rect(1272,713,2,220,'#b2b1b2',0);
});

page('Progres claim dan serah terima',60,'Claim langsung, keputusan penerima, pencabutan oleh pengaju, dan serah terima dengan foto sudah tersedia. Perbaikan HTTP 500 dan transport unggah foto sudah memiliki bukti uji otomatis serta konfirmasi manual pengguna. Angka pengujian berasal dari patch tersebut, bukan bukti semua kombinasi sudah diuji. Pengujian seluruh peran, kamera dan galeri masih perlu dilengkapi. Penutupan otomatis claim pending lain belum tersedia.',sourceNote('Inbox\\reports\\GPT-261101-05-fix-withdraw-500-transfer-policy.md: Konfirmasi akhir user','Inbox\\reports\\GPT-261101-05-fix-upload-foto-serah-terima.md: Konfirmasi akhir user','DailyChanges\\2026-11-01.md'),'Template 9: tiga kolom status dan baris rangkuman',()=>{
 title('Progres claim\n& serah terima','Aksi claim dan unggah foto telah dikonfirmasi berhasil oleh pengguna pada 1 November.',590,82);
 rect(86,734,580,270,C.ink);t(126,776,500,'Perbaikan terbaru',32,600,C.yellow);t(126,839,500,'Error aksi claim dan unggah foto sudah diperbaiki dan diuji.',37,500,C.bg,1.2);
 const cols=[['Tersedia',C.yellow,['Claim langsung ke laporan target.','Penerima menerima atau menolak. Pengaju dapat mencabut claim.','Serah terima dengan foto bukti.']],['Bukti pengujian',C.ink,['284 pengujian backend lulus pada patch claim.','188 pengujian Flutter lulus, 4 dilewati pada patch foto.','Pengguna mengonfirmasi aksi claim dan unggah foto berhasil.']],['Masih terbuka',C.gray,['Lengkapi uji seluruh peran dan pilihan kamera/galeri.','Notifikasi claim di Flutter belum dibuat.','Claim pending lain belum ditutup otomatis.']]];
 cols.forEach(([h,bg,arr],i)=>{let x=718+i*378,col=bg===C.ink?C.bg:C.ink;rect(x,150,358,672,bg);t(x+30,192,300,h,41,700,col,1.08);line(x+30,302,298,bg===C.ink?C.yellow:'#8d8c8d',2);arr.forEach((s,j)=>t(x+30,345+j*149,298,s,30,400,col,1.23))});
 rect(718,844,1116,160,C.ink);t(760,879,1026,'Tersedia dan teruji pada skenario yang dilaporkan.',38,600,C.yellow);t(760,941,1026,'Cakupan uji manual belum mencakup seluruh kombinasi.',29,400,C.bg);
});

page('Progres chat dan arsip',65,'Chat real time sudah teruji pada dua HP, dan kartu konteks barang sudah dikonfirmasi berhasil. Fitur arsip serta hapus untuk saya merupakan tambahan terbaru. Kode backend dan Flutter sudah digabung, tetapi hal itu belum membuktikan penerapannya di server. Lima pengujian Flutter baru lulus dalam suite terbaru. Dua puluh tiga kasus backend belum bisa dijalankan. Uji manual dua akun, migrasi produksi, dan scheduler masih perlu diverifikasi.',sourceNote('Documents\\Lost&Found Progress.md: Real-Time Chat','DailyChanges\\2026-11-01.md: status merge report_context','Inbox\\reports\\Bob-261101-09-arsip-hapus-chat-backend.md','Inbox\\reports\\Ajax-261101-10-arsip-hapus-chat-ui.md','Inbox\\reports\\Dominic-261101-11-sinkron-arsip-hapus-chat.md'),'Template 7: empat kolom status dan bidang rangkuman bawah',()=>{
 title('Progres chat\n& arsip','Chat dasar sudah teruji. Arsip dan hapus chat masih memerlukan pengujian lanjutan.',575,96);
 rect(86,760,575,244,C.ink);t(126,801,490,'Chat aktif',34,600,C.yellow);t(126,862,490,'Kirim dan terima pesan real time telah diuji pada dua HP.',34,400,C.bg,1.23);
 const cards=[['01','Chat dasar','Kirim/terima real time teruji dua HP. Kartu konteks barang dikonfirmasi berhasil.',C.yellow],['02','Kode tergabung','Arsip, buka arsip, dan hapus untuk saya sudah ditulis di backend serta Flutter.',C.gray],['03','Uji otomatis','Flutter terbaru: 193 lulus, 4 dilewati. 23 kasus backend arsip belum dijalankan.',C.gray],['04','Belum terbukti','Uji manual dua akun, deploy/migrasi produksi, dan scheduler belum terverifikasi.',C.yellow]];
 cards.forEach(([n,h,b,bg],i)=>{let x=718+i*282;rect(x,168,264,595,bg);circle(x+30,205,n,C.ink,C.yellow,80,31);t(x+30,337,205,h,37,700,C.ink,1.08);line(x+30,449,200,'#939293',2);t(x+30,496,205,b,29,400,C.ink,1.24)});
 rect(718,785,1116,219,C.ink);t(760,825,1000,'Arsip otomatis 14 hari',39,700,C.yellow);t(760,889,1010,'Jadwal sudah didaftarkan. Proses penjadwal di server\nbelum terbukti berjalan. Claim aktif dikecualikan.',32,400,C.bg,1.22);
});

page('Progres admin dan fitur pendukung',50,'Admin sudah memiliki pengelolaan laporan, claim, gedung, dan pengguna. Pengujian manual sebelumnya memastikan halaman daftar, detail, tambah, serta ubah laporan bekerja. Aksi claim di Filament belum memiliki pengujian otomatis khusus. Pengiriman notifikasi claim tersedia sebagian pada backend, tetapi penanganan claim di Flutter dan uji notifikasi perangkat belum selesai. WhatsApp masih memerlukan fasilitas pengisian nomor.',sourceNote('Documents\\TechnicalReference.md §11, §17','Documents\\Lost&Found Progress.md: Archive, Push Notification, Nomor WhatsApp','DailyChanges\\2026-11-01.md'),'Template 6: empat baris horizontal kiri, judul kanan',()=>{
 const rows=[['Admin','Tersedia','Kelola laporan, claim, gedung, dan pengguna. Halaman laporan teruji manual.'],['Uji admin','Sebagian','Aksi claim memakai uji service. Test otomatis khusus Filament belum ada.'],['Notifikasi','Sebagian','Pengiriman claim ada di backend. Penanganan Flutter dan uji perangkat belum lengkap.'],['WhatsApp','Rencana','Pengisian nomor belum memiliki endpoint. Integrasi belum dapat dinyatakan lengkap.']];
 rows.forEach(([h,s,b],i)=>{let y=168+i*203,bg=i===0?C.ink:C.gray,col=i===0?C.bg:C.ink;rect(86,y,1030,184,bg);circle(120,y+51,String(i+1).padStart(2,'0'),C.yellow,C.ink,78,31);t(232,y+29,310,h,35,700,col);t(232,y+94,310,s,27,600,i===0?C.yellow:C.ink);rect(555,y+30,2,123,i===0?'#686668':'#b5b4b5',0);t(594,y+30,475,b,31,400,col,1.23)});
 title('Progres admin\n& fitur\npendukung','Fitur pendukung berada pada tingkat kesiapan yang berbeda.',645,89,1188,170);
 rect(1188,735,646,243,C.ink);t(1230,777,560,'Tampilan aplikasi',33,600,C.yellow);t(1230,838,555,'UI v3 sudah digabung. Pemeriksaan seluruh layar di HP masih dilanjutkan.',34,400,C.bg,1.23);
});

page('Progres keseluruhan proyek',40,'Secara keseluruhan, alur utama sudah tersedia dan sebagian sudah diuji pada perangkat. Kami belum menyatakan seluruh proyek selesai. Fokus berikutnya adalah menguji arsip dan hapus chat pada dua akun, memastikan penjadwal otomatis bekerja di server, melengkapi notifikasi claim, serta memeriksa seluruh layar. Kami menggunakan status berbasis bukti karena dokumentasi tidak menetapkan persentase progres resmi. Terima kasih.',sourceNote('DailyChanges\\2026-11-01.md','Inbox\\reports\\Dominic-261101-11-sinkron-arsip-hapus-chat.md','Documents\\TechnicalReference.md §17'),'Template 11: bidang besar kiri, judul besar kanan dan tiga panel bawah',()=>{
 rect(86,150,1050,528,C.ink);t(132,200,920,'ALUR UTAMA TERSEDIA',29,600,C.yellow);t(132,280,915,'Laporan, pencarian,\nclaim, chat, dan\nserah terima.',78,700,C.bg,1.07,'letter-spacing:-2px;');line(132,568,920,'#5a585a',2);t(132,607,930,'Sebagian skenario telah diuji pada perangkat.',32,400,C.bg);
 t(1200,156,634,'Progres\nkeseluruhan\nproyek',91,700,C.ink,.99,'letter-spacing:-3px;');line(1200,472,300);
 t(1200,530,620,'Proyek masih dalam penyelesaian integrasi dan pengujian menyeluruh.',42,500,C.ink,1.18);
 const a=[['01','Uji arsip & hapus','Dua akun dan data server.',C.yellow],['02','Pastikan scheduler','Arsip dan kedaluwarsa claim.',C.gray],['03','Lengkapi kualitas','Notifikasi dan seluruh layar.',C.ink]];
 a.forEach(([n,h,b,bg],i)=>{let x=86+i*357,col=bg===C.ink?C.bg:C.ink;rect(x,702,336,302,bg);t(x+32,738,270,n,55,700,bg===C.ink?C.yellow:C.ink);t(x+32,832,275,h,34,700,col,1.12);t(x+32,927,270,b,28,400,col,1.18)});
 rect(1200,766,634,238,C.ink);t(1240,808,550,'Terima kasih',57,700,C.yellow);t(1240,900,545,'Diskusi dan masukan',34,500,C.bg);
});

const css=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box}html,body{margin:0;padding:0;background:#d1d1d1;font-family:'DM Sans',Arial,sans-serif}section{position:relative;width:1920px;height:1080px;background:${C.bg};overflow:hidden;margin:0}.shape,.txt{position:absolute}.txt{white-space:normal;overflow:visible;margin:0;padding:0} @media print{section{page-break-after:always}}`;
const html=`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Lost & Found — Progres Proyek PBL — 1 November 2026</title><style>${css}</style></head><body>${slides.map((s,i)=>`<section data-document-role="page" data-label="${esc(s.name)}" data-speaker-notes="${esc('Alokasi '+s.seconds+' detik. '+s.notes+'\n\nSumber (tidak dibacakan):\n'+s.sources)}" aria-label="Slide ${i+1}">${s.html}</section>`).join('\n')}</body></html>`;
fs.writeFileSync(path.join(root,'lostfound-canva.html'),html);
fs.writeFileSync(path.join(root,'slide-manifest.json'),JSON.stringify(slides.map(({html,...s},i)=>({slide:i+1,...s})),null,2));
fs.writeFileSync(path.join(root,'catatan-presenter.md'),'# Lost & Found — Catatan presenter\n\nTanggal status: 1 November 2026. Total alokasi: '+slides.reduce((a,s)=>a+s.seconds,0)+' detik (9 menit 15 detik).\n\n'+slides.map((s,i)=>`## ${i+1}. ${s.name} (${s.seconds} detik)\n\n${s.notes}\n\nSumber (tidak dibacakan):\n${s.sources.split('\n').map(v=>'- '+v).join('\n')}\n`).join('\n'));
console.log(JSON.stringify({slides:slides.length,seconds:slides.reduce((a,s)=>a+s.seconds,0),html:path.join(root,'lostfound-canva.html')}));
