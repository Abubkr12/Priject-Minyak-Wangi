"use server";

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Cart } from '@/lib/types';

const supabaseAdmin = createAdminClient();

function generateOrderCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MW-${timestamp}-${random}`;
}

export async function validateVoucher(code: string, subtotal: number, shippingCost: number) {
  try {
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !voucher) return { error: 'Voucher tidak ditemukan.' };
    
    if (!voucher.is_active) return { error: 'Voucher tidak aktif.' };
    
    const now = new Date();
    if (voucher.valid_from && new Date(voucher.valid_from) > now) return { error: 'Voucher belum berlaku.' };
    if (voucher.valid_until && new Date(voucher.valid_until) < now) return { error: 'Voucher sudah kadaluarsa.' };
    
    if (voucher.quota > 0 && voucher.used_count >= voucher.quota) return { error: 'Kuota voucher telah habis.' };
    if (voucher.min_purchase > 0 && subtotal < voucher.min_purchase) return { error: `Minimal belanja Rp ${voucher.min_purchase.toLocaleString('id-ID')}` };

    let discountAmount = 0;
    if (voucher.type === 'percentage') {
      discountAmount = Math.floor(subtotal * (voucher.value / 100));
      if (voucher.max_discount > 0 && discountAmount > voucher.max_discount) {
        discountAmount = voucher.max_discount;
      }
    } else if (voucher.type === 'fixed') {
      discountAmount = voucher.value;
    } else if (voucher.type === 'free_shipping') {
      discountAmount = shippingCost; // Assuming free shipping covers the entire shipping cost or up to `value`?
      // If `value` > 0, it might mean Max Free Shipping Discount.
      if (voucher.value > 0 && shippingCost > voucher.value) {
        discountAmount = voucher.value;
      }
    }

    if (discountAmount <= 0) return { error: 'Voucher tidak memberikan potongan.' };

    return { success: true, voucher, discountAmount };
  } catch (err: any) {
    return { error: 'Terjadi kesalahan sistem.' };
  }
}

export async function processCheckout(formData: FormData, cart: Cart, subtotal: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Harap login terlebih dahulu untuk checkout.' };
    if (!cart || cart.items.length === 0) return { error: 'Keranjang belanja kosong.' };

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const shippingCostStr = formData.get('shippingCost') as string;
    const courierInfo = formData.get('courierInfo') as string;
    const voucherCode = formData.get('voucherCode') as string;
    const paymentMethodIdStr = formData.get('paymentMethodId') as string;
    const paymentMethodId = paymentMethodIdStr ? parseInt(paymentMethodIdStr, 10) : null;
    
    const shippingCost = parseInt(shippingCostStr || "0", 10);
    let discount = 0;
    let appliedVoucherId = null;

    if (voucherCode) {
      const vRes = await validateVoucher(voucherCode, subtotal, shippingCost);
      if (vRes.success && vRes.discountAmount) {
        discount = vRes.discountAmount;
        appliedVoucherId = vRes.voucher.id;
      } else {
        return { error: 'Voucher tidak valid: ' + vRes.error };
      }
    }

    let paymentMethodLabel = 'Transfer/QRIS manual';
    if (paymentMethodId) {
      const { data: paymentMethod } = await supabaseAdmin
        .from('payment_methods')
        .select('id,type,bank_name,account_number,account_name,is_active')
        .eq('id', paymentMethodId)
        .eq('is_active', true)
        .single();

      if (!paymentMethod) {
        return { error: 'Metode pembayaran tidak tersedia. Silakan pilih metode lain.' };
      }

      paymentMethodLabel = paymentMethod.type === 'qris'
        ? paymentMethod.bank_name
        : `${paymentMethod.bank_name} - ${paymentMethod.account_number} a.n. ${paymentMethod.account_name}`;
    }

    // Generate Unique Code 1 - 999
    const uniqueCode = Math.floor(Math.random() * 999) + 1;
    const total = subtotal + shippingCost - discount + uniqueCode;
    const orderCode = generateOrderCode();

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        customer_id: user.id,
        customer_name: fullName,
        customer_phone: phone,
        customer_address: address,
        subtotal: subtotal,
        discount: discount,
        shipping_cost: shippingCost,
        courier_name: courierInfo,
        total: total,
        status: 'pending',
        payment_method: paymentMethodLabel,
        notes: `Kurir: ${courierInfo} | Pembayaran: ${paymentMethodLabel} | Kode Unik: ${uniqueCode}${voucherCode ? ` | Voucher: ${voucherCode}` : ''}`
      })
      .select('id')
      .single();

    if (orderError) return { error: 'Gagal membuat pesanan: ' + orderError.message };

    const orderItemsData = cart.items.map(item => ({
      order_id: orderData.id,
      perfume_id: item.perfumeId,
      size_id: item.sizeId,
      perfume_name: item.perfumeName,
      size_label: item.sizeLabel,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(orderItemsData);
    if (itemsError) return { error: 'Gagal menyimpan detail pesanan: ' + itemsError.message };

    // Increment voucher used_count
    if (appliedVoucherId) {
      const { data: v } = await supabaseAdmin.from('vouchers').select('used_count').eq('id', appliedVoucherId).single();
      if (v) {
        await supabaseAdmin.from('vouchers').update({ used_count: v.used_count + 1 }).eq('id', appliedVoucherId);
      }
    }

    return { url: `/checkout/success?id=${orderData.id}`, success: true };
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return { error: 'Terjadi kesalahan sistem internal: ' + err.message };
  }
}
