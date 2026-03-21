import { db } from '../db';
import { sharedResources, SharedResource, InsertSharedResource, insertSharedResourceSchema } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

type CreateShareInput = z.infer<typeof insertSharedResourceSchema>;

export class ShareRepository {
  async findAll() {
    return db.select().from(sharedResources).orderBy(desc(sharedResources.sharedAt));
  }

  async findById(id: string): Promise<SharedResource | undefined> {
    const [share] = await db.select().from(sharedResources).where(eq(sharedResources.id, id));
    return share;
  }

  async create(data: CreateShareInput): Promise<SharedResource> {
    const [share] = await db.insert(sharedResources).values(data as InsertSharedResource).returning();
    return share;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(sharedResources).where(eq(sharedResources.id, id)).returning();
    return result.length > 0;
  }
}

export const shareRepository = new ShareRepository();
