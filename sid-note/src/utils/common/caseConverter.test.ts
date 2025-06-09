import { toCamelCaseKeysDeep } from "@/utils/common/caseConverter";

describe("toCamelCaseKeysDeep", () => {
  it("snake_caseのキーがcamelCaseに正しく変換される", () => {
    const input = {
      snake_case_key: "value",
      another_snake_key: "value2",
    };
    const expected = {
      snakeCaseKey: "value",
      anotherSnakeKey: "value2",
    };
    expect(toCamelCaseKeysDeep(input)).toEqual(expected);
  });
});
