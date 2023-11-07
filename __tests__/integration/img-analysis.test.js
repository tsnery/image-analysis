const { describe, test, expect } = require("@jest/globals");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const requestMock = require("../mocks/request.json");
const { main } = require("../../src");

describe("Image analyzer test suite", () => {
  test("it should analyze successfully the image returning the results", async () => {
    const finalTexts = [
      "98.05% de ser to tipo Animal",
      "98.05% de ser to tipo gato",
      "98.05% de ser to tipo mamífero",
      "98.05% de ser to tipo animal de estimação",
      "94.51% de ser to tipo gatinho",
      "90.42% de ser to tipo abissínio",
      "80.45% de ser to tipo parte do corpo",
      "80.45% de ser to tipo boca",
      "80.45% de ser to tipo pessoa",
    ].join("\n");
    const expected = {
      statusCode: 200,
      body: "A image tem\n".concat(finalTexts),
    };

    const result = await main(requestMock);

    expect(result).toStrictEqual(expected);
  });
  test("given an empty query string it should return status code 400", async () => {
    const expected = {
      statusCode: 400,
      body: "an image url is required!",
    };
    const result = await main({ queryStringParameters: {} });
    expect(result).toStrictEqual(expected);
  });
  test("given an invalid image url it should return status code 500", async () => {
    const expected = {
      statusCode: 500,
      body: "Internal Server Error!",
    };

    const result = await main({ queryStringParameters: { imageUrl: "aaa" } });

    expect(result).toStrictEqual(expected);
  });
});
