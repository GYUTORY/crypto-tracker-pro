const axios = require('axios');

async function testExchangeRate() {
  console.log('=== 실시간 환율 API 테스트 ===');
  
  try {
    // ExchangeRate-API 테스트
    console.log('1. ExchangeRate-API 테스트...');
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Crypto-Tracker-Pro/1.0'
      }
    });
    
    if (response.data.rates && response.data.rates.KRW) {
      console.log(`✅ ExchangeRate-API 성공: 1 USD = ${response.data.rates.KRW} KRW`);
      return response.data.rates.KRW;
    }
  } catch (error) {
    console.log(`❌ ExchangeRate-API 실패: ${error.message}`);
  }
  
  try {
    // CurrencyAPI 테스트
    console.log('2. CurrencyAPI 테스트...');
    const response = await axios.get('https://api.currencyapi.com/v3/latest?apikey=free&currencies=KRW&base_currency=USD', {
      timeout: 5000
    });
    
    if (response.data.data && response.data.data.KRW && response.data.data.KRW.value) {
      console.log(`✅ CurrencyAPI 성공: 1 USD = ${response.data.data.KRW.value} KRW`);
      return response.data.data.KRW.value;
    }
  } catch (error) {
    console.log(`❌ CurrencyAPI 실패: ${error.message}`);
  }
  
  try {
    // Open Exchange Rates 테스트
    console.log('3. Open Exchange Rates 테스트...');
    const response = await axios.get('https://open.er-api.com/v6/latest/USD', {
      timeout: 5000
    });
    
    if (response.data.rates && response.data.rates.KRW) {
      console.log(`✅ Open Exchange Rates 성공: 1 USD = ${response.data.rates.KRW} KRW`);
      return response.data.rates.KRW;
    }
  } catch (error) {
    console.log(`❌ Open Exchange Rates 실패: ${error.message}`);
  }
  
  console.log('❌ 모든 환율 API 실패, 기본값 사용');
  return 1350; // 2025년 8월 기준 기본값
}

// 테스트 실행
testExchangeRate().then(rate => {
  console.log(`\n최종 환율: 1 USD = ${rate} KRW`);
  
  // SHIB 예시 계산
  const shibUsdtPrice = 0.00001262;
  const shibKrwPrice = shibUsdtPrice * rate;
  console.log(`SHIB 예시: ${shibUsdtPrice} USDT = ${shibKrwPrice.toFixed(4)} KRW`);
}); 