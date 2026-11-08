# Đặc tả API — 102 endpoint

> Sinh tự động từ `docs/tai-lieu-goc/QLTT-ThietKe-API-CSDL.xlsx` (sheet *Khung chức năng*). Sửa thiết kế thì sửa file Excel rồi sinh lại, **không sửa tay file này**.
> Người phụ trách từng nhóm theo `docs/04-ke-hoach.md` (A = Hoàng Gia Bảo, B = Trần Đức Văn).

Quy ước: mọi endpoint (trừ PUBLIC) cần header `Authorization: Bearer <JWT>`. **Vai trò** kiểm ở bộ lọc JWT / `@PreAuthorize`; **quyền sở hữu dữ liệu** ("chỉ xem của mình") kiểm ở tầng service.


## 1. Xác thực và hồ sơ cá nhân — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 1 | `POST` | `/api/auth/login` | PUBLIC | Đăng nhập, nhận JWT chứa mã người dùng và vai trò, thời hạn 8 giờ. Sai mật khẩu 5 lần liên tiếp thì khóa tài khoản 15 phút |
| 2 | `GET` | `/api/auth/me` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy thông tin người dùng hiện tại kèm vai trò và hồ sơ mở rộng tương ứng vai trò |
| 3 | `PUT` | `/api/auth/profile` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Cập nhật hồ sơ cá nhân (họ tên, email, điện thoại). Không đổi được vai trò, trạng thái, mã định danh (BR-01.9) |
| 4 | `PUT` | `/api/auth/change_password` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Đổi mật khẩu: kiểm tra mật khẩu hiện tại, mật khẩu mới tối thiểu 8 ký tự gồm chữ và số, buộc đăng nhập lại |

## 2. Quản lý tài khoản (UC01) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 5 | `GET` | `/api/users` | ADMIN | Lấy danh sách người dùng, lọc theo vai trò, trạng thái, từ khóa; phân trang 15 dòng |
| 6 | `GET` | `/api/users/{user_id}` | ADMIN | Lấy chi tiết một người dùng theo ID kèm hồ sơ mở rộng theo vai trò |
| 7 | `POST` | `/api/users` | ADMIN | Tạo tài khoản kèm hồ sơ theo vai trò trong một giao dịch, sinh mật khẩu ban đầu băm BCrypt. Kiểm tra trùng tên đăng nhập, email (BR-01.1) |
| 8 | `PUT` | `/api/users/{user_id}` | ADMIN | Cập nhật thông tin cơ bản của người dùng |
| 9 | `PUT` | `/api/users/{user_id}/status` | ADMIN | Kích hoạt hoặc vô hiệu hóa tài khoản. Chặn vô hiệu hóa nếu đang là GVHD hoặc cán bộ hướng dẫn của sinh viên trong đợt đang chạy |
| 10 | `PUT` | `/api/users/{user_id}/reset_password` | ADMIN | Đặt lại mật khẩu ban đầu cho người dùng |

## 3. Sinh viên và giảng viên — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 11 | `GET` | `/api/students` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy danh sách sinh viên. GIANG_VIEN chỉ thấy sinh viên mình phụ trách, CAN_BO_DVHD chỉ thấy sinh viên mình hướng dẫn |
| 12 | `GET` | `/api/students/{student_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy chi tiết sinh viên theo ID (SINH_VIEN chỉ xem của mình) |
| 13 | `PUT` | `/api/students/{student_id}` | ADMIN | Cập nhật mã sinh viên, lớp, ngành, chương trình đào tạo CHUAN / CLC_STEM (quyết định ngưỡng đạt, CBR-19) |
| 14 | `GET` | `/api/lecturers` | ADMIN | Lấy danh sách giảng viên kèm số sinh viên đang phụ trách trên hạn mức |
| 15 | `GET` | `/api/lecturers/{lecturer_id}` | ADMIN, GIANG_VIEN | Lấy chi tiết giảng viên theo ID (GIANG_VIEN chỉ xem của mình) |
| 16 | `PUT` | `/api/lecturers/{lecturer_id}` | ADMIN | Cập nhật bộ môn, học hàm học vị, hạn mức sinh viên trong khoảng 5 đến 10 (CBR-04) |

## 4. Đơn vị hướng dẫn và cán bộ hướng dẫn (UC02) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 17 | `GET` | `/api/host_organizations` | ADMIN, SINH_VIEN | Lấy danh mục ĐVHD, lọc theo trạng thái phê duyệt. SINH_VIEN chỉ thấy đơn vị Đã duyệt (CBR-02) |
| 18 | `GET` | `/api/host_organizations/{org_id}` | ADMIN, CAN_BO_DVHD, SINH_VIEN | Lấy chi tiết một ĐVHD theo ID |
| 19 | `POST` | `/api/host_organizations` | ADMIN, SINH_VIEN | Thêm ĐVHD mới ở trạng thái Chờ duyệt. SINH_VIEN dùng để đề xuất đơn vị chưa có trong danh mục |
| 20 | `PUT` | `/api/host_organizations/{org_id}` | ADMIN | Cập nhật thông tin ĐVHD |
| 21 | `PUT` | `/api/host_organizations/{org_id}/approval` | ADMIN | Phê duyệt, từ chối hoặc loại khỏi danh mục kèm lý do. Khi phê duyệt tạo tài khoản CAN_BO_DVHD cho các cán bộ; yêu cầu có ít nhất một cán bộ |
| 22 | `DELETE` | `/api/host_organizations/{org_id}` | ADMIN | Xóa mềm ĐVHD. Chặn nếu đã có hồ sơ thực tập gắn vào (RESOURCE_IN_USE) |
| 23 | `GET` | `/api/host_organizations/{org_id}/supervisors` | ADMIN, SINH_VIEN | Lấy danh sách cán bộ hướng dẫn của ĐVHD kèm số đang hướng dẫn trên 5. SINH_VIEN chỉ thấy cán bộ còn hạn mức |
| 24 | `POST` | `/api/host_organizations/{org_id}/supervisors` | ADMIN | Thêm cán bộ hướng dẫn cho ĐVHD, kiểm tra kinh nghiệm tối thiểu 3 năm (CBR-05) |
| 25 | `PUT` | `/api/supervisors/{supervisor_id}` | ADMIN | Cập nhật chức vụ, số năm kinh nghiệm, hạn mức của cán bộ hướng dẫn |

## 5. Đợt thực tập, chặng, CLO và rubric (UC03) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 26 | `GET` | `/api/terms` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy danh sách đợt TTTN, lọc theo năm học, học kỳ, trạng thái |
| 27 | `GET` | `/api/terms/{term_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy chi tiết một đợt TTTN theo ID |
| 28 | `POST` | `/api/terms` | ADMIN | Tạo đợt TTTN; tự sinh 2 chặng (tuần 4 trọng số 30%, tuần 8 trọng số 70%), sao chép 7 CLO, rubric 5 mức và bộ câu hỏi vào đợt |
| 29 | `PUT` | `/api/terms/{term_id}` | ADMIN | Cập nhật đợt. Sửa ngày kết thúc thì tính lại mốc chặng 2 và thông báo người dùng liên quan |
| 30 | `PUT` | `/api/terms/{term_id}/status` | ADMIN | Chuyển trạng thái đợt: Khởi tạo, Đang nhận đăng ký, Đang thực hiện, Đã kết thúc |
| 31 | `GET` | `/api/terms/{term_id}/stages` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy hai chặng đánh giá của đợt kèm mốc tuần, trọng số, ngày mở, trạng thái |
| 32 | `PUT` | `/api/stages/{stage_id}/status` | ADMIN | Mở hoặc đóng chặng thủ công, bổ sung cho lịch tự động; kiểm tra điều kiện mở chặng (CBR-13) |
| 33 | `GET` | `/api/terms/{term_id}/clos` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy 7 CLO của đợt kèm trọng số alpha và tỷ lệ đồng chấm ĐVHD / GVHD |
| 34 | `PUT` | `/api/clos/{clo_id}` | ADMIN | Sửa trọng số alpha, tỷ lệ đồng chấm. Chỉ khi đợt chưa có phiếu nộp; kiểm tra tổng alpha và tổng tỷ lệ bằng 100 (CBR-07, CBR-08) |
| 35 | `GET` | `/api/clos/{clo_id}/rubric_levels` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy 5 mức rubric của một CLO kèm khoảng điểm và mô tả hành vi |
| 36 | `PUT` | `/api/rubric_levels/{level_id}` | ADMIN | Sửa mô tả hành vi của mức rubric. Không cho sửa số mức và khoảng điểm (BR-03.7) |
| 37 | `GET` | `/api/stages/{stage_id}/questions` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy bộ câu hỏi đánh giá của chặng kèm CLO ánh xạ |
| 38 | `GET` | `/api/required_evidence_types` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy danh mục minh chứng bắt buộc, lọc theo hình thức thực tập (Điều 4) |

## 6. Đăng ký và phê duyệt hồ sơ thực tập (UC04) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 39 | `GET` | `/api/internship_records` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy danh sách hồ sơ thực tập, lọc theo đợt, trạng thái, hình thức. GIANG_VIEN và CAN_BO_DVHD chỉ thấy hồ sơ thuộc phạm vi mình |
| 40 | `GET` | `/api/internship_records/me` | SINH_VIEN | Lấy hồ sơ thực tập của sinh viên đang đăng nhập trong đợt hiện tại |
| 41 | `GET` | `/api/internship_records/{record_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy chi tiết hồ sơ thực tập theo ID (lọc theo quyền sở hữu dữ liệu) |
| 42 | `POST` | `/api/internship_records` | SINH_VIEN | Tạo hồ sơ đăng ký TTTN-01 ở trạng thái Bản nháp. Mỗi sinh viên một hồ sơ hiệu lực trong đợt (CBR-01) |
| 43 | `PUT` | `/api/internship_records/{record_id}` | SINH_VIEN | Sửa hồ sơ khi đang ở trạng thái Bản nháp |
| 44 | `PUT` | `/api/internship_records/{record_id}/submit` | SINH_VIEN | Gửi đăng ký: kiểm tra CBR-01, hạn mức cán bộ (CBR-03), thực tập quốc tế từ 6 tuần; chuyển Chờ ĐVHD, thông báo cán bộ |
| 45 | `PUT` | `/api/internship_records/{record_id}/host_confirmation` | CAN_BO_DVHD | Xác nhận tiếp nhận hoặc từ chối kèm lý do. Xác nhận thì tăng bộ đếm cán bộ, chuyển Chờ GVHD |
| 46 | `PUT` | `/api/internship_records/{record_id}/lecturer_approval` | GIANG_VIEN | Phê duyệt hoặc từ chối kèm lý do, chỉ khi đã được phân công. Phê duyệt thì chuyển Đang thực tập, tạo khung kế hoạch và bảng tiến độ tuần |
| 47 | `PUT` | `/api/internship_records/{record_id}/status` | ADMIN | Chuyển hồ sơ sang Gián đoạn do bất khả kháng hoặc khôi phục (Điều 15 khoản 4) |

## 7. Phân công giảng viên hướng dẫn (UC05) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 48 | `GET` | `/api/assignments` | ADMIN, GIANG_VIEN, SINH_VIEN | Lấy danh sách phân công theo đợt. GIANG_VIEN xem sinh viên của mình, SINH_VIEN xem GVHD của mình (BR-05.4) |
| 49 | `GET` | `/api/assignments/candidates` | ADMIN | Lấy sinh viên chưa có GVHD và danh sách giảng viên kèm số đã nhận trên hạn mức |
| 50 | `POST` | `/api/assignments` | ADMIN | Phân công một hoặc nhiều sinh viên cho một giảng viên trong một giao dịch. Vượt hạn mức thì chặn toàn bộ (QUOTA_EXCEEDED) |
| 51 | `PUT` | `/api/assignments/{assignment_id}` | ADMIN | Đổi GVHD kèm lý do. Chặn nếu giảng viên cũ đã có phiếu đánh giá đã nộp; ghi nhật ký |

## 8. Kế hoạch học tập (UC06) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 52 | `GET` | `/api/internship_records/{record_id}/study_plan` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy kế hoạch học tập của hồ sơ kèm các dòng tuần và hạn nộp |
| 53 | `PUT` | `/api/study_plans/{plan_id}` | SINH_VIEN | Cập nhật mục tiêu, kết quả mong đợi, hình thức minh chứng của từng tuần |
| 54 | `PUT` | `/api/study_plans/{plan_id}/submit` | SINH_VIEN | Gửi xác nhận: kiểm tra đủ các dòng, gắn nhãn Nộp muộn nếu quá 5 ngày làm việc (BR-06.3) |
| 55 | `PUT` | `/api/study_plans/{plan_id}/confirmation` | CAN_BO_DVHD, GIANG_VIEN | Xác nhận kế hoạch. Đủ hai xác nhận thì khóa kế hoạch |
| 56 | `PUT` | `/api/study_plans/{plan_id}/reopen` | GIANG_VIEN | Mở lại kế hoạch đã khóa để sinh viên sửa (BR-06.4) |

## 9. Nhật ký, tiến độ tuần và minh chứng (UC07) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 57 | `GET` | `/api/internship_records/{record_id}/logbooks` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy nhật ký thực tập của hồ sơ, lọc theo khoảng ngày |
| 58 | `POST` | `/api/logbooks` | SINH_VIEN | Thêm nhật ký ngày. Mỗi hồ sơ một bản ghi mỗi ngày (BR-07.1) |
| 59 | `PUT` | `/api/logbooks/{logbook_id}` | SINH_VIEN | Sửa nhật ký, chỉ trong 7 ngày gần nhất (BR-07.2) |
| 60 | `POST` | `/api/logbooks/reminders` | GIANG_VIEN | Gửi nhắc nhở tới sinh viên chưa cập nhật nhật ký quá 5 ngày |
| 61 | `GET` | `/api/internship_records/{record_id}/weekly_progress` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy bảng theo dõi tiến độ theo tuần TTTN-03 |
| 62 | `PUT` | `/api/weekly_progress/{progress_id}` | SINH_VIEN | Cập nhật công việc được giao, kết quả, phần trăm hoàn thành 0 đến 100. Chặn nếu dòng đã được xác nhận |
| 63 | `PUT` | `/api/weekly_progress/{progress_id}/confirmation` | CAN_BO_DVHD | Xác nhận dòng tuần (khóa dòng) hoặc yêu cầu bổ sung kèm nội dung |
| 64 | `GET` | `/api/internship_records/{record_id}/evidences` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy danh sách minh chứng của hồ sơ, lọc theo loại và tuần |
| 65 | `GET` | `/api/internship_records/{record_id}/evidences/checklist` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Đối chiếu minh chứng đã nộp với danh mục bắt buộc của hình thức thực tập, trả trạng thái Đủ / Thiếu (BR-07.6) |
| 66 | `POST` | `/api/evidences` | SINH_VIEN | Tải lên minh chứng (multipart): tối đa 20 MB, định dạng pdf, doc, docx, xls, xlsx, jpg, png, mp4 (CBR-24) |
| 67 | `GET` | `/api/evidences/{evidence_id}/file` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Tải xuống tệp minh chứng qua endpoint có kiểm tra quyền |
| 68 | `DELETE` | `/api/evidences/{evidence_id}` | SINH_VIEN | Xóa minh chứng khi hồ sơ chưa chốt điểm (RESOURCE_LOCKED nếu đã khóa) |

## 10. Phiếu đánh giá chặng 1 và chặng 2 (UC08, UC09) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 69 | `GET` | `/api/assessments` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy danh sách phiếu đánh giá, lọc theo đợt, chặng, trạng thái. Người chấm chỉ thấy phiếu của mình |
| 70 | `GET` | `/api/assessments/form` | GIANG_VIEN, CAN_BO_DVHD | Lấy biểu mẫu chấm theo hồ sơ và chặng: câu hỏi, rubric, hồ sơ tóm tắt. Nhóm ĐVHD không có CLO7 (CBR-09) |
| 71 | `GET` | `/api/assessments/{assessment_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy chi tiết phiếu. Người chấm không xem được phiếu của bên kia khi hai bên chưa cùng nộp (BR-08.7) |
| 72 | `POST` | `/api/assessments` | GIANG_VIEN, CAN_BO_DVHD | Tạo phiếu ở trạng thái nháp kèm mức đạt và điểm từng CLO. Mỗi người chấm một phiếu cho một sinh viên trong một chặng (CBR-11) |
| 73 | `PUT` | `/api/assessments/{assessment_id}` | GIANG_VIEN, CAN_BO_DVHD | Sửa phiếu đang ở trạng thái Nháp hoặc Mở lại |
| 74 | `PUT` | `/api/assessments/{assessment_id}/submit` | GIANG_VIEN, CAN_BO_DVHD | Nộp phiếu: kiểm tra đủ câu, điểm nằm trong khoảng của mức (CBR-10), khóa phiếu. Đủ phiếu thì tính điểm chặng |
| 75 | `PUT` | `/api/assessments/{assessment_id}/reopen` | ADMIN | Mở lại phiếu đã nộp kèm lý do bắt buộc; ghi nhật ký giá trị điểm cũ (CBR-12) |
| 76 | `GET` | `/api/assessments/deviation_warnings` | ADMIN | Lấy danh sách cặp phiếu lệch trên 2,0 điểm ở cùng một CLO (BR-08.9) |

## 11. Tổ đánh giá cuối kỳ (UC09) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 77 | `GET` | `/api/panels` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy danh sách Tổ đánh giá theo đợt. Thành viên chỉ thấy tổ mình tham gia |
| 78 | `GET` | `/api/panels/{panel_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy chi tiết tổ: thành viên, nhóm người chấm, sinh viên, thời gian, địa điểm (SINH_VIEN chỉ xem tổ của mình) |
| 79 | `POST` | `/api/panels` | ADMIN | Thành lập tổ: kiểm tra tối thiểu 3 thành viên, số lẻ, có GVHD của sinh viên, có thành viên ĐVHD (CBR-14); thông báo thành viên |
| 80 | `PUT` | `/api/panels/{panel_id}` | ADMIN | Cập nhật thời gian, địa điểm, hình thức, ghi chú phê duyệt trực tuyến, đường dẫn tệp ghi hình |
| 81 | `PUT` | `/api/panels/{panel_id}/members/{member_id}/absence` | ADMIN | Đánh dấu thành viên vắng mặt và bổ sung người thay thế; kiểm tra lại điều kiện thành lập tổ |

## 12. Tính điểm, xác nhận và công bố kết quả (UC10) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 82 | `GET` | `/api/results` | ADMIN, GIANG_VIEN, CAN_BO_DVHD | Lấy bảng kết quả toàn đợt: điểm 7 CLO, điểm học phần, mức đạt, kết luận (RP-01), lọc theo phạm vi quyền |
| 83 | `GET` | `/api/results/{record_id}` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy bảng tổng hợp TTTN-07 của một hồ sơ. SINH_VIEN chỉ xem khi đã công bố và đã gửi phiếu 08b, không thấy điểm từng người chấm |
| 84 | `POST` | `/api/results/{record_id}/calculate` | ADMIN | Chạy lại thuật toán tính điểm (tự động khi đủ phiếu). Kiểm tra đủ minh chứng và đủ phiếu hai bên (CBR-16, CBR-17); ghi nhật ký điểm trước và sau |
| 85 | `PUT` | `/api/results/{record_id}/review` | GIANG_VIEN | GVHD nhập nhận xét và đề xuất điểm thưởng tối đa 0,5 (CBR-21) |
| 86 | `PUT` | `/api/results/{record_id}/confirm` | ADMIN | Xác nhận kết quả và duyệt điểm thưởng; trạng thái chuyển Đã xác nhận |
| 87 | `PUT` | `/api/results/publish` | ADMIN | Công bố kết quả theo đợt hoặc danh sách hồ sơ; hồ sơ chuyển Hoàn thành hoặc Không hoàn thành |
| 88 | `GET` | `/api/results/{record_id}/export` | ADMIN, GIANG_VIEN | Xuất bảng tổng hợp TTTN-07 ra tệp Word đúng bố cục biểu mẫu |

## 13. Báo cáo thực tập (UC11) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 89 | `GET` | `/api/internship_records/{record_id}/reports` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy các phiên bản báo cáo đã nộp của hồ sơ |
| 90 | `POST` | `/api/reports` | SINH_VIEN | Nộp báo cáo (multipart): pdf hoặc docx tối đa 20 MB, lưu phiên bản mới không ghi đè, gắn nhãn Nộp muộn nếu quá hạn |
| 91 | `GET` | `/api/reports/{report_id}/file` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Tải xuống tệp báo cáo qua endpoint có kiểm tra quyền |
| 92 | `PUT` | `/api/reports/{report_id}/confirmation` | CAN_BO_DVHD, GIANG_VIEN | Xác nhận báo cáo. Đủ hai xác nhận thì hồ sơ chuyển Chờ đánh giá cuối kỳ |
| 93 | `PUT` | `/api/reports/{report_id}/reopen` | GIANG_VIEN | Cho phép sinh viên thay tệp báo cáo sau khi đã có xác nhận (BR-11.4) |

## 14. Phản hồi và tự đánh giá (UC12) — phụ trách: **B**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 94 | `GET` | `/api/internship_records/{record_id}/feedbacks` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy phiếu phản hồi TTTN-08a và TTTN-08b của hồ sơ theo phạm vi quyền |
| 95 | `POST` | `/api/feedbacks/self_score_preview` | SINH_VIEN | Tính thử HPself từ mức tự đánh giá 7 CLO để sinh viên xem lại trước khi gửi (BR-12.3) |
| 96 | `POST` | `/api/feedbacks` | CAN_BO_DVHD, SINH_VIEN | Gửi phiếu TTTN-08a (cán bộ ĐVHD) hoặc TTTN-08b (sinh viên); 08b phải đủ 7 CLO |
| 97 | `GET` | `/api/feedbacks/{feedback_id}/self_awareness` | SINH_VIEN, GIANG_VIEN | Lấy chỉ số tự nhận thức năng lực sau khi kết quả được công bố (BR-12.4) |

## 15. Thống kê, nhật ký hệ thống và thông báo (UC13) — phụ trách: **A**

| # | Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|---|
| 98 | `GET` | `/api/statistics/{report_type}` | ADMIN | Lấy báo cáo thống kê theo đợt: tỷ lệ đạt CLO so với mục tiêu 90%, tiến độ chấm, tình trạng minh chứng, tự nhận thức, phản hồi (RP-02 đến RP-06) |
| 99 | `GET` | `/api/statistics/{report_type}/export` | ADMIN | Xuất báo cáo thống kê ra tệp Excel |
| 100 | `GET` | `/api/audit_logs` | ADMIN | Tra cứu nhật ký hệ thống theo đối tượng, người thực hiện, khoảng thời gian; chỉ đọc |
| 101 | `GET` | `/api/notifications` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Lấy thông báo của người dùng hiện tại, lọc chưa đọc |
| 102 | `PUT` | `/api/notifications/{notification_id}/read` | ADMIN, GIANG_VIEN, CAN_BO_DVHD, SINH_VIEN | Đánh dấu thông báo đã đọc |
