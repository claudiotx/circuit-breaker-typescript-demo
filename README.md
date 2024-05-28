# Circuit Breaker Demo

A circuit breaker is a design pattern used to detect failures and encapsulate the logic of preventing a failure from constantly recurring. It’s a way to manage failure and latency in distributed systems.
The circuit breaker helps prevent the system from being overwhelmed by continuous failures by temporarily stopping calls to the failing service after a certain failure threshold (50% in this case) is reached. It periodically tests the service to see if it has recovered and resumes normal operations once the service is healthy again.

## Practical Use Cases
1. Third-Party API Integration (prevent your application from continuously trying to call the failing API)
2. Microservices Communication (inter-service calls to isolate failures and prevent them from propagating through the system)
3. Database Connection Management (prevents your application from continuously trying to connect to a failing database)
4. File Storage Services (handle service disruptions: application can switch to alternative storage or queue the operations for later processing.)
5. Email Sending Services (handle service outages or rate limiting)


## How does it work?

```
const userServiceBreaker = new CircuitBreaker(callUserService, options);
app.get('/user-details', async (req, res) => {
  try {
    const userDetails = await userServiceBreaker.fire();
    res.send(userDetails);
  } catch (error) {
    res.status(503).send('User service is currently unavailable. Please try again later.');
  }
});
```

- Closed State: Initially, the circuit breaker is closed. Calls to the service proceed normally. If the failures meet a certain threshold (e.g., a certain percentage of requests fail within a given timeframe), the circuit breaker opens.

- Open State: When the circuit breaker is open, it prevents calls to the service. Instead of attempting the operation and likely failing, it quickly returns with a predefined response, often an error. This state protects the downstream service from overload and allows it time to recover.

- Half-Open State: After a predefined timeout period in the open state, the circuit breaker enters a half-open state. In this state, a limited number of test requests are allowed to pass through. If these requests succeed without issues, the circuit breaker closes again, returning to normal operation. If these requests fail, it reopens, prolonging the recovery period...

## Testing the Circuit Breaker

- Normal Operation: Test the normal functioning when the downstream service is healthy.
- Service Failure: Simulate a failure in the downstream service and observe the circuit breaker opening.
- Recovery: Test how the system recovers from failures by transitioning from open to half-open, and then to closed.

## Testing Endpoints (manipulate and monitor the state of the circuit breaker)

GET /test
GET /force-failure
GET /reset-failure
GET /breaker-state

### How to test

- Normal Operation: Continuously hit /test and observe successful responses.
- Force Failures: Call /force-failure to make the service start failing, then hit /test to see the circuit breaker open.
- Observe State: Use /breaker-state to see the state change from closed to open, and check how stats change.
- Recovery: Stop forcing failures with /reset-failure, wait for the reset timeout, and start testing /test to see if the circuit closes again.
