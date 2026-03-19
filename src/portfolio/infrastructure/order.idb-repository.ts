import { openDB, type IDBPDatabase } from "idb";
import type { Order } from "@/portfolio/domain/order.schema";

const DB_NAME = "myinvestor";
const DB_VERSION = 1;
const STORE_NAME = "orders";

interface MyInvestorDB {
  orders: {
    key: string;
    value: Order;
    indexes: {
      "by-date": string;
      "by-type": string;
      "by-fund": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MyInvestorDB>> | null = null;

function getDb(): Promise<IDBPDatabase<MyInvestorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MyInvestorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("by-date", "date");
        store.createIndex("by-type", "type");
        store.createIndex("by-fund", "fundId");
      },
    });
  }
  return dbPromise;
}

let counter = 0;

export const orderIdbRepository = {
  async getOrders(): Promise<Order[]> {
    const db = await getDb();
    const orders = await db.getAllFromIndex(STORE_NAME, "by-date");
    return orders.reverse();
  },

  async addOrder(order: Omit<Order, "id" | "date">): Promise<Order> {
    const db = await getDb();
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${++counter}`,
      date: new Date().toISOString(),
    };
    await db.add(STORE_NAME, newOrder);
    return newOrder;
  },

  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear(STORE_NAME);
    counter = 0;
  },
};
