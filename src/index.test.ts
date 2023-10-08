import { test, expect } from "vitest";
import { Build, TSBuilder } from "./index";
import { assertType } from "vitest";

test("Successfully runs a dumb build", () => {
  const builder = TSBuilder<{ a: string; b: string }>({
    a: null,
    b: null,
  });

  expect(builder.a()).toEqual(undefined);
  expect(builder.b()).toEqual(undefined);

  assertType<{ [Build]: () => never }>(builder);

  const aBuilder = builder.setA("a");
  expect(aBuilder.a()).toEqual("a");
  expect(aBuilder.b()).toEqual(undefined);

  assertType<{ [Build]: () => never }>(aBuilder);

  const bBuilder = aBuilder.setB("b");
  expect(bBuilder.a()).toEqual("a");
  expect(bBuilder.b()).toEqual("b");

  assertType<{ [Build]: () => { result: { a: string; b: string } } }>(bBuilder);

  expect(bBuilder[Build]().result).toEqual({ a: "a", b: "b" });
});

test("Successfully runs a build with a build function", () => {
  const builder = TSBuilder<{ a: string; b: string }, string>(
    {
      a: null,
      b: null,
    },
    (x) => x.a + x.b
  );

  expect(builder.a()).toEqual(undefined);
  expect(builder.b()).toEqual(undefined);

  assertType<{ [Build]: () => never }>(builder);

  const aBuilder = builder.setA("a");
  expect(aBuilder.a()).toEqual("a");
  expect(aBuilder.b()).toEqual(undefined);

  assertType<{ [Build]: () => never }>(aBuilder);

  const bBuilder = aBuilder.setB("b");
  expect(bBuilder.a()).toEqual("a");
  expect(bBuilder.b()).toEqual("b");

  assertType<{ [Build]: () => { result: string } }>(bBuilder);

  expect(bBuilder[Build]().result).toEqual("ab");
});

test("Successfully runs a build with a build function and required keys", () => {
  const builder = TSBuilder<{ a: string; b: string }, string, "b">(
    {
      a: () => "a",
      b: null,
    },
    (x) => x.a + x.b
  );

  expect(builder.a()).toEqual(undefined);
  expect(builder.b()).toEqual(undefined);

  assertType<{ [Build]: () => never }>(builder);

  const bBuilder = builder.setB("b");
  expect(bBuilder.a()).toBeUndefined();
  expect(bBuilder.b()).toEqual("b");

  assertType<{ [Build]: () => { result: string } }>(bBuilder);

  const { result, finalData } = bBuilder[Build]();
  expect(result).toEqual("ab");
  expect(finalData).toEqual({ a: "a", b: "b" });
});
