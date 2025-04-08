import { supabase } from "../supabase";

export async function fetchGroupedProductsFromBackend() {
  const { data, error } = await supabase.rpc("get_products_with_prices");

  if (error) {
    console.error("Error fetching grouped products:", error);
    return [];
  }

  return data.map((row) => row.product);
}
