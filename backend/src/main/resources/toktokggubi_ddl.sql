/* =========================================================
   0) 스키마 생성 및 사용
========================================================= */
CREATE DATABASE IF NOT EXISTS toktokggubi
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE toktokggubi;

/* =========================================================
   Clean drop (FK 무시 후 전부 삭제)
========================================================= */
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_molbbang_room_totals;

DROP TABLE IF EXISTS sale_event;
DROP TABLE IF EXISTS gifticon;
DROP TABLE IF EXISTS notification_log;
DROP TABLE IF EXISTS user_notification_setting;
DROP TABLE IF EXISTS device_push_token;
DROP TABLE IF EXISTS card_transaction;
DROP TABLE IF EXISTS user_card;
DROP TABLE IF EXISTS user_account;
DROP TABLE IF EXISTS fixed_expense;
DROP TABLE IF EXISTS budget_category;
DROP TABLE IF EXISTS user_selected_category;
DROP TABLE IF EXISTS user_monthly_budget;
DROP TABLE IF EXISTS card_product_benefit;
DROP TABLE IF EXISTS card_product;
DROP TABLE IF EXISTS card_issuer;
DROP TABLE IF EXISTS merchant;
DROP TABLE IF EXISTS franchise;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS molbbang_score;
DROP TABLE IF EXISTS molbbang_member;
DROP TABLE IF EXISTS molbbang_room;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

/* =========================================================
   1) 사용자
========================================================= */
CREATE TABLE `user`
(
    `user_id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `email`            VARCHAR(255) NOT NULL COMMENT 'UNIQUE',
    `password`         VARCHAR(255) NULL,
    `nickname`         VARCHAR(50)  NOT NULL,
    `gender`           VARCHAR(50)  NOT NULL COMMENT 'ENUM(`M`, `F`)',
    `age_group`        VARCHAR(20)  NULL,
    `job_title`        VARCHAR(50)  NULL,
    `monthly_income`   BIGINT       NULL,
    `kakao_sub`        VARCHAR(128) NULL COMMENT 'UNIQUE',
    `finance_user_key` VARCHAR(36)  NULL,
    `created_at`       DATETIME     NOT NULL,
    `updated_at`       DATETIME     NOT NULL,
    `status`           VARCHAR(50)  NULL COMMENT 'ENUM(`ACTIVE`, `INACTIVE`, `WITHDRAWN`)',
    CONSTRAINT `PK_USER` PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_user_email` (`email`),
    UNIQUE KEY `uq_user_kakao` (`kakao_sub`)
) ENGINE = InnoDB;

/* =========================================================
   2) 카테고리 및 가맹점
========================================================= */
CREATE TABLE `category`
(
    `category_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `sort_order`  INT          NULL DEFAULT 0,
    CONSTRAINT `PK_CATEGORY` PRIMARY KEY (`category_id`),
    UNIQUE KEY `uq_category_name` (`name`)
) ENGINE = InnoDB;

CREATE TABLE `franchise`
(
    `franchise_id`   BIGINT       NOT NULL AUTO_INCREMENT,
    `franchise_name` VARCHAR(150) NOT NULL,
    `image_url`      VARCHAR(255) NULL,
    CONSTRAINT `PK_FRANCHISE` PRIMARY KEY (`franchise_id`)
) ENGINE = InnoDB;

CREATE TABLE `merchant`
(
    `merchant_id`   BIGINT       NOT NULL,
    `franchise_id`  BIGINT       NULL,
    `category_id`   BIGINT       NOT NULL,
    `merchant_name` VARCHAR(150) NOT NULL,
    CONSTRAINT `PK_MERCHANT` PRIMARY KEY (`merchant_id`),
    KEY `idx_mrch_name` (`merchant_name`),
    KEY `idx_mrch_category` (`category_id`),
    KEY `idx_mrch_franchise` (`franchise_id`),
    CONSTRAINT `FK_merchant_category`
        FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `FK_merchant_franchise`
        FOREIGN KEY (`franchise_id`) REFERENCES `franchise` (`franchise_id`)
            ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

/* =========================================================
   3) 카드 상품
========================================================= */
CREATE TABLE `card_issuer`
(
    `card_issuer_code` VARCHAR(10)  NOT NULL,
    `card_issuer_name` VARCHAR(100) NOT NULL,
    CONSTRAINT `PK_CARD_ISSUER` PRIMARY KEY (`card_issuer_code`)
) ENGINE = InnoDB;

CREATE TABLE `card_product`
(
    `card_unique_no`   VARCHAR(40)  NOT NULL,
    `card_issuer_code` VARCHAR(10)  NOT NULL,
    `card_name`        VARCHAR(150) NOT NULL,
    `card_type_name`   VARCHAR(50)  NOT NULL COMMENT 'ENUM(`CREDIT`, `CHECK`)',
    `image_url`        VARCHAR(255) NULL,
    `card_description` VARCHAR(500) NULL,
    CONSTRAINT `PK_CARD_PRODUCT` PRIMARY KEY (`card_unique_no`),
    KEY `idx_cp_issuer` (`card_issuer_code`),
    CONSTRAINT `FK_cp_issuer`
        FOREIGN KEY (`card_issuer_code`) REFERENCES `card_issuer` (`card_issuer_code`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE `card_product_benefit`
(
    `franchise_id`   BIGINT        NOT NULL,
    `card_unique_no` VARCHAR(40)   NOT NULL,
    `discount_rate`  DECIMAL(5, 2) NOT NULL,
    CONSTRAINT `PK_CARD_PRODUCT_BENEFIT` PRIMARY KEY (`franchise_id`, `card_unique_no`),
    KEY `idx_cpb_franchise` (`franchise_id`),
    CONSTRAINT `FK_franchise_TO_card_product_benefit_1`
        FOREIGN KEY (`franchise_id`) REFERENCES `franchise` (`franchise_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `FK_card_product_TO_card_product_benefit_1`
        FOREIGN KEY (`card_unique_no`) REFERENCES `card_product` (`card_unique_no`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

/* =========================================================
   4) 사용자 카드/계좌
========================================================= */
CREATE TABLE `user_account`
(
    `user_account_id`     BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`             BIGINT       NOT NULL,
    `account_no`          VARCHAR(32)  NOT NULL,
    `account_name`        VARCHAR(150) NULL,
    `account_description` VARCHAR(500) NULL,
    `is_active`           BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT `PK_USER_ACCOUNT` PRIMARY KEY (`user_account_id`),
    UNIQUE KEY `uq_user_account` (`user_id`, `account_no`),
    CONSTRAINT `FK_user_account_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `user_card`
(
    `user_card_id`    BIGINT      NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT      NOT NULL,
    `user_account_id` BIGINT      NOT NULL,
    `card_unique_no`  VARCHAR(40) NOT NULL,
    `card_no`         VARCHAR(32) NOT NULL,
    `cvc`             VARCHAR(10) NOT NULL,
    `withdrawal_date` TINYINT     NULL COMMENT '월 화 수 목 금 토 일 : 1, 2, 3, 4, 5, 6, 7',
    `is_active`       BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT `PK_USER_CARD` PRIMARY KEY (`user_card_id`),
    UNIQUE KEY `uq_user_card_unique` (`user_id`, `card_unique_no`),
    CONSTRAINT `FK_uc_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_uc_account`
        FOREIGN KEY (`user_account_id`) REFERENCES `user_account` (`user_account_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `FK_uc_product`
        FOREIGN KEY (`card_unique_no`) REFERENCES `card_product` (`card_unique_no`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

/* =========================================================
   5) 예산
========================================================= */
CREATE TABLE `user_monthly_budget`
(
    `user_monthly_budget_id` BIGINT     NOT NULL AUTO_INCREMENT,
    `user_id`                BIGINT     NOT NULL,
    `budget_ym`              VARCHAR(6) NOT NULL,
    `total_amount`           BIGINT     NOT NULL,
    `created_at`             DATETIME   NOT NULL,
    `updated_at`             DATETIME   NOT NULL,
    `is_active`              BOOLEAN    NOT NULL DEFAULT TRUE,
    CONSTRAINT `PK_USER_MONTHLY_BUDGET` PRIMARY KEY (`user_monthly_budget_id`),
    UNIQUE KEY `uq_umb_user_month` (`user_id`, `budget_ym`),
    CONSTRAINT `FK_umb_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `user_selected_category`
(
    `user_selected_category_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id`                   BIGINT NOT NULL,
    `category_id`               BIGINT NOT NULL,
    CONSTRAINT `PK_USER_SELECTED_CATEGORY` PRIMARY KEY (`user_selected_category_id`),
    UNIQUE KEY `uq_usc_user_cat` (`user_id`, `category_id`),
    CONSTRAINT `FK_usc_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_usc_category`
        FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE `budget_category`
(
    `budget_category_id`        BIGINT NOT NULL AUTO_INCREMENT,
    `user_monthly_budget_id`    BIGINT NOT NULL,
    `user_selected_category_id` BIGINT NOT NULL,
    `final_amount`              BIGINT NULL,
    CONSTRAINT `PK_BUDGET_CATEGORY` PRIMARY KEY (`budget_category_id`),
    UNIQUE KEY `uq_budget_category` (`user_monthly_budget_id`, `user_selected_category_id`),
    CONSTRAINT `FK_bc_budget`
        FOREIGN KEY (`user_monthly_budget_id`) REFERENCES `user_monthly_budget` (`user_monthly_budget_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_bc_usc`
        FOREIGN KEY (`user_selected_category_id`) REFERENCES `user_selected_category` (`user_selected_category_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

CREATE TABLE `fixed_expense`
(
    `fixed_expense_id`       BIGINT       NOT NULL AUTO_INCREMENT,
    `user_monthly_budget_id` BIGINT       NOT NULL,
    `title`                  VARCHAR(100) NOT NULL,
    `amount`                 BIGINT       NOT NULL,
    `include_in_budget`      BOOLEAN      NOT NULL DEFAULT TRUE,
    `payment_day`            TINYINT      NULL COMMENT '1~31',
    CONSTRAINT `PK_FIXED_EXPENSE` PRIMARY KEY (`fixed_expense_id`),
    KEY `idx_fe_budget` (`user_monthly_budget_id`),
    CONSTRAINT `FK_fe_budget`
        FOREIGN KEY (`user_monthly_budget_id`) REFERENCES `user_monthly_budget` (`user_monthly_budget_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

/* =========================================================
   6) 카드 거래
========================================================= */
CREATE TABLE `card_transaction`
(
    `transaction_unique_no` VARCHAR(40) NOT NULL,
    `user_id`               BIGINT      NOT NULL,
    `user_card_id`          BIGINT      NOT NULL,
    `merchant_id`           BIGINT      NOT NULL,
    `card_status`           VARCHAR(20) NOT NULL DEFAULT 'APPROVED' COMMENT 'ENUM(`APPROVED`, `CANCEL`, `DECLINED`)',
    `transaction_ymd`       VARCHAR(8)  NOT NULL,
    `transaction_hms`       VARCHAR(6)  NOT NULL,
    `payment_balance`       BIGINT      NOT NULL,
    `created_at`            DATETIME    NOT NULL DEFAULT NOW(),
    CONSTRAINT `PK_CARD_TRANSACTION` PRIMARY KEY (`transaction_unique_no`),
    KEY `idx_ct_user_ymd` (`user_id`, `transaction_ymd`),
    KEY `idx_ct_merchant` (`merchant_id`),
    CONSTRAINT `FK_ct_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_ct_user_card`
        FOREIGN KEY (`user_card_id`) REFERENCES `user_card` (`user_card_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `FK_ct_merchant`
        FOREIGN KEY (`merchant_id`) REFERENCES `merchant` (`merchant_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

/* =========================================================
   7) 알림/설정
========================================================= */
CREATE TABLE `device_push_token`
(
    `device_push_token_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`              BIGINT       NOT NULL,
    `platform`             VARCHAR(10)  NOT NULL COMMENT 'ENUM(`APNS`, `FCM`, `WEB`)',
    `token`                VARCHAR(300) NOT NULL,
    `is_active`            BOOLEAN      NOT NULL DEFAULT TRUE,
    `created_at`           DATETIME     NOT NULL DEFAULT NOW(),
    `updated_at`           DATETIME     NOT NULL DEFAULT NOW(),
    CONSTRAINT `PK_DEVICE_PUSH_TOKEN` PRIMARY KEY (`device_push_token_id`),
    UNIQUE KEY `uq_user_token` (`user_id`, `token`),
    CONSTRAINT `FK_dpt_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `user_notification_setting`
(
    `user_notification_setting_id` BIGINT  NOT NULL AUTO_INCREMENT,
    `user_id`                      BIGINT  NOT NULL,
    `all_notifications_on`         BOOLEAN NOT NULL DEFAULT TRUE,
    `budget_threshold_on`          BOOLEAN NOT NULL DEFAULT TRUE,
    `anomaly_detection_on`         BOOLEAN NOT NULL DEFAULT TRUE,
    `location_based_on`            BOOLEAN NOT NULL DEFAULT TRUE,
    `monthly_report_on`            BOOLEAN NOT NULL DEFAULT TRUE,
    `shake_trigger_on`             BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT `PK_USER_NOTIFICATION_SETTING` PRIMARY KEY (`user_notification_setting_id`),
    UNIQUE KEY `uq_uns_user` (`user_id`),
    CONSTRAINT `FK_uns_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE `notification_log`
(
    `notification_log_id` BIGINT        NOT NULL AUTO_INCREMENT,
    `user_id`             BIGINT        NOT NULL,
    `type`                VARCHAR(50)   NOT NULL,
    `title`               VARCHAR(150)  NOT NULL,
    `body`                VARCHAR(1000) NOT NULL,
    `payload_json`        JSON          NULL,
    `sent_at`             DATETIME      NOT NULL,
    `read_at`             DATETIME      NULL,
    CONSTRAINT `PK_NOTIFICATION_LOG` PRIMARY KEY (`notification_log_id`),
    KEY `idx_notif_user_time` (`user_id`, `sent_at`),
    CONSTRAINT `FK_notif_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

/* =========================================================
   8) 기프티콘
========================================================= */
CREATE TABLE `gifticon`
(
    `gifticon_id`  BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT       NOT NULL,
    `franchise_id` BIGINT       NULL,
    `label`        VARCHAR(150) NOT NULL,
    `image_url`    VARCHAR(500) NULL,
    `expires_at`   DATE         NULL,
    `created_at`   DATETIME     NOT NULL,
    `status`       VARCHAR(16)  NULL DEFAULT 'ACTIVE' COMMENT 'ENUM(`ACTIVE`, `USED`, `EXPIRED`, `INACTIVE`)',
    CONSTRAINT `PK_GIFTICON` PRIMARY KEY (`gifticon_id`),
    KEY `idx_gi_user_status_exp` (`user_id`, `status`, `expires_at`),
    KEY `idx_gi_franchise` (`franchise_id`),
    CONSTRAINT `FK_gi_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_gi_franchise`
        FOREIGN KEY (`franchise_id`) REFERENCES `franchise` (`franchise_id`)
            ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE = InnoDB;

/* =========================================================
   9) 세일/프로모션
========================================================= */
CREATE TABLE `sale_event`
(
    `sale_event_id` BIGINT        NOT NULL AUTO_INCREMENT,
    `franchise_id`  BIGINT        NOT NULL,
    `title`         VARCHAR(150)  NOT NULL,
    `starts_at`     DATETIME      NOT NULL,
    `ends_at`       DATETIME      NOT NULL,
    `description`   VARCHAR(1000) NULL,
    CONSTRAINT `PK_SALE_EVENT` PRIMARY KEY (`sale_event_id`),
    KEY `idx_sale_period` (`starts_at`, `ends_at`),
    KEY `idx_sale_franchise` (`franchise_id`),
    CONSTRAINT `FK_sale_franchise`
        FOREIGN KEY (`franchise_id`) REFERENCES `franchise` (`franchise_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

/* =========================================================
   10) 몰빵 게임: 방
   - status: LOBBY, IN_PROGRESS, FINISHED, CANCELLED
========================================================= */
CREATE TABLE `molbbang_room`
(
    `room_id`      BIGINT      NOT NULL AUTO_INCREMENT,
    `room_code`    VARCHAR(12) NOT NULL COMMENT '입장 코드, 대소문자+숫자, 예: ABC123',
    `host_user_id` BIGINT      NOT NULL,
    `amount`       BIGINT      NOT NULL COMMENT '몰빵 금액',
    `status`       VARCHAR(20) NOT NULL DEFAULT 'LOBBY' COMMENT 'ENUM(`LOBBY`,`IN_PROGRESS`,`FINISHED`,`CANCELLED`)',
    `created_at`   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `started_at`   DATETIME    NULL,
    `ended_at`     DATETIME    NULL,
    CONSTRAINT `PK_MOLBBANG_ROOM` PRIMARY KEY (`room_id`),
    UNIQUE KEY `uq_mr_code` (`room_code`),
    KEY `idx_mr_status` (`status`),
    CONSTRAINT `FK_mr_host_user`
        FOREIGN KEY (`host_user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

/* =========================================================
   11) 몰빵 게임: 멤버
========================================================= */
CREATE TABLE `molbbang_member`
(
    `member_id` BIGINT      NOT NULL AUTO_INCREMENT,
    `room_id`   BIGINT      NOT NULL,
    `user_id`   BIGINT      NOT NULL,
    `nickname`  VARCHAR(50) NOT NULL,
    `is_host`   BOOLEAN     NOT NULL DEFAULT FALSE,
    `is_ready`  BOOLEAN     NOT NULL DEFAULT FALSE,
    `is_active` BOOLEAN     NOT NULL DEFAULT TRUE,
    `joined_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `left_at`   DATETIME    NULL,
    CONSTRAINT `PK_MOLBBANG_MEMBER` PRIMARY KEY (`member_id`),
    UNIQUE KEY `uq_mm_room_user` (`room_id`, `user_id`),
    UNIQUE KEY `uq_mm_room_nickname` (`room_id`, `nickname`),
    KEY `idx_mm_room` (`room_id`),
    KEY `idx_mm_user` (`user_id`),
    CONSTRAINT `FK_mm_room`
        FOREIGN KEY (`room_id`) REFERENCES `molbbang_room` (`room_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_mm_user`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

/* =========================================================
   12) 몰빵 게임: 점수
========================================================= */
CREATE TABLE `molbbang_score`
(
    `score_id`     BIGINT   NOT NULL AUTO_INCREMENT,
    `room_id`      BIGINT   NOT NULL,
    `member_id`    BIGINT   NOT NULL,
    `score`        INT      NOT NULL,
    `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `PK_MOLBBANG_SCORE` PRIMARY KEY (`score_id`),
    UNIQUE KEY `uq_ms_room_member` (`room_id`, `member_id`),
    KEY `idx_ms_room` (`room_id`),
    KEY `idx_ms_member` (`member_id`),
    CONSTRAINT `FK_ms_room`
        FOREIGN KEY (`room_id`) REFERENCES `molbbang_room` (`room_id`)
            ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `FK_ms_member`
        FOREIGN KEY (`member_id`) REFERENCES `molbbang_member` (`member_id`)
            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

/* =========================================================
   13) 뷰: 방별 총점/순위(집계)
========================================================= */
CREATE VIEW `v_molbbang_room_totals` AS
SELECT mr.room_id,
       mm.member_id,
       mm.user_id,
       mm.nickname,
       COALESCE(SUM(ms.score), 0)                                                     AS total_score,
       RANK() OVER (PARTITION BY mr.room_id ORDER BY COALESCE(SUM(ms.score), 0) DESC) AS rank_desc,
       RANK() OVER (PARTITION BY mr.room_id ORDER BY COALESCE(SUM(ms.score), 0) ASC)  AS rank_asc
FROM molbbang_room mr
         JOIN molbbang_member mm
              ON mm.room_id = mr.room_id AND mm.is_active = TRUE
         LEFT JOIN molbbang_score ms
                   ON ms.room_id = mr.room_id AND ms.member_id = mm.member_id
GROUP BY mr.room_id, mm.member_id, mm.user_id, mm.nickname;
