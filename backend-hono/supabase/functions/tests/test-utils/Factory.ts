import { merge } from "lodash-es";
import type { TestTables } from "../../api/database.types.ts";
import { type SupabaseClient, supabase } from "../supabase.ts";


type NoId<T> = T & { id?: never };
type WithoutId = Record<string, unknown> & { id?: never };
type WithId<T> = {[K in keyof T]: T[K]} & { id: number };

type FactoryDefaults<T> = Partial<T> | ((sequence: number) => Partial<T>);

type TestCallback = (supabase: SupabaseClient) => Promise<void>

type FactoryBuild<T> = {
  data: T;
  test: (callback: TestCallback) => Promise<void>;
}

type FactoryCreate<T> = FactoryBuild<WithId<T>>

type FactoryBatch<T> = {
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
  getTableName(): TestTables {
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

  async cleanUp() {
    // hack to avoid "DELETE requires a WHERE clause"
    await (await this.getSupabase()).from(this.getTableName()).delete().neq("id", -1)
  }

  test = (client: SupabaseClient) => async (callback: TestCallback) => {
    try {
      await callback(client)
    } finally {
      await this.cleanUp()
    }
  }

  /**
   * Creates a single record in the database.
   */
  async create(override?: FactoryDefaults<T>): Promise<FactoryCreate<T>> {
    this.sequence += 1;
    const dataToInsert: T = merge(this.generate(), this.getDefaults(), this.getOverride(override));

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

    return { data, test: this.test(supabase) };
  }

  /**
   * Creates a batch of records in the database.
   * @param count - The number of records to create.
   * @param overrides - Specific fields to override the default data for all records in the batch.
   * @returns An array of the newly created records.
   */
  async batch(count: number, overrides: Partial<T> = {}): Promise<FactoryBatch<T>> {
    const dataToInsert: T[] = Array.from({ length: count }, () => {
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

    return { data, test: this.test(supabase) };
  }

  /**
   * Creates a single record without saving to the database.
   */
  async build(override?: FactoryDefaults<T>): Promise<FactoryBuild<T>> {
    this.sequence += 1;
    const supabase = await this.getSupabase()
    return {
      data: merge(this.generate(), this.getDefaults(), this.getOverride(override)),
      test: this.test(supabase)
    };
  }

  /**
   * Builds a batch of records without saving them to the database.
   * @param count - The number of records to build.
   * @param overrides - Specific fields to override the default data for all records in the batch.
   * @returns An array of the built records.
   */
  buildBatch(count: number, overrides: Partial<T> = {}): NoId<T>[] {
    return Array.from({ length: count }, () => {
      this.sequence += 1;
      return merge(this.generate(), this.getDefaults(), this.getOverride(overrides))
    });
  }
}
