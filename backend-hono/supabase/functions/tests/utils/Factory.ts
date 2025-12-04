import { merge } from "npm:lodash-es";
import { getClient as supabaseClient } from "../../api/client.ts";
import { type SupabaseClient } from 'npm:@supabase/supabase-js'

type NoId<T> = T & { id?: never };
type WithoutId = Record<string, unknown> & { id?: never };
type FactoryDefaults<T> = Partial<T> | ((sequence: number) => Partial<T>);

type ReturnType<T> = {
    data: T;
    cleanUp: () => Promise<void>;
}

/**
 * Factory class for generating test data.
 * @param T interface or type of the generated data.
 */
export class Factory<T extends WithoutId> {
  client?: SupabaseClient;
  /**
   * Will be merged with every generated object.
   */
  defaults?: FactoryDefaults<T>;
  /**
   * A sequence number for the generated data.
   */
  sequence = 0;

  /**
   * Creates an instance of Factory.
   * @param [defaults] default values for the generated data.
   */
  constructor(defaults?: FactoryDefaults<T>) {
    this.defaults = defaults;
  }

  /**
   * A database table name
   */
  getTableName(): string {
    throw new Error("Not implemented");
  }
  /**
   * Supabase Client
   */
  getClient(): SupabaseClient  {
    if (!this.client) {
      this.client = supabaseClient()
    }
    return this.client!
  }

  /**
   * Generates a single object.
   */
  generate(): NoId<T> {
    throw new Error("Not implemented");
  }

  /**
   * Returns override values for the generated data.
   */
  getOverride(override?: FactoryDefaults<T>): Partial<T> {
    if (typeof override === "function") {
      return override(this.sequence);
    }
    return override || ({} as Record<keyof T, undefined>);
  }

  /**
   * Returns default values for the generated data.
   */
  getDefaults() {
    return this.getOverride(this.defaults);
  }

  /**
   * Calls generate() method and deep merges the result with defaults.
   */
  async create(override?: FactoryDefaults<T>): Promise<ReturnType<T>> {
    this.sequence += 1;
    const dataToInsert = merge(this.generate(), this.getDefaults(), this.getOverride(override));

    const { data, error } = await this.getClient()
      .from(this.getTableName())
      .insert(dataToInsert)
      .select<string, T>("*")
      .single();

    if (error) {
      console.error("Error creating record:", error);
      throw error;
    }

    const cleanUp = async () => {
      if (data) {
        await this.getClient().from(this.getTableName()).delete().eq("id", data.id);
      }
      await this.client!.auth.stopAutoRefresh()
    }
    return { data, cleanUp };
  }

  /**
   * Creates a batch of records in the database.
   * @param count - The number of records to create.
   * @param overrides - Specific fields to override the default data for all records in the batch.
   * @returns An array of the newly created records.
   */
  async batch(count: number, overrides: Partial<T> = {}): Promise<T[]> {
    const dataToInsert: T[] = Array.from({ length: count }, (_, i) => {
      return merge(this.generate(), this.getDefaults(), this.getOverride(overrides))
    })

    const { data, error } = await this.getClient()
      .from(this.getTableName())
      .insert(dataToInsert)
      .select<string, T>();

    if (error) {
      console.error(`Error creating batch of ${count} records:`, error);
      throw error;
    }

    return data;
  }
}
