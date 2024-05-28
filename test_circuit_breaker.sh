#!/bin/bash

# Define the base URL
BASE_URL="http://localhost:3000"

echo "Testing normal operation... (5 req) unreliable service call with random failures (200 | 502)"
# Send 5 requests to simulate normal behavior
for i in {1..5}
do
  curl -o /dev/null -s -w "Status Code: %{http_code}\n" "$BASE_URL/test"
done

echo "Enabling forced failure mode..."
curl -o /dev/null -s -w "CONTROL\n" "$BASE_URL/force-failure"

echo "Testing with forced failures... (5 req) all 502"
# Send 5 requests to trigger the circuit breaker
for i in {1..5}
do
  curl -o /dev/null -s -w "Status Code: %{http_code}\n" "$BASE_URL/test"
done

echo "Checking circuit breaker state..."
curl -s "$BASE_URL/breaker-state"

echo "Waiting for the reset timeout..."
# Assuming resetTimeout is 5000 ms = 5 seconds
sleep 6  # Sleep a bit longer than the reset timeout

echo "Resetting failure mode..."
curl -o /dev/null -s -w "Status Code: %{http_code}\n" "$BASE_URL/reset-failure"

echo "Testing post-recovery..."
# Send 5 more requests to see if the circuit breaker has closed
for i in {1..5}
do
  curl -o /dev/null -s -w "Status Code: %{http_code}\n" "$BASE_URL/test"
done

echo "Final check of circuit breaker state..."
curl -s "$BASE_URL/breaker-state"