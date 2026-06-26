import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Category, CategoryInput, CategoryUpdate, ChartDataPoint, Customer, CustomerInput, CustomerUpdate, DashboardSummary, Employee, EmployeeInput, EmployeeUpdate, GetCustomersParams, GetEmployeesParams, GetInventoryItemsParams, GetOrdersParams, GetProductsParams, GetProductsReportParams, GetRecentOrdersParams, GetSalesChartParams, GetSalesReportParams, GetTablesParams, GetTopProductsParams, HealthStatus, InventoryItem, InventoryItemInput, InventoryItemUpdate, InventorySummary, Order, OrderInput, OrderStatusUpdate, OrderUpdate, PaymentInput, Product, ProductInput, ProductReport, ProductUpdate, SalesReport, Table, TableInput, TableUpdate, TopProduct } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDashboardSummaryUrl: () => string;
/**
 * @summary Get dashboard summary statistics
 */
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary statistics
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSalesChartUrl: (params?: GetSalesChartParams) => string;
/**
 * @summary Get sales chart data
 */
export declare const getSalesChart: (params?: GetSalesChartParams, options?: RequestInit) => Promise<ChartDataPoint[]>;
export declare const getGetSalesChartQueryKey: (params?: GetSalesChartParams) => readonly ["/api/dashboard/sales-chart", ...GetSalesChartParams[]];
export declare const getGetSalesChartQueryOptions: <TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(params?: GetSalesChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesChartQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesChart>>>;
export type GetSalesChartQueryError = ErrorType<unknown>;
/**
 * @summary Get sales chart data
 */
export declare function useGetSalesChart<TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(params?: GetSalesChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTopProductsUrl: (params?: GetTopProductsParams) => string;
/**
 * @summary Get top selling products
 */
export declare const getTopProducts: (params?: GetTopProductsParams, options?: RequestInit) => Promise<TopProduct[]>;
export declare const getGetTopProductsQueryKey: (params?: GetTopProductsParams) => readonly ["/api/dashboard/top-products", ...GetTopProductsParams[]];
export declare const getGetTopProductsQueryOptions: <TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(params?: GetTopProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTopProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getTopProducts>>>;
export type GetTopProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get top selling products
 */
export declare function useGetTopProducts<TData = Awaited<ReturnType<typeof getTopProducts>>, TError = ErrorType<unknown>>(params?: GetTopProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTopProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRecentOrdersUrl: (params?: GetRecentOrdersParams) => string;
/**
 * @summary Get recent orders
 */
export declare const getRecentOrders: (params?: GetRecentOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getGetRecentOrdersQueryKey: (params?: GetRecentOrdersParams) => readonly ["/api/dashboard/recent-orders", ...GetRecentOrdersParams[]];
export declare const getGetRecentOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getRecentOrders>>, TError = ErrorType<unknown>>(params?: GetRecentOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentOrders>>>;
export type GetRecentOrdersQueryError = ErrorType<unknown>;
/**
 * @summary Get recent orders
 */
export declare function useGetRecentOrders<TData = Awaited<ReturnType<typeof getRecentOrders>>, TError = ErrorType<unknown>>(params?: GetRecentOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetCategoriesUrl: () => string;
/**
 * @summary List all categories
 */
export declare const getCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getGetCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getGetCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof getCategories>>>;
export type GetCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all categories
 */
export declare function useGetCategories<TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCategoryUrl: () => string;
/**
 * @summary Create a new category
 */
export declare const createCategory: (categoryInput: CategoryInput, options?: RequestInit) => Promise<Category>;
export declare const getCreateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export type CreateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof createCategory>>>;
export type CreateCategoryMutationBody = BodyType<CategoryInput>;
export type CreateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Create a new category
*/
export declare const useCreateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCategory>>, TError, {
        data: BodyType<CategoryInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCategory>>, TError, {
    data: BodyType<CategoryInput>;
}, TContext>;
export declare const getGetCategoryUrl: (id: number) => string;
/**
 * @summary Get a category by ID
 */
export declare const getCategory: (id: number, options?: RequestInit) => Promise<Category>;
export declare const getGetCategoryQueryKey: (id: number) => readonly [`/api/categories/${number}`];
export declare const getGetCategoryQueryOptions: <TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryQueryResult = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type GetCategoryQueryError = ErrorType<unknown>;
/**
 * @summary Get a category by ID
 */
export declare function useGetCategory<TData = Awaited<ReturnType<typeof getCategory>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCategoryUrl: (id: number) => string;
/**
 * @summary Update a category
 */
export declare const updateCategory: (id: number, categoryUpdate: CategoryUpdate, options?: RequestInit) => Promise<Category>;
export declare const getUpdateCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export type UpdateCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof updateCategory>>>;
export type UpdateCategoryMutationBody = BodyType<CategoryUpdate>;
export type UpdateCategoryMutationError = ErrorType<unknown>;
/**
* @summary Update a category
*/
export declare const useUpdateCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCategory>>, TError, {
        id: number;
        data: BodyType<CategoryUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCategory>>, TError, {
    id: number;
    data: BodyType<CategoryUpdate>;
}, TContext>;
export declare const getDeleteCategoryUrl: (id: number) => string;
/**
 * @summary Delete a category
 */
export declare const deleteCategory: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCategoryMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export type DeleteCategoryMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCategory>>>;
export type DeleteCategoryMutationError = ErrorType<unknown>;
/**
* @summary Delete a category
*/
export declare const useDeleteCategory: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCategory>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCategory>>, TError, {
    id: number;
}, TContext>;
export declare const getGetProductsUrl: (params?: GetProductsParams) => string;
/**
 * @summary List all products
 */
export declare const getProducts: (params?: GetProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getGetProductsQueryKey: (params?: GetProductsParams) => readonly ["/api/products", ...GetProductsParams[]];
export declare const getGetProductsQueryOptions: <TData = Awaited<ReturnType<typeof getProducts>>, TError = ErrorType<unknown>>(params?: GetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getProducts>>>;
export type GetProductsQueryError = ErrorType<unknown>;
/**
 * @summary List all products
 */
export declare function useGetProducts<TData = Awaited<ReturnType<typeof getProducts>>, TError = ErrorType<unknown>>(params?: GetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductUrl: () => string;
/**
 * @summary Create a new product
 */
export declare const createProduct: (productInput: ProductInput, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<ProductInput>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
* @summary Create a new product
*/
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export declare const getGetProductUrl: (id: number) => string;
/**
 * @summary Get a product by ID
 */
export declare const getProduct: (id: number, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (id: number) => readonly [`/api/products/${number}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<unknown>;
/**
 * @summary Get a product by ID
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProductUrl: (id: number) => string;
/**
 * @summary Update a product
 */
export declare const updateProduct: (id: number, productUpdate: ProductUpdate, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<ProductUpdate>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
* @summary Update a product
*/
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        id: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    id: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export declare const getDeleteProductUrl: (id: number) => string;
/**
 * @summary Delete a product
 */
export declare const deleteProduct: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
* @summary Delete a product
*/
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    id: number;
}, TContext>;
export declare const getGetTablesUrl: (params?: GetTablesParams) => string;
/**
 * @summary List all tables
 */
export declare const getTables: (params?: GetTablesParams, options?: RequestInit) => Promise<Table[]>;
export declare const getGetTablesQueryKey: (params?: GetTablesParams) => readonly ["/api/tables", ...GetTablesParams[]];
export declare const getGetTablesQueryOptions: <TData = Awaited<ReturnType<typeof getTables>>, TError = ErrorType<unknown>>(params?: GetTablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTablesQueryResult = NonNullable<Awaited<ReturnType<typeof getTables>>>;
export type GetTablesQueryError = ErrorType<unknown>;
/**
 * @summary List all tables
 */
export declare function useGetTables<TData = Awaited<ReturnType<typeof getTables>>, TError = ErrorType<unknown>>(params?: GetTablesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTables>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTableUrl: () => string;
/**
 * @summary Create a new table
 */
export declare const createTable: (tableInput: TableInput, options?: RequestInit) => Promise<Table>;
export declare const getCreateTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
        data: BodyType<TableInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
    data: BodyType<TableInput>;
}, TContext>;
export type CreateTableMutationResult = NonNullable<Awaited<ReturnType<typeof createTable>>>;
export type CreateTableMutationBody = BodyType<TableInput>;
export type CreateTableMutationError = ErrorType<unknown>;
/**
* @summary Create a new table
*/
export declare const useCreateTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTable>>, TError, {
        data: BodyType<TableInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTable>>, TError, {
    data: BodyType<TableInput>;
}, TContext>;
export declare const getGetTableUrl: (id: number) => string;
/**
 * @summary Get a table by ID
 */
export declare const getTable: (id: number, options?: RequestInit) => Promise<Table>;
export declare const getGetTableQueryKey: (id: number) => readonly [`/api/tables/${number}`];
export declare const getGetTableQueryOptions: <TData = Awaited<ReturnType<typeof getTable>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTable>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTable>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTableQueryResult = NonNullable<Awaited<ReturnType<typeof getTable>>>;
export type GetTableQueryError = ErrorType<unknown>;
/**
 * @summary Get a table by ID
 */
export declare function useGetTable<TData = Awaited<ReturnType<typeof getTable>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTable>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateTableUrl: (id: number) => string;
/**
 * @summary Update a table status
 */
export declare const updateTable: (id: number, tableUpdate: TableUpdate, options?: RequestInit) => Promise<Table>;
export declare const getUpdateTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
        id: number;
        data: BodyType<TableUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
    id: number;
    data: BodyType<TableUpdate>;
}, TContext>;
export type UpdateTableMutationResult = NonNullable<Awaited<ReturnType<typeof updateTable>>>;
export type UpdateTableMutationBody = BodyType<TableUpdate>;
export type UpdateTableMutationError = ErrorType<unknown>;
/**
* @summary Update a table status
*/
export declare const useUpdateTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTable>>, TError, {
        id: number;
        data: BodyType<TableUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTable>>, TError, {
    id: number;
    data: BodyType<TableUpdate>;
}, TContext>;
export declare const getDeleteTableUrl: (id: number) => string;
/**
 * @summary Delete a table
 */
export declare const deleteTable: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteTableMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
    id: number;
}, TContext>;
export type DeleteTableMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTable>>>;
export type DeleteTableMutationError = ErrorType<unknown>;
/**
* @summary Delete a table
*/
export declare const useDeleteTable: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTable>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTable>>, TError, {
    id: number;
}, TContext>;
export declare const getGetOrdersUrl: (params?: GetOrdersParams) => string;
/**
 * @summary List all orders
 */
export declare const getOrders: (params?: GetOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getGetOrdersQueryKey: (params?: GetOrdersParams) => readonly ["/api/orders", ...GetOrdersParams[]];
export declare const getGetOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getOrders>>>;
export type GetOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List all orders
 */
export declare function useGetOrders<TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Create a new order
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<unknown>;
/**
* @summary Create a new order
*/
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getGetOrderUrl: (id: number) => string;
/**
 * @summary Get an order by ID
 */
export declare const getOrder: (id: number, options?: RequestInit) => Promise<Order>;
export declare const getGetOrderQueryKey: (id: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<unknown>;
/**
 * @summary Get an order by ID
 */
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateOrderUrl: (id: number) => string;
/**
 * @summary Update an order
 */
export declare const updateOrder: (id: number, orderUpdate: OrderUpdate, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
        id: number;
        data: BodyType<OrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
    id: number;
    data: BodyType<OrderUpdate>;
}, TContext>;
export type UpdateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrder>>>;
export type UpdateOrderMutationBody = BodyType<OrderUpdate>;
export type UpdateOrderMutationError = ErrorType<unknown>;
/**
* @summary Update an order
*/
export declare const useUpdateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrder>>, TError, {
        id: number;
        data: BodyType<OrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrder>>, TError, {
    id: number;
    data: BodyType<OrderUpdate>;
}, TContext>;
export declare const getDeleteOrderUrl: (id: number) => string;
/**
 * @summary Delete an order
 */
export declare const deleteOrder: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOrder>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteOrder>>, TError, {
    id: number;
}, TContext>;
export type DeleteOrderMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOrder>>>;
export type DeleteOrderMutationError = ErrorType<unknown>;
/**
* @summary Delete an order
*/
export declare const useDeleteOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOrder>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteOrder>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateOrderStatusUrl: (id: number) => string;
/**
 * @summary Update order status
 */
export declare const updateOrderStatus: (id: number, orderStatusUpdate: OrderStatusUpdate, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusUpdate>;
}, TContext>;
export type UpdateOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;
export type UpdateOrderStatusMutationBody = BodyType<OrderStatusUpdate>;
export type UpdateOrderStatusMutationError = ErrorType<unknown>;
/**
* @summary Update order status
*/
export declare const useUpdateOrderStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusUpdate>;
}, TContext>;
export declare const getPayOrderUrl: (id: number) => string;
/**
 * @summary Process payment for an order
 */
export declare const payOrder: (id: number, paymentInput: PaymentInput, options?: RequestInit) => Promise<Order>;
export declare const getPayOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof payOrder>>, TError, {
        id: number;
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof payOrder>>, TError, {
    id: number;
    data: BodyType<PaymentInput>;
}, TContext>;
export type PayOrderMutationResult = NonNullable<Awaited<ReturnType<typeof payOrder>>>;
export type PayOrderMutationBody = BodyType<PaymentInput>;
export type PayOrderMutationError = ErrorType<unknown>;
/**
* @summary Process payment for an order
*/
export declare const usePayOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof payOrder>>, TError, {
        id: number;
        data: BodyType<PaymentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof payOrder>>, TError, {
    id: number;
    data: BodyType<PaymentInput>;
}, TContext>;
export declare const getGetKitchenOrdersUrl: () => string;
/**
 * @summary Get active kitchen orders
 */
export declare const getKitchenOrders: (options?: RequestInit) => Promise<Order[]>;
export declare const getGetKitchenOrdersQueryKey: () => readonly ["/api/orders/kitchen"];
export declare const getGetKitchenOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getKitchenOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getKitchenOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getKitchenOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetKitchenOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getKitchenOrders>>>;
export type GetKitchenOrdersQueryError = ErrorType<unknown>;
/**
 * @summary Get active kitchen orders
 */
export declare function useGetKitchenOrders<TData = Awaited<ReturnType<typeof getKitchenOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getKitchenOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetCustomersUrl: (params?: GetCustomersParams) => string;
/**
 * @summary List all customers
 */
export declare const getCustomers: (params?: GetCustomersParams, options?: RequestInit) => Promise<Customer[]>;
export declare const getGetCustomersQueryKey: (params?: GetCustomersParams) => readonly ["/api/customers", ...GetCustomersParams[]];
export declare const getGetCustomersQueryOptions: <TData = Awaited<ReturnType<typeof getCustomers>>, TError = ErrorType<unknown>>(params?: GetCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomersQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomers>>>;
export type GetCustomersQueryError = ErrorType<unknown>;
/**
 * @summary List all customers
 */
export declare function useGetCustomers<TData = Awaited<ReturnType<typeof getCustomers>>, TError = ErrorType<unknown>>(params?: GetCustomersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCustomerUrl: () => string;
/**
 * @summary Create a new customer
 */
export declare const createCustomer: (customerInput: CustomerInput, options?: RequestInit) => Promise<Customer>;
export declare const getCreateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
export type CreateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof createCustomer>>>;
export type CreateCustomerMutationBody = BodyType<CustomerInput>;
export type CreateCustomerMutationError = ErrorType<unknown>;
/**
* @summary Create a new customer
*/
export declare const useCreateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCustomer>>, TError, {
        data: BodyType<CustomerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCustomer>>, TError, {
    data: BodyType<CustomerInput>;
}, TContext>;
export declare const getGetCustomerUrl: (id: number) => string;
/**
 * @summary Get a customer by ID
 */
export declare const getCustomer: (id: number, options?: RequestInit) => Promise<Customer>;
export declare const getGetCustomerQueryKey: (id: number) => readonly [`/api/customers/${number}`];
export declare const getGetCustomerQueryOptions: <TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCustomerQueryResult = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;
export type GetCustomerQueryError = ErrorType<unknown>;
/**
 * @summary Get a customer by ID
 */
export declare function useGetCustomer<TData = Awaited<ReturnType<typeof getCustomer>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCustomer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateCustomerUrl: (id: number) => string;
/**
 * @summary Update a customer
 */
export declare const updateCustomer: (id: number, customerUpdate: CustomerUpdate, options?: RequestInit) => Promise<Customer>;
export declare const getUpdateCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
export type UpdateCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof updateCustomer>>>;
export type UpdateCustomerMutationBody = BodyType<CustomerUpdate>;
export type UpdateCustomerMutationError = ErrorType<unknown>;
/**
* @summary Update a customer
*/
export declare const useUpdateCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCustomer>>, TError, {
        id: number;
        data: BodyType<CustomerUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCustomer>>, TError, {
    id: number;
    data: BodyType<CustomerUpdate>;
}, TContext>;
export declare const getDeleteCustomerUrl: (id: number) => string;
/**
 * @summary Delete a customer
 */
export declare const deleteCustomer: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
export type DeleteCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof deleteCustomer>>>;
export type DeleteCustomerMutationError = ErrorType<unknown>;
/**
* @summary Delete a customer
*/
export declare const useDeleteCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteCustomer>>, TError, {
    id: number;
}, TContext>;
export declare const getGetInventoryItemsUrl: (params?: GetInventoryItemsParams) => string;
/**
 * @summary List all inventory items
 */
export declare const getInventoryItems: (params?: GetInventoryItemsParams, options?: RequestInit) => Promise<InventoryItem[]>;
export declare const getGetInventoryItemsQueryKey: (params?: GetInventoryItemsParams) => readonly ["/api/inventory", ...GetInventoryItemsParams[]];
export declare const getGetInventoryItemsQueryOptions: <TData = Awaited<ReturnType<typeof getInventoryItems>>, TError = ErrorType<unknown>>(params?: GetInventoryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventoryItems>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventoryItemsQueryResult = NonNullable<Awaited<ReturnType<typeof getInventoryItems>>>;
export type GetInventoryItemsQueryError = ErrorType<unknown>;
/**
 * @summary List all inventory items
 */
export declare function useGetInventoryItems<TData = Awaited<ReturnType<typeof getInventoryItems>>, TError = ErrorType<unknown>>(params?: GetInventoryItemsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItems>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateInventoryItemUrl: () => string;
/**
 * @summary Create an inventory item
 */
export declare const createInventoryItem: (inventoryItemInput: InventoryItemInput, options?: RequestInit) => Promise<InventoryItem>;
export declare const getCreateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<InventoryItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<InventoryItemInput>;
}, TContext>;
export type CreateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof createInventoryItem>>>;
export type CreateInventoryItemMutationBody = BodyType<InventoryItemInput>;
export type CreateInventoryItemMutationError = ErrorType<unknown>;
/**
* @summary Create an inventory item
*/
export declare const useCreateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<InventoryItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<InventoryItemInput>;
}, TContext>;
export declare const getGetInventoryItemUrl: (id: number) => string;
/**
 * @summary Get an inventory item by ID
 */
export declare const getInventoryItem: (id: number, options?: RequestInit) => Promise<InventoryItem>;
export declare const getGetInventoryItemQueryKey: (id: number) => readonly [`/api/inventory/${number}`];
export declare const getGetInventoryItemQueryOptions: <TData = Awaited<ReturnType<typeof getInventoryItem>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventoryItemQueryResult = NonNullable<Awaited<ReturnType<typeof getInventoryItem>>>;
export type GetInventoryItemQueryError = ErrorType<unknown>;
/**
 * @summary Get an inventory item by ID
 */
export declare function useGetInventoryItem<TData = Awaited<ReturnType<typeof getInventoryItem>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventoryItem>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateInventoryItemUrl: (id: number) => string;
/**
 * @summary Update an inventory item
 */
export declare const updateInventoryItem: (id: number, inventoryItemUpdate: InventoryItemUpdate, options?: RequestInit) => Promise<InventoryItem>;
export declare const getUpdateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<InventoryItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<InventoryItemUpdate>;
}, TContext>;
export type UpdateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateInventoryItem>>>;
export type UpdateInventoryItemMutationBody = BodyType<InventoryItemUpdate>;
export type UpdateInventoryItemMutationError = ErrorType<unknown>;
/**
* @summary Update an inventory item
*/
export declare const useUpdateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<InventoryItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<InventoryItemUpdate>;
}, TContext>;
export declare const getDeleteInventoryItemUrl: (id: number) => string;
/**
 * @summary Delete an inventory item
 */
export declare const deleteInventoryItem: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
    id: number;
}, TContext>;
export type DeleteInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof deleteInventoryItem>>>;
export type DeleteInventoryItemMutationError = ErrorType<unknown>;
/**
* @summary Delete an inventory item
*/
export declare const useDeleteInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteInventoryItem>>, TError, {
    id: number;
}, TContext>;
export declare const getGetInventorySummaryUrl: () => string;
/**
 * @summary Get inventory summary stats
 */
export declare const getInventorySummary: (options?: RequestInit) => Promise<InventorySummary>;
export declare const getGetInventorySummaryQueryKey: () => readonly ["/api/inventory/summary"];
export declare const getGetInventorySummaryQueryOptions: <TData = Awaited<ReturnType<typeof getInventorySummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventorySummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getInventorySummary>>>;
export type GetInventorySummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get inventory summary stats
 */
export declare function useGetInventorySummary<TData = Awaited<ReturnType<typeof getInventorySummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventorySummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetEmployeesUrl: (params?: GetEmployeesParams) => string;
/**
 * @summary List all employees
 */
export declare const getEmployees: (params?: GetEmployeesParams, options?: RequestInit) => Promise<Employee[]>;
export declare const getGetEmployeesQueryKey: (params?: GetEmployeesParams) => readonly ["/api/employees", ...GetEmployeesParams[]];
export declare const getGetEmployeesQueryOptions: <TData = Awaited<ReturnType<typeof getEmployees>>, TError = ErrorType<unknown>>(params?: GetEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmployees>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmployeesQueryResult = NonNullable<Awaited<ReturnType<typeof getEmployees>>>;
export type GetEmployeesQueryError = ErrorType<unknown>;
/**
 * @summary List all employees
 */
export declare function useGetEmployees<TData = Awaited<ReturnType<typeof getEmployees>>, TError = ErrorType<unknown>>(params?: GetEmployeesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployees>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEmployeeUrl: () => string;
/**
 * @summary Create a new employee
 */
export declare const createEmployee: (employeeInput: EmployeeInput, options?: RequestInit) => Promise<Employee>;
export declare const getCreateEmployeeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export type CreateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof createEmployee>>>;
export type CreateEmployeeMutationBody = BodyType<EmployeeInput>;
export type CreateEmployeeMutationError = ErrorType<unknown>;
/**
* @summary Create a new employee
*/
export declare const useCreateEmployee: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmployee>>, TError, {
        data: BodyType<EmployeeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmployee>>, TError, {
    data: BodyType<EmployeeInput>;
}, TContext>;
export declare const getGetEmployeeUrl: (id: number) => string;
/**
 * @summary Get an employee by ID
 */
export declare const getEmployee: (id: number, options?: RequestInit) => Promise<Employee>;
export declare const getGetEmployeeQueryKey: (id: number) => readonly [`/api/employees/${number}`];
export declare const getGetEmployeeQueryOptions: <TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmployeeQueryResult = NonNullable<Awaited<ReturnType<typeof getEmployee>>>;
export type GetEmployeeQueryError = ErrorType<unknown>;
/**
 * @summary Get an employee by ID
 */
export declare function useGetEmployee<TData = Awaited<ReturnType<typeof getEmployee>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmployee>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateEmployeeUrl: (id: number) => string;
/**
 * @summary Update an employee
 */
export declare const updateEmployee: (id: number, employeeUpdate: EmployeeUpdate, options?: RequestInit) => Promise<Employee>;
export declare const getUpdateEmployeeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: number;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: number;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export type UpdateEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof updateEmployee>>>;
export type UpdateEmployeeMutationBody = BodyType<EmployeeUpdate>;
export type UpdateEmployeeMutationError = ErrorType<unknown>;
/**
* @summary Update an employee
*/
export declare const useUpdateEmployee: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateEmployee>>, TError, {
        id: number;
        data: BodyType<EmployeeUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateEmployee>>, TError, {
    id: number;
    data: BodyType<EmployeeUpdate>;
}, TContext>;
export declare const getDeleteEmployeeUrl: (id: number) => string;
/**
 * @summary Delete an employee
 */
export declare const deleteEmployee: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEmployeeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: number;
}, TContext>;
export type DeleteEmployeeMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEmployee>>>;
export type DeleteEmployeeMutationError = ErrorType<unknown>;
/**
* @summary Delete an employee
*/
export declare const useDeleteEmployee: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEmployee>>, TError, {
    id: number;
}, TContext>;
export declare const getGetSalesReportUrl: (params?: GetSalesReportParams) => string;
/**
 * @summary Get sales report
 */
export declare const getSalesReport: (params?: GetSalesReportParams, options?: RequestInit) => Promise<SalesReport>;
export declare const getGetSalesReportQueryKey: (params?: GetSalesReportParams) => readonly ["/api/reports/sales", ...GetSalesReportParams[]];
export declare const getGetSalesReportQueryOptions: <TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params?: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesReportQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesReport>>>;
export type GetSalesReportQueryError = ErrorType<unknown>;
/**
 * @summary Get sales report
 */
export declare function useGetSalesReport<TData = Awaited<ReturnType<typeof getSalesReport>>, TError = ErrorType<unknown>>(params?: GetSalesReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProductsReportUrl: (params?: GetProductsReportParams) => string;
/**
 * @summary Get products performance report
 */
export declare const getProductsReport: (params?: GetProductsReportParams, options?: RequestInit) => Promise<ProductReport[]>;
export declare const getGetProductsReportQueryKey: (params?: GetProductsReportParams) => readonly ["/api/reports/products", ...GetProductsReportParams[]];
export declare const getGetProductsReportQueryOptions: <TData = Awaited<ReturnType<typeof getProductsReport>>, TError = ErrorType<unknown>>(params?: GetProductsReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductsReportQueryResult = NonNullable<Awaited<ReturnType<typeof getProductsReport>>>;
export type GetProductsReportQueryError = ErrorType<unknown>;
/**
 * @summary Get products performance report
 */
export declare function useGetProductsReport<TData = Awaited<ReturnType<typeof getProductsReport>>, TError = ErrorType<unknown>>(params?: GetProductsReportParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductsReport>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map