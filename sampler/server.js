const express = require("express");
const { sample } = require("./sampler");

const app = express();
app.use(express.json());

const TRANSFORMER_URL = "http://127.0.0.1:5000/transform";

// ── Circuit Breaker State ──────────────────────────────────────────
let circuitState = "CLOSED";
let failureCount = 0;
let lastFailureTime = null;
const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT = 3000;

function checkCircuit(){
    if (circuitState === "OPEN") {
        const now = Date.now();
        if (now - lastFailureTime >= RECOVERY_TIMEOUT) {
            console.log("Circuit HALF-OPEN - testing recovery...");
            circuitState = "HALF-OPEN";
            return true;
        }
        return false;
    }
    return true;
}

function recordSuccess(){
    failureCount = 0;
    circuitState = "CLOSED";
    console.log("Circuit CLOSED - sensor recovered");
}

function recordFailure(){
    failureCount++;
    lastFailureTime = Date.now();
    if (failureCount >= FAILURE_THRESHOLD) {
        circuitState = "OPEN";
        console.log(`Circuit OPEN - ${failureCount} failures detected`);
    }
}

// ── Main Route ────────────────────────────────────────────────────
app.post("/sample", async (req, res) => {
    const data = req.body;

    console.log("Body received:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    if (!checkCircuit()){
        return res.status(503).json({
            error: "Circuit OPEN — sensor unavailable, retrying in 3 seconds"
        });
    }

    if(!data || Object.keys(data).length === 0) {
        recordFailure();
        return res.status(400).json({ error: "Empty request body" });
    }

    const result = sample(data);

    if(result.status === "rejected"){
        recordFailure();
        return res.status(400).json(result);
    }

    if(result.status === "skipped"){
        recordSuccess();
        return res.status(200).json(result); // skipped readings don't go to transformer
    }

    // ── Forward accepted readings to Transformer ───────────────────
    if(result.status === "accepted"){
        try {
            console.log("Forwarding to Transformer:", result);

            const transformResponse = await fetch(TRANSFORMER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result)
            });

            const temperature = await transformResponse.json();
            console.log("Transformer response:", temperature);

            recordSuccess();
            return res.status(200).json(temperature); // return temperature to sensor

        } catch (error) {
            console.log("Failed to reach Transformer:", error.message);
            recordFailure();
            return res.status(503).json({ error: "Transformer unavailable" });
        }
    }
});

app.listen(3000, () => {
    console.log("Sampler running on http://localhost:3000");
});