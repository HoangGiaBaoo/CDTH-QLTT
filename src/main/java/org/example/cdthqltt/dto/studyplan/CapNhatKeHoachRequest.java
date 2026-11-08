package org.example.cdthqltt.dto.studyplan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** #53 — lưu nháp các dòng kế hoạch; dòng nào gửi lên thì ghi đè dòng đó. */
public record CapNhatKeHoachRequest(@NotEmpty(message = "Chưa có dòng kế hoạch nào") List<@Valid Muc> cacMuc) {

    public record Muc(@NotNull(message = "Thiếu số tuần") @Min(1) Integer tuan,
                      @Size(max = 2000) String mucTieu,
                      @Size(max = 2000) String ketQuaMongDoi,
                      @Size(max = 200) String hinhThucMinhChung) {
    }
}
