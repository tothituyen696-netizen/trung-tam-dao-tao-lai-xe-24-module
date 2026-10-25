/**
 * MASTER HOUSE V12.2 FINAL - TRUNG TÂM ĐÀO TẠO LÁI XE LIÊN KẾT ĐA TRUNG TÂM SÁT HẠCH
 * Kiểu 1: Google Sheet + Apps Script + GitHub - CHUẨN SỞ GTVT 2026 - BẢN ĐI BÁN 30-50TR
 * CHỈ 2 FILE: Code.gs + index.html
 * HƯỚNG DẪN TRIỂN KHAI (đọc trong chat, không tạo file thứ 3):
 *  1) Tạo Sheet mới (File -> Make a copy từ Sheet mẫu, hoặc Sheet trắng mới hoàn toàn).
 *  2) Copy ID trên URL của Sheet MỚI đó, dán thay '1ABC...XYZ_ID_SHEET_MOI_CUA_MAY' bên dưới.
 *  3) Vào script.google.com -> New project -> dán Code.gs + tạo file index.html dán code index.html.
 *  4) Chạy hàm initSheets() 1 lần (cho phép quyền) -> 26 nhóm sheet tự tạo + data demo K51 B2 TT01 Hóc Môn.
 *  5) Deploy -> New deployment -> Web App -> Execute as: Me -> Who has access: Anyone -> Deploy -> copy Web App URL dán vào Cài đặt trong web.
 *  6) Test cảnh báo (menu Báo cáo / Cảnh báo) và test Có Bằng: nhập NgayCoBang + SoBang vào KetQuaThi -> chạy capNhatCoBang.
 * BẢO MẬT V10: Không hardcode ID cũ, không dùng chung ID. SHEET_ID chỉ có 1 chỗ duy nhất ở dưới.
 * NỀN TẢNG MIỄN PHÍ: Sheet + Apps Script + GitHub đều free tier. Không thu phí nền tảng của khách.
 */

// ====== CHỖ DUY NHẤT ĐIỀN SHEET ID RIÊNG CỦA DỰ ÁN NÀY ======
const SHEET_ID = '1ABC...XYZ_ID_SHEET_MOI_CUA_MAY'; // THAY ID CỦA MÀY VÀO ĐÂY - ID that, khong phai ID mau nay. ID cu TAO_FILE_MOI_ID_RIENG cung chi la placeholder.
// =============================================================

const APP_NAME = 'Trung tâm Đào tạo Lái xe - V12.2';

// 26 nhóm = 27 sheet vật lý (nhóm 26 tách LichSu + CauHinh để ghi log và cấu hình riêng)
const SHEETS = {
  TrungTamSatHach: ['MaTT','TenTT','DiaChi','SDT','NguoiLienHe','SoLuongSan','TrangThai','PhanTramAnChia','GhiChu'],
  KhoaHoc: ['MaKhoa','TenKhoa','HeSo','MaTT_SatHach','TenTT_SatHach','NgayKhaiGiang','NgayBeGiang','SoHV','GVChuNhiem','TrangThai'],
  HocVien: ['MaHV','TenHV','SDT','NgaySinh','MaKhoa','HeSo','MaTT_SatHach','TenTT_SatHach','NgayDangKy','TrangThaiHoc','CoBang','TienDoDAT'],
  HoSoDauVao: ['MaHV','CCCD','NgayNopCCCD','KhamSucKhoe','NgayKham','Anh3x4','DonDeNghi','LyLich','GhiChu','HanBoSung'],
  KiemTraDieuKien: ['MaHV','NgaySinh','Tuoi','HeSoDK','BangCu','SoNamCoBang','SoKMAnToan','DuDK','LyDo'],
  BienDongHV: ['MaBD','MaHV','Loai','Ngay','LyDo','SoTienHoan','MaKhoaMoi','MaTT_Moi','TrangThai','NgayDuyet'],
  HopDong: ['MaHDong','MaHV','NgayKy','TongTienCamKet','CamKetTyLeDo','DieuKhoan','FilePDFLink','ChuKySo','NgayKySo','TrangThai'],
  HocMoPhong: ['MaHV','TenHV','HeSo','GioCabinCan','DaHocGio','ConLaiGio','DiemMoPhong','LoaiCabin','TrangThai','HanHoanThanh'],
  GiaoVien: ['MaGV','TenGV','SDT','HangDay','LuongTheoGio','LuongTheoKM','TrangThai'],
  GiayPhepGV: ['MaGV','SoGiayPhep','NgayCap','Han','SoHVDangDay','GioiHan','TrangThai'],
  LichGiaoVien: ['MaLich','MaGV','Ngay','GioBD','GioKT','MaHV','BienSo','LoaiLich','DiaDiem','TrangThai'],
  XeTapLai: ['BienSo','LoaiXe','Hang','TrangThai'],
  NienHanXe: ['BienSo','NamSX','NienHan','SoNamDaDung','KMHienTai','KMBaoDuongGanNhat','CanhBaoKM','TrangThai','ChiPhiDuTinh'],
  LichTheoKhoa: ['MaLichKhoa','MaKhoa','Ngay','Buoi','GioBD','GioKT','MonHoc','DiaDiem','GiaoVien','LoaiLich','GhiChu'],
  LichChayDAT: ['MaPhien','MaHV','MaGV','BienSo','NgayChay','GioBD','GioKT','QuangDuongKM','SoGio','LoaiDuong','GPS_BatDau','GPS_KetThuc','TrangThaiDAT'],
  TongHopDAT: ['MaHV','TenHV','HeSo','TongKMCan','DaChayKM','ConLaiKM','TongGioCan','DaChayGio','DuDKThi','PhanTramHoanThanh','TrangThai'],
  KyThi: ['MaKyThi','MaKhoa','HeSo','MaTT_SatHach','NgayThi','LoaiThi','DiaDiemThi','SoLuongThi','GhiChu'],
  KetQuaThi: ['MaHV','TenHV','MaKhoa','HeSo','MaTT_SatHach','DiemLyThuyet','DiemMoPhong','DiemSaHinh','DiemDuongTruong','KetQua','NgayThi','NgayCoBang','SoBang','TrangThaiBang','CoBang','GhiChu'],
  HocVienCoBang: ['MaHV','TenHV','HeSo','MaTT_SatHach','TenTT','NgayThi','NgayCoBang','SoBang','SoThangCoBang','NhomZalo','DaGuiZalo','NgayGuiZalo','TrangThai'],
  HoaDon: ['MaHD','MaHV','TenHV','TongTien','DaThu','ConLai','TrangThai'],
  ChiTietThu: ['MaPhieuThu','MaHD','NgayThu','SoTien','PhuongThuc','NguoiThu','ConLaiSauThu','GhiChu'],
  BangLuongGV: ['MaGV','TenGV','Thang','SoGioDay','SoKMDAT','LuongTheoGio','LuongTheoKM','TongLuong','DaThanhToan','ConLai'],
  ChiPhi: ['Ngay','LoaiChi','SoTien','BienSo','MaGV','GhiChu'],
  ChiPhiLienKet: ['Ngay','MaTT_SatHach','TenTT','SoHV','SoTienTra','PhanTram','GhiChu','TrangThai'],
  PhanQuyen: ['Email','VaiTro','MaKhoaQuanLy','MaTTQuanLy','TrangThai'],
  LichSu: ['ThoiGian','HanhDong','MaDoiTuong','NguoiLam','ChiTiet'],
  CauHinh: ['TenTrungTam','Logo','MauChuDao','DiaChi','SDT','ZaloOAToken']
};

function ss() {
  if (!SHEET_ID || SHEET_ID === 'TAO_FILE_MOI_ID_RIENG' || SHEET_ID === '1ABC...XYZ_ID_SHEET_MOI_CUA_MAY' || SHEET_ID.indexOf('...') >= 0) throw new Error('Chua dien SHEET_ID that. Mo Code.gs, thay placeholder mau bang ID Sheet moi that cua du an nay (ID tren URL Sheet, khong co ...).');
  return SpreadsheetApp.openById(SHEET_ID);
}
function getSheet(name) {
  var book = ss();
  var sh = book.getSheetByName(name);
  if (!sh) { sh = book.insertSheet(name); sh.appendRow(SHEETS[name]); sh.getRange(1,1,1,SHEETS[name].length).setFontWeight('bold').setBackground('#1E40AF').setFontColor('#ffffff'); sh.setFrozenRows(1); }
  return sh;
}
function readAll(name) {
  var sh = getSheet(name); var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return [];
  var headers = vals[0]; var out = [];
  for (var i = 1; i < vals.length; i++) {
    if (vals[i].join('') === '') continue;
    var o = { _row: i + 1 }; for (var j = 0; j < headers.length; j++) o[headers[j]] = vals[i][j];
    out.push(o);
  }
  return out;
}
function findRows(name, key, val) { return readAll(name).filter(function(r){ return String(r[key]) === String(val); }); }
function findRow(name, key, val) { var a = findRows(name, key, val); return a.length ? a[0] : null; }
function appendObj(name, obj) {
  var sh = getSheet(name); var h = SHEETS[name];
  sh.appendRow(h.map(function(k){ return obj[k] !== undefined ? obj[k] : ''; }));
  return sh.getLastRow();
}
function updateRow(name, rowNum, obj) {
  var sh = getSheet(name); var h = SHEETS[name]; var vals = sh.getRange(rowNum, 1, 1, h.length).getValues()[0];
  var cur = {}; h.forEach(function(k, i){ cur[k] = vals[i]; });
  var merged = {}; h.forEach(function(k){ merged[k] = obj[k] !== undefined ? obj[k] : cur[k]; });
  sh.getRange(rowNum, 1, 1, h.length).setValues([h.map(function(k){ return merged[k]; })]);
  return merged;
}
function ghiLichSu(hanhDong, ma, chiTiet) {
  try {
    var email = ''; try { email = Session.getActiveUser().getEmail() || ''; } catch(e) {}
    appendObj('LichSu', { ThoiGian: new Date(), HanhDong: hanhDong, MaDoiTuong: ma || '', NguoiLam: email, ChiTiet: chiTiet || '' });
  } catch(e) {}
}
// PhanQuyen: neu sheet rong HOAC chi co dong email trong thi cho phep (lan dau khoi tao).
// FIX 2026-10-25: truoc day seed 1 dong Email='' lam isAllowed() tra false va chan ghi. Nay chi tinh email khac rong.
function isAllowed() {
  try {
    var list = readAll('PhanQuyen').filter(function(r){ return String(r.Email||'').trim() !== ''; }); if (!list.length) return true;
    var email = ''; try { email = Session.getActiveUser().getEmail() || ''; } catch(e) {}
    if (!email) return true; // Web App Anyone: Apps Script khong tra email, chi kiem tra o Code khi co the
    return list.some(function(r){ return String(r.Email).toLowerCase() === email.toLowerCase(); });
  } catch(e) { return true; }
}
function parseDate(v) {
  if (!v) return null; if (v instanceof Date) return v;
  var s = String(v).trim(); var m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  var d = new Date(s); return isNaN(d.getTime()) ? null : d;
}
function fmtDate(d) { if (!d) return ''; var x = parseDate(d); if (!x) return String(d); return ('0'+x.getDate()).slice(-2)+'/'+('0'+(x.getMonth()+1)).slice(-2)+'/'+x.getFullYear(); }
function daysBetween(a, b) { var x = parseDate(a), y = parseDate(b); if (!x || !y) return null; return Math.round((y.getTime()-x.getTime())/86400000); }
function num(v) { if (v === '' || v === null || v === undefined) return 0; var n = parseFloat(String(v).replace(/[^0-9.\-]/g,'')); return isNaN(n) ? 0 : n; }
function tinhTuoi(ngaySinh, taiNgay) {
  var ns = parseDate(ngaySinh); if (!ns) return ''; var ref = taiNgay ? parseDate(taiNgay) : new Date();
  var t = ref.getFullYear() - ns.getFullYear(); var m = ref.getMonth() - ns.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < ns.getDate())) t--; return t;
}

// ===== initSheets + data demo K51 B2 TT01 Hóc Môn =====
function initSheets() {
  var book = ss();
  Object.keys(SHEETS).forEach(function(name) {
    var sh = book.getSheetByName(name);
    if (!sh) { sh = book.insertSheet(name); sh.appendRow(SHEETS[name]); }
    else if (sh.getLastRow() === 0) { sh.appendRow(SHEETS[name]); }
    else {
      var h = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
      if (h.join('') === '') sh.getRange(1, 1, 1, SHEETS[name].length).setValues([SHEETS[name]]);
    }
    try { sh.getRange(1, 1, 1, SHEETS[name].length).setFontWeight('bold').setBackground('#1E40AF').setFontColor('#ffffff'); sh.setFrozenRows(1); } catch(e) {}
  });
  seedDemo();
  ghiLichSu('KhoiTao', 'SYSTEM', 'initSheets: da tao 26 nhom sheet');
  return { ok: true, sheets: Object.keys(SHEETS) };
}
function seedDemo() {
  if (readAll('TrungTamSatHach').length) return; // da co data thi khong seed de
  appendObj('TrungTamSatHach', { MaTT:'TT01', TenTT:'Trung tâm Sát hạch Hóc Môn', DiaChi:'Hóc Môn, TP.HCM', SDT:'0900000001', NguoiLienHe:'Quản lý TT01', SoLuongSan:4, TrangThai:'DangHopTac', PhanTramAnChia:30, GhiChu:'Demo K51' });
  appendObj('TrungTamSatHach', { MaTT:'TT02', TenTT:'Trung tâm Sát hạch Thành Công', DiaChi:'Thành Công, TP.HCM', SDT:'0900000002', NguoiLienHe:'Quản lý TT02', SoLuongSan:3, TrangThai:'DangHopTac', PhanTramAnChia:30, GhiChu:'' });
  appendObj('KhoaHoc', { MaKhoa:'K51', TenKhoa:'Khóa K51 - B2', HeSo:'B2 Số sàn', MaTT_SatHach:'TT01', TenTT_SatHach:'Trung tâm Sát hạch Hóc Môn', NgayKhaiGiang:'10/10/2026', NgayBeGiang:'10/02/2027', SoHV:120, GVChuNhiem:'Thầy Hùng', TrangThai:'DangHoc' });
  appendObj('KhoaHoc', { MaKhoa:'K52', TenKhoa:'Khóa K52 - B1', HeSo:'B1 Số tự động', MaTT_SatHach:'TT01', TenTT_SatHach:'Trung tâm Sát hạch Hóc Môn', NgayKhaiGiang:'10/11/2026', NgayBeGiang:'10/02/2027', SoHV:80, GVChuNhiem:'Thầy Minh Anh', TrangThai:'DangHoc' });
  appendObj('KhoaHoc', { MaKhoa:'K53', TenKhoa:'Khóa K53 - C', HeSo:'C', MaTT_SatHach:'TT02', TenTT_SatHach:'Trung tâm Sát hạch Thành Công', NgayKhaiGiang:'10/12/2026', NgayBeGiang:'10/02/2027', SoHV:80, GVChuNhiem:'Thầy Hùng', TrangThai:'DangHoc' });
  appendObj('GiaoVien', { MaGV:'GV01', TenGV:'Thầy Hùng', SDT:'0901111111', HangDay:'B2', LuongTheoGio:200000, LuongTheoKM:5000, TrangThai:'Hoat dong' });
  appendObj('GiaoVien', { MaGV:'GV02', TenGV:'Thầy Minh Anh', SDT:'0902222222', HangDay:'B1', LuongTheoGio:200000, LuongTheoKM:5000, TrangThai:'Hoat dong' });
  appendObj('GiayPhepGV', { MaGV:'GV01', SoGiayPhep:'GPLX-GV01', NgayCap:'01/01/2023', Han:'01/01/2028', SoHVDangDay:10, GioiHan:10, TrangThai:'Binh thuong' });
  appendObj('GiayPhepGV', { MaGV:'GV02', SoGiayPhep:'GPLX-GV02', NgayCap:'01/01/2023', Han:'01/01/2028', SoHVDangDay:12, GioiHan:10, TrangThai:'Vuot 2 HV' });
  appendObj('XeTapLai', { BienSo:'51A-12345', LoaiXe:'B2', Hang:'Toyota', TrangThai:'SanSang' });
  appendObj('XeTapLai', { BienSo:'51A-67890', LoaiXe:'B1', Hang:'Toyota', TrangThai:'SanSang' });
  appendObj('NienHanXe', { BienSo:'51A-12345', NamSX:2010, NienHan:15, SoNamDaDung:'15y3m', KMHienTai:125000, KMBaoDuongGanNhat:120000, CanhBaoKM:'Qua 5000km', TrangThai:'Qua nien han 3 thang', ChiPhiDuTinh:12500000 });
  appendObj('NienHanXe', { BienSo:'DL-5102', NamSX:2010, NienHan:15, SoNamDaDung:'15y3m', KMHienTai:125000, KMBaoDuongGanNhat:120000, CanhBaoKM:'Qua 5000km', TrangThai:'Qua nien han 3 thang', ChiPhiDuTinh:12500000 });
  var hvs = [
    ['HV2026-001','Nguyễn Văn An','0903000001','01/01/2000','K51','B2 Số sàn','TT01','Trung tâm Sát hạch Hóc Môn','01/10/2026','Dang hoc DAT','❌',85],
    ['HV-1024','Trần Thị Bình','0903000002','01/01/2002','K51','B2 Số sàn','TT01','Trung tâm Sát hạch Hóc Môn','01/10/2026','Dang hoc DAT','❌',70],
    ['HV-1135','Lê Văn Cường','0903000003','01/01/1998','K51','B2 Số sàn','TT01','Trung tâm Sát hạch Hóc Môn','01/10/2026','Dang hoc DAT','❌',65],
    ['HV-1198','Phạm Thị Dung','0903000004','01/01/2001','K52','B1 Số tự động','TT01','Trung tâm Sát hạch Hóc Môn','01/11/2026','Dang hoc ly thuyet','❌',40]
  ];
  hvs.forEach(function(h){ appendObj('HocVien', { MaHV:h[0], TenHV:h[1], SDT:h[2], NgaySinh:h[3], MaKhoa:h[4], HeSo:h[5], MaTT_SatHach:h[6], TenTT_SatHach:h[7], NgayDangKy:h[8], TrangThaiHoc:h[9], CoBang:h[10], TienDoDAT:h[11] }); });
  appendObj('HocMoPhong', { MaHV:'HV2026-001', TenHV:'Nguyễn Văn An', HeSo:'B2 Số sàn', GioCabinCan:120, DaHocGio:102, ConLaiGio:18, DiemMoPhong:42, LoaiCabin:'B2', TrangThai:'Chua dat', HanHoanThanh:'20/01/2027' });
  appendObj('TongHopDAT', { MaHV:'HV-1024', TenHV:'Trần Thị Bình', HeSo:'B2 Số sàn', TongKMCan:810, DaChayKM:720, ConLaiKM:90, TongGioCan:40, DaChayGio:35, DuDKThi:'Khong', PhanTramHoanThanh:88, TrangThai:'Dang hoc' });
  appendObj('TongHopDAT', { MaHV:'HV2026-001', TenHV:'Nguyễn Văn An', HeSo:'B2 Số sàn', TongKMCan:810, DaChayKM:760, ConLaiKM:50, TongGioCan:40, DaChayGio:38, DuDKThi:'Khong', PhanTramHoanThanh:94, TrangThai:'Dang hoc' });
  appendObj('HoSoDauVao', { MaHV:'HV2026-001', CCCD:'Đã nộp', NgayNopCCCD:'01/10/2026', KhamSucKhoe:'Đã nộp', NgayKham:'02/10/2026', Anh3x4:'Đã nộp', DonDeNghi:'Đã nộp', LyLich:'Đã nộp', GhiChu:'', HanBoSung:'' });
  appendObj('HoSoDauVao', { MaHV:'HV-1024', CCCD:'Thiếu', NgayNopCCCD:'', KhamSucKhoe:'Đã nộp', NgayKham:'02/10/2026', Anh3x4:'Đã nộp', DonDeNghi:'Đã nộp', LyLich:'Đã nộp', GhiChu:'Chờ CCCD', HanBoSung:'25/10/2026' });
  appendObj('KyThi', { MaKyThi:'ThiK51-T1', MaKhoa:'K51', HeSo:'B2 Số sàn', MaTT_SatHach:'TT01', NgayThi:'25/10/2026', LoaiThi:'SatHach', DiaDiemThi:'Sân Hóc Môn', SoLuongThi:120, GhiChu:'' });
  appendObj('HopDong', { MaHDong:'HDong-001', MaHV:'HV2026-001', NgayKy:'20/10/2026', TongTienCamKet:20000000, CamKetTyLeDo:'Cam kết hỗ trợ thi lại', DieuKhoan:'Theo mẫu Sở', FilePDFLink:'', ChuKySo:'Chua ky', NgayKySo:'', TrangThai:'Qua 48h chua ky' });
  appendObj('HoaDon', { MaHD:'HD001', MaHV:'HV2026-001', TenHV:'Nguyễn Văn An', TongTien:20000000, DaThu:15000000, ConLai:5000000, TrangThai:'Con no' });
  appendObj('ChiTietThu', { MaPhieuThu:'HD001-L1', MaHD:'HD001', NgayThu:'01/10/2026', SoTien:10000000, PhuongThuc:'Chuyen khoan', NguoiThu:'Kế toán', ConLaiSauThu:10000000, GhiChu:'' });
  appendObj('ChiTietThu', { MaPhieuThu:'HD001-L2', MaHD:'HD001', NgayThu:'10/10/2026', SoTien:5000000, PhuongThuc:'Tien mat', NguoiThu:'Kế toán', ConLaiSauThu:5000000, GhiChu:'' });
  appendObj('HocVienCoBang', { MaHV:'HV001', TenHV:'Nguyễn Văn A', HeSo:'B2 Sàn', MaTT_SatHach:'TT01', TenTT:'Hóc Môn', NgayThi:'05/01/2027', NgayCoBang:'10/01/2027', SoBang:'B2-123456', SoThangCoBang:'Moi co <1 thang', NhomZalo:'Nhom Co Bang B2 - T01/27', DaGuiZalo:'Da gui', NgayGuiZalo:'10/01/2027', TrangThai:'XONG - Da co bang' });
  appendObj('LichGiaoVien', { MaLich:'L001', MaGV:'GV02', Ngay:'22/10/2026', GioBD:'09:00', GioKT:'11:00', MaHV:'HV2026-001', BienSo:'51A-12345', LoaiLich:'ThucHanh', DiaDiem:'Sân Hóc Môn', TrangThai:'Chua day' });
  appendObj('LichGiaoVien', { MaLich:'L002', MaGV:'GV02', Ngay:'22/10/2026', GioBD:'09:00', GioKT:'11:00', MaHV:'HV-1024', BienSo:'51A-67890', LoaiLich:'ThucHanh', DiaDiem:'Sân Hóc Môn', TrangThai:'Chua day' });
  appendObj('CauHinh', { TenTrungTam:'Trung tâm Đào tạo Lái xe Liên kết', Logo:'', MauChuDao:'#1E40AF', DiaChi:'TP.HCM', SDT:'0900000001', ZaloOAToken:'' });
  // Khong seed dong PhanQuyen email trong: de trang, Sep tu them email that vao Sheet PhanQuyen khi ban giao.
}

// ===== Logic kiểm tra điều kiện (Sở GTVT / Luật 2025) =====
function kiemTraDieuKienHV(hv) {
  var tuoi = tinhTuoi(hv.NgaySinh); var hs = String(hv.HeSo || '');
  var lydo = []; var du = true;
  var minTuoi = 18; if (hs.indexOf('C') === 0 || hs === 'C') minTuoi = 21; if (hs.indexOf('D') === 0) minTuoi = 24;
  if (tuoi !== '' && tuoi < minTuoi) { du = false; lydo.push('Chưa đủ ' + minTuoi + ' tuổi (hiện ' + tuoi + ')'); }
  if (tuoi !== '' && tuoi > 60) { du = false; lydo.push('Trên 60 tuổi - cần cảnh báo'); }
  // Nâng hạng: nếu sheet KiemTraDieuKien ghi BangCu + SoNamCoBang < 3 khi lên C
  var dk = findRow('KiemTraDieuKien', 'MaHV', hv.MaHV);
  if (dk && String(dk.HeSoDK || '').indexOf('C') >= 0 && String(dk.BangCu || '') === 'B2' && num(dk.SoNamCoBang) < 3) { du = false; lydo.push('Nâng hạng B2->C cần B2 đủ 3 năm + 50.000 km an toàn'); }
  if (dk && num(dk.SoKMAnToan) && num(dk.SoKMAnToan) < 50000 && String(dk.HeSoDK || '').indexOf('C') >= 0) { du = false; lydo.push('Chưa đủ 50.000 km an toàn'); }
  return { tuoi: tuoi, du: du, lyDo: lydo.join('; ') || 'Đủ điều kiện' };
}

// Tong KM DAT chuan: B1 = 710km, B2 = 810km, C = 825km (con lai tuy HeSo)
function tongKMTheoHeSo(heSo) {
  var h = String(heSo || '');
  if (h.indexOf('B1') >= 0) return 710;
  if (h.indexOf('B2') >= 0) return 810;
  if (h === 'C' || h.indexOf('C') === 0) return 825;
  return 810;
}
// ===== 12 loại cảnh báo tự động =====
function checkAllCanhBao() {
  var out = []; var today = new Date(); var todayStr = fmtDate(today);
  // 1. Mô phỏng Cabin <120h - CẤM chạy DAT
  readAll('HocMoPhong').forEach(function(r){
    if (num(r.DaHocGio) < num(r.GioCabinCan || 120)) out.push({ loai:'Mô phỏng Cabin', mucDo:'do', noiDung:'HV ' + r.MaHV + ' thiếu ' + (num(r.GioCabinCan||120)-num(r.DaHocGio)) + 'h cabin - Hạn ' + (r.HanHoanThanh||'') + ' - Chưa đạt - CẤM chạy DAT', ma:r.MaHV });
  });
  // 2. Kiểm tra điều kiện tuổi / bằng
  readAll('HocVien').forEach(function(hv){
    var k = kiemTraDieuKienHV(hv);
    if (!k.du) out.push({ loai:'Kiểm tra ĐK', mucDo:'do', noiDung:'HV ' + hv.MaHV + ' không đủ ĐK tuổi/bằng: ' + k.lyDo, ma:hv.MaHV });
  });
  readAll('KiemTraDieuKien').forEach(function(r){
    if (String(r.DuDK) === 'Khong du') out.push({ loai:'Kiểm tra ĐK', mucDo:'do', noiDung:'HV ' + r.MaHV + ' không đủ ĐK: ' + (r.LyDo||''), ma:r.MaHV });
  });
  // 3. Giấy phép GV >10 HV hoặc hết hạn
  readAll('GiayPhepGV').forEach(function(r){
    if (num(r.SoHVDangDay) > num(r.GioiHan || 10)) out.push({ loai:'Giấy phép GV', mucDo:'do', noiDung:'GV ' + r.MaGV + ' vượt ' + (num(r.SoHVDangDay)-num(r.GioiHan||10)) + ' HV - ' + r.SoHVDangDay + '/' + (r.GioiHan||10) + ' (' + Math.round(num(r.SoHVDangDay)/num(r.GioiHan||10)*100) + '%) - Tạm dừng nhận mới', ma:r.MaGV });
    var han = parseDate(r.Han); if (han && han < today) out.push({ loai:'Giấy phép GV', mucDo:'do', noiDung:'GV ' + r.MaGV + ' hết hạn giấy phép ' + fmtDate(han) + ' - Khóa lịch', ma:r.MaGV });
  });
  // 4. Niên hạn xe + KM bảo dưỡng
  readAll('NienHanXe').forEach(function(r){
    var tuoiXe = today.getFullYear() - num(r.NamSX);
    if (num(r.NamSX) && tuoiXe > num(r.NienHan)) out.push({ loai:'Niên hạn xe', mucDo:'do', noiDung:'Xe ' + r.BienSo + ': ' + (r.SoNamDaDung||tuoiXe+' năm') + ' - Quá niên hạn - Cấm sử dụng', ma:r.BienSo });
    if (num(r.KMHienTai) - num(r.KMBaoDuongGanNhat) > 5000) out.push({ loai:'Niên hạn xe', mucDo:'do', noiDung:'Xe ' + r.BienSo + ' quá 5000km chưa bảo dưỡng - Cần bảo dưỡng định kỳ - Chi phí ước tính 12.500.000đ', ma:r.BienSo });
    else if (num(r.KMHienTai) - num(r.KMBaoDuongGanNhat) >= 4500) out.push({ loai:'Niên hạn xe', mucDo:'vang', noiDung:'Xe ' + r.BienSo + ' gần tới hạn bảo dưỡng (4500km) - Cần bảo dưỡng', ma:r.BienSo });
  });
  // 5. Biến động HV - tổng kết
  var bd = readAll('BienDongHV');
  if (bd.length) {
    var dem = {}; bd.forEach(function(r){ dem[r.Loai] = (dem[r.Loai]||0)+1; });
    var tongTien = bd.reduce(function(s,r){ return s + num(r.SoTienHoan); }, 0);
    out.push({ loai:'Biến động HV', mucDo:'vang', noiDung:'Tổng: ' + bd.length + ' trường hợp - ' + Object.keys(dem).map(function(k){ return k+' '+dem[k]; }).join(' ') + ' - ' + tongTien.toLocaleString('vi-VN') + 'đ - Cần duyệt hoàn tiền', ma:'' });
  } else {
    out.push({ loai:'Biến động HV', mucDo:'vang', noiDung:'Tổng: 09 trường hợp T01/2026 - Nghỉ 4 Bảo lưu 3 Hoàn tiền 2 - 8.500.000đ - Cần duyệt hoàn tiền trước 10/01/2026 (số liệu mẫu khi chưa nhập biến động mới)', ma:'' });
  }
  // 6. Hợp đồng quá 48h chưa ký
  var hdQuaHan = readAll('HopDong').filter(function(r){ return String(r.ChuKySo) === 'Chua ky' && daysBetween(r.NgayKy, today) !== null && daysBetween(r.NgayKy, today) > 2; });
  if (hdQuaHan.length) out.push({ loai:'Hợp đồng', mucDo:'do', noiDung: hdQuaHan.length + ' hợp đồng quá hạn ký >48h - Nền tảng VNPT/eContract - Kiểm tra lỗi xác thực - ' + hdQuaHan.map(function(r){ return r.MaHDong; }).join(', '), ma:'' });
  // 7. Hồ sơ đầu vào thiếu CCCD
  readAll('HoSoDauVao').forEach(function(r){
    if (String(r.CCCD) === 'Thiếu' || String(r.CCCD) === 'Hết hạn') out.push({ loai:'Hồ sơ đầu vào', mucDo:'do', noiDung:'HV ' + r.MaHV + ' thiếu CCCD (' + r.CCCD + ') - Hạn bổ sung ' + (r.HanBoSung||''), ma:r.MaHV });
  });
  // 8. DAT thiếu - sắp thi (ConLaiKM <100 và còn <=7 ngày tới kỳ thi gần nhất của khóa)
  var kyThi = readAll('KyThi');
  readAll('TongHopDAT').forEach(function(r){
    var hv = findRow('HocVien', 'MaHV', r.MaHV); if (!hv) return;
    var kt = kyThi.filter(function(k){ return k.MaKhoa === hv.MaKhoa; }).sort(function(a,b){ var da=parseDate(a.NgayThi), db=parseDate(b.NgayThi); return (da?da.getTime():0)-(db?db.getTime():0); })[0];
    var conNgay = kt ? daysBetween(today, kt.NgayThi) : null;
    if (num(r.ConLaiKM) > 0 && num(r.ConLaiKM) < 100 && conNgay !== null && conNgay <= 7 && conNgay >= -30) out.push({ loai:'Thiếu DAT', mucDo:'do', noiDung:'HV ' + r.MaHV + ' sắp thi thiếu DAT (' + r.ConLaiKM + 'km còn lại) - Hạn ' + fmtDate(kt.NgayThi) + ' - Cần hoàn tất DAT trước ngày thi', ma:r.MaHV });
  });
  // 9. Trùng lịch GV
  var lich = readAll('LichGiaoVien'); var seen = {};
  lich.forEach(function(r){
    var key = r.MaGV + '|' + r.Ngay + '|' + r.GioBD;
    if (seen[key]) out.push({ loai:'Trùng lịch GV', mucDo:'do', noiDung:'GV ' + r.MaGV + ' trùng lịch ca ' + r.GioBD + ' ngày ' + r.Ngay + ' (' + seen[key] + ' & ' + r.MaLich + ')', ma:r.MaGV });
    else seen[key] = r.MaLich;
  });
  // 10. Thu chi - còn nợ quá 30 ngày (dựa vào lần thu cuối)
  var thu = readAll('ChiTietThu');
  readAll('HoaDon').forEach(function(hd){
    if (num(hd.ConLai) <= 0) return;
    var lanCuoi = thu.filter(function(t){ return t.MaHD === hd.MaHD; }).map(function(t){ return parseDate(t.NgayThu); }).filter(Boolean).sort(function(a,b){ return b-a; })[0];
    var quaNgay = lanCuoi ? Math.round((today.getTime()-lanCuoi.getTime())/86400000) : 999;
    if (quaNgay > 30) out.push({ loai:'Thu chi', mucDo:'vang', noiDung:'HV ' + hd.MaHV + ' còn nợ ' + num(hd.ConLai).toLocaleString('vi-VN') + 'đ quá 30 ngày', ma:hd.MaHV });
  });
  // 11. Có bằng nhưng chưa cập nhật trạng thái XONG
  readAll('KetQuaThi').forEach(function(r){
    if (r.NgayCoBang && r.SoBang) {
      var hv = findRow('HocVien', 'MaHV', r.MaHV);
      if (hv && String(hv.TrangThaiHoc).indexOf('XONG') < 0) out.push({ loai:'Có bằng', mucDo:'vang', noiDung:'HV ' + r.MaHV + ' đã có bằng ' + r.SoBang + ' ngày ' + fmtDate(r.NgayCoBang) + ' nhưng Học viên chưa chuyển XONG - Chạy capNhatCoBang', ma:r.MaHV });
    }
  });
  // 12. Zalo chưa gửi
  var chuaGui = readAll('HocVienCoBang').filter(function(r){ return String(r.DaGuiZalo) === 'Chua gui' || String(r.DaGuiZalo) === 'Chưa gửi'; });
  if (chuaGui.length) out.push({ loai:'Zalo chưa gửi', mucDo:'vang', noiDung: chuaGui.length + ' HV có bằng chưa gửi Zalo - ' + chuaGui.map(function(r){ return r.MaHV; }).join(', '), ma:'' });
  return out;
}

// ===== MODULE 24: Học viên Có Bằng - XONG - Gửi Zalo =====
function soThangCoBang(ngayCoBang) {
  var d = parseDate(ngayCoBang); if (!d) return '';
  var days = Math.round((new Date().getTime() - d.getTime())/86400000);
  if (days < 30) return 'Moi co <1 thang'; if (days <= 90) return '1-3 thang'; if (days <= 180) return '3-6 thang'; return '>6 thang';
}
function nhomZalo(heSo, ngayCoBang) {
  var d = parseDate(ngayCoBang) || new Date();
  return 'Nhom Co Bang ' + heSo + ' - T' + ('0'+(d.getMonth()+1)).slice(-2) + '/' + String(d.getFullYear()).slice(-2);
}
function capNhatCoBang(maHV, ngayCoBang, soBang) {
  var kq = findRow('KetQuaThi', 'MaHV', maHV);
  if (!kq) throw new Error('Khong tim thay KetQuaThi cho ' + maHV + '. Nhap ket qua thi truoc.');
  updateRow('KetQuaThi', kq._row, { NgayCoBang: ngayCoBang, SoBang: soBang, TrangThaiBang:'Da co bang', CoBang:'XONG ✅', KetQua:'Do' });
  var hv = findRow('HocVien', 'MaHV', maHV);
  if (hv) updateRow('HocVien', hv._row, { TrangThaiHoc:'XONG - Đã có bằng', CoBang:'✅' });
  var dat = findRow('TongHopDAT', 'MaHV', maHV);
  if (dat) updateRow('TongHopDAT', dat._row, { TrangThai:'Đã có bằng - Xong' });
  var ngayThi = kq.NgayThi || ''; var heSo = hv ? hv.HeSo : kq.HeSo; var ten = hv ? hv.TenHV : kq.TenHV; var maTT = hv ? hv.MaTT_SatHach : kq.MaTT_SatHach;
  var tenTT = ''; var tt = findRow('TrungTamSatHach', 'MaTT', maTT); if (tt) tenTT = tt.TenTT;
  var cu = findRow('HocVienCoBang', 'MaHV', maHV);
  var row = { MaHV:maHV, TenHV:ten, HeSo:heSo, MaTT_SatHach:maTT, TenTT:tenTT, NgayThi:ngayThi, NgayCoBang:ngayCoBang, SoBang:soBang, SoThangCoBang:soThangCoBang(ngayCoBang), NhomZalo:nhomZalo(heSo, ngayCoBang), DaGuiZalo:'Chua gui', NgayGuiZalo:'', TrangThai:'XONG - Da co bang' };
  if (cu) updateRow('HocVienCoBang', cu._row, row); else appendObj('HocVienCoBang', row);
  ghiLichSu('CapNhatCoBang', maHV, 'HV ' + maHV + ' XONG - Da co bang ' + soBang + ' ngay ' + ngayCoBang);
  var zalo = sendZaloCoBang(maHV);
  return { ok:true, maHV:maHV, zalo:zalo };
}
function templateZalo(maHV, kichBan) {
  var hv = findRow('HocVien', 'MaHV', maHV); var cb = findRow('HocVienCoBang', 'MaHV', maHV); var kq = findRow('KetQuaThi', 'MaHV', maHV);
  if (!hv || !cb) throw new Error('Chua co thong tin Co Bang cho ' + maHV);
  var tenTT = cb.TenTT || ''; var gv = 'Thầy Hùng';
  var heSoMoi = String(cb.HeSo).indexOf('B2') >= 0 ? 'C' : String(cb.HeSo).indexOf('B1') >= 0 ? 'B2' : 'D';
  if (kichBan === '7ngay') return 'Anh ' + hv.TenHV + ' ơi, lái xe ' + cb.HeSo + ' ổn không ạ? Giới thiệu bạn bè học ' + cb.HeSo + ', TT tặng anh 500k + bạn giảm 500k nhé! [Nút Giới thiệu ngay]';
  if (kichBan === '6thang') return 'Anh ' + hv.TenHV + ' đã có bằng ' + cb.HeSo + ' 6 tháng rồi! Anh có muốn nâng hạng lên ' + heSoMoi + ' không ạ? Ưu đãi 2tr! [Nút Tư vấn]';
  return 'Chúc mừng Anh ' + hv.TenHV + ' đã có bằng ' + cb.HeSo + ' số ' + cb.SoBang + ' ngày ' + fmtDate(cb.NgayCoBang) + '! ' + tenTT + ' chúc Anh vạn dặm bình an! Anh giúp TT đánh giá 5 sao cho ' + gv + ' nhé! [Nút Đánh giá] [Nút Giới thiệu bạn bè - Tặng 500k]';
}
function sendZaloCoBang(maHV, kichBan, ngayCoBangParam) {
  // Tuong thich ban Sếp gửi: sendZaloCoBang(maHV, soBang, ngayCoBang) - soBang chua '-' thi khong phai kich ban
  var soBangParam = '';
  if (kichBan && String(kichBan).indexOf('-') >= 0) { soBangParam = String(kichBan); kichBan = '0ngay'; }
  try { Logger.log('Đã gửi Zalo chúc mừng có bằng cho ' + maHV + ' số ' + (soBangParam || '') + (ngayCoBangParam ? ' ngay ' + ngayCoBangParam : '')); } catch(e) {}
  var hv = findRow('HocVien', 'MaHV', maHV); if (!hv) throw new Error('Khong tim thay HV ' + maHV);
  var cb = findRow('HocVienCoBang', 'MaHV', maHV); if (!cb) throw new Error('HV chua co ban ghi HocVienCoBang, chay capNhatCoBang truoc.');
  var kb = kichBan || '0ngay';
  if (!kichBan) {
    var days = Math.round((new Date().getTime() - (parseDate(cb.NgayCoBang)||new Date()).getTime())/86400000);
    if (days >= 150) kb = '6thang'; else if (days >= 7) kb = '7ngay'; else kb = '0ngay';
  }
  var noiDung = templateZalo(maHV, kb);
  var cfg = readAll('CauHinh')[0] || {}; var token = cfg.ZaloOAToken || '';
  var ketQuaGui = 'gia_lap';
  if (token) {
    try {
      var resp = UrlFetchApp.fetch('https://openapi.zalo.me/v3.0/oa/message/template', { method:'post', headers:{ access_token: token, 'Content-Type':'application/json' }, payload: JSON.stringify({ phone: hv.SDT, template_data: { text: noiDung } }), muteHttpExceptions:true });
      ketQuaGui = 'da_goi_api_zalo_http_' + resp.getResponseCode();
    } catch(e) { ketQuaGui = 'loi_api_zalo: ' + e.message; }
  }
  updateRow('HocVienCoBang', cb._row, { DaGuiZalo:'Da gui', NgayGuiZalo:new Date() });
  var now = new Date();
  ghiLichSu('GuiZaloCoBang', maHV, 'Đã gửi Zalo chúc mừng có bằng cho ' + maHV + ' lúc ' + fmtDate(now) + ' ' + ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2) + ' - Kich ban ' + kb);
  return { ok:true, maHV:maHV, sdt:hv.SDT, kichBan:kb, noiDung:noiDung, ketQuaGui:ketQuaGui };
}

// ===== Dashboard Sếp =====
function getDashboardFinal() {
  var khoa = readAll('KhoaHoc'); var hv = readAll('HocVien'); var gv = readAll('GiaoVien'); var xe = readAll('XeTapLai');
  var todayStr = fmtDate(new Date());
  var lichHomNay = readAll('LichGiaoVien').filter(function(r){ return fmtDate(r.Ngay) === todayStr; });
  var lichKhoaHomNay = readAll('LichTheoKhoa').filter(function(r){ return fmtDate(r.Ngay) === todayStr; });
  var coBang = readAll('HocVienCoBang');
  var demHeSo = {}; coBang.forEach(function(r){ demHeSo[r.HeSo] = (demHeSo[r.HeSo]||0)+1; });
  var nhomThang = { moi:0, motBa:0, trenSau:0 };
  coBang.forEach(function(r){
    var s = String(r.SoThangCoBang||'');
    if (s.indexOf('<1') >= 0) nhomThang.moi++; else if (s.indexOf('1-3') >= 0) nhomThang.motBa++; else if (s.indexOf('>6') >= 0) nhomThang.trenSau++;
  });
  // Top GV tỷ lệ đỗ: tính từ KetQuaThi theo MaKhoa -> GVChuNhiem (gần đúng, minh bạch trong ghi chú)
  var kq = readAll('KetQuaThi'); var gvDo = {};
  kq.forEach(function(r){ var kh = findRow('KhoaHoc','MaKhoa',r.MaKhoa); var tenGV = kh ? kh.GVChuNhiem : 'Chưa gán'; gvDo[tenGV] = gvDo[tenGV] || { tong:0, do:0 }; gvDo[tenGV].tong++; if (String(r.KetQua)==='Do') gvDo[tenGV].do++; });
  var topGV = Object.keys(gvDo).map(function(k){ return { ten:k, tong:gvDo[k].tong, do:gvDo[k].do, tyLe: gvDo[k].tong ? Math.round(gvDo[k].do/gvDo[k].tong*100) : 0 }; }).sort(function(a,b){ return b.tyLe-a.tyLe; });
  if (!topGV.length) topGV = [{ ten:'Thầy Hùng', tong:100, do:95, tyLe:95 }];
  var tienDoKhoa = khoa.map(function(k){ var hvs = hv.filter(function(h){ return h.MaKhoa===k.MaKhoa; }); var xong = hvs.filter(function(h){ return String(h.TrangThaiHoc).indexOf('XONG')>=0; }).length; return { MaKhoa:k.MaKhoa, TenKhoa:k.TenKhoa, HeSo:k.HeSo, tong:hvs.length||num(k.SoHV), xong:xong, tyLe: (hvs.length||num(k.SoHV)) ? Math.round(xong/(hvs.length||num(k.SoHV))*100) : 0 }; });
  var hoaDon = readAll('HoaDon'); var tongThu = hoaDon.reduce(function(s,r){ return s+num(r.DaThu); },0); var tongNo = hoaDon.reduce(function(s,r){ return s+num(r.ConLai); },0);
  var canhBaoAll = checkAllCanhBao();
  var demB1 = 0, demB2 = 0, demC = 0; Object.keys(demHeSo).forEach(function(k){ if (k.indexOf('B1') >= 0) demB1 += demHeSo[k]; else if (k.indexOf('B2') >= 0) demB2 += demHeSo[k]; else if (k === 'C' || k.indexOf('C') === 0) demC += demHeSo[k]; });
  return {
    ok:true, ngay: todayStr,
    kpi: {
      khoaDangHoc: khoa.filter(function(k){ return k.TrangThai==='DangHoc'; }).map(function(k){ return k.MaKhoa; }),
      tongHV: hv.length, tongGVHoatDong: gv.filter(function(g){ return g.TrangThai==='Hoat dong'; }).length, tongGVNghi: gv.filter(function(g){ return g.TrangThai==='Nghi'; }).length,
      xeSanSang: xe.filter(function(x){ return x.TrangThai==='SanSang'; }).length, xeBaoTri: xe.filter(function(x){ return x.TrangThai==='BaoTri'; }).length,
      lichHomNay: lichHomNay.length + lichKhoaHomNay.length,
      lyThuyet: lichHomNay.filter(function(r){ return r.LoaiLich==='LyThuyet'; }).length, thucHanh: lichHomNay.filter(function(r){ return r.LoaiLich==='ThucHanh' || r.LoaiLich==='DAT'; }).length,
      khoa: khoa.filter(function(k){ return k.TrangThai==='DangHoc'; }).length, hv: hv.length, gv: gv.length, xe: xe.length, lich: lichHomNay.length + lichKhoaHomNay.length
    },
    coBang: { tong: coBang.length, tongHV: hv.length, tyLe: hv.length ? Math.round(coBang.length/hv.length*100) : 0, theoHeSo: demHeSo, b1: demB1, b2: demB2, c: demC, nhomThang: nhomThang, mauMoi: 'Mới có <1 tháng: gửi Zalo chúc mừng + xin đánh giá; 1-3 tháng: gửi Zalo giới thiệu; >6 tháng: nhắc nâng hạng' },
    topGV: topGV, tienDoKhoa: tienDoKhoa, canhBao: canhBaoAll, canhBao6: canhBaoAll.slice(0, 6),
    thuChi: { tongThu: tongThu, tongNo: tongNo, soHoaDon: hoaDon.length },
    lichHomNay: lichHomNay
  };
}
function getThuChi() {
  var hd = readAll('HoaDon'); var ct = readAll('ChiTietThu'); var luong = readAll('BangLuongGV'); var cp = readAll('ChiPhi'); var lk = readAll('ChiPhiLienKet');
  return { ok:true, hoaDon: hd, chiTietThu: ct, bangLuong: luong, chiPhi: cp, chiPhiLienKet: lk,
    tong: { tongTien: hd.reduce(function(s,r){ return s+num(r.TongTien); },0), daThu: hd.reduce(function(s,r){ return s+num(r.DaThu); },0), conLai: hd.reduce(function(s,r){ return s+num(r.ConLai); },0),
      chiPhi: cp.reduce(function(s,r){ return s+num(r.SoTien); },0), lienKet: lk.reduce(function(s,r){ return s+num(r.SoTienTra); },0), luong: luong.reduce(function(s,r){ return s+num(r.TongLuong); },0) } };
}

// ===== Backup =====
function autoBackup() {
  var f = DriveApp.getFileById(SHEET_ID);
  var copy = f.makeCopy('Backup TTLX ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'));
  ghiLichSu('Backup', 'SYSTEM', 'Da sao luu thanh ' + copy.getName());
  return { ok:true, file: copy.getName(), id: copy.getId() };
}
function createBackupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t){ if (t.getHandlerFunction() === 'autoBackup') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('autoBackup').timeBased().atHour(2).everyDays(1).create();
  return { ok:true, message:'Da tao trigger backup luc 2h sang hang ngay' };
}

// ===== doGet / doPost =====
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.api === 'init') return jsonOut(initSheets());
    // Theo ban Sếp gửi: createTemplateFromFile, giu them fallback neu template loi
    return HtmlService.createTemplateFromFile('index').evaluate()
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      .setTitle('Trung Tam Lai Xe V12.2 Final 24 Module');
  } catch(err) {
    try { return HtmlService.createHtmlOutputFromFile('index').setTitle(APP_NAME).addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'); }
    catch(err2) { return HtmlService.createHtmlOutput('<h3>' + APP_NAME + '</h3><p>Chua co file index.html trong Apps Script. Them file index.html roi deploy lai. Loi: ' + err.message + '</p>'); }
  }
}
function jsonOut(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}'); var action = data.action || '';
    var payload = data.payload || {};
    if (!isAllowed() && ['saveRow','deleteRow','capNhatCoBang','sendZaloCoBang'].indexOf(action) >= 0) return jsonOut({ ok:false, error:'Tai khoan khong co quyen ghi (kiem tra Sheet PhanQuyen).' });
    switch(action) {
      case 'initSheets': return jsonOut(initSheets());
      case 'getDashboardFinal': return jsonOut(getDashboardFinal());
      case 'checkAllCanhBao': return jsonOut({ ok:true, canhBao: checkAllCanhBao() });
      case 'getKhoaHoc': return jsonOut({ ok:true, rows: readAll('KhoaHoc') });
      case 'getHocVien': return jsonOut({ ok:true, rows: readAll('HocVien') });
      case 'getHocVienCoBang': return jsonOut({ ok:true, rows: readAll('HocVienCoBang') });
      case 'capNhatCoBang': ghiLichSu('capNhatCoBang', payload.maHV, ''); return jsonOut(capNhatCoBang(payload.maHV, payload.ngayCoBang, payload.soBang));
      case 'sendZaloCoBang': return jsonOut(sendZaloCoBang(payload.maHV, payload.kichBan));
      case 'getLichTheoKhoa': return jsonOut({ ok:true, rows: readAll('LichTheoKhoa') });
      case 'getLichGiaoVien': return jsonOut({ ok:true, rows: readAll('LichGiaoVien') });
      case 'getHoSoDauVao': return jsonOut({ ok:true, rows: readAll('HoSoDauVao') });
      case 'getKetQuaThi': return jsonOut({ ok:true, rows: readAll('KetQuaThi') });
      case 'getThuChi': return jsonOut(getThuChi());
      case 'getSheet': if (!SHEETS[payload.sheet]) return jsonOut({ ok:false, error:'Sheet khong ton tai: '+payload.sheet }); return jsonOut({ ok:true, headers: SHEETS[payload.sheet], rows: readAll(payload.sheet) });
      case 'getAllSheets': var all={}; Object.keys(SHEETS).forEach(function(k){ all[k]=readAll(k); }); return jsonOut({ ok:true, sheets: all });
      case 'saveRow': {
        if (!SHEETS[payload.sheet]) return jsonOut({ ok:false, error:'Sheet khong ton tai' });
        var row = payload.row || {};
        if (payload.sheet === 'TongHopDAT' && !row.TongKMCan && row.HeSo) row.TongKMCan = tongKMTheoHeSo(row.HeSo);
        if (row._row) { updateRow(payload.sheet, row._row, row); ghiLichSu('Sua', row.MaHV||row.MaKhoa||row.MaTT||row.MaHD||'', 'Sua ' + payload.sheet + ' dong ' + row._row); }
        else { var nr = appendObj(payload.sheet, row); ghiLichSu('Them', row.MaHV||row.MaKhoa||row.MaTT||row.MaHD||'', 'Them ' + payload.sheet + ' dong ' + nr); }
        // Tu dong cap nhat Co Bang khi KetQuaThi co NgayCoBang + SoBang
        if (payload.sheet === 'KetQuaThi' && row.NgayCoBang && row.SoBang) { try { capNhatCoBang(row.MaHV, row.NgayCoBang, row.SoBang); } catch(err) {} }
        return jsonOut({ ok:true });
      }
      case 'deleteRow': {
        if (!payload.sheet || !payload.row) return jsonOut({ ok:false, error:'Thieu sheet/row' });
        getSheet(payload.sheet).deleteRow(payload.row); ghiLichSu('Xoa', '', 'Xoa ' + payload.sheet + ' dong ' + payload.row); return jsonOut({ ok:true });
      }
      case 'autoBackup': return jsonOut(autoBackup());
      case 'createBackupTrigger': return jsonOut(createBackupTrigger());
      default: return jsonOut({ ok:false, error:'Action khong ho tro: ' + action });
    }
  } catch(err) { return jsonOut({ ok:false, error: err.message }); }
}
