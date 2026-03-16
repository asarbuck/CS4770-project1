const express = require("express");
const { sample } = require("./sampler")

const app = express();
app.use(express.json());



let circuitState = "CLOSED";
let failureCount = 0;
let lastFailureTime = null;
const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT = 3000;

function checkCircuit(){
    if (circuitState === "OPEN") {
        const now = Date.now();

        if ( now - lastFailureTime >= RECOVERY_TIMEOUT) {
            console.log("Circuit HALF-OPEN - testing recovery...");
            circuitState = "HALF-OPEN"
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
    if ( failureCount >= FAILURE_THRESHOLD) {
        circuitState = "OPEN";
        console.log(`Circuit OPEN - ${failureCount} failures detected`);
    }
}

app.post("/sample", (req, res) => {
    const data = req.body;

    console.log("Body received:", req.body);      // ← add this
    console.log("Content-Type:", req.headers["content-type"]); // ← and this

    if (!checkCircuit()){
        return res.status(503).json({
            error: "Circuit OPEN — sensor unavailable, retrying in 3 seconds"
        });
    }

    if(!data || Object.keys(data).length === 0) {
        recordFailure();
        return res.status(400).json({error: "Empty request body" });
    }

    const result = sample(data);

    if( result.status === "rejected"){
        recordFailure();
        return res.status(400).json({ result });
    }

    recordSuccess();
    return res.status(200).json(result);
});

app.listen(3000, () => {
    console.log("Sampler running on http://172.17.0.1:3000/sample");
});