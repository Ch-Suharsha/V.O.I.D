const { lookupNPI } = require("./lib/npiLookup");

async function test() {
  try {
    const result = await lookupNPI("1467823901");
    console.log("TEST RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("TEST ERROR:", err);
  }
}

test();
