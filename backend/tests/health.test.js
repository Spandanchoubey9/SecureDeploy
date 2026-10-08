const request = require("supertest");
const app = require("../src/server");

describe("SecureDeploy API", () => {
    test("GET /health should return healthy status", async () => {
        const response = await request(app).get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("healthy");
        expect(response.body.service).toBe("SecureDeploy API");
    });
});