import { getAccessToken } from '../lib/kra-client';

async function test() {
  console.log("Testing pinByID Auth...");
  try {
    const token = await getAccessToken('pinByID');
    if (token) {
      console.log("Token ID:", token.substring(0, 10));
    }
  } catch(e: any) { console.error("ID Auth failed:", e?.message); }

  console.log("\nTesting pinByPIN Auth...");
  try {
    const token2 = await getAccessToken('pinByPIN');
    if (token2) {
      console.log("Token PIN:", token2.substring(0, 10));
    }
  } catch(e: any) { console.error("PIN Auth failed:", e?.message); }
}

test();
