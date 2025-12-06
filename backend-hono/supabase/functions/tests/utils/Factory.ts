import { merge } from "npm:lodash-es";
import type { Database } from "../../api/database.types.ts";
import { type SupabaseClient, supabase } from "../supabase.ts";


type NoId<T> = T & { id?: never };
type WithoutId = Record<string, unknown> & { id?: never };
type WithId<T> = {[K in keyof T]: T[K]} & { id: number };

type FactoryDefaults<T> = Partial<T> | ((sequence: number) => Partial<T>);

type TestCallback = (supabase: SupabaseClient) => Promise<void>

type FactoryReturnType<T> = {
  data: WithId<T>;
  test: (callback: TestCallback) => Promise<void>;
}

type FactoryReturnArrayType<T> = {
  data: WithId<T>[];
  test: (callback: TestCallback) => Promise<void>;
}

/**
 * Factory class for generating test data.
 * @param T interface or type of the generated data.
 */
export class Factory<T extends WithoutId> {
  supabase?: SupabaseClient;
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
  getTableName(): keyof Database["public"]["Tables"] {
    throw new Error("Not implemented");
  }
  /**
   * Supabase Client
   */
  async getSupabase(): Promise<SupabaseClient> {
    if (!this.supabase) {
      this.supabase = await supabase()
    }
    return this.supabase!
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
  async create(override?: FactoryDefaults<T>): Promise<FactoryReturnType<T>> {
    this.sequence += 1;
    const dataToInsert = merge(this.generate(), this.getDefaults(), this.getOverride(override));

    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from(this.getTableName())
      .insert(dataToInsert)
      .select<string, WithId<T>>("*")
      .single();

    if (error) {
      console.error("Error creating record:", error);
      throw error;
    }

    const cleanUp = async () => {
      if (data) {
        await supabase.from(this.getTableName()).delete().eq("id", data.id);
      }
    }

    const test = async (callback: (supabase: SupabaseClient) => Promise<void>) => {
      try {
        await callback(supabase)
      } finally {
        await cleanUp()
      }
    }
    return { data, test };
  }

  /**
   * Creates a batch of records in the database.
   * @param count - The number of records to create.
   * @param overrides - Specific fields to override the default data for all records in the batch.
   * @returns An array of the newly created records.
   */
  async batch(count: number, overrides: Partial<T> = {}): Promise<FactoryReturnArrayType<T>> {
    const dataToInsert: T[] = Array.from({ length: count }, (_, i) => {
      return merge(this.generate(), this.getDefaults(), this.getOverride(overrides))
    })

    const supabase = await this.getSupabase()
    const { data, error } = await supabase
      .from(this.getTableName())
      .insert(dataToInsert)
      .select<string, WithId<T>>();

    if (error) {
      console.error(`Error creating batch of ${count} records:`, error);
      throw error;
    }

    const cleanUp = async () => {
      if (data) {
        await supabase.from(this.getTableName()).delete().in("id", (data as WithId<T>[]).map(({ id }) => id));
      }
      await supabase.auth.signOut()
    }

    const test = async (callback: (supabase: SupabaseClient) => Promise<void>) => {
      try {
        await callback(supabase)
      } finally {
        await cleanUp()
      }
    }

    return { data, test };
  }
}
