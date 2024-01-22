// Production Price ID, can be overridden by env variable
export const PAYMENT_LINK: {[planId: string]: string} = {
  start_monthly: 'https://buy.stripe.com/28o9BM00bbvreJOcMQ',
  start_yearly: 'https://buy.stripe.com/6oE5lw8wH8jf59e6or',
  pro_monthly: 'https://buy.stripe.com/9AQg0a9AL8jfgRW6oq',
  pro_yearly: 'https://buy.stripe.com/4gw29k3cndDz8lqcMN',
};

export const PRICE_ID: {[planId: string]: string} = {
  start_monthly: 'price_1Ob7VLEoPi5YaDciRQ77xvd6',
  start_yearly: 'price_1Ob7WDEoPi5YaDcivvMW4yfV',
  pro_monthly: 'price_1Ob7cgEoPi5YaDcihpFs8aF0',
  pro_yearly: 'price_1Ob7dhEoPi5YaDcis61mNtME',
};
