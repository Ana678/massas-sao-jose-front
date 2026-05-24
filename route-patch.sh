cat << 'PATCH' > route.patch
--- src/lib/hooks/useOrders.ts
+++ src/lib/hooks/useOrders.ts
@@ -45,6 +45,31 @@
     }[];
 }
 
+export interface RouteOrderResponse {
+    id: string;
+    clientId: string;
+    type: string;
+    paymentMethod: string;
+    isPaid: boolean;
+    deliveryFee: string | number;
+    createdAt: string;
+    client: {
+        id: string;
+        name: string;
+        phone: string;
+        cityId: string;
+    };
+    products: {
+        id: string;
+        name: string;
+        price: string | number;
+        quantity: string | number;
+        unitPrice: string | number;
+    }[];
+}
+
+export function useOrdersByCities(cityIds: string[]) {
+    return useQuery({
+        queryKey: ['orders-by-cities', cityIds],
+        queryFn: async () => {
+            const response = await api.post<RouteOrderResponse[]>('/orders/by-cities', { cityIds });
+            return response.data;
+        },
+        enabled: cityIds.length > 0,
+    });
+}
+
 export function useOrdersList(page = 1, limit = 100) {
     return useQuery({
PATCH
patch -p0 < route.patch
