const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const reason = (codes) => JSON.stringify(codes);

async function main() {
  await prisma.selectionReview.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sourcingSession.deleteMany();

  const bath = await prisma.sourcingSession.create({
    data: {
      title: "욕실 수납용품 탐색",
      targetCategory: "생활/수납",
      domesticKeyword: "욕실 수납 선반",
      relatedKeywords: "무타공, 코너선반, 화장실 정리",
      sourcePlatforms: "1688, Taobao",
      sourcingStrategy: "작고 가볍고 비전기인 생활잡화 위주로 확인",
      demandSignal: "normal",
      competitionLevel: "normal",
      targetCandidateCount: 3,
      memo: "초보 운영에 무리가 적은 소형 생활잡화 우선"
    }
  });

  const office = await prisma.sourcingSession.create({
    data: {
      title: "문구/사무용품 소품 탐색",
      targetCategory: "문구/사무",
      domesticKeyword: "책상 정리 소품",
      relatedKeywords: "케이블 정리, 데스크 수납, 펜꽂이",
      sourcePlatforms: "1688, AliExpress",
      sourcingStrategy: "브랜드/IP 요소가 없고 옵션이 단순한 상품 확인",
      demandSignal: "strong",
      competitionLevel: "high",
      targetCandidateCount: 2,
      memo: "가격 경쟁이 강하므로 마진을 보수적으로 확인"
    }
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        sourcingSessionId: bath.id,
        sourceUrl: "https://example.com/bath-rack",
        sourcePlatform: "1688",
        originalName: "무타공 욕실 코너 선반",
        translatedName: "욕실 무타공 코너 수납 선반",
        sourceCost: 36,
        sourceShippingFee: 6,
        optionsMemo: "화이트/그레이 2색, 단일 사이즈",
        estimatedWeight: "0.7kg",
        estimatedVolume: "30x18x8cm",
        sourcingMemo: "가볍고 파손 위험 낮음",
        currentStatus: "selection_proceed"
      }
    }),
    prisma.product.create({
      data: {
        sourcingSessionId: bath.id,
        sourcePlatform: "1688",
        originalName: "대형 접이식 세탁 바구니",
        translatedName: "대형 접이식 빨래 바구니",
        sourceCost: 52,
        sourceShippingFee: 12,
        optionsMemo: "대형이라 부피 배송비 확인 필요",
        estimatedWeight: "1.8kg",
        estimatedVolume: "60x40x8cm",
        currentStatus: "selection_hold"
      }
    }),
    prisma.product.create({
      data: {
        sourcingSessionId: bath.id,
        sourcePlatform: "Taobao",
        originalName: "캐릭터 욕실 매트",
        translatedName: "캐릭터 디자인 욕실 매트",
        sourceCost: 28,
        optionsMemo: "캐릭터 이미지 포함",
        currentStatus: "selection_exclude"
      }
    }),
    prisma.product.create({
      data: {
        sourcingSessionId: office.id,
        sourcePlatform: "1688",
        originalName: "데스크 케이블 정리 클립",
        translatedName: "책상 케이블 정리 클립",
        sourceCost: 4.8,
        sourceShippingFee: 2,
        optionsMemo: "색상 3종, 세트 구성",
        estimatedWeight: "0.1kg",
        currentStatus: "selection_proceed"
      }
    }),
    prisma.product.create({
      data: {
        sourcingSessionId: office.id,
        sourcePlatform: "AliExpress",
        originalName: "알루미늄 데스크 오거나이저",
        translatedName: "알루미늄 책상 정리함",
        sourceCost: 98,
        sourceShippingFee: 24,
        optionsMemo: "국내 판매가와 마진 추가 확인 필요",
        currentStatus: "selection_hold"
      }
    })
  ]);

  await prisma.selectionReview.createMany({
    data: [
      {
        productId: products[0].id,
        selectionStatus: "proceed",
        demandSignal: "medium",
        competitionLevel: "medium",
        priceAttractiveness: "good",
        sourcingDifficulty: "easy",
        selectionScore: 78,
        reasonCodesJson: reason([]),
        riskCodesJson: reason([]),
        sourcePrice: 36,
        sourceShippingFee: 6,
        exchangeRate: 185,
        exchangeRateBufferPercent: 5,
        paymentFeePercent: 3,
        estimatedInternationalShippingFee: 5500,
        domesticShippingFee: 3500,
        marketplaceFeePercent: 12,
        returnLossRiskBuffer: 1500,
        targetMarginPercent: 20,
        totalEstimatedCost: 18766,
        breakEvenPrice: 21325,
        recommendedSellingPrice: 26656,
        estimatedNetProfit: 3199,
        estimatedMarginRate: 12,
        priceCompetitivenessMemo: "국내 경쟁가 확인 후 판매가 조정 필요",
        reviewerNote: "초기 테스트 가능"
      },
      {
        productId: products[1].id,
        selectionStatus: "hold",
        demandSignal: "medium",
        competitionLevel: "high",
        priceAttractiveness: "uncertain",
        sourcingDifficulty: "medium",
        selectionScore: 55,
        reasonCodesJson: reason(["HEAVY_OR_BULKY", "SHIPPING_COST_RISK"]),
        riskCodesJson: reason(["HEAVY_OR_BULKY"]),
        reviewerNote: "부피무게 확인 후 진행"
      },
      {
        productId: products[2].id,
        selectionStatus: "exclude",
        demandSignal: "uncertain",
        competitionLevel: "high",
        priceAttractiveness: "poor",
        sourcingDifficulty: "hard",
        selectionScore: 25,
        reasonCodesJson: reason(["IP_OR_BRAND_RISK"]),
        riskCodesJson: reason(["IP_BRAND_CHARACTER_LOGO"]),
        reviewerNote: "캐릭터/IP 리스크로 초보 운영 제외"
      },
      {
        productId: products[3].id,
        selectionStatus: "proceed",
        demandSignal: "high",
        competitionLevel: "high",
        priceAttractiveness: "good",
        sourcingDifficulty: "easy",
        selectionScore: 74,
        reasonCodesJson: reason([]),
        riskCodesJson: reason([]),
        reviewerNote: "소형 저위험 후보"
      },
      {
        productId: products[4].id,
        selectionStatus: "hold",
        demandSignal: "medium",
        competitionLevel: "high",
        priceAttractiveness: "uncertain",
        sourcingDifficulty: "medium",
        selectionScore: 48,
        reasonCodesJson: reason(["MARGIN_TOO_LOW"]),
        riskCodesJson: reason([]),
        reviewerNote: "국내 경쟁가 대비 마진 부족 가능성"
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
