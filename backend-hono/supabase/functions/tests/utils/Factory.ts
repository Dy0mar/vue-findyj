import { merge } from "npm:lodash-es";
import { getClient as supabaseClient } from "../../api/client.ts";
import { type SupabaseClient } from 'npm:@supabase/supabase-js'

type NoId<T> = T & { id?: never };
type WithoutId = Record<string, unknown> & { id?: never };
type WithId<T> = {[K in keyof T]: T[K]} & { id: number };

type FactoryDefaults<T> = Partial<T> | ((sequence: number) => Partial<T>);

type FactoryReturnType<T> = {
  data: WithId<T>;
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
  async getClient(): Promise<SupabaseClient>  {
    if (!this.client) {
      // @ts-ignore it's impossible to make as Context without install the library
      const client = supabaseClient({
        // @ts-ignore mocked jwt token
        req: {
          // @ts-ignore mocked jwt token
          header: () => Deno.env.get("SUPABASE_ANON_KEY")!
        }
      })
      const { data, error } = await client.auth.signInWithPassword({
        email: Deno.env.get("TEST_USER_EMAIL")!,
        password: Deno.env.get("TEST_USER_PASSWORD")!,
      })
      if (error) {
        throw error
      }
      // @ts-ignore it's impossible to make as Context without install the library
      this.client = supabaseClient({
        // @ts-ignore mocked jwt token
        req: {
          // @ts-ignore mocked jwt token
          header: () => `Bearer ${data.session!.access_token}`
        }
      })
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
  async create(override?: FactoryDefaults<T>): Promise<FactoryReturnType<T>> {
    this.sequence += 1;
    const dataToInsert = merge(this.generate(), this.getDefaults(), this.getOverride(override));

    const { data, error } = await (await this.getClient())
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
        await (await this.getClient()).from(this.getTableName()).delete().eq("id", data.id);
      }
      await (await this.getClient()).auth.stopAutoRefresh()
    }
    return { data, cleanUp };
  }

  /**
   * Creates a batch of records in the database.
   * @param count - The number of records to create.
   * @param overrides - Specific fields to override the default data for all records in the batch.
   * @returns An array of the newly created records.
   */
  async batch(count: number, overrides: Partial<T> = {}): Promise<WithId<T>[]> {
    const dataToInsert: T[] = Array.from({ length: count }, (_, i) => {
      return merge(this.generate(), this.getDefaults(), this.getOverride(overrides))
    })

    const { data, error } = await (await this.getClient())
      .from(this.getTableName())
      .insert(dataToInsert)
      .select<string, WithId<T>>();

    if (error) {
      console.error(`Error creating batch of ${count} records:`, error);
      throw error;
    }

    return data;
  }
}
