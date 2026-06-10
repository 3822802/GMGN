import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** Base Builder Code — base.dev → Settings → Builder Codes */
export const BUILDER_CODE = "bc_laffvyyb";

/** ERC-8021 suffix appended to all onchain txs (ignored by contracts, read by Base indexers). */
export const BUILDER_DATA_SUFFIX: Hex = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});
