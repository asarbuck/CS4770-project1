let readingCount = 0;
let SAMPLE_RATE = 2;
let lastReadingTime = Date.now();

const IDLE_THRESHOLD_MS = 3000;
const IDLE_SAMPLE_RATE = 4;
const NORMAL_SAMPLE_RATE = 2;

function adjustSampleRate() {
    const now = Date.now();
    const timeSinceLastReading = now - lastReadingTime;

    if (timeSinceLastReading > IDLE_THRESHOLD_MS) {
        if (SAMPLE_RATE !== IDLE_SAMPLE_RATE) {
            SAMPLE_RATE = IDLE_SAMPLE_RATE;
            console.log("System IDLE — reducing sample rate to save energy");
        }
    } else {
        if (SAMPLE_RATE !== NORMAL_SAMPLE_RATE) {
            SAMPLE_RATE = NORMAL_SAMPLE_RATE;
            console.log("System ACTIVE — resuming normal sample rate");
        }
    }
}

function sample(data) {
    if(!data.sensorId || data.value === undefined || !data.timestamp) {  
        return { status: "rejected", reason: "Missing required fields" };  
    }

    lastReadingTime = Date.now();
    adjustSampleRate();

    readingCount++;

    if(readingCount % SAMPLE_RATE !== 0) {
        return { status: "skipped", reason: "Filtered by sample rate" };
    }

    return {
        status: "accepted",
        sampledValue: data.value,  
        sensorId: data.sensorId,
        timestamp: data.timestamp,
        samplingMode: SAMPLE_RATE === IDLE_SAMPLE_RATE ? "idle" : "normal" 

    };
}

module.exports = { sample };