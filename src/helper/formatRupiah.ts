export const formatRupiah = (number?: number) => {
  if (number === undefined) return "0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

export default formatRupiah;
