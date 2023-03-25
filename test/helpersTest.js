const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = testUsers["userRandomID"];
    assert.equal(user, expectedUser);
  });

 it('should return undefined when looking for a non-existent email', () => {
    const user = getUserByEmail('hacker@example.com', testUsers);
    const expectedOutput = null;
    assert.equal(user, expectedOutput);
  });

});
