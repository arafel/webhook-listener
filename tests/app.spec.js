const path = require("path");
const request = require("supertest");

const testConfig = {
  app: {
    port: 8000
  },
  hooks: [
    {
      name: "testhook",
      token: "abc123",
      command: path.join(__dirname, "scripts/hello.sh")
    },
    {
      name: "nocommand",
      token: "HelloWorld"
    },
    {
      name: "badcommand",
      token: "abc123",
      command: path.join(__dirname, "scripts/doesnotexist.sh")
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
    expect(res.text.trim()).toBe("Hello world");
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

  test("empty hook won't crash it", async () => {
    const res = await request(app)
      .post("/nocommand?token=HelloWorld");
    expect(res.status).toBe(200);
  });

  test("app doesn't crash with bad command", async () => {
    const res = await request(app)
      .post("/badcommand?token=abc123");
    expect(res.status).toBe(406);
  });
})
