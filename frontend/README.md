🚀 HỆ THỐNG QUẢN LÝ SUẤT ĂN QUÂN NHÂN

Công nghệ sử dụng: ReactJS (Vite) + NodeJS (Express) + MySQL (XAMPP) (không hash mật khẩu)
Hệ thống được phân quyền 2 cấp độ:

Admin – toàn quyền quản trị hệ thống

Quân nhân (Soldier) – chỉ thao tác trên dữ liệu cá nhân

🛡️ 1. PHÂN QUYỀN HỆ THỐNG
🔹 Admin

Toàn quyền quản trị

Quản lý toàn bộ người dùng, suất ăn, cấu hình hệ thống

Xem được mọi dữ liệu

🔹 Quân nhân (Soldier)

Chỉ thao tác trên data cá nhân: đăng ký/hủy bữa ăn, xem thống kê, hồ sơ

Không được xem dữ liệu người khác

🧭 2. TRANG ADMIN – CHI TIẾT CHỨC NĂNG

Trang Admin tập trung cho quản trị hệ thống, gồm các module chính:

A. Dashboard tổng quan

Hiển thị các số liệu quan trọng:

Tổng số người dùng (phân loại: Admin / Quân nhân)

Tổng số suất ăn được đăng ký trong ngày

Biểu đồ thống kê suất ăn theo:

Ngày

Tháng

B. Quản lý người dùng

Chức năng đầy đủ dành cho quản trị nhân sự:

Thêm – Sửa – Xóa người dùng (CRUD)

Phân quyền: Admin / Quân nhân

Tìm kiếm + Lọc theo vai trò

Phân trang

Reset mật khẩu cho người dùng

C. Quản lý suất ăn toàn hệ thống

Admin xem toàn bộ dữ liệu suất ăn của mọi quân nhân:

Xem theo ngày / tháng

Lọc theo:

Tên người dùng

Vai trò

Đơn vị (nếu có)

Buổi ăn: sáng / trưa / tối

Khoảng ngày

Hủy hoặc cập nhật suất ăn thay cho người dùng (trong trường hợp đặc biệt)

D. Thống kê & Báo cáo

Thống kê toàn hệ thống theo:

Ngày

Tuần

Tháng

Biểu đồ trực quan

Xuất báo cáo Excel tổng hợp

E. Quản lý đơn vị / phòng ban (nếu hệ thống có)

Thêm / sửa / xóa đơn vị

Gán quân nhân vào từng đơn vị

F. Cấu hình hệ thống

Cho phép Admin điều chỉnh các quy định dùng chung:

Cấu hình 3 buổi ăn (sáng – trưa – tối)

Thiết lập ngày không cho hủy suất ăn

Thiết lập hạn đăng ký trong ngày

Quản lý file backup (nếu có)

🎖️ 3. TRANG QUÂN NHÂN (SOLDIER)

Trang Quân nhân phục vụ từng người dùng riêng lẻ, giao diện đơn giản – trực quan – thao tác nhanh.

🥗 A. Đăng ký / Hủy suất ăn
1. Giao diện lịch dạng tháng

Hiển thị Lịch tháng

Mỗi ngày có 3 ô bữa ăn:

Sáng

Trưa

Tối

Mỗi ô thể hiện trạng thái:

Đã đăng ký → màu nổi bật (xanh/cam), có dấu ✓

Chưa đăng ký → màu trung tính

2. Đăng ký suất ăn

Nhấn 1 lần vào ô bữa ăn → hệ thống lập tức đăng ký

Ô chuyển màu sáng + đánh dấu đã đăng ký

Trải nghiệm nhanh, không popup, không form

3. Quy tắc hủy suất ăn

Không cho hủy:

Ngày hiện tại

Ngày trong quá khứ

Chỉ được hủy các ngày tương lai

4. Cách hủy

Nhấn vào ô bữa ăn đã đăng ký

Hệ thống hủy → ô trở về màu mặc định

📊 B. Xem thống kê suất ăn
1. Thống kê theo tuần

Thống kê số bữa đã đăng ký

Dạng:

Danh sách

Bảng

Biểu đồ đơn giản (cột/tròn)

2. Thống kê theo tháng

Tương tự theo tuần nhưng dữ liệu theo tháng

Có chế độ xem dạng lịch để đối chiếu trực quan

👤 C. Hồ sơ cá nhân
1. Xem thông tin

Họ tên

Chức vụ

Đơn vị

Số điện thoại

Mã quân nhân

2. Đổi mật khẩu

Nhập mật khẩu cũ

Nhập mới

Xác nhận

📤 4. CHỨC NĂNG XUẤT EXCEL

(Áp dụng cho cả Admin và Quân nhân, nhưng nội dung khác nhau)

🟦 A. Admin – Xuất Excel toàn hệ thống
1. Xuất theo ngày

File Excel gồm:

Tiêu đề: “Suất ăn đăng ký ngày dd/mm/yyyy”

Bảng dữ liệu:

STT

Người đăng ký

Chức vụ

Đơn vị

Số điện thoại

Bữa sáng

Bữa trưa

Bữa tối

Ghi chú

Tổng số:

Tổng số người

Tổng số bữa sáng

Tổng số bữa trưa

Tổng số bữa tối

2. Xuất theo tháng

Excel gồm:

Tiêu đề

Bảng dữ liệu:

STT

Người đăng ký

Chức vụ

Đơn vị

Số điện thoại

Tổng số bữa sáng trong tháng

Tổng số bữa trưa trong tháng

Tổng số bữa tối trong tháng

Ghi chú

Tổng kết:

Tổng số người

Tổng bữa sáng/tháng

Tổng bữa trưa/tháng

Tổng bữa tối/tháng

🟩 B. Quân nhân – Xuất Excel cá nhân

File xuất nội dung:

Tiêu đề

Thông tin người đăng ký:

Họ tên

Chức vụ

Đơn vị

Số điện thoại

Bảng dữ liệu:

STT

Ngày

Sáng

Trưa

Tối

Ghi chú

Tổng tiền (nếu hệ thống có tính phí)

📌 TÓM TẮT CHUNG
🎛️ Admin

Dashboard

Quản lý người dùng (CRUD)

Quản lý suất ăn toàn hệ thống

Thống kê – Báo cáo

Xuất Excel

Quản lý đơn vị (nếu có)

Cấu hình hệ thống

🎖️ Quân nhân (Soldier)

Đăng ký / Hủy suất ăn (lịch tháng trực quan)

Xem thống kê (tuần / tháng)

Hồ sơ cá nhân

Xuất Excel cá nhân

backend/
│── package.json
│── server.js
│── .env
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── mealController.js
│   ├── registerController.js
│   ├── statsController.js
│   └── unitController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Unit.js
│   ├── Meal.js
│   ├── MealRegister.js
│   ├── Config.js
│   └── Log.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── mealRoutes.js
│   ├── registerRoutes.js
│   ├── statsRoutes.js
│   └── unitRoutes.js
│
└── utils/
    └── excelExport.js

frontend/
│── index.html
│── package.json
│── vite.config.js
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── router.jsx
│
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── authApi.js
│   │   ├── userApi.js
│   │   ├── mealApi.js
│   │   ├── registerApi.js
│   │   └── statsApi.js
│
│   ├── components/
│   │   ├── CalendarMeal.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Chart.jsx
│
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard/
│   │   │   └── AdminDashboard.jsx
│   │   ├── Admin/
│   │   │   ├── UserManager.jsx
│   │   │   ├── MealManager.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── UnitManager.jsx
│   │   ├── Soldier/
│   │   │   ├── MealRegister.jsx
│   │   │   ├── MealStats.jsx
│   │   │   └── Profile.jsx
│   │   └── NotFound.jsx
│
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       └── format.js
