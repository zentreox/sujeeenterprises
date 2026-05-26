import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { seedCategories = true, seedBrands = true, seedProducts = true, seedUsers = true, seedWarehouseInventory = true } = body;

    const results: { message: string; seeded: string[] } = {
      message: "Seed completed successfully",
      seeded: [],
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const headers = {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal",
    };

    // Seed Categories
    if (seedCategories) {
      const categories = [
        { name: "Kitchen", slug: "kitchen", sort_order: 1 },
        { name: "Appliances", slug: "appliances", sort_order: 2 },
        { name: "Electronics", slug: "electronics", sort_order: 3 },
        { name: "Furniture", slug: "furniture", sort_order: 4 },
        { name: "Other", slug: "other", sort_order: 5 },
      ];

      for (const cat of categories) {
        await fetch(`${supabaseUrl}/rest/v1/categories`, {
          headers,
          method: "POST",
          body: JSON.stringify(cat),
        });
      }
      results.seeded.push("categories");
    }

    // Seed Brands
    if (seedBrands) {
      const brands = ["Singer", "Abans", "LG", "Samsung", "Philips", "Hitachi", "Innovex", "Damro", "Other"];

      for (const brand of brands) {
        await fetch(`${supabaseUrl}/rest/v1/brands`, {
          headers,
          method: "POST",
          body: JSON.stringify({ name: brand }),
        });
      }
      results.seeded.push("brands");
    }

    // Get categories and brands for product seeding
    const catRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
    });
    const categories = await catRes.json();

    const brandRes = await fetch(`${supabaseUrl}/rest/v1/brands`, {
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
    });
    const brands = await brandRes.json();

    const getCatId = (name: string) => (categories as any[]).find((c: any) => c.name === name)?.id;
    const getBrandId = (name: string) => (brands as any[]).find((b: any) => b.name === name)?.id;

    // Seed Products
    if (seedProducts) {
      const products = [
        { code: "RC-28", barcode: "4891234500011", name: "Singer Rice Cooker 2.8L", category_id: getCatId("Kitchen"), brand_id: getBrandId("Singer"), cost_price: 850000, cash_price: 1150000, installment_price: 1390000, low_stock_threshold: 10 },
        { code: "EK-15", barcode: "4891234500028", name: "Abans Electric Kettle", category_id: getCatId("Kitchen"), brand_id: getBrandId("Abans"), cost_price: 320000, cash_price: 450000, installment_price: 540000, low_stock_threshold: 10 },
        { code: "SF-16", barcode: "4891234500035", name: "Innovex Stand Fan 16\"", category_id: getCatId("Appliances"), brand_id: getBrandId("Innovex"), cost_price: 780000, cash_price: 1090000, installment_price: 1320000, low_stock_threshold: 8 },
        { code: "TV-32H", barcode: "4891234500042", name: "LG TV 32\" HD", category_id: getCatId("Electronics"), brand_id: getBrandId("LG"), cost_price: 4200000, cash_price: 5490000, installment_price: 6450000, low_stock_threshold: 5 },
        { code: "GC-2B", barcode: "4891234500059", name: "Singer Gas Cooker 2B", category_id: getCatId("Kitchen"), brand_id: getBrandId("Singer"), cost_price: 1150000, cash_price: 1540000, installment_price: 1820000, low_stock_threshold: 6 },
        { code: "RF-190", barcode: "4891234500066", name: "Hitachi Refrigerator 190L", category_id: getCatId("Appliances"), brand_id: getBrandId("Hitachi"), cost_price: 7800000, cash_price: 9650000, installment_price: 11400000, low_stock_threshold: 4 },
        { code: "PC-01", barcode: "4891234500073", name: "Damro Plastic Chair", category_id: getCatId("Furniture"), brand_id: getBrandId("Damro"), cost_price: 180000, cash_price: 260000, installment_price: 310000, low_stock_threshold: 30 },
        { code: "IR-ST", barcode: "4891234500080", name: "Philips Iron Steam", category_id: getCatId("Appliances"), brand_id: getBrandId("Philips"), cost_price: 420000, cash_price: 590000, installment_price: 710000, low_stock_threshold: 8 },
        { code: "SM-01", barcode: "4891234500097", name: "Singer Sewing Machine", category_id: getCatId("Appliances"), brand_id: getBrandId("Singer"), cost_price: 2800000, cash_price: 3650000, installment_price: 4350000, low_stock_threshold: 4 },
        { code: "BL-15", barcode: "4891234500103", name: "Innovex Blender 1.5L", category_id: getCatId("Kitchen"), brand_id: getBrandId("Innovex"), cost_price: 390000, cash_price: 540000, installment_price: 650000, low_stock_threshold: 10 },
      ];

      for (const product of products) {
        if (product.category_id && product.brand_id) {
          await fetch(`${supabaseUrl}/rest/v1/products`, {
            headers,
            method: "POST",
            body: JSON.stringify({ ...product, is_active: true }),
          });
        }
      }
      results.seeded.push("products");
    }

    // Seed Demo Users
    if (seedUsers) {
      const demoUsers = [
        { email: "owner@sujee.lk", name: "Owner", role: "admin" },
        { email: "stock@sujee.lk", name: "Stock Manager", role: "stock_manager" },
        { email: "lorry@sujee.lk", name: "Lorry Manager", role: "lorry_manager" },
        { email: "sales@sujee.lk", name: "Sales Staff", role: "sales_staff" },
        { email: "collector@sujee.lk", name: "Cash Collector", role: "collector" },
      ];

      for (const user of demoUsers) {
        await fetch(`${supabaseUrl}/rest/v1/users`, {
          headers,
          method: "POST",
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: true,
            commission_rate: 0.04,
          }),
        });
      }
      results.seeded.push("users");
    }

    // Seed Warehouse Inventory
    if (seedWarehouseInventory) {
      // Get warehouse and products
      const whRes = await fetch(`${supabaseUrl}/rest/v1/warehouses`, {
        headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
      });
      const warehouses = await whRes.json();
      const warehouseId = (warehouses as any[])[0]?.id;

      const prodRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
        headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
      });
      const products = await prodRes.json();

      if (warehouseId && products.length > 0) {
        const stockQty = [42, 18, 27, 9, 14, 6, 120, 4, 11, 22];
        for (let i = 0; i < products.length; i++) {
          const product = (products as any[])[i];
          await fetch(`${supabaseUrl}/rest/v1/inventory_warehouse`, {
            headers,
            method: "POST",
            body: JSON.stringify({
              warehouse_id: warehouseId,
              product_id: product.id,
              quantity: stockQty[i % stockQty.length],
            }),
          });
        }
        results.seeded.push("warehouse_inventory");
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
