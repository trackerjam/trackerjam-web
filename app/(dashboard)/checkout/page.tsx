import {Checkout} from '../../../components/checkout/checkout';

export default function CheckoutPage() {
  return (
    <div>
      <h1 className="font-bold text-28 mb-4 leading-tight flex items-center gap-2">
        Processing checkout...
      </h1>
      <Checkout />
    </div>
  );
}
