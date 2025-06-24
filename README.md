# 🧪 Vendor Data Fetch Service

A scalable, dockerized system to fetch vendor data from both synchronous and asynchronous vendors using Redis, MongoDB, and Node.js.

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone <repo_url>
cd vendor-service

# 2. Add .env file
echo "MONGODB_URI=mongodb://mongo:27017/vendor_service" > .env

# 3. Start everything
docker-compose up --build

# 4. Submit a job (sync example)
curl -X POST http://localhost:8080/jobs \
  -H "Content-Type: application/json" \
  -d '{"vendor":"sync","payload":{"name":"Alice","email":"alice@example.com","ssn":"123-45-6789"}}'

# 5. Get job result
curl http://localhost:8080/jobs/<request_id>




     +------------+      Redis Queue       +-----------+
     |            |  push jobs & poll res |           |
     |   Client   +---------------------->+   API      |
     |            |                       |  Server    |
     +------------+                       +--+--------+
                                              |
                                              | MongoDB (jobs metadata)
                                              v
                                        +-----+------+
                                        |            |
                                        |  Worker     |
                                        |            |
                                        +------+-----+
                                               |
                            +------------------+------------------+
                            |                                     |
                    +-------v--------+                  +---------v--------+
                    |   sync-vendor  |                  |  async-vendor    |
                    | (Mock service) |                  | (Mock service)   |
                    +----------------+                  +------------------+
