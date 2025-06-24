import http from "k6/http";
import { sleep, check } from "k6";

export let options = {
  duration: "60s",
  vus: 200, 
};

const BASE_URL = "http://localhost:8080";

export default function () {
  const payload = JSON.stringify({
    vendor: Math.random() < 0.5 ? "sync" : "async",
    payload: {
      name: "John Doe",
      ssn: "123-45-6789",
    },
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Submit job
  const res = http.post(`${BASE_URL}/jobs`, payload, params);
  check(res, {
    "submitted successfully": (r) => r.status === 200,
  });

  const requestId = res.json("request_id");
  sleep(1);

  // Check status
  const statusRes = http.get(`${BASE_URL}/jobs/${requestId}`);
  check(statusRes, {
    "status fetched": (r) => r.status === 200,
  });
}
