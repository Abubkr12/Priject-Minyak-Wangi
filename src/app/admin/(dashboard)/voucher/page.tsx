import { getVouchers } from "./actions";
import VoucherClient from "./VoucherClient";

export const metadata = {
  title: "Kelola Voucher | Admin Minyak Wangi",
};

export default async function VoucherPage() {
  const vouchers = await getVouchers();

  return (
    <div>
      <VoucherClient initialVouchers={vouchers} />
    </div>
  );
}
