import { env } from "@/env";
import { Options } from "@node-rs/argon2";

export const argon2idConfig: Options = {
  memoryCost: 65536,
  timeCost: 4,
  outputLen: 32,
  parallelism: 2,
  secret: Buffer.from(env.SECRET_HASH, "base64"),
};
export const argon2idOsloConfig = {
  memorySize: 65536,
  iterations: 4,
  tagLength: 32,
  parallelism: 2,
  secret: Buffer.from(env.SECRET_HASH, "base64"),
};
