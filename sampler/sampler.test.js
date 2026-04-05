const assert = require("node:assert");

// helper function to ensure sampler.js has clean state when testing different issues
function loadFreshSampler() {
    const path = require.resolve("./sampler");
    delete require.cache[path];
    return require("./sampler");
}


describe("Sampler Tests", () => {
    
    // rejects if sensorId is not present
    it("Rejects data that is missing (sensorId)", () => {
        const { sample } = loadFreshSampler();
        const result = sample({ value: 2.5, timestamp: "test place holder"});
        assert.strictEqual(result.status, "rejected");
    });

    // test fails when value is not present
    it("Rejects data missing value", () => {
        const { sample } = loadFreshSampler();
        const result = sample({ sensorId : "s1", timestamp: "test place holder"});
        assert.strictEqual(result.status, "rejected")
    });

    // Test if timestamp is not entered
    it("Rejects when timestamp is missing", () => {
        const { sample } = loadFreshSampler();
        const result = sample({ sensorId: "s1", value: 3.0});
        assert.strictEqual(result.status, "rejected");
    });

    // Test whether the first reading is skipped, and then the second is accepted
    // Using value of SAMPLE_RATE = 2
    it("skips first reading and accepts second", () => {
        const { sample } = loadFreshSampler();
        const data = { sensorId: "s1", value: 2.5, timestamp: "test place holder" };

        const first = sample(data);
        assert.strictEqual(first.status, "skipped");
    
        const second = sample(data);
        assert.strictEqual(second.status, "accepted");
    });

    // all response fields are filled including
    // status, sensorId, timestamp, sampling mode, sampledValue
    it("accepted response has all required fields", () => {
        const { sample } = loadFreshSampler();
        const data = { sensorId: "s1", value: 4.2, timestamp: "test place holder" };
    
        sample(data); // skipped
        const result = sample(data); // accepted
    
        assert.strictEqual(result.status, "accepted");
        assert.strictEqual(result.sampledValue, 4.2);
        assert.strictEqual(result.sensorId, "s1");
        assert.strictEqual(result.timestamp, "test place holder");
        assert.ok(result.samplingMode === "normal" || result.samplingMode === "idle");
    });

    it("accepts value of 0 as valid sensor data", () => {
        const { sample } = loadFreshSampler();
        const result = sample({ sensorId: "s1", value: 0, timestamp: "test place holder" });
        assert.notStrictEqual(result.status, "rejected");
    });


});