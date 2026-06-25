import PaymentMethodClient from "./PaymentMethodClient";
import { getPaymentMethods } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaymentMethodPage() {
  const paymentMethods = await getPaymentMethods();

  return <PaymentMethodClient paymentMethods={paymentMethods} />;
}
