import { useState } from "react";
import { useGetProducts, useGetCategories, useUpdateProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Plus, Filter, Image as ImageIcon } from "lucide-react";

export default function Menu() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: products, isLoading: loadingProducts } = useGetProducts({ 
    categoryId: activeCategory,
    search: search || undefined
  });

  const updateProduct = useUpdateProduct();

  const handleToggleAvailability = (id: number, isAvailable: boolean) => {
    updateProduct.mutate(
      { id, data: { isAvailable } },
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة المنتج");
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] animate-in fade-in duration-500 gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">قائمة الطعام</h1>
          <p className="text-muted-foreground">إدارة المنتجات والأصناف المتاحة للبيع</p>
        </div>
        <Button className="shrink-0"><Plus className="ml-2 h-4 w-4" /> إضافة منتج جديد</Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Categories Sidebar */}
        <Card className="w-full lg:w-64 shrink-0 border-border/50 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-muted/20 font-bold flex items-center gap-2">
            <Filter size={18} />
            التصنيفات
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-right px-4 py-3 rounded-lg transition-colors font-medium ${
                activeCategory === null ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
              }`}
            >
              كل التصنيفات
            </button>
            {loadingCategories ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
            ) : (
              categories?.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-right px-4 py-3 rounded-lg transition-colors font-medium flex justify-between items-center ${
                    activeCategory === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{category.nameAr || category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeCategory === category.id ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}>
                    {category.productCount}
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Products Grid */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <div className="mb-4 shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="البحث في المنتجات..." 
                className="pl-4 pr-10 bg-card border-border/50 h-12"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loadingProducts ? (
                [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)
              ) : products?.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
                  <Search size={48} className="mb-4 opacity-20" />
                  <h2 className="text-xl font-bold mb-2">لا توجد منتجات</h2>
                  <p>جرب تغيير مصطلح البحث أو التصنيف</p>
                </div>
              ) : (
                products?.map(product => (
                  <Card key={product.id} className={`overflow-hidden transition-all duration-300 border-2 ${
                    product.isAvailable ? 'border-border/50 hover:border-primary/50' : 'border-muted opacity-60 grayscale-[0.5]'
                  }`}>
                    <div className="aspect-[4/3] bg-muted relative">
                      {product.image ? (
                        <img src={product.image} alt={product.nameAr} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-secondary/50">
                          <ImageIcon size={48} className="mb-2" />
                          <span className="text-sm font-medium">لا توجد صورة</span>
                        </div>
                      )}
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                          <Badge variant="destructive" className="text-base py-1 px-4 border-2 border-white/20 shadow-xl">غير متوفر</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg leading-tight line-clamp-1 flex-1" title={product.nameAr || product.name}>
                          {product.nameAr || product.name}
                        </h3>
                        <div className="font-black text-primary whitespace-nowrap mr-2">
                          {product.price.toFixed(2)} د.ك
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-4">
                        {product.categoryName}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm font-medium text-foreground">متوفر للبيع</span>
                        <Switch 
                          checked={product.isAvailable} 
                          onCheckedChange={(checked) => handleToggleAvailability(product.id, checked)}
                          className={product.isAvailable ? "bg-green-500" : ""}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}