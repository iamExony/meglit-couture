/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as analytics from "../analytics.js";
import type * as carts from "../carts.js";
import type * as categories from "../categories.js";
import type * as contactMessages from "../contactMessages.js";
import type * as customers from "../customers.js";
import type * as favorites from "../favorites.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as purchases from "../purchases.js";
import type * as subscribers from "../subscribers.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  analytics: typeof analytics;
  carts: typeof carts;
  categories: typeof categories;
  contactMessages: typeof contactMessages;
  customers: typeof customers;
  favorites: typeof favorites;
  messages: typeof messages;
  migrations: typeof migrations;
  orders: typeof orders;
  products: typeof products;
  purchases: typeof purchases;
  subscribers: typeof subscribers;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
