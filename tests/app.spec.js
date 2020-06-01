const request = require("supertest");

const testConfig = {
  app: {
    port: 8000
  },
  hooks: [
    {
      name: "testhook",
      token: "abc123",
      command: "scripts/hello.sh"
    }
  ]
};

const app = require("../src/app")(testConfig);

describe("sanity tests", () => {
  test("app responds to PING", async () => {
    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.text).toEqual("PONG");
  });
});

describe("webhook test", () => {
  test("app accepts webhook with the right token", async () => {
    const res = await request(app)
      .post("/testhook?token=abc123");
    expect(res.status).toBe(200);
  });

  test("app rejects non-existent webhook with any token", async () => {
    const res = await request(app)
      .post("/?token=helloworld");
    expect(res.status).toBe(404);
  });

  test("app rejects webhook with the wrong token", async () => {
    const res = await request(app)
      .post("/testhook?token=helloworld");
    expect(res.status).toBe(401);
  });
})
