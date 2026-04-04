import { getAccessToken } from '../lib/kra-client';

async function test() {
  console.log("Testing pinByID Auth...");
  try {
    const token = await getAccessToken('pinByID');
    console.log("Token ID:", token.substring(0, 10));
  } catch(e: any) { console.error("ID Auth failed:", e?.message); }

  console.log("\nTesting pinByPIN Auth...");
  try {
    const token2 = await getAccessToken('pinByPIN');
    console.log("Token PIN:", token2.substring(0, 10));
  } catch(e: any) { console.error("PIN Auth failed:", e?.message); }
}

test();
