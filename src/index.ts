import express from 'express';
import CircuitBreaker from 'opossum';

const app = express();
const port = 3000;

let forceFail = false;  // Flag to control forced failure

// Simulate unreliable service call with random failures
function unreliableServiceCall(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (forceFail || Math.random() > 0.6) {
      reject(new Error("Failed!"));
    } else {
      resolve("Success!");
    }
  });
}

const options = {
  timeout: 3000,
  errorThresholdPercentage: 50, // Percentage of failed requests needed to trip the breaker.
  resetTimeout: 5000
};

const breaker = new CircuitBreaker(unreliableServiceCall, options);

app.get('/test', async (req, res) => {
  try {
    const result = await breaker.fire();
    console.log('Result:', result)
    res.send(result);
  } catch (error: any) {
    console.error('Error:', error)
    res.status(502).send(error.message);
  }
});

// Endpoint to force failure mode
app.get('/force-failure', (req, res) => {
  forceFail = true;
  res.send("Service will now fail all requests!");
});

// Endpoint to reset failure mode
app.get('/reset-failure', (req, res) => {
  forceFail = false;
  res.send("Service restored to normal operation!");
});

// Endpoint to get circuit breaker state
app.get('/breaker-state', (req, res) => {
  const state = {
    isOpen: breaker.opened,
    isClosed: breaker.closed,
    isHalfOpen: breaker.halfOpen,
    stats: breaker.stats
  };
  res.json(state);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});