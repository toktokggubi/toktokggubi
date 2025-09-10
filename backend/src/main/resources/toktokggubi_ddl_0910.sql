/* =========================================================
   0) 스키마
========================================================= */
CREATE DATABASE IF NOT EXISTS toktokggubi
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE toktokggubi;

/* =========================================================
   Clean drop (ignore FK order)
========================================================= */
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sale_event;
DROP TABLE IF EXISTS gifticon;
DROP TABLE IF EXISTS notification_log;
DROP TABLE IF EXISTS user_notification_setting;
DROP TABLE IF EXISTS device_push_token;
DROP TABLE IF EXISTS billing_statement_cycle;
DROP TABLE IF EXISTS billing_statement;
DROP TABLE IF EXISTS card_transaction;
DROP TABLE IF EXISTS user_card;
DROP TABLE IF EXISTS user_deposit_account;
DROP TABLE IF EXISTS card_product_benefit;
DROP TABLE IF EXISTS card_product;
DROP TABLE IF EXISTS card_issuer;
DROP TABLE IF EXISTS fixed_expense;
DROP TABLE IF EXISTS budget_category;
DROP TABLE IF EXISTS user_selected_category;
DROP TABLE IF EXISTS user_monthly_budget;
DROP TABLE IF EXISTS merchant_internal_map;
DROP TABLE IF EXISTS merchant;
DROP TABLE IF EXISTS ext_category_default_map;
DROP TABLE IF EXISTS external_category;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

/* =========================================================
   1) 사용자
========================================================= */
CREATE TABLE `user` (
                        user_id          BIGINT       NOT NULL AUTO_INCREMENT,
                        email            VARCHAR(255) NOT NULL,
                        password         VARCHAR(255) NULL,
                        nickname         VARCHAR(50)  NULL,
                        gender           VARCHAR(50)  NULL COMMENT 'M, F',
                        age_group        VARCHAR(20)  NULL,
                        job_title        VARCHAR(50)  NULL,
                        monthly_income   BIGINT       NULL,
                        kakao_sub        VARCHAR(128) NULL,
                        finance_user_key CHAR(36)     NULL,
                        fintech_app_no   VARCHAR(10)  NULL,
                        institution_code VARCHAR(10)  NULL,
                        created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        status           VARCHAR(50)  NULL COMMENT 'ACTIVE, WITHDRAWN',
                        CONSTRAINT PK_USER PRIMARY KEY (user_id),
                        UNIQUE KEY uq_user_email (email),
                        UNIQUE KEY uq_user_fin_key (finance_user_key)
) ENGINE=InnoDB;

/* =========================================================
   2) 카테고리(내부/외부) & 매핑
========================================================= */
CREATE TABLE category (
                          category_id BIGINT       NOT NULL AUTO_INCREMENT,
                          name        VARCHAR(100) NOT NULL,
                          description VARCHAR(255) NULL,
                          sort_order  INT          NULL DEFAULT 0,
                          is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
                          created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT PK_CATEGORY PRIMARY KEY (category_id),
                          UNIQUE KEY uq_category_name (name)
) ENGINE=InnoDB;

CREATE TABLE external_category (
                                   ext_category_id VARCHAR(32)  NOT NULL,
                                   name            VARCHAR(100) NULL,
                                   description     VARCHAR(255) NULL,
                                   created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   CONSTRAINT PK_EXTERNAL_CATEGORY PRIMARY KEY (ext_category_id)
) ENGINE=InnoDB;

CREATE TABLE ext_category_default_map (
                                          ext_category_id VARCHAR(32) NOT NULL,
                                          category_id     BIGINT      NOT NULL,
                                          CONSTRAINT PK_EXT_CATEGORY_DEFAULT_MAP PRIMARY KEY (ext_category_id),
                                          CONSTRAINT FK_ecdm_ext FOREIGN KEY (ext_category_id)
                                              REFERENCES external_category(ext_category_id)
                                              ON UPDATE CASCADE ON DELETE CASCADE,
                                          CONSTRAINT FK_ecdm_cat FOREIGN KEY (category_id)
                                              REFERENCES category(category_id)
                                              ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

/* =========================================================
   3) 가맹점 & 내부카테고리 오버라이드
========================================================= */
CREATE TABLE merchant (
                          merchant_id     BIGINT       NOT NULL,
                          ext_category_id VARCHAR(32)  NOT NULL,
                          name            VARCHAR(150) NOT NULL,
                          lat             DECIMAL(10,7) NULL,
                          lng             DECIMAL(10,7) NULL,
                          image_url       VARCHAR(255)  NULL,
                          created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT PK_MERCHANT PRIMARY KEY (merchant_id),
                          KEY idx_mr_name (name),
                          KEY idx_mr_extcat (ext_category_id),
                          CONSTRAINT FK_merchant_extcat FOREIGN KEY (ext_category_id)
                              REFERENCES external_category(ext_category_id)
                              ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE merchant_internal_map (
                                       merchant_id BIGINT NOT NULL,
                                       category_id BIGINT NOT NULL,
                                       CONSTRAINT PK_MERCHANT_INTERNAL_MAP PRIMARY KEY (merchant_id),
                                       CONSTRAINT FK_mim_merchant FOREIGN KEY (merchant_id)
                                           REFERENCES merchant(merchant_id)
                                           ON UPDATE CASCADE ON DELETE CASCADE,
                                       CONSTRAINT FK_mim_category FOREIGN KEY (category_id)
                                           REFERENCES category(category_id)
                                           ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

/* =========================================================
   4) 예산
========================================================= */
CREATE TABLE user_monthly_budget (
                                     user_monthly_budget_id BIGINT   NOT NULL AUTO_INCREMENT,
                                     user_id                BIGINT   NOT NULL,
                                     budget_ym              CHAR(6)  NOT NULL,
                                     total_amount           BIGINT   NOT NULL,
                                     is_finalized           BOOLEAN  NOT NULL DEFAULT FALSE,
                                     created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     CONSTRAINT PK_USER_MONTHLY_BUDGET PRIMARY KEY (user_monthly_budget_id),
                                     UNIQUE KEY uq_umb_user_month (user_id, budget_ym),
                                     CONSTRAINT FK_umb_user FOREIGN KEY (user_id)
                                         REFERENCES `user`(user_id)
                                         ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_selected_category (
                                        user_selected_category_id BIGINT NOT NULL AUTO_INCREMENT,
                                        user_id    BIGINT NOT NULL,
                                        category_id BIGINT NOT NULL,
                                        CONSTRAINT PK_USER_SELECTED_CATEGORY PRIMARY KEY (user_selected_category_id),
                                        CONSTRAINT FK_usc_user FOREIGN KEY (user_id)
                                            REFERENCES `user`(user_id)
                                            ON UPDATE CASCADE ON DELETE CASCADE,
                                        CONSTRAINT FK_usc_category FOREIGN KEY (category_id)
                                            REFERENCES category(category_id)
                                            ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE budget_category (
                                 budget_category_id        BIGINT   NOT NULL AUTO_INCREMENT,
                                 user_monthly_budget_id    BIGINT   NOT NULL,
                                 user_selected_category_id BIGINT   NOT NULL,
                                 suggested_amount          BIGINT   NULL,
                                 final_amount              BIGINT   NULL,
                                 created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 updated_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                 CONSTRAINT PK_BUDGET_CATEGORY PRIMARY KEY (budget_category_id),
                                 UNIQUE KEY uq_budget_category (user_monthly_budget_id, user_selected_category_id),
                                 CONSTRAINT FK_bc_budget FOREIGN KEY (user_monthly_budget_id)
                                     REFERENCES user_monthly_budget(user_monthly_budget_id)
                                     ON UPDATE CASCADE ON DELETE CASCADE,
                                 CONSTRAINT FK_bc_usc FOREIGN KEY (user_selected_category_id)
                                     REFERENCES user_selected_category(user_selected_category_id)
                                     ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE fixed_expense (
                               fixed_expense_id       BIGINT       NOT NULL AUTO_INCREMENT,
                               user_monthly_budget_id BIGINT       NOT NULL,
                               title                  VARCHAR(100) NOT NULL,
                               amount                 BIGINT       NOT NULL,
                               payment_day            TINYINT      NULL COMMENT '1~31',
                               include_in_budget      BOOLEAN      NOT NULL DEFAULT TRUE,
                               created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               updated_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               CONSTRAINT PK_FIXED_EXPENSE PRIMARY KEY (fixed_expense_id),
                               KEY idx_fe_budget (user_monthly_budget_id),
                               CONSTRAINT FK_fe_budget FOREIGN KEY (user_monthly_budget_id)
                                   REFERENCES user_monthly_budget(user_monthly_budget_id)
                                   ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   5) 카드 마스터
========================================================= */
CREATE TABLE card_issuer (
                             card_issuer_code VARCHAR(10)  NOT NULL,
                             card_issuer_name VARCHAR(100) NOT NULL,
                             CONSTRAINT PK_CARD_ISSUER PRIMARY KEY (card_issuer_code)
) ENGINE=InnoDB;

CREATE TABLE card_product (
                              card_unique_no       VARCHAR(40)  NOT NULL,
                              card_issuer_code     VARCHAR(10)  NOT NULL,
                              card_type_code       VARCHAR(20)  NOT NULL,
                              card_type_name       VARCHAR(50)  NOT NULL,
                              card_name            VARCHAR(150) NOT NULL,
                              image_url            VARCHAR(255) NULL,
                              baseline_performance BIGINT       NOT NULL DEFAULT 0,
                              max_benefit_limit    BIGINT       NOT NULL DEFAULT 0,
                              card_description     VARCHAR(500) NULL,
                              created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              CONSTRAINT PK_CARD_PRODUCT PRIMARY KEY (card_unique_no),
                              KEY idx_cp_issuer (card_issuer_code),
                              CONSTRAINT FK_cp_issuer FOREIGN KEY (card_issuer_code)
                                  REFERENCES card_issuer(card_issuer_code)
                                  ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE card_product_benefit (
                                      card_unique_no  VARCHAR(40)  NOT NULL,
                                      ext_category_id VARCHAR(32)  NOT NULL,
                                      discount_rate   DECIMAL(5,2) NOT NULL,
                                      CONSTRAINT PK_CARD_PRODUCT_BENEFIT PRIMARY KEY (card_unique_no, ext_category_id),
                                      CONSTRAINT FK_cpb_product FOREIGN KEY (card_unique_no)
                                          REFERENCES card_product(card_unique_no)
                                          ON UPDATE CASCADE ON DELETE CASCADE,
                                      CONSTRAINT FK_cpb_extcat FOREIGN KEY (ext_category_id)
                                          REFERENCES external_category(ext_category_id)
                                          ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

/* =========================================================
   6) 사용자 카드 / 예금계좌
========================================================= */
CREATE TABLE user_card (
                           user_card_id      BIGINT       NOT NULL AUTO_INCREMENT,
                           user_id           BIGINT       NOT NULL,
                           card_unique_no    VARCHAR(40)  NOT NULL,
                           card_issuer_code  VARCHAR(10)  NOT NULL,
                           card_name         VARCHAR(150) NOT NULL,
                           card_description  VARCHAR(500) NULL,
                           card_no           VARCHAR(32)  NOT NULL,
                           cvc               VARCHAR(10)  NOT NULL,
                           card_expiry_date  CHAR(8)      NULL,
                           withdrawal_account_no VARCHAR(128) NULL,
                           withdrawal_date   TINYINT      NULL,
                           created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
                           CONSTRAINT PK_USER_CARD PRIMARY KEY (user_card_id),
                           UNIQUE KEY uq_user_card_unique (user_id, card_unique_no),
                           KEY idx_uc_user (user_id),
                           KEY idx_uc_issuer (card_issuer_code),
                           CONSTRAINT FK_uc_user FOREIGN KEY (user_id)
                               REFERENCES `user`(user_id)
                               ON UPDATE CASCADE ON DELETE CASCADE,
                           CONSTRAINT FK_uc_product FOREIGN KEY (card_unique_no)
                               REFERENCES card_product(card_unique_no)
                               ON UPDATE CASCADE ON DELETE RESTRICT,
                           CONSTRAINT FK_uc_issuer FOREIGN KEY (card_issuer_code)
                               REFERENCES card_issuer(card_issuer_code)
                               ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE user_deposit_account (
                                      user_deposit_account_id BIGINT       NOT NULL AUTO_INCREMENT,
                                      user_id                 BIGINT       NOT NULL,
                                      bank_code               VARCHAR(10)  NOT NULL,
                                      bank_name               VARCHAR(100) NOT NULL,
                                      account_no              VARCHAR(32)  NOT NULL,
                                      account_name            VARCHAR(150) NULL,
                                      account_description     VARCHAR(500) NULL,
                                      withdrawal_bank_code    VARCHAR(10)  NULL,
                                      withdrawal_bank_name    VARCHAR(100) NULL,
                                      withdrawal_account_no   VARCHAR(64)  NULL,
                                      subscription_period     INT          NULL,
                                      deposit_balance         BIGINT       NOT NULL DEFAULT 0,
                                      interest_rate           DECIMAL(5,2) NULL,
                                      account_create_date     DATE         NULL,
                                      account_expiry_date     DATE         NULL,
                                      status                  VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, MATURED, CLOSED',
                                      created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                      CONSTRAINT PK_USER_DEPOSIT_ACCOUNT PRIMARY KEY (user_deposit_account_id),
                                      UNIQUE KEY uq_uda_user_acct (user_id, account_no),
                                      KEY idx_uda_user_status (user_id, status),
                                      CONSTRAINT FK_uda_user FOREIGN KEY (user_id)
                                          REFERENCES `user`(user_id)
                                          ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   7) 거래/청구
========================================================= */
CREATE TABLE card_transaction (
                                  transaction_unique_no   VARCHAR(40)  NOT NULL,
                                  user_id                 BIGINT       NOT NULL,
                                  user_card_id            BIGINT       NOT NULL,
                                  ext_category_id         VARCHAR(32)  NOT NULL,
                                  category_id             BIGINT       NOT NULL,
                                  merchant_id             BIGINT       NOT NULL,
                                  merchant_name_snapshot  VARCHAR(150) NULL,
                                  card_status             VARCHAR(20)  NOT NULL DEFAULT 'APPROVED' COMMENT 'APPROVED, CANCEL, DECLINED',
                                  bill_statements_yn      CHAR(1)      NULL DEFAULT 'N'     COMMENT 'Y, N',
                                  bill_statements_status  VARCHAR(20)  NULL                 COMMENT 'UNPAID, PAID_IN_FULL, PARTIALLY_PAID',
                                  category_source         VARCHAR(20)  NULL                 COMMENT 'DEFAULT, MERCHANT',
                                  transaction_ymd         CHAR(8)      NOT NULL,
                                  transaction_hms         CHAR(6)      NOT NULL,
                                  amount                  BIGINT       NOT NULL,
                                  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                  CONSTRAINT PK_CARD_TRANSACTION PRIMARY KEY (transaction_unique_no),
                                  KEY idx_ct_user_ymd (user_id, transaction_ymd),
                                  KEY idx_ct_user_cat_ymd (user_id, category_id, transaction_ymd),
                                  KEY idx_ct_merchant (merchant_id),
                                  KEY idx_ct_extcat (ext_category_id),
                                  KEY idx_ct_bill (bill_statements_yn, bill_statements_status),
                                  CONSTRAINT FK_ct_user FOREIGN KEY (user_id)
                                      REFERENCES `user`(user_id)
                                      ON UPDATE CASCADE ON DELETE CASCADE,
                                  CONSTRAINT FK_ct_user_card FOREIGN KEY (user_card_id)
                                      REFERENCES user_card(user_card_id)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,
                                  CONSTRAINT FK_ct_extcat FOREIGN KEY (ext_category_id)
                                      REFERENCES external_category(ext_category_id)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,
                                  CONSTRAINT FK_ct_category FOREIGN KEY (category_id)
                                      REFERENCES category(category_id)
                                      ON UPDATE CASCADE ON DELETE RESTRICT,
                                  CONSTRAINT FK_ct_merchant FOREIGN KEY (merchant_id)
                                      REFERENCES merchant(merchant_id)
                                      ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE billing_statement (
                                   billing_statement_id BIGINT    NOT NULL AUTO_INCREMENT,
                                   user_id              BIGINT    NOT NULL,
                                   user_card_id         BIGINT    NOT NULL,
                                   billing_month        CHAR(6)   NOT NULL,
                                   estimated_balance    BIGINT    NOT NULL DEFAULT 0,
                                   status               VARCHAR(20) NULL DEFAULT 'UNPAID' COMMENT 'UNPAID, PAID_IN_FULL, PARTIALLY_PAID',
                                   due_date             DATE      NULL,
                                   paid_amount          BIGINT    NOT NULL DEFAULT 0,
                                   paid_at              DATETIME  NULL DEFAULT CURRENT_TIMESTAMP,
                                   created_at           DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at           DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                   CONSTRAINT pk_billing_statement PRIMARY KEY (billing_statement_id),
                                   UNIQUE KEY uq_bss_card_month (user_card_id, billing_month),
                                   INDEX idx_bss_user_month (user_id, billing_month),
                                   KEY idx_bss_due (due_date),

                                   CONSTRAINT fk_billing_statement_user FOREIGN KEY (user_id)
                                       REFERENCES `user`(user_id)
                                       ON UPDATE CASCADE ON DELETE CASCADE,
                                   CONSTRAINT fk_billing_statement_card FOREIGN KEY (user_card_id)
                                       REFERENCES user_card(user_card_id)
                                       ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE billing_statement_cycle (
                                         billing_statement_cycle_id BIGINT   NOT NULL AUTO_INCREMENT,
                                         user_id        BIGINT   NOT NULL,
                                         user_card_id   BIGINT   NOT NULL,
                                         billing_month  CHAR(6)  NOT NULL,
                                         billing_week   TINYINT  NULL,
                                         billing_date   DATE     NULL,
                                         total_balance  BIGINT   NOT NULL DEFAULT 0,
                                         status         VARCHAR(20) NOT NULL COMMENT 'UNPAID, PAID_IN_FULL, PARTIALLY_PAID',
                                         payment_date   DATE     NULL,
                                         payment_time   TIME     NULL,
                                         created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         CONSTRAINT PK_BILLING_STATEMENT_CYCLE PRIMARY KEY (billing_statement_cycle_id),
                                         KEY idx_bsc_user_month (user_id, billing_month),
                                         KEY idx_bsc_pay (payment_date),
                                         CONSTRAINT FK_bsc_user FOREIGN KEY (user_id)
                                             REFERENCES `user`(user_id)
                                             ON UPDATE CASCADE ON DELETE CASCADE,
                                         CONSTRAINT FK_bsc_card FOREIGN KEY (user_card_id)
                                             REFERENCES user_card(user_card_id)
                                             ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   8) 알림/설정
========================================================= */
CREATE TABLE device_push_token (
                                   device_push_token_id BIGINT       NOT NULL AUTO_INCREMENT,
                                   user_id              BIGINT       NOT NULL,
                                   platform             VARCHAR(10)  NOT NULL COMMENT 'APNS, FCM, WEB',
                                   token                VARCHAR(300) NOT NULL,
                                   is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
                                   created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                   CONSTRAINT PK_DEVICE_PUSH_TOKEN PRIMARY KEY (device_push_token_id),
                                   UNIQUE KEY uq_user_token (user_id, token),
                                   CONSTRAINT FK_dpt_user FOREIGN KEY (user_id)
                                       REFERENCES `user`(user_id)
                                       ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_notification_setting (
                                           user_notification_setting_id BIGINT  NOT NULL AUTO_INCREMENT,
                                           user_id            BIGINT   NOT NULL,
                                           all_notifications_on  BOOLEAN NOT NULL DEFAULT TRUE,
                                           budget_threshold_on   BOOLEAN NOT NULL DEFAULT TRUE,
                                           anomaly_detection_on  BOOLEAN NOT NULL DEFAULT TRUE,
                                           location_based_on     BOOLEAN NOT NULL DEFAULT TRUE,
                                           monthly_report_on     BOOLEAN NOT NULL DEFAULT TRUE,
                                           shake_trigger_on      BOOLEAN NOT NULL DEFAULT TRUE,
                                           created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                           updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                           CONSTRAINT PK_USER_NOTIFICATION_SETTING PRIMARY KEY (user_notification_setting_id),
                                           UNIQUE KEY uq_uns_user (user_id),
                                           CONSTRAINT FK_uns_user FOREIGN KEY (user_id)
                                               REFERENCES `user`(user_id)
                                               ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notification_log (
                                  notification_log_id BIGINT        NOT NULL AUTO_INCREMENT,
                                  user_id             BIGINT        NOT NULL,
                                  type                VARCHAR(50)   NOT NULL,
                                  title               VARCHAR(150)  NOT NULL,
                                  body                VARCHAR(1000) NOT NULL,
                                  payload_json        JSON          NULL,
                                  sent_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  read_at             DATETIME      NULL,
                                  CONSTRAINT PK_NOTIFICATION_LOG PRIMARY KEY (notification_log_id),
                                  CONSTRAINT FK_notif_user FOREIGN KEY (user_id)
                                      REFERENCES `user`(user_id)
                                      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

/* =========================================================
   9) 기프티콘
========================================================= */
CREATE TABLE gifticon (
                          gifticon_id BIGINT       NOT NULL AUTO_INCREMENT,
                          user_id     BIGINT       NOT NULL,
                          merchant_id BIGINT       NULL,
                          label       VARCHAR(150) NOT NULL,
                          image_url   VARCHAR(500) NULL,
                          expires_at  DATE         NULL,
                          status      VARCHAR(16)  NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, USED, EXPIRED',
                          created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT PK_GIFTICON PRIMARY KEY (gifticon_id),
                          KEY idx_gi_user_status_exp (user_id, status, expires_at),
                          CONSTRAINT FK_gi_user FOREIGN KEY (user_id)
                              REFERENCES `user`(user_id)
                              ON UPDATE CASCADE ON DELETE CASCADE,
                          CONSTRAINT FK_gi_merchant FOREIGN KEY (merchant_id)
                              REFERENCES merchant(merchant_id)
                              ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

/* =========================================================
   10) 세일/프로모션
========================================================= */
CREATE TABLE sale_event (
                            sale_event_id BIGINT       NOT NULL AUTO_INCREMENT,
                            merchant_id   BIGINT       NULL,
                            category_id   BIGINT       NOT NULL,
                            title         VARCHAR(150) NOT NULL,
                            starts_at     DATETIME     NOT NULL,
                            ends_at       DATETIME     NOT NULL,
                            description   VARCHAR(1000) NULL,
                            created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            CONSTRAINT PK_SALE_EVENT PRIMARY KEY (sale_event_id),
                            KEY idx_sale_period (starts_at, ends_at),
                            CONSTRAINT FK_sale_merchant FOREIGN KEY (merchant_id)
                                REFERENCES merchant(merchant_id)
                                ON UPDATE CASCADE ON DELETE SET NULL,
                            CONSTRAINT FK_sale_category FOREIGN KEY (category_id)
                                REFERENCES category(category_id)
                                ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;
