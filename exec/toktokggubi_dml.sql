-- =========================================
-- 1) 기초 데이터
-- =========================================
INSERT INTO `category` (`name`, `description`, `sort_order`) VALUES
                                                                 ('식비',       NULL, 1),
                                                                 ('카페/간식',   NULL, 2),
                                                                 ('술/유흥',     NULL, 3),
                                                                 ('생활',       NULL, 4),
                                                                 ('쇼핑',       NULL, 5),
                                                                 ('뷰티/미용',   NULL, 6),
                                                                 ('교통',       NULL, 7),
                                                                 ('자동차',      NULL, 8),
                                                                 ('의료/건강',   NULL, 9),
                                                                 ('문화',       NULL, 10),
                                                                 ('기타',       NULL, 11);

INSERT INTO franchise (franchise_name, image_url) SELECT '스타벅스', '/images/franchise/starbucks.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='스타벅스');
INSERT INTO franchise (franchise_name, image_url) SELECT '메가박스', '/images/franchise/megabox.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='메가박스');
INSERT INTO franchise (franchise_name, image_url) SELECT '파리바게뜨', '/images/franchise/paris_baguette.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='파리바게뜨');
INSERT INTO franchise (franchise_name, image_url) SELECT '이디야커피', '/images/franchise/ediya.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='이디야커피');
INSERT INTO franchise (franchise_name, image_url) SELECT 'CGV', '/images/franchise/cgv.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='CGV');
INSERT INTO franchise (franchise_name, image_url) SELECT '롯데시네마', '/images/franchise/lotte_cinema.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='롯데시네마');
INSERT INTO franchise (franchise_name, image_url) SELECT '맥도날드', '/images/franchise/mcdonalds.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='맥도날드');
INSERT INTO franchise (franchise_name, image_url) SELECT '롯데리아', '/images/franchise/lotteria.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='롯데리아');
INSERT INTO franchise (franchise_name, image_url) SELECT '교촌치킨', '/images/franchise/kyochon.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='교촌치킨');
INSERT INTO franchise (franchise_name, image_url) SELECT '올리브영', '/images/franchise/oliveyoung.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='올리브영');
INSERT INTO franchise (franchise_name, image_url) SELECT '버거킹', '/images/franchise/burgerking.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='버거킹');
INSERT INTO franchise (franchise_name, image_url) SELECT '세븐일레븐', '/images/franchise/7eleven.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='세븐일레븐');
INSERT INTO franchise (franchise_name, image_url) SELECT 'GS25', '/images/franchise/gs25.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='GS25');
INSERT INTO franchise (franchise_name, image_url) SELECT 'CU', '/images/franchise/cu.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='CU');
INSERT INTO franchise (franchise_name, image_url) SELECT '이마트24', '/images/franchise/emart24.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='이마트24');
INSERT INTO franchise (franchise_name, image_url) SELECT '투썸플레이스', '/images/franchise/twosome.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='투썸플레이스');
INSERT INTO franchise (franchise_name, image_url) SELECT '컴포즈커피', '/images/franchise/compose.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='컴포즈커피');
INSERT INTO franchise (franchise_name, image_url) SELECT '맘스터치', '/images/franchise/momstouch.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='맘스터치');
INSERT INTO franchise (franchise_name, image_url) SELECT '굽네치킨', '/images/franchise/goobne.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='굽네치킨');
INSERT INTO franchise (franchise_name, image_url) SELECT '다이소', '/images/franchise/daiso.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='다이소');
INSERT INTO franchise (franchise_name, image_url) SELECT '파스쿠찌', '/images/franchise/pascucci.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='파스쿠찌');
INSERT INTO franchise (franchise_name, image_url) SELECT '엔제리너스', '/images/franchise/angelinus.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='엔제리너스');
INSERT INTO franchise (franchise_name, image_url) SELECT 'KFC', '/images/franchise/kfc.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='KFC');
INSERT INTO franchise (franchise_name, image_url) SELECT '메가MGC커피', '/images/franchise/mega.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='메가MGC커피');
INSERT INTO franchise (franchise_name, image_url) SELECT '한솥도시락', '/images/franchise/hansot.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='한솥도시락');
INSERT INTO franchise (franchise_name, image_url) SELECT 'BHC', '/images/franchise/bhc.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='BHC');
INSERT INTO franchise (franchise_name, image_url) SELECT '배스킨라빈스', '/images/franchise/baskin.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='배스킨라빈스');
INSERT INTO franchise (franchise_name, image_url) SELECT '쿠팡', '/images/franchise/coupang.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='쿠팡');
INSERT INTO franchise (franchise_name, image_url) SELECT '우아한형제들', '/images/franchise/baemin.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='우아한형제들');
INSERT INTO franchise (franchise_name, image_url) SELECT '할리스', '/images/franchise/hollys.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='할리스');
INSERT INTO franchise (franchise_name, image_url) SELECT '공차', '/images/franchise/gongcha.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='공차');
INSERT INTO franchise (franchise_name, image_url) SELECT '탐앤탐스', '/images/franchise/tomntoms.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='탐앤탐스');
INSERT INTO franchise (franchise_name, image_url) SELECT '성심당', '/images/franchise/sungsimdang.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='성심당');
INSERT INTO franchise (franchise_name, image_url) SELECT '아웃백', '/images/franchise/outback.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='아웃백');
INSERT INTO franchise (franchise_name, image_url) SELECT '본죽', '/images/franchise/bonjuk.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='본죽');
INSERT INTO franchise (franchise_name, image_url) SELECT '이케아', '/images/franchise/ikea.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='이케아');
INSERT INTO franchise (franchise_name, image_url) SELECT 'NC백화점', '/images/franchise/nc.png' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='NC백화점');
INSERT INTO franchise (franchise_name, image_url) SELECT '티머니', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='티머니');
INSERT INTO franchise (franchise_name, image_url) SELECT '마이비', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='마이비');
INSERT INTO franchise (franchise_name, image_url) SELECT '이비', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='이비');
INSERT INTO franchise (franchise_name, image_url) SELECT '한국철도공사', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='한국철도공사');
INSERT INTO franchise (franchise_name, image_url) SELECT '코레일유통', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='코레일유통');
INSERT INTO franchise (franchise_name, image_url) SELECT 'SRT', NULL FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM franchise WHERE franchise_name='SRT');

INSERT INTO `merchant` (`merchant_id`,`franchise_id`,`category_id`,`merchant_name`) VALUES
                                                                                        (14844, (SELECT franchise_id FROM franchise WHERE merchant_name='스타벅스'),
                                                                                         (SELECT category_id FROM category WHERE name='카페/간식'), '스타벅스 대전중앙로R점'),
                                                                                        (14845, (SELECT franchise_id FROM franchise WHERE merchant_name='스타벅스'),
                                                                                         (SELECT category_id FROM category WHERE name='카페/간식'), '스타벅스 대전노은점'),
                                                                                        (14846, (SELECT franchise_id FROM franchise WHERE merchant_name='스타벅스'),
                                                                                         (SELECT category_id FROM category WHERE name='카페/간식'), '스타벅스 대전시청역점');

INSERT INTO `merchant` (`merchant_id`,`franchise_id`,`category_id`,`merchant_name`) VALUES
                                                                                        (14847, (SELECT franchise_id FROM franchise WHERE merchant_name='메가박스'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '메가박스 대전'),
                                                                                        (14848, (SELECT franchise_id FROM franchise WHERE merchant_name='메가박스'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '메가박스 대전중앙로'),
                                                                                        (14849, (SELECT franchise_id FROM franchise WHERE merchant_name='메가박스'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '메가박스 대전신세계 아트&사이언스');

INSERT INTO `merchant` (`merchant_id`,`franchise_id`,`category_id`,`merchant_name`) VALUES
                                                                                        (14850, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 대전'),
                                                                                        (14851, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 대전가수원'),
                                                                                        (14852, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 대전가오'),
                                                                                        (14853, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 대전탄방'),
                                                                                        (14854, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 대전터미널'),
                                                                                        (14855, (SELECT franchise_id FROM franchise WHERE merchant_name='CGV'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), 'CGV 유성노은');

INSERT INTO `merchant` (`merchant_id`,`franchise_id`,`category_id`,`merchant_name`) VALUES
                                                                                        (14856, (SELECT franchise_id FROM franchise WHERE merchant_name='롯데시네마'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '롯데시네마 대전'),
                                                                                        (14857, (SELECT franchise_id FROM franchise WHERE merchant_name='롯데시네마'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '롯데시네마 대전둔산'),
                                                                                        (14858, (SELECT franchise_id FROM franchise WHERE merchant_name='롯데시네마'),
                                                                                         (SELECT category_id FROM category WHERE name='문화'), '롯데시네마 대전센트럴');

INSERT INTO `merchant` (`merchant_id`,`franchise_id`,`category_id`,`merchant_name`) VALUES
                                                                                        (14859, (SELECT franchise_id FROM franchise WHERE merchant_name='올리브영'),
                                                                                         (SELECT category_id FROM category WHERE name='뷰티/미용'), '올리브영 대전상대점'),
                                                                                        (14860, (SELECT franchise_id FROM franchise WHERE merchant_name='올리브영'),
                                                                                         (SELECT category_id FROM category WHERE name='뷰티/미용'), '올리브영 대전터미널점'),
                                                                                        (14861, (SELECT franchise_id FROM franchise WHERE merchant_name='올리브영'),
                                                                                         (SELECT category_id FROM category WHERE name='뷰티/미용'), '올리브영 대전송촌점'),
                                                                                        (14862, (SELECT franchise_id FROM franchise WHERE merchant_name='올리브영'),
                                                                                         (SELECT category_id FROM category WHERE name='뷰티/미용'), '올리브영 대전역점'),
                                                                                        (14863, (SELECT franchise_id FROM franchise WHERE merchant_name='올리브영'),
                                                                                         (SELECT category_id FROM category WHERE name='뷰티/미용'), '올리브영 대전중앙(은행동)');

INSERT INTO sale_event (franchise_id, title, starts_at, ends_at, description)
SELECT
    f.franchise_id,
    se.title,
    se.starts_at,
    se.ends_at,
    se.description
FROM (
         SELECT '스타벅스'     AS franchise_name, '봄맞이 벚꽃 시즌 메뉴 10% 할인'   AS title, '2025-03-10 00:00:00' AS starts_at, '2025-03-24 23:59:59' AS ends_at, '지정 시즌 음료 및 푸드 10% 할인' AS description
         UNION ALL SELECT '메가박스',     '스프링 무비 위크 1+1(요일 한정)',   '2025-03-15 00:00:00', '2025-03-31 23:59:59', '월/화 한정 동반 1인 무료(지정작)'
         UNION ALL SELECT 'CGV',          '봄 영화 페스티벌 패키지 특가',      '2025-04-05 00:00:00', '2025-04-14 23:59:59', 'CGV 콤보+예매 패키지 묶음 할인'
         UNION ALL SELECT '파리바게뜨',   '봄맞이 케이크/샌드위치 15% 세일',   '2025-04-10 00:00:00', '2025-04-20 23:59:59', '지정 케이크/샌드위치 15%'
         UNION ALL SELECT '맥도날드',     '패밀리 위크 세트 2천원 할인',       '2025-05-01 00:00:00', '2025-05-12 23:59:59', '빅맥/맥스파이시 세트 포함'
         UNION ALL SELECT '올리브영',     '초여름 빅세일 최대 30% OFF',        '2025-05-20 00:00:00', '2025-05-31 23:59:59', '뷰티/헬스 인기템 기획전'
         UNION ALL SELECT '버거킹',       '초여름 버거 페스티벌 1+1 쿠폰',     '2025-06-01 00:00:00', '2025-06-14 23:59:59', '앱 전용 한정 쿠폰 제공'
         UNION ALL SELECT 'GS25',         '편의점 원플원 모음전',               '2025-06-05 00:00:00', '2025-06-18 23:59:59', '냉음료/스낵 1+1/2+1'
         UNION ALL SELECT 'CU',           '여름맞이 도시락/음료 프로모션',      '2025-06-10 00:00:00', '2025-06-23 23:59:59', '도시락/컵커피 균일가'
         UNION ALL SELECT '이디야커피',   '쿨서머 아이스드링크 20% 세일',       '2025-06-15 00:00:00', '2025-06-28 23:59:59', '아이스 커피류 20%'
         UNION ALL SELECT '이마트24',     '바캉스 간편식/아이스크림 특가',      '2025-07-01 00:00:00', '2025-07-14 23:59:59', '냉동 간편식/아이스크림 기획'
         UNION ALL SELECT '파리바게뜨',   '썸머 스페셜 디저트 15% 할인',        '2025-07-05 00:00:00', '2025-07-19 23:59:59', '케이크 조각/라떼류 포함'
         UNION ALL SELECT '맘스터치',     '치킨/버거 콤보 여름 특가',           '2025-07-15 00:00:00', '2025-07-29 23:59:59', '세트 업사이즈 무료'
         UNION ALL SELECT '다이소',       '여름 대방출 생활용품 균일가전',      '2025-08-05 00:00:00', '2025-08-20 23:59:59', '수납/문구/여행용품 기획'
         UNION ALL SELECT 'KFC',          '핫서머 치킨버켓 20% 할인',           '2025-08-10 00:00:00', '2025-08-24 23:59:59', '앱/키오스크 한정'
         UNION ALL SELECT '배스킨라빈스', '가을시즌 아이스크림 패밀리팩 특가',  '2025-09-10 00:00:00', '2025-09-24 23:59:59', '가을 신메뉴 출시 기념'
         UNION ALL SELECT '쿠팡',         '가을 특가전(리빙/가전/식품) 주간',   '2025-09-15 00:00:00', '2025-09-30 23:59:59', '쿠폰 중복할인 적용'
         UNION ALL SELECT '우아한형제들', '배달의민족 가을쿠폰 페스티벌',       '2025-10-05 00:00:00', '2025-10-19 23:59:59', '전지역 즉시할인/중복쿠폰'
         UNION ALL SELECT '아웃백',       '스테이크&파스타 위크 15% OFF',       '2025-10-10 00:00:00', '2025-10-24 23:59:59', '런치/디너 공통 적용'
         UNION ALL SELECT '서브웨이',     '홀리데이 서브 세트 2천원 할인',      '2025-12-12 00:00:00', '2025-12-31 23:59:59', '샌드위치 세트/쿠키 포함'
     ) AS se
         JOIN franchise f
              ON f.franchise_name = se.franchise_name
WHERE NOT EXISTS (
    SELECT 1
    FROM sale_event x
    WHERE x.franchise_id = f.franchise_id
      AND x.title        = se.title
      AND x.starts_at    = se.starts_at
);

INSERT INTO `card_issuer` (`card_issuer_code`, `card_issuer_name`) VALUES
                                                                       ('1001','KB국민카드'),
                                                                       ('1002','삼성카드'),
                                                                       ('1003','롯데카드'),
                                                                       ('1004','우리카드'),
                                                                       ('1005','신한카드'),
                                                                       ('1006','현대카드'),
                                                                       ('1007','BC 바로카드'),
                                                                       ('1008','NH농협카드'),
                                                                       ('1009','하나카드'),
                                                                       ('1010','IBK기업은행')
ON DUPLICATE KEY UPDATE `card_issuer_name` = VALUES(`card_issuer_name`);

-- =========================================
-- 2) 카드 상품 적재/가공
-- =========================================
SET NAMES utf8mb4;
SET @card_image_base := '/images/cards/';

-- 스테이징 테이블 생성
CREATE TABLE IF NOT EXISTS staging_fin_card_api (
                                                    card_unique_no   VARCHAR(40)  NOT NULL,
                                                    card_issuer_code VARCHAR(10)  NOT NULL,
                                                    card_name        VARCHAR(200) NOT NULL,
                                                    PRIMARY KEY (card_unique_no),
                                                    KEY idx_sfin_issuer_code (card_issuer_code),
                                                    KEY idx_sfin_name (card_name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS staging_card_csv (
                                                image_file        VARCHAR(255) NOT NULL,
                                                issuer_name       VARCHAR(100) NOT NULL,
                                                card_name         VARCHAR(200) NOT NULL,
                                                card_description  TEXT NOT NULL,
                                                KEY idx_scsv_issuer (issuer_name),
                                                KEY idx_scsv_name (card_name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

TRUNCATE TABLE staging_fin_card_api;
TRUNCATE TABLE staging_card_csv;

INSERT INTO staging_card_csv (image_file, issuer_name, card_name, card_description) VALUES
                                                                                        ('51card.png','삼성카드','삼성카드 taptap O','라이프스타일 패키지 선택 | 대중교통·택시 10% 결제일할인 | 이동통신요금 10% 결제일할인 | CGV 및 롯데시네마 5,000원 결제일할인 | 해외 1.3% 적립'),
                                                                                        ('13card.png','신한카드','신한카드 Mr.Life','월납요금(공과금) 10% 할인서비스 | 편의점 10% 할인 | 병원/약국업종 10% 할인 | 세탁소 업종 10% 할인 | 온라인 쇼핑 10% 할인 | 택시 10% 할인 | 식음료 10% 할인 | 3대 마트 10% 할인 | 4대 정유사 리터당 60원 할인 | 인테이크몰 20% 할인'),
                                                                                        ('2441card_3.png','KB국민카드','KB국민 My WE:SH 카드','[나한테 진심 서비스] KB Pay 10% 할인 | [나한테 진심 서비스] 음식점, 편의점 10% 할인 | [나한테 진심 서비스] 이동통신요금 10% 할인 | [나한테 진심 서비스] OTT 30% 할인 | [더욱 진심 서비스] 먹는데 진심-배달/커피 5% 할인 | [더욱 진심 서비스] 노는데 진심-택시/커피 5%, 영화관 30% 할인 | [더욱 진심 서비스] 관리에 진심-미용실, 스포츠, 온라인서점, 올리브영 5% 할인 | WE:SH 서비스 | 카드 플레이트 선택 가능'),
                                                                                        ('49card.png','삼성카드','삼성카드 & MILEAGE PLATINUM (스카이패스)','모든 가맹점 이용금액 1,000원당 1마일리지 기본적립 | (특별적립) 국내형: 백화점 이용금액 1,000원당 (스카이패스) 1 마일리지 추가 적립 | (특별적립) 국내형: 주유 이용금액 1,000원당 (스카이패스) 1 마일리지 추가 적립 | (특별적립) 국내형: 커피 이용금액 1,000원당 (스카이패스) 1 마일리지 추가 적립 | (특별적립) 국내형: 편의점 이용금액 1,000원당 (스카이패스) 1 마일리지 추가 적립 | (특별적립) 국내형: 택시 이용금액 1,000원당 (스카이패스) 1 마일리지 추가 적립 | (특별적립) 해외형: 해외 가맹점 및 해외 직접구매 이용건 1,000원당 (스카이패스) 1 마일리지 추가 적립 | 인천공항 라운지 본인 무료 이용 | 인천공항 발렛파킹 무료 이용 | 공항 커피 서비스 | 아멕스 PLATINUM 등급 서비스 | 여행의 설레임을 담은 디자인으로 리뉴얼 된 삼성카드 & MILEAGE PLATINUM'),
                                                                                        ('2844card.png','현대카드','현대카드 ZERO Up','[기본 혜택] 실적·한도 제한 없이 국내외 가맹점 0.8% 청구 할인 | [추가 혜택] 온라인몰, 대형마트, 교육, 주유, 이동통신 요금 10만원 이상 결제 시 1.6% 청구 할인 | X 긴급할인(선지급 포인트 서비스) | 메탈 플레이트 제공'),
                                                                                        ('657card.png','삼성카드','taptap DIGITAL','온라인 간편결제 5% 결제일할인 | 스트리밍 50% 결제일할인 | 편의점·헬스&뷰티·생활잡화 10% 결제일할인 | 해외 1.5% 결제일할인'),
                                                                                        ('2330card.png','롯데카드','LOCA 365 카드','[생활업종]아파트관리비 10% 할인 | [생활업종]공과금(도시가스비, 전기료) 10% 할인 | [생활업종]대중교통 10% 할인 | [생활업종]SKT, KT, LG U+ 10% 할인 | [생활업종]배달의 민족, 요기요, 쿠팡이츠 10% 할인 | [생활업종]생명보험, 손해보험 10% 할인 | [생활업종]학습지 10% 할인 | [생활업종]넷플릭스, 유튜브, 왓챠, 멜론, 지니뮤직, 디즈니 플러스 1,500원 할인 | 국내 가맹점 2~3개월 무이자 할부'),
                                                                                        ('2376card.png','삼성카드','삼성 iD SIMPLE 카드','국내외 가맹점 0.7% 할인 | 국내외 가맹점 1% 할인 | 온라인쇼핑몰 멤버십 50% 할인전월 이용금액 30만원 이상 시 제공 | 영화 3,000원 할인전월 이용금액 30만원 이상 시 제공 | 내 마음대로 고르는 디자인!'),
                                                                                        ('2835card.png','신한카드','신한카드 Discount Plan+','Time Plan 서비스 | [Daily Plan 서비스] 쇼핑 10% 결제일 할인 | [Daily Plan 서비스] 이동 5% 결제일 할인 | [Daily Plan 서비스] 생활 5% 결제일 할인 | [Plan Day 서비스] 매월 1일 Time Plan, Daily Plan 서비스 2배 할인 | [Monthly Plan 서비스] 정기결제(공과금/디지털구독·멤버십/피트니스) 최대 20% 할인 | [Monthly Plan 서비스] 영화 예매 5천원 결제일 할인 | [Annual Plan 서비스] 장보기 3만원 캐시백 (연 1회) | [Annual Plan 서비스] 스피트메이트 정비 현장 할인·테마파크 할인'),
                                                                                        ('2719card.jpg','우리카드','카드의정석 EVERY DISCOUNT','[기본 할인] 국내외 가맹점 0.8% 청구할인 | [추가 할인] 국내 온라인 간편결제 2% 추가 청구할인 (전월실적: 40만원 이상)'),
                                                                                        ('115card.png','KB국민카드','굿데이올림카드','주유소, 충전소 업종 리터당 60원 청구할인 | 대형마트 10% 청구할인 | 전화요금, 인터넷이용료, 케이블TV 업종 10% 청구할인 | 버스, 지하철, 택시 업종 10% 청구할인 | 해외이용(해외직구) 5% 할인 캐시백 | 음식점, 커피전문점, 편의점, 약국 업종 10% 추가 청구할인 | 학원/피트니스 업종 10% 추가 청구할인'),
                                                                                        ('2885card_1.png','삼성카드','삼성 iD SELECT ALL 카드','[SELECT 1] 선택 옵션에 따른 할인 혜택 제공 (택 1) | [SELECT 1] 국내 가맹점 0.7% 할인 | [SELECT 1] 아파트 관리비/통신 10% 할인 | [SELECT 1] 교육 10% 할인 | [SELECT 2] 선택 옵션에 따른 할인 혜택 제공 (택 1) | [SELECT 2] 온라인쇼핑몰/의료/배달앱 7% 할인 | [SELECT 2] 음식점/편의점/할인점/주유 7% 할인 | [기본] 생활 편의 영역 5% 할인 | [기본] 디지털콘텐츠 멤버십 50% 할인 | [기본] 해외 2% 할인'),
                                                                                        ('2759card.png','신한카드','신한카드 처음(ANNIVERSE)','[오늘도 5% 적립 서비스] 음식점·카페·편의점·온라인쇼핑 5% 마이신한포인트 적립 | [일상 속 5% 적립 서비스] 생활·여행·패션 5% 마이신한포인트적립 | [정기결제 최대 20% 적립 서비스] 통신 10% , OTT 15%, 멤버십 20% 마이신한포인트 적립 | [소비관리 보너스] ①계획소비 적립 | [소비관리 보너스] ②즉시결제 적립'),
                                                                                        ('2669card_5.png','현대카드','현대카드 M','[기본 혜택] 국내외 가맹점 1.5% M포인트 적립전월 이용 금액 50만원 이상 이용 시 | [추가 혜택] 온라인 쇼핑몰・외식・해외 가맹점 5% M포인트 적립(월 1만 M포인트 한도)전월 이용 금액 100만원 이상 이용 시 | M 긴급적립(선지급 포인트 서비스)'),
                                                                                        ('2609card.png','KB국민카드','쿠팡 와우카드','쿠팡, 쿠팡이츠, 쿠팡플레이 최대 4만원 적립(전월실적 조건 없음)쿠팡 외 최대 1.2만원 적립(전월실적 조건 없음) | (상품 기본 혜택) 쿠팡, 쿠팡이츠, 쿠팡플레이 2% 쿠팡캐시 적립 | (상품 기본 혜택) 쿠팡 외 가맹점 0.2% 쿠팡캐시 적립'),
                                                                                        ('2553card.png','우리카드','카드의정석 EVERY MILE SKYPASS','SKYPASS 최대 2마일리지 적립 | 해외수수료 면제 | 국내 공항라운지 동반 1인 동시 이용 가능 (전월실적 50만원 이상 시 제공)'),
                                                                                        ('2663card.png','현대카드','American Express® Gold Card Edition2','국내 트래블·패션/뷰티 영역에서 사용 가능한 25만원 상당 바우처 제공(연 1회) | 대상점에 따라 이용 금액 1,000원당 최대 3 멤버십 리워즈(MR) 적립 | 전 세계 공항 라운지 이용, 공항 리무진・공항철도서비스 | 공항 및 국내 특급 호텔 무료 발레파킹 서비스 | Be My Guest 호텔 델리/레스토랑, 패밀리 레스토랑 할인 | The Hotel Collection 객실 업그레이드 및 호텔 크레딧 100달러(USD) 제공'),
                                                                                        ('666card.png','NH농협카드','올바른 FLEX 카드','스타벅스(사이렌오더 포함) 50% 청구할인 | 유튜브프리미엄, 넷플릭스, 멜론 정기결제 20% 청구할인배달의민족, 요기요 10% 청구할인 | CGV, 롯데시네마 30% 청구할인 | 지하철, 버스 7% 청구할인SKT, KT, LGU+ 7% 청구할인 | 쿠팡, G마켓, 11번가, 티몬, 농협몰 5% 청구할인CU, GS25 5% 청구할인 | 올원페이(NH앱카드)로 결제 시 건당 1천원 청구할인 | 국제공항 라운지 무료이용 연 1회 제공'),
                                                                                        ('2676card_2.png','삼성카드','삼성 iD GLOBAL 카드','해외 수수료 할인 | 해외 2% 할인 | 삼성페이로 결제 시 해외 오프라인 가맹점 5% 할인 | 공항 라운지 서비스 (The Lounge) | 인앱 결제/디지털콘텐츠/멤버십 50% 할인 | 일상 필수 영역 1% 할인 | 국내 가맹점 0.5% 할인'),
                                                                                        ('39card.png','신한카드','신한카드 Deep Oil','4개의 정유사 중 직접 고른 1개 정유사 주유 이용금액 10% 결제일 할인 | 정비소(스피드메이트), 주차장 이용금액 10% 결제일 할인 | GS25, CU 5% 결제일 할인 | 스타벅스, 이디야 5% 결제일 할인 | 택시 5% 결제일 할인 | 롯데시네마 일반관 5천원 현장 할인'),
                                                                                        ('2261card.png','롯데카드','LOCA LIKIT 1.2','어디서나 1.2% 결제일 할인국내 모든 가맹점 1.2%, 해외 모든 이용금액 1.2% | 온라인 1.5% 결제일 할인'),
                                                                                        ('2886card_1.png','삼성카드','삼성 iD SELECT ON 카드','[SELECT] 선택 옵션에 따른 할인 혜택 제공 (택 1)음식점, 온라인몰(패션/쇼핑), 온라인 간편결제 | [SELECT] 금/토/일엔 외식 2배 할인 | [SELECT] 금/토/일엔 쇼핑 2배 할인 | [SELECT] 온라인 간편결제 1% 할인 | 생활 편의 영역 5% 할인 | 인앱 결제/디지털콘텐츠 50 % 할인 | 해외 2% 할인'),
                                                                                        ('769card.png','KB국민카드','가온올림카드(실속형)','[기본적립] 국내 가맹점 0.7% 기본적립 | [추가 적립] 주말/공휴일 국내 가맹점 0.5% 추가적립 | [추가 적립] 음식점, 커피 전문점 업종 0.5% 추가적립 | [추가 적립] 버스/지하철, 택시 0.5% 추가적립 | [추가 적립] 이동통신요금 0.5% 추가적립 | 해외이용금액 1.7% 할인 캐시백 | CGV/메가박스 온라인 영화 예매 청구할인 | 롯데월드/에버랜드/캐리비안베이 현장할인'),
                                                                                        ('466card.png','신한카드','신한카드 Air One','대한항공 마일리지 적립 | AMEX PLATINUM 서비스 제공'),
                                                                                        ('736card.png','삼성카드','American Express® Reserve','국내외 가맹점 기본 1% 멤버십리워즈 적립온라인쇼핑·해외 추가 4% 멤버십리워즈 적립 | 라이프스타일 30% 결제일할인 [전월 실적 100만원 이상] | 특수 소재 플레이트(Special Plate) 제공'),
                                                                                        ('2657card.png','하나카드','JADE Classic','[PREMIUM VOUCHER] 바우처 5가지 중 1가지를 선택하여 이용 (연 1회) | 전세계 공항 라운지 무료이용(본인/가족/동반자 통합 연 3회, 일 3회) | [기본 적립] 국내외 가맹점 1% 하나머니 적립 | [특별 적립] 영역별 1.5~1.2% 하나머니 적립 제공 | 디지털 컨텐츠 자동이체 시, 50% 하나머니 적립 제공 | 커피 이용금액 50% 하나머니 적립 제공 | 택시 이용금액 50% 하나머니 적립 제공'),
                                                                                        ('2823card.png','롯데카드','롯데멤버스 카드','[기본적립] 국내외 가맹점 0.5% 롯데멤버스 카드 L.POINT 적립 | [특별적립] 롯데멤버스 브랜드 최대 5% ''롯데멤버스 카드 L.POINT'' 적립 | [미리적립] 최대 20만 ''롯데멤버스 카드 L.POINT'' 미리적립 (선지급 포인트 서비스)'),
                                                                                        ('2807card.png','신한카드','신한카드 The BEST-X','[기본 리워드] 이용금액 1% 적립(마이신한포인트형) / 1,500원 당 1마일 적립(스카이패스형) | Gift Option 서비스 (연 1회/ 택 1) | Bonus Gift 서비스 | [Life Experience 서비스] 커피전문점 2천원 할인/택시 이용금액 7% 할인 | THE LOUNGE 서비스'),
                                                                                        ('2848card_2.png','우리카드','카드의정석2','국내외 가맹점 1.2% 청구할인 | 분기별 이용 실적에 따라 최대 15,000원 청구할인'),
                                                                                        ('2707card.png','롯데카드','디지로카 Las Vegas','국내외 가맹점 최대 2% 할인 | 국내 가맹점 2~3개월 무이자 할부'),
                                                                                        ('2687card.png','우리카드','카드의정석 SHOPPING+','[쇼핑 할인의 정석] 온라인 쇼핑 10% 청구할인 | [쇼핑 할인의 정석] 오프라인 쇼핑 10% 청구할인 | [추가 할인의 정석] 온라인 업종 4대 PAY 결제 시 5% 추가할인 | [생활밀착 할인의 정석] 4대 주유소 주말 주유시 리터당 60원 청구할인 | [생활밀착 할인의 정석] 스타벅스, 폴바셋 10% 청구할인'),
                                                                                        ('2632card.png','롯데카드','디지로카 London','어디서나 0.7% 캐시백 | 즉시 결제 1% 추가 캐시백 | LOCA 나누기 혜택'),
                                                                                        ('2666card.png','신한카드','신한카드 Point Plan','[일상 생활비 적립 서비스] 국내 건당 결제금액별 0.5~3% 포인트 적립·해외 결제금액 1% 포인트 적립가족행사월(5월,12월) 적립 한도 1만 포인트 추가 제공 | [필수 생활비 적립 서비스] 주말 외식비 포인트 적립 | [필수 생활비 적립 서비스] 정기결제 자동납부 포인트 적립'),
                                                                                        ('54card.png','삼성카드','삼성카드 스페셜마일리지(스카이패스)','[기본 적립] 모든 가맹점 스카이패스 1 마일리지 적립 | [특별 적립] 옵션 적립처에 따라 스카이패스 2 마일리지 적립 | 아웃백스테이크하우스 30,000원 결제일 할인 [전월 실적 50만원 이상] | 아멕스 PLATINUM 등급 서비스 [전월 실적 30만원 이상]'),
                                                                                        ('2237card.png','하나카드','하나 스카이패스 아멕스 플래티늄 카드','스카이패스 마일리지 적립 | 인천공항 라운지 이용 시 무료서비스 제공'),
                                                                                        ('2851.png','우리카드','우리카드 7CORE','7대 생활영역 10% 청구할인'),
                                                                                        ('2646card_3.png','현대카드','현대카드ZERO Edition3(할인형)','실적・한도 제한 없이 국내외 가맹점 이용 금액의 0.8% 청구 할인'),
                                                                                        ('2731card.png','신한카드','신한카드 Point Plan+','일상 생활비 적립 서비스 | 필수 생활비 적립 서비스 | 여가 생활비 적립 서비스'),
                                                                                        ('2699card.png','우리카드','카드의정석 TEN','[TEN Discount] 5대 일상영역 10% 청구할인 | [ONE Discount] 음식점/주점 및 온라인 간편결제 1% 청구할인'),
                                                                                        ('2689card.png','우리카드','카드의정석 EVERY POINT','[기본 적립] 국내외 가맹점 0.8% 적립 | [추가 적립] 국내 온라인 간편결제 2% 추가 적립'),
                                                                                        ('2692card.png','현대카드','현대카드 Summit','적립한도 제한 없는 1.5% M포인트 적립 | [추가 혜택] 학원/유치원 업종 5% M포인트 적립 | [추가 혜택] 학원/유치원 업종 5% M포인트 적립 | [추가혜택] 병원/약국 업종 5% M포인트 적립 | [추가혜택] 국내 항공사/여행사/특급호텔 업종 5% M포인트 적립 | 15만원 상당 선택 제공 기프트 ①~④ 택1 (연1회) | 공항 및 특급호텔 발레파킹 무료 이용 | THE LOUNGE : 공항 라운지 무료 이용 (연5회)'),
                                                                                        ('2460card.png','삼성카드','THE iD. PLATINUM(포인트)','[GIFT] 5가지 기프트 중에서 매년 1가지를 선택 | [REWARD] 국내 가맹점 1%, 생활 편의 영역 1.2%, 특별 가맹점 1.5% 빅포인트 적립 | [DAILY LIFESTYLE] 디지털콘텐츠 50% 할인 | [DAILY LIFESTYLE] 스타벅스 3,000원 할인 | [PREMIUM LIFESTYLE] 공항 라운지 서비스(The Lounge) | [SPECIAL PLATE] 특수 소재 카드 | 국제브랜드 서비스(해외겸용카드 전용)'),
                                                                                        ('2842card.png','현대카드','현대카드 X Cut','[기본 혜택] 전월 이용 금액 50만원 이상 시 국내외 가맹점 1% 청구 할인 | [추가 혜택] 전월 이용 금액 100만원 이상 시 뷰티/생활/패션, 배달앱, 편의점 5% 청구 할인 | X 긴급할인(선지급 포인트 서비스) | 메탈 플레이트 제공'),
                                                                                        ('2662card.png','현대카드','American Express® Green Card Edition2','국내 트래블・패션/뷰티 영역에서 사용 가능한 12만원 상당 바우처 제공(연 1회) | 대상점에 따라 이용 금액 1,000원당 최대 2 멤버십 리워즈(MR) 적립 | 전 세계 공항 라운지 이용, 공항 리무진・공항철도서비스 | 공항 및 국내 특급 호텔 무료 발레파킹 서비스'),
                                                                                        ('2544card.png','NH농협카드','zgm.play카드','[선택 서비스] 온라인-플레이 타입 | [선택 서비스] 오프라인-플레이 타입 | CGV, 롯데시네마, 메가박스 5천원 청구할인 | 스타벅스, 투썸플레이스, 커피빈 30% 청구할인 | 패스트푸드업종 20% 청구할인 | 미용실·올리브영·CU/GS25 5% 청구할인 (H&B 편의점 통합 일 1회) | 쇼핑·서점 5% 청구할인 (통합 일 1회)'),
                                                                                        ('2827card.png','삼성카드','삼성 iD STATION 카드 (GS칼텍스)','GS칼텍스에서 주유 시 10% 결제일할인 | 통신요금 정기결제 시 5% 결제일할인 | 편의점 5% 결제일할인 | 온라인쇼핑몰 5% 결제일할인 | GS&POINT 적립 서비스'),
                                                                                        ('2751card_2.jpg','현대카드','the Red (항공 마일리지형)','[기본 혜택] 국내외 가맹점 1,500원당 1 대한항공 마일리지 적립 | [연간 보너스] 다양한 라이프스타일 영역에서 사용 가능한 바우처 제공(연 1회) | [우대 서비스] 공항 라운지 연간 10회 무료 이용·공항 및 특급호텔 발레파킹 무료 이용 | [우대 서비스] 메탈 플레이트 제공'),
                                                                                        ('2688card.png','우리카드','카드의정석 I&U+','[Simple 할인] 국내 가맹점 1.0~0.7% 청구할인 | [Daily 할인] 주유 리터당 60~100원 청구할인 | [Daily 할인] 대중교통 10% 청구할인 | [Daily 할인] 커피 10% 청구할인'),
                                                                                        ('2655card.png','우리카드','DA카드의정석Ⅱ','기본 Discount - 0.8% 기본 청구할인 | 추가 Discount - 0.5% 추가 청구할인(기본 0.8% + 추가 0.5% = 1.3% 청구할인) | 국내 공항라운지 무료 이용 서비스 안내'),
                                                                                        ('2843card.png','현대카드','현대카드 X Save','[기본 혜택] 전월 이용 금액 50만원 이상 시 국내외 가맹점 1% 청구 할인 | [추가 혜택] 전월 이용 금액 100만원 이상 시 온라인몰, 교육, 병원 5% 청구 할인 | X 긴급할인(선지급 포인트 서비스) | 메탈 플레이트 제공'),
                                                                                        ('2828card.png','삼성카드','삼성 iD STATION 카드 (SK에너지)','SK주유(충전)소에서 주유 시 10% 결제일할인 | 통신요금 정기결제 시 5% 결제일할인 | 편의점 5% 결제일할인 | 온라인쇼핑몰 5% 결제일할인 | 차량 점검 서비스'),
                                                                                        ('37card.png','신한카드','신한카드 The BEST-F','Gift Option Service | 캐시백(캐시백형 선택 시)마일리지 적립(마일리지 적립형 선택 시) | JEJU 할인 | 공항라운지 | 커피 할인 | 베이커리 할인 | 쇼핑 할인 | 생활 할인'),
                                                                                        ('2346card.png','BC 바로카드','BC 바로 클리어 플러스','[매일 할인] 점심 식사 7% 할인 | [매일 할인] 배달앱 7% 할인 | [매일 할인] 대중교통 7% 할인 | [라이프스타일 할인] 편의점 10% 할인 | [라이프스타일 할인] 온라인쇼핑 10% 할인 | [라이프스타일 할인] 뷰티 10% 할인 | [라이프스타일 할인] 통신 10% 할인 | [라이프스타일 할인] 스트리밍 10% 할인 | [2~3개월 상시] 전국 모든 가맹점 무이자할부 | MasterCard Platinum/VISA Platinum 기본 서비스'),
                                                                                        ('2633card.png','롯데카드','디지로카 Paris','어디서나 0.7% 결제일 할인 | 온라인 쇼핑 최대 5% 결제일 할인'),
                                                                                        ('772card.png','IBK기업은행','BLISS.5 카드(마일리지)','국내외 일시불, 유이자할부금액에 대해서 1,500원당 1마일 적립제휴항공사 | 대한항공 | KTX/SRT 승차권 및 철도 여행상품 3%~10% 할인 서비스 | 영화예매 할인 서비스・CGV 콤보 무료 이용 서비스 | 카페아티제 본인 음료 구매 시 동반자 1인에게 무료 음료 제공 | 바로알림(SMS) 서비스 무료 가입 | Voucher Service 종류(택1) | Premium Service'),
                                                                                        ('2735card.png','신한카드','신한카드 Edu Plan+','[학원비] 최대 10% 캐시백 | [생활비] 1% 캐시백 | [문화 취미] 메가박스 영화 온라인 예매 7천원 즉시 할인'),
                                                                                        ('2592card.png','신한카드','싱가포르항공 크리스플라이어 더 베스트 신한카드','[웰컴기프트] 싱가포르항공 크리스플라이어(이하 KF) 1만 5천 마일리지 적립 (발급 첫해 1회) | [연간기프트] 국내외 가맹점 싱가포르항공 크리스플라이어 마일리지 적립 | 국내외 가맹점 싱가포르항공 크리스플라이어 마일리지 적립 | 싱가포르항공 크리스플라이어 엘리트 멤버십 제공 | 싱가포르항공 크리스플라이어 보너스 마일리지 적립 | [부스터마일즈] 이용금액 1,500원당 1크리스플라이어 마일리지 추가 적립 | 싱가포르항공 크리스플라이어 공제 마일리지 할인 쿠폰 제공 | 싱가포르항공 인천/김해공항 특별 우대 | 싱가포르항공 이용금액 결제일 할인 | The Lounge 공항 라운지 무료 제공 (연 2회)'),
                                                                                        ('2855card_1.png','신한카드','Haru(Hoshino Resorts)','해외 이용 적립 서비스 | 일본 이용 추가 적립 서비스 | 국내 이용 적립 서비스 | Hoshino Resort 서비스'),
                                                                                        ('2697card.png','현대카드','현대카드 MX Black Edition2','적립한도 제한없이 국내외 가맹점 1% M포인트 적립 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | [추가혜택] 전월 이용금액 100만원 이상 시 10% 할인 | THE LOUNGE : 공항 라운지 연5회 무료 이용 | 공항 및 특급호텔 발레파킹 무료 이용'),
                                                                                        ('2654card.png','하나카드','원더카드 2.0 LIFE','[자동이체] 영상 스트리밍 40% 할인 | [자동이체] 생활요금 10% 할인 | 딜리버리 10% 할인 | 대중교통 10% 할인 | 커피 10% 할인 | 편의점 10% 할인'),
                                                                                        ('2703_1card.png','하나카드','JADE Prime','[PREMIUM VOUCHER] 바우처 4가지 중 1가지를 선택하여 이용 (연 1회) | [BONUS VOUCHER] 연 누적 이용금액 2,400만원 이상 시 10만 하나머니 적립 제공(연 1회) | [AIRPORT] 전세계 공항 라운지 무료 이용 (본인/가족/동반자 통합 연 6회, 일 3회) | [REWARD] 국내 전 가맹점 1.5%~1.0% 하나머니 적립 제공・영역별 3.0% 하나머니 적립 | [REWARD] 주유(LPG) 리터당 150하나머니・EV충전 30% 하나머니 적립 제공 | [REWARD] 택시 이용금액 50% 하나머니 적립 제공 | [REWARD] 디지털 컨텐츠 자동납부 시, 50% 하나머니 적립 제공'),
                                                                                        ('2846card_1.png','NH농협카드','클래시 트래블카드','국내 가맹점 1.2% NH포인트 적립 (전월실적 무관) | 해외 서비스 및 국제 브랜드 수수료 면제 (전월실적 무관, 한도 없음) | 해외가맹점 3~4% NH포인트 적립 | 전 세계 공항라운지 무료 입장 | [보너스 포인트] 연간 이용금액 1천만원 이상 시 NH포인트 적립'),
                                                                                        ('2235card.png','삼성카드','삼성 iD ON 카드','많이 쓰는 영역 30% 자동 맞춤 할인(커피전문점·배달앱·델리 영역) | 교통·이동통신·스트리밍 10% 할인 | 온라인 간편결제·해외 3%·1% 할인 | 꼭 확인하세요!'),
                                                                                        ('131card.png','KB국민카드','BeV V카드(스카이패스형)','쿠폰서비스 | 대한항공 마일리지 적립 | BeV Ⅴ카드 공통 서비스'),
                                                                                        ('634card.png','KB국민카드','Easy all 티타늄카드','Easy all 선택 서비스(택1) | 1. Auto 모드 (많이 쓴 영역에서 자동 캐시백)2. DIY 모드 (원하는 영역에서 자유롭게 청구할인) | 티타늄 서비스'),
                                                                                        ('2711card_4.png','현대카드','대한항공카드 300','대한항공 마일리지 적립 | 연간 보너스 1만 마일리지 적립(연 1회) | 우대 서비스 | MasterCard World 서비스'),
                                                                                        ('227card.png','하나카드','CLUB SK 카드','SK텔레콤 이동통신 요금 최대 15,000원 청구할인 | SK주유소 리터당 최대 150원 청구할인SK충전소 리터당 최대 70원 청구할인 | 교통, 영화, 외식, 커피 등 최대 10% 청구할인 | 이마트, 홈플러스, 롯데마트 최대 10% 청구할인 | 학원 업종 최대 10% 청구할인 | SK멤버십 서비스 | 브랜드 서비스 | 면세점/여행 관련 서비스,하나은행 결제 계좌 고객 우대 서비스'),
                                                                                        ('2428card.png','NH농협카드','zgm.streaming카드','멤버십 이용요금 7천원 청구 할인 | 스트리밍 이용요금 50% 청구 할인 | 스타벅스 사이렌오더 50% 청구 할인 | 온라인 간편결제 5% 청구 할인'),
                                                                                        ('2674card_2.png','IBK기업은행','I-Mileage (대한항공)','대한항공 마일리지 적립 | 전 세계 공항 라운지 무료 이용 서비스 | 공항 발레파킹 무료 이용 서비스 | 스타벅스 할인 서비스 | 국제 브랜드 서비스'),
                                                                                        ('2427card.png','NH농협카드','zgm.the pay카드','국내/해외 전 가맹점 1.0% 청구 할인 | 온라인 간편결제 최대 1.7% 청구 할인 | 디자인 선택 가능'),
                                                                                        ('2644card.png','BC 바로카드','GOAT BC 바로카드','[페이북 머니 매일 적립] 국내 가맹점 최대 1.5%, 국외 가맹점 최대 3% 적립 | [페이북 머니 연간 적립] 연간 카드사용액 3천만원 이상 시 10% 추가적립 | [국제 브랜드 서비스] Mastercard/VISA Platinum 기본 서비스 제공'),
                                                                                        ('2451card.png','KB국민카드','HERITAGE Smart [대한항공 마일리지형]','[HERITAGE 전용혜택] 쿠폰서비스 (연 1회 제공, 3가지 중 택1) | 국내 가맹점 1천원 당 대한항공 1마일리지 적립해외 가맹점 1천원 당 대한항공 2마일리지 적립 | KB Pay 2천원당 ''대한항공 1마일리지'' 적립 | [HERITAGE 전용혜택] 금융서비스 | [HERITAGE 전용혜택] Mastercard World 서비스 | [HERITAGE Smart 서비스] 전용고객센터'),
                                                                                        ('2234card.png','삼성카드','삼성 iD ALL 카드','많이 쓰는 영역 5% 자동 맞춤 할인(백화점·할인점·슈퍼마켓 영역) | 주유·이동통신·아파트 관리비 2.5% 할인 | 국내외 가맹점 0.5% 할인 | 내 마음대로 고르는 디자인-다양한 스타일로 새롭게 선보이는 삼성 iD 카드를 소개합니다.'),
                                                                                        ('16card.png','신한카드','신한카드 RPM+ Platinum#','모든 주유소 리터당 40~150포인트/충전소 리터당 10~50포인트 적립 | 1~5% 특별적립 | 1~5% 특별적립 | 1~5% 특별적립 | 1~5% 특별적립 | 국내/외 모든 가맹점 0.2~2.0% 적립 | Platinum # 서비스'),
                                                                                        ('121card.png','KB국민카드','다담카드','버스, 지하철 10% 청구할인 | SKT, KT Olleh, LG U+ 10% 청구할인 | SK주유소(충전소) 리터당 60원 청구할인 | CGV/메가박스 온라인 영화예매시 승인건당 3,500원 청구 할인 | 롯데월드, 에버랜드, 캐리비안베이 30~50% 할인 | 해외가맹점 5% 할인캐시백 | KB투어할인 서비스 | 선택 적립 서비스팩 - 생활/교육/쇼핑/직장인/레저팩 중 택 1 | 연간 이용에 따른 다담리워드 서비스,함께하는 기부 서비스'),
                                                                                        ('2753card_2.png','현대카드','the Green Edition3','[기본 혜택] 국내외 가맹점 1.5% M포인트 적립 | [추가 혜택] 여행, 해외 영역 5% M포인트 적립 | [우대 서비스] M 긴급적립(선지급 포인트 서비스) | [우대 서비스] 공항 라운지 연간 5회 무료 이용·공항 및 특급호텔 발레파킹 무료 이용 | [우대 서비스] 메탈 플레이트 제공'),
                                                                                        ('2779card.png','IBK기업은행','IBK포인트(신용)','국내외 가맹점 최대 3.3% 적립'),
                                                                                        ('2824card.png','롯데카드','롯데멤버스 카드 프리미엄','[기본적립] 국내외 가맹점 0.7% ''롯데멤버스 카드 L.POINT'' 적립 | [특별적립] 롯데멤버스 브랜드 최대 5% ''롯데멤버스 카드 L.POINT'' 적립 | [미리적립] 최대 50만 ''롯데멤버스 카드 L.POINT'' 미리적립 (선지급 포인트 서비스) | SPECIAL GIFT - 롯데상품권카드 5만원 | MasterCard Platinum Service'),
                                                                                        ('2765card.png','롯데카드','LOCA X 기후동행카드','국내 가맹점 0.5% 할인 | 기후동행요금 결제일 할인'),
                                                                                        ('2593card.png','NH농협카드','zgm.일본여행중 카드','해외결제 시 해외서비스수수료 면제 | 일본 오프라인 전매장 10% NH포인트 적립 | 익스피디아 이용 시 객실요금 9% 즉시 할인 | 해외 및 국내 생활업종 NH포인트 적립 | 전세계 공항 라운지 무료 이용(The lounge/더 라운지) | JCB PLATINUM PREMIUM SERVICES'),
                                                                                        ('2820card.png','하나카드','원더카드 2.0 FREE+','국내외가맹점 0.8% 청구할인 | 하나페이 결제 1.2% 청구할인 | 쿠팡&슈퍼마켓 2% 청구할인 | 배달의민족, 요기요, 쿠팡이츠 4% 청구할인 | 컬리, SSG.COM, 롯데ON, 더현대닷컴 4% 청구할인 | G마켓, 옥션, 11번가, 인터파크, 위메프, 티몬 4% 청구할인 | 카카오T, UT, 택시업종 4% 청구할인 | 국내 5만원 이상 결제건 2~3개월 무이자 할부'),
                                                                                        ('2482card.png','IBK기업은행','I-ALL','ALL - 국내·외 가맹점 0.5% 할인 | LIVING - 1%~1.5% 할인온라인쇼핑, 홈쇼핑, 배달앱, 대형마트, 커피, 편의점, 교통, 주유/충전, 통신, 반려동물 | MEMBERSHIP - 5%~7% 할인'),
                                                                                        ('635card.png','NH농협카드','올바른 NEW HAVE카드','국내/외 이용가맹점 0.7% NH포인트 적립 | 6개 영역 중 당월(1일~말일) 이용금액 1위/2위 영역은 기본적립의 3배/2배 자동적용 | 국제공항 라운지 무료이용 | 농협 인터넷·모바일·스마트·텔레뱅킹 이체수수료 통합 월 10회'),
                                                                                        ('2710card_1.png','현대카드','대한항공카드 120','대한항공 마일리지 적립 | 연간 보너스 6천 마일리지 적립(연 1회) | 우대 서비스 | MasterCard Platinum 서비스'),
                                                                                        ('2778card.png','IBK기업은행','IBK포인트3.8(신용)','[기본 포인트] 국내외 가맹점 이용금액의 1.5% 적립 | [특별 포인트 I] 해외 가맹점 이용금액의 5% 적립 | [특별 포인트 II] 온라인 쇼핑 가맹점 이용금액의 0.5% 적립'),
                                                                                        ('2786card.png','롯데카드','힐튼 아너스 아멕스 프리미엄','힐튼 아너스 포인트 적립 (1,500원 당 2~8 힐튼 아너스 포인트 적립) | 전세계 힐튼 호텔 주말 무료 숙박권 2매 제공 | 힐튼 아너스 멤버십 골드 등급 제공 및 다이아몬드 등급으로 업그레이드 | 국내/해외 공항라운지 1인 무료 이용(연4회)'),
                                                                                        ('2794card_1.png','현대카드','네이버 현대카드 Edition2','[기본 혜택] 전월 이용 금액 50만원 이상 시 국내외 가맹점 0.7% 네이버페이 포인트 적립 | [추가 혜택] 전월 이용 금액 50만원 이상 시 네이버플러스 멤버십 적립 대상최대 7% 네이버페이 포인트 적립'),
                                                                                        ('455card.png','롯데카드','롯데 국민행복카드','국가바우처 | 쇼핑 5% 결제일 할인 | 키즈 30% 결제일 할인 | 헬스(병원, 약국, 산후조리원 업종) 5% 결제일 할인 | 육아/교육(어린이집, 유치원, 학원, 학습지 등) 10% 결제일 할인 | 교통 10% 결제일 할인 | 통신 2천원 결제일 할인 | 롯데 국민행복카드 특화서비스'),
                                                                                        ('2447card.png','하나카드','원더카드 2.0 LIVING','생활요금 10% 할인 | 병원/약국 10% 할인 | 주유/LPG충전 10% 할인 | 택시 10% 할인 | 커피 10% 할인 | 세탁 10% 할인 | 무이자할부'),
                                                                                        ('2685ard_2.png','KB국민카드','WE:SH Travel','해외 이용 수수료 총 1.25% 면제 | 해외 이용 환율우대 100% (USD기준) | 공항 라운지 무료 | 자주 쓰는 일상 영역 10% 할인 (KB Pay 결제 시) | 온라인 항공/면세점 5% 할인 (KB Pay 결제 시) | 여행자보험 10% 할인 (KB Pay 결제 시) | 철도・고속버스 10% 할인'),
                                                                                        ('2555card.png','KB국민카드','K-패스카드','청구 할인 서비스'),
                                                                                        ('2680card.png','현대카드','현대카드Z work Edition2','온라인 쇼핑몰 10% 청구 할인 | 편의점 10% 청구 할인 | 커피전문점 10% 청구 할인 | 대중교통 10% 청구 할인(K-패스 또는 후불형 기후동행카드 신청 가능) | 도서 10% 청구 할인'),
                                                                                        ('2422card.png','KB국민카드','노리2 체크카드(KB Pay)','[일상] 스타벅스, 커피빈 10% 할인 | [일상] 구글플레이스토어, 앱스토어 10% 할인 | [일상] 인터파크 티켓 10% 할인 | [일상] 올리브영, 미용실 업종 5% 할인 | [일상] GS25, CU 5% 할인 | [일상]넷플릭스, 유튜브프리미엄 1,000원 할인 | [일상] 배달의 민족, 요기요 1,000원 할인 | [일상] SKT, KT, LG U+, Liiv M 2,500원 할인 | [일상] CGV 4,000원 할인 | [일상] 에버랜드, 롯데월드 15,000원 할인 | [KB Pay] 오프라인 가맹점 2% 추가 할인 | [KB Pay] 온라인 가맹점 2% 추가 할인'),
                                                                                        ('2432card.png','하나카드','네이버페이 머니 하나 체크카드','네이버페이 포인트 적립 서비스 | 플레이트 디자인 선택 가능'),
                                                                                        ('2691card_2.png','KB국민카드','트래블러스 체크카드','[해외 혜택] 해외 가맹점, ATM 이용 수수료 면제 | [국내 혜택] KB Pay 200원 추가 할인 | [국내 혜택] 카페 1,000원 할인 | [국내 혜택] 빵집 2,000원 할인 | [국내 혜택] 철도 5,000원 할인 | [국내 혜택] 고속버스 2,000원 할인 | [국내 혜택] 주차장 500원 할인 | [국내 혜택] 전국맛집 5,000원 할인'),
                                                                                        ('2852card_3.png','KB국민카드','KB 틴업 체크카드','[공통] KB Pay 오프라인 결제 2% 할인 | [공통] CU, 세븐일레븐 5% 할인 | [공통] 다이소, 올리브영, KB Pay 쇼핑 5% 할인 | [공통] 독서실 업종 5% 할인 | [공통] 서점 업종, 문구점 업종 5% 할인 | [놀이 | 2~3구간 혜택] PC방 5% 할인 | [놀이 | 2~3구간 혜택] 구글 플레이스토어, 애플 앱스토어 5% 할인 | [외식 | 3구간 혜택] 패밀리레스토랑 업종 10% 할인'),
                                                                                        ('2570card.png','우리카드','카드의정석 오하CHECK','[오늘 하루 SHOPPING] 온라인 쇼핑  5% 캐시백 | [오늘 하루 SHOPPING] 간편결제 5% 캐시백 | [오늘 하루 SHOPPING] 안경/렌즈 5% 캐시백 | [오늘 하루 EAT] 커피 5% 캐시백 | [오늘 하루 EAT] 배달/주문 5% 캐시백 | [오늘 하루 LIFE] 대중교통(버스/지하철) 5% 캐시백 | [오늘 하루 LIFE] 이동통신 5% 캐시백 | [오늘 하루 LIFE] 해외 5% 캐시백 | [오늘 하루 LIFE] 어학시험 5% 캐시백 | [오늘 하루 PLAY] OTT 5% 캐시백 | [오늘 하루 PLAY] 공연티켓 5% 캐시백'),
                                                                                        ('348card.png','KB국민카드','노리체크카드','버스·지하철 10% 청구할인 | 이동통신요금 2,500원 환급할인 | CGV 35% 환급할인 | 아웃백, VIPS / 스타벅스 20% 환급할인 | 에버랜드·롯데월드 50% 환급할인 | 금융수수료 면제 서비스 | GS25 5% 환급할인 | 교보문고 5% 환급할인'),
                                                                                        ('2604card.png','KB국민카드','토심이 첵첵 체크카드','버스·지하철 2~4천원 청구할인 | CU편의점 2~4천원 환급할인 | 스타벅스(사이렌오더 포함) 2~4천원 환급할인 | CGV 2~4천원 환급할인 | 텐바이텐 2~4천원 환급할인 | 네이버페이·카카오페이·SSG페이 2~4천원 환급할인 (온라인만) | 올리브영, 안경(렌즈)점 2~4천원 환급할인 | YES24, 교보문고 2~4천원 환급할인 (온라인만) | 인터파크티켓 2~4천원 환급할인 (온라인만)'),
                                                                                        ('2758card_1.png','NH농협카드','춘식이달달체크카드','Single Point (월~금 0.5% NH포인트 적립)Double Point (토,일 1% NH포인트 적립) | Triple Point (요일 관계없이 1.5% NH포인트 적립) | Bonus Point (유튜브, 넷플릭스, 유료 어플리케이션 결제 5% NH포인트 적립) | 국제공항 라운지 무료이용 서비스'),
                                                                                        ('2423card.png','KB국민카드','노리2 체크카드(Global)','[일상] 스타벅스, 커피빈 10% 할인 | [일상] 구글플레이스토어, 앱스토어 10% 할인 | [일상] 인터파크 티켓 10% 할인 | [일상] 올리브영, 미용실 업종 5% 할인 | [일상] GS25, CU 5% 할인 | [일상]넷플릭스, 유튜브프리미엄 1,000원 할인 | [일상] 배달의 민족, 요기요 1,000원 할인 | [일상] SKT, KT, LG U+, Liiv M 2,500원 할인 | [일상] CGV 4,000원 할인 | [일상] 에버랜드, 롯데월드 15,000원 할인 | [Global] 해외 가맹점 2% 할인 | [Global] 공항라운지 더라운지멤버스'),
                                                                                        ('362card.png','NH농협카드','NH20해봄체크카드','해봄 선택 서비스_여행해봄/놀이해봄 Type 중 택1 | [On-Line 서비스] | [Off-Line 서비스] | GS리테일 POP 서비스 | 주요서비스 통합 월 할인한도'),
                                                                                        ('2394card.png','하나카드','트래블로그 체크카드','해외 가맹점 이용수수료 면제 | 해외 ATM 인출 수수료 면제 | 국내 가맹점 이용 시 0.3% 적립 | 플레이트 3종 선택'),
                                                                                        ('2552card.png','우리카드','카드의정석 EVERY CHECK','[기본 적립] 국내외 가맹점 이용금액 0.2% 적립 | [추가 적립] 전월실적에 따라 최대 3천원 추가 적립 | [특별 적립] 4대 일상영역 중 한 곳 1만원 적립 | 플레이트 3종 선택'),
                                                                                        ('2561card.png','NH농협카드','K-패스카드(체크)','[모빌리티 서비스] 버스/지하철 10% 캐시백, 렌터카/카쉐어링/전기차 충전 5% 캐시백 | [라이프 서비스] 이동통신요금/커피전문점/편의점 5% 캐시백'),
                                                                                        ('407card.png','현대카드','현대카드M CHECK','업종·이용금액별 기본 M포인트 적립에 추가 M포인트 적립'),
                                                                                        ('350card.png','KB국민카드','직장인보너스체크카드','국세·지방세 7천원 환급할인 | GS칼텍스 리터당 주중 50원, 주말 60원 환급할인 | 스피드메이트 엔진오일교환 2만원 현장할인 및 정비 할인 | SK렌터카 할인 (연 2회) | 롯데·현대·신세계백화점 5% 환급할인 | 아웃백 10% 환급할인 | 버스·지하철 5% 청구할인 | 이동통신요금 1,000원 환급할인 (월 1회) | 에버랜드 50% 환급할인 | 해피포인트 5% 현장적립 | 통합할인한도'),
                                                                                        ('2620card.png','NH농협카드','NH 무럭이 체크카드','[기본 적립] 국내/외 이용가맹점 0.2% NH포인트 적립 | [스마트 적립] 6개 영역 중 이용금액 1위/2위 영역 기본적립의 3배/2배 적립'),
                                                                                        ('2750card_1.png','하나카드','달달 하나 체크카드','하나머니 적립 서비스'),
                                                                                        ('325card.png','우리카드','그랑블루 체크카드','GIFT VOUCHER (연 1회, 택1회) | 사용업종 또는 결제건당 금액에 따라 0.3~1% 모아포인트 적립 | 체크 브랜드별 공항라운지 이용 서비스 | [Travel Service] 국내외 여행 관련 서비스 제공 | 치킨, 피자 10% 청구할인 | 전국 영화관 3,000원 청구할인 | 골프 우대 서비스 및 자전거 무료 세척 서비스 | SK주유 및 충전 시 리터당 60원 청구할인'),
                                                                                        ('739card.png','KB국민카드','나라사랑체크카드','군마트(P.X) 및 GS25 해군마트 환급할인군 KT공중전화 할인 | GS리테일 팝서비스 | 대중교통(전국 버스/지하철) 20% 청구할인 | CGV 35% / 스타벅스 20% / 아웃백, VIPS 20%/ 에버랜드, 롯데월드 현장예매 50% 환급할인 | 교보문고 5% 환급할인TOEIC, JPT 응시료 2,000원 환급할인 | 이동통신 자동납부 2,500원 환급할인 | GS홈쇼핑, CJ홈쇼핑, G마켓, 옥션 5% 환급할인'),
                                                                                        ('360card.png','NH농협카드','올바른POINT체크카드','적립한도 없이 0.2% ~ 0.7% NH포인트 적립 | 국제공항 라운지 무료이용 | 전자금융 수수료 면제'),
                                                                                        ('528card.png','NH농협카드','라이언 치즈 체크카드','커피. 월~금 0.5% / 토,일 1% NH포인트 적립 | 편의점. 월~금 0.5% / 토,일 1% NH포인트 적립 | 영화. 월~금 0.5% / 토,일 1% NH포인트 적립 | 온라인쇼핑. 월~금 0.5% / 토,일 1% NH포인트 적립 | 배달앱. 월~금 0.5% / 토,일 1% NH포인트 적립 | 교통. 요일관계없이 1.5% NH포인트 적립 | 해외. 요일관계없이 1.5% NH포인트 적립 | 서점. 요일관계없이 1.5% NH포인트 적립 | 자기계발, 공연·전시, H&B. 요일관계없이 1.5% NH포인트 적립 | 유튜브, 넷플릭스, 유료 어플리케이션 결제 5% NH포인트 적립 | 국제공항 라운지 무료이용 서비스'),
                                                                                        ('2727_1card.png','NH농협카드','NH트래블리체크카드','[국내 서비스] 국내 가맹점 0.2~0.3% 캐시백 | [국내 가맹점] 일상 가맹점 0.6% 캐시백 | [해외 서비스] 외화 결제/인출 서비스 | [해외 서비스] 자동충전 서비스 | [해외 서비스] 해외 이용 수수료 면제'),
                                                                                        ('2556card.png','KB국민카드','K-패스체크카드','포인트리 적립 서비스'),
                                                                                        ('674card.png','IBK기업은행','IBK무민카드(체크)','버스, 지하철 이용건당 100원 할인 | 쿠팡, 티몬, 위메프 10% 할인 | GS25, CU, 세븐일레븐, 올리브영 5% 할인 | CGV, 롯데시네마, 메가박스 4천원 할인 | 주요 커피전문점 10% 할인 | 금융우대서비스 | 주요 놀이공원 무료입장 또는 입장료/자유이용권 할인 (월 1회, 연 2회)'),
                                                                                        ('2700card.png','우리카드','위비트래블 체크카드','해외 수수료 면제 서비스 | 해외 5% 캐시백 | 쇼핑 5% 캐시백 | 푸드 5% 캐시백 | 일상 5% 캐시백'),
                                                                                        ('335card.png','KB국민카드','청춘대로 싱글 체크카드','편의점 업종 5~10% 환급할인 | 다이소/소셜커머스 5~10% 환급할인 | 대중교통, 택시 5% 환급할인 | 올리브영·박승철헤어스투디오/동물병원 10% 환급할인 | 해외이용/해외직구 할인캐시백 | 라이프샵 여행 해외패키지 3% 현장할인'),
                                                                                        ('2682card.png','하나카드','K-패스 하나 체크카드','버스/지하철 10% 캐시백 (월 3천원, 월 6천원) | 다이소/올리브영 1% 캐시백 (월 1만원) | 스타벅스/커피빈 1% 캐시백 (월 5천원)'),
                                                                                        ('2588card.png','KB국민카드','스타플러스 체크카드','스타벅스, 커피빈 10% 할인 | 구글플레이스토어, 앱스토어 10% 할인 | 인터파크 티켓 10% 할인 | 올리브영, 미용실 업종 5% 할인 | GS25, CU 5% 할인 | 넷플릭스, 유튜브프리미엄 1,000원 할인 | 배달의 민족, 요기요 1,000원 할인 | SKT, KT, LG U+, Liiv M 2,500원 할인 | CGV 4,000원 할인 | 에버랜드, 롯데월드 15,000원 할인 | 해외 가맹점 2% 할인 | 공항라운지 더라운지멤버스'),
                                                                                        ('2742card.png','우리카드','카드의정석 EVERYDAY CHECK','[기본 적립] 국내/해외 가맹점 0.2% 적립 | [추가 적립] 우리페이 0.5% 추가 적립 | [특별 적립] 생활소비 1% 특별 적립'),
                                                                                        ('388card.png','하나카드','하나멤버스 Mega 체크카드','요식/마트/백화점/온라인쇼핑/주유/병원/ 2만원당 200 하나머니 적립SKT/KT/LGU+ 자동이체 적립(월1회) 3천~5천 하나머니 적립 | 하나멤버스 서비스'),
                                                                                        ('1765card.png','NH농협카드','올바른 NEW HAVE체크카드','국내외 이용가맹점 0.2% NH포인트 적립 | 6개 영역 중 당월(1일~말일) 이용금액 1위/2위 영역은 기본적립의 3배/2배 자동적용 | 국제 공항라운지 무료이용 | 농협 인터넷·모바일·스마트·텔레뱅킹 이체수수료 통합 월 5회 면제'),
                                                                                        ('2775card.png','하나카드','카카오페이 트래블로그 체크카드','국내 가맹점 카카오페이 포인트 적립 서비스 | 해외 이용수수료 면제 서비스'),
                                                                                        ('382card.png','하나카드','카카오페이 체크카드','카카오페이, 통신요금자동이체, 커피, 대중교통 캐시백 | 카드플레이트 디자인 선택 가능'),
                                                                                        ('676card.png','NH농협카드','올리 POINT 체크','국내/외 이용가맹점 0.2% NH포인트 적립 | 아래 6개 영역 중 당월(1일~말일) 이용금액 1위/2위 영역은 기본적립의 3배/2배 자동적용 | 국제공항 라운지 무료이용'),
                                                                                        ('454card.png','KB국민카드','가온 올포인트 체크카드','국내외 가맹점 0.2% 포인트리 기본 적립 | 커피/제과아이스크림 업종 0.2% 포인트리 추가 적립 | 이동통신요금 자동이체 시 0.2% 포인트리 추가 적립 | GS25 편의점 0.2% 포인트리 추가 적립 | 대중교통(버스, 지하철), 택시 0.2% 포인트리 추가 적립 | 대형마트 0.8% 포인트리 추가 적립 | GS칼텍스 주유소 0.8% 포인트리 추가 적립'),
                                                                                        ('2740card_1.png','하나카드','트래블GO 체크카드','해외 가맹점 이용 수수료 면제 · 해외 ATM 인출 수수료 면제 | 국내 가맹점 하나머니 적립 서비스'),
                                                                                        ('2866card.png','IBK기업은행','I-Travel(체크)','우대 환율(매매기준율) 적용 | [해외가맹점 이용] 국제브랜드수수료(1%) 및 해외이용 수수료(0.18%) 면제 | [해외ATM 인출] 국제브랜드수수료(1%) 및 해외ATM 이용 수수료(USD 3.0) 월 3회 면제 | [대한항공 마일리지] 건당 3만원 이상 결제 시 3천원당 1마일리지 적립'),
                                                                                        ('2826card.png','우리카드','우리 기후동행카드(체크)','생활 5% 캐시백 서비스 | 후불 기후동행카드 서비스 이용 안내'),
                                                                                        ('2770card.png','KB국민카드','KB국민 기후동행체크카드','후불 기후동행카드 안내 | 할인 서비스'),
                                                                                        ('446card.png','IBK기업은행','IBK 나라사랑카드','전국 시내버스/지하철, KTX(철도)/SRT/고속버스 할인 | 군 공중전화요금 자동이체 시 10% 할인 | CU 및 군마트(PX)할인 | 이니스프리 온/오프라인 매장 상시 10% 할인 | CGV 3천원 현장할인(동반1인 포함 시) | 아웃백스테이크 20% 현장할인 | 주요 놀이공원 본인 자유이용권 50% 현장할인 | 여기어때 결제금액 매월 최대 1만원 청구할인 | 인터넷 토익시험 접수(결제) 및 온라인서적(교보문고) 구매시 2천원 청구할인 | 군 복무 중 은행 ATM 출금수수료 무제한 면제 | 그린카드 멤버십 서비스 및 Syrup 통합 멤버십 서비스'),
                                                                                        ('414card.png','현대카드','현대카드M HYBRID','당월 이용금액별 M포인트 적립 | 체크결제와 신용결제 서비스를 한번에'),
                                                                                        ('380card.png','하나카드','하나멤버스 1Q 체크카드','편의점/베이커리/커피 1만원이상 이용시 건당 5% 하나머니 적립대중교통(버스,지하철) 월 사용금액 5만원 이상 시 5% 하나머니 적립 | 하나멤버스 서비스'),
                                                                                        ('1572card.png','KB국민카드','탐나는전 체크카드','국내외 가맹점 0.2% 기본 포인트리 적립 | 음식점, 커피전문점 업종 0.2% 추가 포인트리 적립 | 대중교통(버스·지하철), 택시 0.2% 추가 포인트리 적립 | 이동통신요금 0.2% 추가 포인트리 적립'),
                                                                                        ('2332card.png','KB국민카드','KB국민 우리동네 체크카드','세탁소 10% 할인 | 정육점 10% 할인 | 슈퍼마켓 5% 할인 | 반찬가게 5% 할인 | 야채과일가게 5% 할인 | 번개장터(번개페이) 5% 할인 | 카드 디자인 선택 가능'),
                                                                                        ('2768card.png','하나카드','하나 기후동행체크카드','캐시백 서비스 | 후불교통 기능 이용안내'),
                                                                                        ('368card.jpg','NH농협카드','NH올원체크카드','전월실적에 상관없이 0.2 ~ 0.4% 적립 | 제휴멤버십 서비스 | 기타서비스'),
                                                                                        ('749card.png','하나카드','VIVA X 체크카드','해외 가맹점 이용 수수료 면제 서비스 | 해외 ATM 인출 수수료 면제 서비스 | 국내 가맹점 0.3% 캐쉬백'),
                                                                                        ('2437card.png','NH농협카드','GS리테일 NH농협체크카드','GS리테일 점내 이용 시 2% GS&POINT 적립 | 국내 이용금액의 0.2%, 국외 이용금액의 1% NH포인트 적립 | 국제공항 라운지 무료이용 연 1회 제공'),
                                                                                        ('129card.png','KB국민카드','청춘대로 톡톡카드','[Great 서비스] 스타벅스 50% 청구할인 | [Enjoy 서비스] 버거/패스트푸드 업종 20% 청구할인 | [Check 서비스] 간편결제(Pay) 10% 청구할인 | [Basic 서비스] 대중교통, 택시/이동통신요금 10% 청구할인'),
                                                                                        ('2785card.png','롯데카드','힐튼 아너스 아멕스','힐튼 아너스 포인트 적립 (1,500원 당 2~4 힐튼 아너스 포인트 적립) | 전세계 힐튼호텔 주말 무료 숙박권 1매 제공 | 힐튼 아너스 멤버쉽 실버 등급 제공 및 골드 등급으로 업그레이드 | 국내/해외 공항라운지 1인 무료 이용(연2회)'),
                                                                                        ('2613card.png','우리카드','ALL 우리카드 Infinite','[아코르 서비스] 14,000 ALL 리워드 포인트 기프트 제공 | [아코르 서비스] 아코르 플러스 유료 멤버십 자동 가입 | [아코르 서비스] ALL 회원 GOLD 등급 제공 및 업그레이드 | [아코르 서비스] ALL 리워드 포인트 적립 | [아코르 서비스] 5,000 ALL 리워드 포인트 보너스 제공 | [Premium Service] 국내외 공항 라운지 무료이용 서비스 제공 | [Premium Service] KAL 리무진 버스 무료이용 서비스 제공 | [Premium Service] 국내 지정 골프장 무료 커피 또는 지정 골프연습장 무료 타석권 제공 | [Premium Service] 국내외 여행자 보험 서비스 제공 | [Premium Service] 아코르 호텔 프리미엄 서비스 제공 | 플레이트 선택'),
                                                                                        ('2821card.png','하나카드','원더카드 2.0 HAPPY+','국내외 결제 시 0.5% 할인 | 쿠팡 2% 할인 | 백화점 2% 할인 | 마트 2% 할인 | 홈쇼핑 2% 할인 | 슈퍼마켓 2% 할인 | 편의점 2% 할인 | 베이커리 2% 할인 | 간편결제 5% 할인'),
                                                                                        ('2406card.png','하나카드','하나 CLUB H 아메리칸 익스프레스 리저브 카드','국내 이용금액 1천원당 1마일리지 적립 | 해외 이용금액 1천원당 2마일리지 적립 | 인천공항 라운지 무료 서비스 | Special Service 메탈 플레이트 기본 제공 | 국제 브랜드 서비스'),
                                                                                        ('2446card.png','하나카드','원더카드 FREE','전가맹점 0.7% 할인 | 간편결제 1.2% 할인 | 쿠팡/마트/베이커리 2% 할인대중교통 3% 할인 | 무이자할부'),
                                                                                        ('654card.png','NH농협카드','올바른 MYPICK 카드','기본서비스(PACK 선택과 상관없이 공통 제공) | [선택형1] FOOD PACK | [선택형2] SHOPPING PACK | [선택형3] TRAVEL PACK | [선택형4] MEDI PACK | [선택형5] HEALTH & BEAUTY PACK'),
                                                                                        ('2464card.png','NH농협카드','zgm.휴가중카드','해외 이용액 2~5% NH포인트 적립 | 국내 이용액 0.5% NH포인트 기본적립 | 항공권, 면세점 업종 0.5% NH포인트 추가적립 | 호텔스닷컴 이용 시 20% 즉시할인(월 이용 한도 4회) | 전 세계 공항 라운지 무료 이용(The lounge / 더 라운지) | 여행자보험 무료 가입 | MASTERCARD TITANUM / PLATINUM PREMIUM SERVICES | 플레이트 디자인 선택가능'),
                                                                                        ('2305card.png','NH농협카드','별다줄카드','[기본할인] 국내 온라인 전 가맹점 7% 청구할인 | [더블할인] FLEX, RE-SELL, FUN 가맹점 14% 청구할인 | [생활할인] 6대 생활업종 5% 청구 할인 | 국제공항 라운지 무료이용 연2회 제공 | 전국 주요 놀이공원 현장할인 최대 50% | 원하는 플레이트 디자인 선택 가능'),
                                                                                        ('655card.png','IBK기업은행','Daily With(데일리위드)카드','6대 생활영역 캐시백 | [6대생활영역] 음식점 | [6대생활영역] 온라인쇼핑 | [6대생활영역] 대형마트·편의점 | [6대 생활영역] 통신비 | [6대 생활영역] 병원비 | [6대 생활영역] 교통'),
                                                                                        ('723card.png','IBK기업은행','IBK무민카드(신용)','주요 커피전문점 20% 할인 | 쿠팡, 티몬, 위메프 20% 할인 | GS25, CU, 세븐일레븐, 올리브영 10% 할인,이마트, 홈플러스, 롯데마트 5% 할인 | CGV, 롯데시네마, 메가박스 1만원 할인 | 버스, 지하철 이용건당 200원 할인 | 전 주유소 리터당 60원 할인(LPG포함) | 금융우대서비스(각종 수수료 면제) | 놀이공원 할인'),
                                                                                        ('2610card.png','IBK기업은행','I-어디로든 그린카드','에코머니 포인트 & 그린서비스란? | 친환경 자동차 최대 40% 적립 | 공유 모빌리티 10% 적립 | 대중교통 10% 적립 | 일반교통 10% 적립 | 커피전문점 10% 적립 | 생활 서비스 0.2% 적립'),
                                                                                        ('269card.png','IBK기업은행','IBK-Hybrid(하이브리드)카드','하이브리드 서비스 (체크+신용 결제서비스)'),
                                                                                        ('2591card.png','BC 바로카드','BC 바로 On&Off 카드','온라인/간편결제 10% 결제일 할인 | 음식점/커피 10% 결제일 할인 | 버스/지하철/택시 10% 결제일 할인 | 해외 10% 결제일 할인 | 무이자할부 서비스 | 국제 브랜드 서비스'),
                                                                                        ('2728card.png','BC 바로카드','BC 바로 MACAO 카드','[넣을수록 할인] 모든 주유소에서 많이 넣을수록 크게 할인 | [담을수록 할인] 장보기 가맹점에서 많이 담을수록 크게 할인 | [해외에서도 할인] 해외 전 가맹점에서도 전월 실적, 한도 없이 할인 | MasterCard Platinum/VISA Platinum 기본 서비스'),
                                                                                        ('2418card.png','BC 바로카드','始發(시발)카드',''),
                                                                                        ('2557card.png','BC 바로카드','K-패스 카드','대중교통(버스, 지하철) 15% 결제일 할인 | OTT/스트리밍 15% 결제일 할인 | 이동통신요금 5% 결제일 할인 | 편의점 5% 결제일 할인 | 카페 5% 결제일 할인 | 해외 3% 결제일 할인'),
                                                                                        ('2774card.png','BC 바로카드','BC 바로 기후동행카드','기후동행카드 안내 | 대중교통(버스, 지하철) 15% 결제일 할인 | 이동통신요금 5% 결제일 할인 | OTT/스트리밍 10% 결제일 할인 | 편의점 5% 결제일 할인 | 온라인쇼핑 멤버십 10% 결제일 할인 | 카페 5% 결제일 할인'),
                                                                                        ('2380card.png','BC 바로카드','신세계 BC 바로 콰트로 플러스','[쇼핑] 신세계백화점·이마트 등 5% 할인 | [교통] 주유소·전기차·대중교통·택시 4% 할인 | [온라인몰] SSG·쿠팡·G마켓·옥션·11번가 7% 할인 | [생활] 병원·약국·통신3사휴대폰요금 5% 할인 | [커피/외식] 스타벅스·이디야·아웃백 등 10% 할인 | 신세계백화점 제휴 서비스 제공 | VISA Platinum 서비스 제공'),
                                                                                        ('2347card.png','BC 바로카드','BC 바로 리워드 플러스',''),
                                                                                        ('2590card.png','BC 바로카드','BC 바로 에어 플러스 아시아나',''),
                                                                                        ('651card.png','신한카드','네이버페이 라인프렌즈 신한카드','플레이트 디자인 선택 가능 | 네이버에서 결제 시 2% 적립'),
                                                                                        ('64card.png','삼성카드','신세계이마트 삼성카드7','신세계백화점·이마트 제휴 혜택 | 국내 가맹점, 주유, 삼성전자 등 빅포인트 적립 | 영화, 세콤홈즈, 삼성미술관리움 등 할인'),
                                                                                        ('72card.png','삼성카드','트레이더스신세계 삼성카드','트레이더스 결제일할인 | 학원·서점·학습지·인터넷강의 5% 결제일할인 | 이동통신 5% 결제일할인 | 커피전문점 5% 결제일할인 | 신세계백화점 제휴 서비스'),
                                                                                        ('577card.png','신한카드','네이버페이 신한카드','네이버페이포인트 1% 적립네이버 카드간편결제 2% 추가적립'),
                                                                                        ('1555card.png','우리카드','SKT 우리카드','T라이트할부 및 SKT 통신요금 월 1만원 ~ 2만원 청구할인 | 전국 영화관 3천원 청구할인 | VIPS, TGIF 10% 청구할인 | 할리스, 엔제리너스 20% 청구할인 | 롯데월드, 에버랜드, 서울랜드, 이월드(대구), 경주월드, 통도환타지아 자유이용권 50% 현장할인'),
                                                                                        ('490card.png','신한카드','11번가 신한카드','국내외 가맹점 이용금액 0.5% SK pay 포인트 적립 | 11번가에서 SK pay 결제 시 이용금액 1% 적립'),
                                                                                        ('589card.png','하나카드','토스 신용카드','해외 모든 가맹점 2% 토스머니 적립 (월 1만 토스머니 한도) | 해외 인출 수수료 우대 서비스 | 국제 브랜드 서비스'),
                                                                                        ('351card.png','KB국민카드','스타체크카드','GS칼텍스 리터당 주중 50원, 주말 60원 환급할인 | 버스·지하철 5% 청구할인 | 이동통신요금 2,500원 환급할인 | CGV 3,000원 환급할인 | 에버랜드 50% 환급할인 | G마켓·옥션 3% 환급할인 | 올리브영 5% 환급할인 | 교보문고 3% 환급할인 | 아웃백·VIPS 10% 환급할인 | 통합할인한도'),
                                                                                        ('458card.png','삼성카드','네이버페이 taptap','라이프스타일 옵션 패키지 | [일상팩] 네이버페이 온라인 간편결제 시 10% 네이버페이 포인트 적립 | [일상팩] 커피전문점·편의점·배달앱 5% 네이버페이 포인트 적립'),
                                                                                        ('394card.png','삼성카드','삼성체크카드 & CASHBACK','업종 및 연간 이용금액에 따라 0.2%~0.6% 캐시백 | CGV 3,000원 할인 | 놀이공원 자유이용권 50%·워터파크 입장권 30% 현장할인'),
                                                                                        ('2563card.png','삼성카드','K-패스 삼성체크카드','대중교통 10% 캐시백 | 이동통신 10% 캐시백 | 편의점/커피전문점/제과 1,000원 캐시벡 | CGV 3,000원 할인 | K-패스 마일리지'),
                                                                                        ('2268card.png','신한카드','네이버페이 신한카드 체크 S2','네이버에서 결제 시 1~2% 적립'),
                                                                                        ('391card.png','신한카드','신한카드 하이패스(전용) 체크','하이패스 이용요금의 0.1% 포인트 적립'),
                                                                                        ('2527card.png','신한카드','신한카드 Pick I 체크','4대 편의점 이용 시 10% 적립 | 커피 업종 이용 시 10% 적립 | 해외 이용금액 1% 적립 | 디지털 구독 영역 이용 시 10% 적립 | One Pick 온라인 쇼핑몰 가맹점 최대 3천 포인트 적립'),
                                                                                        ('281card.png','신한카드','신한카드 Deep Dream 체크','기본 포인트 적립 | 추가 포인트 적립 | 추가 포인트 적립 | 주유소 적립 | 택시 할인 | 추가 포인트 적립 | 수수료 우대'),
                                                                                        ('15card.png','신한카드','신한카드 The CLASSIC+','Gift Option | 항공 마일리지 적립 서비스 | 제주 JDC 면세점 8% 결제일 할인 | 더라운지 | GS칼텍스 주유 시 리터당 40원 결제일 할인 | 스타벅스 3,000원 할인'),
                                                                                        ('618card.png','신한카드','신한카드 Hey Young 체크','플레이트 디자인 선택 가능 | 대중교통 이용금액 5% 캐시백 | 이동통신요금 자동납부 시 2천원 캐시백 | CGV 영화 예매 5천원 캐시백 | 편의점 1천원 캐시백 | 카페 1천원 캐시백 | 패스트푸드 1천원 캐시백'),
                                                                                        ('2660card.png','신한카드','신한카드 SOL트래블 체크','해외 이용금액 현지 통화 결제 서비스 | 국제 브랜드 수수료(1%)/해외 서비스 수수료(0.2%) 면제 | 더라운지 공항라운지 본인 무료 입장 | 해외 대중교통 컨택리스 방식으로 이용 시 1% 결제일 할인 | 국내 4대 편의점 5% 결제일 할인국내 대중교통 1% 결제일 할인 | 해외이용 프로모션'),
                                                                                        ('2847card_1.png','신한카드','신한카드 SOL트래블 J체크','해외 이용금액 현지통화 결제 서비스 | [해외 이용 서비스] 국제 브랜드 수수료(1%) / 해외 서비스 수수료(0.2%) 면제'),
                                                                                        ('284card.png','신한카드','신한카드 주거래 체크','모든 가맹점 0.3% 포인트 적립 | 신한은행 결제 계좌 연결 제공 서비스(추가 포인트 적립) | 주거래Package'),
                                                                                        ('2386card_3.png','신한카드','티머니 Pay & GO 신한카드','K-패스 안내 | [교통서비스 할인(모바일티머니)]대중교통(버스, 지하철) 30% 결제일 할인 | [교통서비스 할인(티머니GO)]고속/시외 버스, 따릉이, 킥보드, 택시 20% 결제일 할인'),
                                                                                        ('12card.png','신한카드','신한카드 Air Platinum#','대한항공 1,500원당 1마일/아시아나항공 1,000원당 1마일 | 마이신한포인트 추가 적립 | 특급 호텔 발렛파킹/면세점 우대 서비스'),
                                                                                        ('2372card.png','신한카드','신한카드 플리(체크)','[Daily 할인] 국내 이용금액 최대 0.3% 할인, 해외 이용금액 0.2% 할인 | [Weekly 할인 쿠폰] 매월 2회 국내 이용 할인 쿠폰 제공 | [Monthly 단골 적립] My Pick 가맹점 월 3, 6, 9번째 이용 건에 대해 마이신한포인트 1,000포인트 적립'),
                                                                                        ('2338card.png','신한카드','신한카드 Way 체크','대중교통(버스/지하철) 이용 시 최대 5% 적립 | 생활편의영역 이용 시 최대 2% 적립 | 해외 이용금액에 대해 1.3% 적립'),
                                                                                        ('286card.png','신한카드','카카오페이 신한 체크카드','플레이트 디자인 선택 가능 | 카카오페이 결제 시 2% 적립 | 대중교통 3% 적립 | 이동통신요금 3% 적립 | CGV 영화 최대 3천원 적립 | 해외 전가맹점(온라인 포함) 이용금액 1% 적립,해외 인출 1건당 US $3 적립 제공 | Master 플래티늄 서비스'),
                                                                                        ('2492card.png','신한카드','신한카드 플리 체크(산리오캐릭터즈)','[Daily 할인] 국내 이용금액 최대 0.3% 할인, 해외 이용금액 0.2% 할인 | [Weekly 할인 쿠폰] 매월 2회 국내 이용 할인 쿠폰 제공 | 카드 플레이트 선택 가능'),
                                                                                        ('2528card.png','신한카드','신한카드 Pick E 체크','4대 편의점 이용 시 10% 적립 | 커피 업종 이용 시 10% 적립 | 해외 이용금액 1% 적립 | 놀이 영역 이용 시 10% 적립 | One Pick 맛집 가맹점 최대 3천 포인트 적립'),
                                                                                        ('2767card.png','신한카드','신한 후불 기후동행 체크카드','후불 기후동행카드 서비스 안내 | 온라인 5% 할인 | 오프라인 5% 혜택'),
                                                                                        ('2690card.png','신한카드','K-패스 신한카드','대중교통(버스, 지하철) 이용 시 10% 결제일 할인 | 간편결제로 결제 시 5% 결제일 할인 | 생활서비스 5% 결제일 할인'),
                                                                                        ('367card.png','NH농협카드','내일배움체크카드','내일배움카드제도란? | 농협운영주유소, NH-Oil 및 GS칼텍스 주유소 할인 또는 적립 | 농협판매장 5% NH포인트 적립 | 문화 서비스(영화, 커피, 서적) 10% 청구 할인 | 국내·외 여행스케치 현장 할인(3~5%)'),
                                                                                        ('370card.png','NH농협카드','BAZIC(베이직)체크카드','국내·외 전 가맹점 0.2~0.3% 청구할인'),
                                                                                        ('2810card.png','하나카드','더 심플 체크카드','통신 요금 대상 가맹점 자동이체 1만원 이상 납부 시 5,000원 캐시백 | 스타벅스, 커피빈, 투썸플레이스 1만원 이상 결제 시 5% 캐시백'),
                                                                                        ('378card.jpg','하나카드','VIVA+ 체크카드','해외 이용 수수료 면제 서비스해외 인출 수수료 우대 서비스 | Lunch Time 7% 캐쉬백 서비스'),
                                                                                        ('2526card.png','IBK기업은행','K-패스(체크)','대중교통 건당 100원 할인 | 커피 10% 할인 | 쇼핑 10% 할인 | 편의점 5% 할인 | 영화 4천원 할인 | 놀이공원 본인 무료입장 또는 자유이용권 최대 50% 할인 | 금융우대서비스');

-- 외부 금융망 API 카드 상품 목록 JSON
SET @payload = '{
    "Header": {
        "responseCode": "H0000",
        "responseMessage": "정상처리 되었습니다.",
        "apiName": "inquireCreditCardList",
        "transmissionDate": "20250916",
        "transmissionTime": "093735",
        "institutionCode": "00100",
        "apiKey": "523a1ee577b84d6694ab880af74c3b4e",
        "apiServiceCode": "inquireCreditCardList",
        "institutionTransactionUniqueNo": "20240215121212123523"
    },
    "REC": [
        {
            "cardUniqueNo": "1001-c6ddc9a8f90c450",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "KB 틴업 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-439e0cab860f4f8",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "쿠팡 와우카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-1a056c5c0b58407",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "Easy all 티타늄카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-dc69959ebfea438",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "탐나는전 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-7a0bbd5c1fea4a2",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "직장인보너스체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-54c3e0c3d262431",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "토심이 첵첵 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-a001b918bcf24d6",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "가온올림카드(실속형)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-fedd10748e25423",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "K-패스카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-3ebb11ec6c4f4b5",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "SSAFY 스마일카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "500000",
            "maxBenefitLimit": "10000",
            "cardDescription": "생활 10% 할인",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "10.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-f8fadbc7ffd7436",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "다담카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-4852af683f4a4ff",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "KB국민 기후동행체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-60cb8ffee6fb406",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "청춘대로 톡톡카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-dfa72322271840c",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "노리체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-3d19ff4c2eb8483",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "BeV V카드(스카이패스형)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-1cebf31c0fc04bf",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "트래블러스 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-74d253cfde0c49f",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "청춘대로 싱글 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-b0f814a734914b3",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "K-패스체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-b015ca5c9d60448",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "가온 올포인트 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-94413c2df38947d",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "노리2 체크카드(Global)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-7ec0eeed88fe448",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "굿데이올림카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-3d17ad215cbf439",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "KB국민 My WE:SH 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-f9838e847ceb488",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "나라사랑체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-02256c2676284ed",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "노리2 체크카드(KB Pay)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-73a3e25da45d46e",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "스타플러스 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-b949239c6fbf4b6",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "KB국민 우리동네 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-02518f842ad14e0",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "WE:SH Travel",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1001-3cca4d6f474e4ed",
            "cardIssuerCode": "1001",
            "cardIssuerName": "KB국민카드",
            "cardName": "스타체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-666472820fe24cc",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD SELECT ON 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-520f5ef3be3e478",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD SELECT ALL 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-fec8742c68ef425",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD ALL 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-89258c2867cb49d",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "신세계이마트 삼성카드7",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-bcbcc7fba4014f2",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성카드 taptap O",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-7f4bcf1b00d04b8",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성체크카드 & CASHBACK",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-9de4bff4710949d",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "트레이더스신세계 삼성카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-62a75efd02e54cd",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "네이버페이 taptap",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-4c0564a5fc1d4da",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성카드 스페셜마일리지(스카이패스)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-6a94d2696d5f4b8",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD GLOBAL 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-56fa8d552a814b9",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD SIMPLE 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-1376c2e203ec43a",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "taptap DIGITAL",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-5cc89d16072c498",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "삼성 iD ON 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1002-d6a4dfbe97594e6",
            "cardIssuerCode": "1002",
            "cardIssuerName": "삼성카드",
            "cardName": "K-패스 삼성체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-c63748352fef444",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "롯데 국민행복카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-342ef444fa9f431",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "디지로카 Paris",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-8ad4f67930d5473",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "LOCA 365 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-057693ad297d47e",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "디지로카 London",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-a39dc4db38f9424",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "LOCA X 기후동행카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-92f4223ca1ce4f5",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "힐튼 아너스 아멕스 프리미엄",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-3a9c37c5bcb04f2",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "디지로카 Las Vegas",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-cd29f82d6c224be",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "롯데멤버스 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-3a114affc568468",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "LOCA LIKIT 1.2",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-9a0d072b3a21405",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "롯데멤버스 카드 프리미엄",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1003-4106d89f5924467",
            "cardIssuerCode": "1003",
            "cardIssuerName": "롯데카드",
            "cardName": "힐튼 아너스 아멕스",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-f079e27ed5f54c0",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 오하CHECK",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-1f100a11437740a",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 EVERYDAY CHECK",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-93e6655891a9403",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 EVERY DISCOUNT",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-40ea959c26094fb",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석2",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-480976f20975424",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "SKT 우리카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-d0ba026f30554d1",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 EVERY POINT",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-83149acaa58d4d3",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "그랑블루 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-533e55eca28c4b1",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 TEN",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-4eff664a4203471",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "ALL 우리카드 Infinite",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-41ad6bd0d0074c7",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "DA카드의정석Ⅱ",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-35db775a7eae4bd",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 I&U+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-fc426b9c49e8452",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "우리카드 7CORE",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-4470beeb9dce466",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 EVERY CHECK",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-a12611bf8d8c41a",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "우리 기후동행카드(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-4e41e9b08e6e499",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "위비트래블 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1004-0db9e3f5c62b4db",
            "cardIssuerCode": "1004",
            "cardIssuerName": "우리카드",
            "cardName": "카드의정석 SHOPPING+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-be3821446e0e447",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Way 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-6326adc26b1542a",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 SOL트래블 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-c07bf9825cf9443",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "11번가 신한카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-594c45df0673485",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Hey Young 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-eed69760c317481",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한 후불 기후동행 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-43c65e0eea9b4f7",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 On 체크(잔망루피)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-23f4d192795c413",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 The BEST-F",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-db0fece2dcc54f9",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 플리 체크(산리오캐릭터즈)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-876b3697add94ea",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 주거래 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-8935db5a771942f",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 RPM+ Platinum#",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-4c7533f6a3db4b6",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 The BEST-X",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-bf05f1104d4b428",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "카카오페이 신한 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-7439519f0e30448",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 SOL트래블 J체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-47c2a77b3b044e1",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "네이버페이 라인프렌즈 신한카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-af93e994317f4b2",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 플리(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-98b89c0dcd564fc",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Air Platinum#",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-47518da2c1b54cb",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 The CLASSIC+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-6e91f7836bea481",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Discount Plan+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-433616b2753e4d1",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Edu Plan+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-14e4e550a6944d1",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 하이패스(전용) 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-81e9aa7f30ea43b",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Deep Oil",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-108a94eb4a48465",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Air One",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-156a03fa5df64a0",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Pick I 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-6a99038b019b4b3",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Point Plan",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-4663363b6b9c4e3",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Point Plan+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-10ec8cfb7e0c47b",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "네이버페이 신한카드 체크 S2",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-f8ab9b393b404b5",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "네이버페이 신한카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-e7bb841010a2439",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Pick E 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-247985557138471",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Mr.Life",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-f398a0d153ab43f",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "K-패스 신한카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-2a1c7d4ac1fe4a6",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 Deep Dream 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-8dee46afdd824e9",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "티머니 Pay & GO 신한카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1005-46b78575a739466",
            "cardIssuerCode": "1005",
            "cardIssuerName": "신한카드",
            "cardName": "신한카드 처음(ANNIVERSE)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-279820c3d5504a3",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "대한항공카드 300",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-84cc223e05d6446",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드M CHECK",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-877eb0b73243442",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "네이버 현대카드 Edition2",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-b0883bc682e14a4",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드 Summit",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-164adf37a03044a",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "the Green Edition3",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-2aba9e455be94d7",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드 ZERO Up",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-bd34841a0103493",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드M HYBRID",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-9b52ea48d951443",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드Z work Edition2",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-b270a008e9104e0",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드 X Save",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-d12af6a5c94d478",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드 X Cut",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-7134780b4c99471",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "현대카드 M",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-64f216632cbf458",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "대한항공카드 120",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1006-4c411a3a6fb24cc",
            "cardIssuerCode": "1006",
            "cardIssuerName": "현대카드",
            "cardName": "the Red (항공 마일리지형)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-468fcb6dbb0d473",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "신세계 BC 바로 콰트로 플러스",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-ec5d9bedf6f241c",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 리워드 플러스",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-80a4899b2f034e5",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 On&Off 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-cb063e64407441d",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "始發(시발)카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-76aa9ae4632e4e9",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "K-패스 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-6caf59463399481",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 MACAO 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-f7da90e4f11640a",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "GOAT BC 바로카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-8e2ba61eaf14409",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 기후동행카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-185f3c1aa94a435",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 클리어 플러스",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1007-1fec568e9827494",
            "cardIssuerCode": "1007",
            "cardIssuerName": "BC 바로카드",
            "cardName": "BC 바로 에어 플러스 아시아나",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-790d1d251e2a4b3",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "BAZIC(베이직)체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-f33bef4b953d41a",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "NH트래블리체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-4e17ce8a7bbc491",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "클래시 트래블카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-13572afa301a43b",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "NH20해봄체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-22d397f82e0c481",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "K-패스카드(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-239caa550d01401",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올리 POINT 체크",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-372944b8a8924f0",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "NH올원체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-fe81f6c5d5d34f7",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "zgm.play카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-e9ad95bf42c147f",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "zgm.일본여행중 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-3aa0474d3f29428",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올바른POINT체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-daf5e721476240e",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "zgm.streaming카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-9cf124657d8e46c",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "zgm.the pay카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-e0ea604509734dc",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "라이언 치즈 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-15bd445a3f5a411",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "내일배움체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-4e60760044b84a2",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "춘식이달달체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-e0620cbb9497485",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "zgm.휴가중카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-b64270d5f7ea49a",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올바른 MYPICK 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-d48157b286f24f4",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "NH 무럭이 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-d123e830937a473",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올바른 NEW HAVE카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-34b2d9742d45432",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올바른 FLEX 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-20dcbd2e409d4a5",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "올바른 NEW HAVE체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-b13b94846c0b484",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "별다줄카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1008-2e8827faadc9420",
            "cardIssuerCode": "1008",
            "cardIssuerName": "NH농협카드",
            "cardName": "GS리테일 NH농협체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-e1decc42d072499",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "VIVA+ 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-be3885ba5cbc43d",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "하나멤버스 1Q 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-12bc69d84ed045a",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "카카오페이 트래블로그 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-0fa79b04958c4bd",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "더 심플 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-1d038cc2434946f",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "원더카드 2.0 HAPPY+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-73eb88f747cb4d7",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "원더카드 FREE",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-6c6ec471a695404",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "K-패스 하나 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-bdc82e6693f6475",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "하나멤버스 Mega 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-4d6a6d60c0b7452",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "하나 스카이패스 아멕스 플래티늄 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-6ffbe660035a49b",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "카카오페이 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-73d1ad5c9487431",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "원더카드 2.0 FREE+",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-71b17f98ddff4a5",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "원더카드 2.0 LIVING",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-119b1e9f3c2d4db",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "트래블로그 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-8985bcf98eb347f",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "JADE Prime",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-ee10e32a2821482",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "JADE Classic",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-d9f49efd8f93406",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "네이버페이 머니 하나 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-84425cf7afd1477",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "원더카드 2.0 LIFE",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-23adece1b3714f1",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "달달 하나 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-b6a4a53adef2484",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "VIVA X 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-066db0032409410",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "하나 기후동행체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-8f156fbe10944a3",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "CLUB SK 카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-4682ee888afc403",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "토스 신용카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1009-d52a89c9bf9d455",
            "cardIssuerCode": "1009",
            "cardIssuerName": "하나카드",
            "cardName": "트래블GO 체크카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-f48c2222d17e470",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "I-Mileage (대한항공)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-2d1c8c60809145c",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK-Hybrid(하이브리드)카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-6400ecfed7a8496",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "I-ALL",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-9a5106c8bf5e4ad",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "BLISS.5 카드(마일리지)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-19104aa6fd074db",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "I-Travel(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-cacc9cb11f7741a",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK포인트3.8(신용)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-b6b46b97b6b945d",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK포인트(신용)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-8bb3a75c093e4ad",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK 나라사랑카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-34edc98f9d98447",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "Daily With(데일리위드)카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-b214e4391089456",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK무민카드(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-0b18a32ecb5d48a",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "IBK무민카드(신용)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-1b913832c460496",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "I-어디로든 그린카드",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        },
        {
            "cardUniqueNo": "1010-1c2fb0561662470",
            "cardIssuerCode": "1010",
            "cardIssuerName": "IBK기업은행",
            "cardName": "K-패스(체크)",
            "cardTypeCode": "1",
            "cardTypeName": "신용카드",
            "baselinePerformance": "0",
            "maxBenefitLimit": "1000000",
            "cardDescription": "",
            "cardBenefitsInfo": [
                {
                    "categoryId": "CG-9ca85f66311a23d",
                    "categoryName": "생활",
                    "discountRate": "3.0"
                }
            ]
        }
    ]
}';

INSERT INTO staging_fin_card_api (card_unique_no, card_issuer_code, card_name)
SELECT
    jt.cardUniqueNo,
    jt.cardIssuerCode,
    TRIM(jt.cardName)
FROM JSON_TABLE(
             @payload,
             '$.REC[*]'
             COLUMNS(
                 cardUniqueNo   VARCHAR(40)  PATH '$.cardUniqueNo',
                 cardIssuerCode VARCHAR(10)  PATH '$.cardIssuerCode',
                 cardName       VARCHAR(200) PATH '$.cardName'
                 )
     ) AS jt
ON DUPLICATE KEY UPDATE
                     card_issuer_code = VALUES(card_issuer_code),
                     card_name        = VALUES(card_name);

INSERT IGNORE INTO card_product (
    card_unique_no, card_issuer_code, card_name, card_type_name, image_url, card_description
)
SELECT
    f.card_unique_no,
    f.card_issuer_code,
    f.card_name,
    IF(f.card_name LIKE '%체크%', 'CHECK', 'CREDIT') AS card_type_name,
    CASE WHEN sc.image_file IS NOT NULL THEN CONCAT(@card_image_base, sc.image_file) END AS image_url,
    sc.card_description
FROM staging_fin_card_api f
         LEFT JOIN card_issuer ci
                   ON ci.card_issuer_code = f.card_issuer_code
         LEFT JOIN staging_card_csv sc
                   ON sc.issuer_name = ci.card_issuer_name
                       AND sc.card_name   = f.card_name;

-- =========================================
-- 3) 브랜드 혜택 추출 → card_product_benefit 적재
-- =========================================
INSERT IGNORE INTO card_product_benefit (franchise_id, card_unique_no, discount_rate)
SELECT r.franchise_id, r.card_unique_no, r.discount_rate
FROM (
         SELECT
             (SELECT franchise_id FROM franchise f WHERE f.franchise_name = bm.franchise_name) AS franchise_id,
             c.card_unique_no,
             COALESCE(
                     CAST(NULLIF(
                             REPLACE(
                                     REGEXP_SUBSTR(
                                             REGEXP_SUBSTR(
                                                     c.card_description,
                                                     CONCAT(bm.franchise_name, '[^%]{0,30}[0-9]+(?:\\.[0-9]+)?%')
                                             ),
                                             '[0-9]+(?:\\.[0-9]+)?%'
                                     ), '%',''
                             ), ''
                          ) AS DECIMAL(6,2)),
                     CAST(NULLIF(
                             REPLACE(REGEXP_SUBSTR(c.card_description, '[0-9]+(?:\\.[0-9]+)?%'),'%',''),
                             ''
                          ) AS DECIMAL(6,2))
             ) AS discount_rate
         FROM card_product c
                  JOIN (
             SELECT '스타벅스' AS franchise_name, '스타벅스' AS term UNION ALL
             SELECT '스타벅스','사이렌오더' UNION ALL
             SELECT 'CGV','CGV' UNION ALL
             SELECT '롯데시네마','롯데시네마' UNION ALL
             SELECT '메가박스','메가박스' UNION ALL
             SELECT '올리브영','올리브영'
         ) bm
                       ON c.card_description IS NOT NULL
                           AND c.card_description <> ''
                           AND c.card_description LIKE CONCAT('%', bm.term, '%')
     ) AS r
WHERE r.discount_rate IS NOT NULL
ON DUPLICATE KEY UPDATE
    card_product_benefit.discount_rate =
        GREATEST(card_product_benefit.discount_rate, VALUES(discount_rate));
