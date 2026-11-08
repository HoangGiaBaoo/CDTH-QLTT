package org.example.cdthqltt.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.cdthqltt.service.DotThucTapService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

/** CBR-13: tự mở chặng khi đến mốc. Chạy lúc 00:05 hằng ngày và một lần khi khởi động (bù ngày máy tắt). */
@Slf4j
@Component
@RequiredArgsConstructor
public class MoChangScheduler {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DotThucTapService dotService;

    @Scheduled(cron = "0 5 0 * * *", zone = "Asia/Ho_Chi_Minh")
    public void moChangHangNgay() {
        chay();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void moChangKhiKhoiDong() {
        chay();
    }

    private void chay() {
        int soChang = dotService.moChangDenHan(LocalDate.now(VN));
        if (soChang > 0) {
            log.info("Đã tự mở {} chặng đánh giá đến hạn", soChang);
        }
    }
}
