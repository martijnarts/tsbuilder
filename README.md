# TSBuilder

<img alt="npm (scoped)" src="https://img.shields.io/npm/v/%40totempaaltj/tsbuilder"> <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/martijnarts/tsbuilder/test.yaml">

Strict builder pattern in Typescript. Based loosely on [builder-pattern][builder-pattern]'s StrictBuilder.

[builder-pattern]: https://github.com/vincent-pang/builder-pattern/

## How to use

Install:

```bash
$ npm i -S @totempaaltj/tsbuilder
$ pnpm i -S @totempaaltj/tsbuilder
$ yarn add @totempaaltj/tsbuilder
```

Examples are tested with [vite-plugin-doctest][doctest], which require a weird import syntax. Instead, you probably want to use:

```typescript
import { TSBuilder, Build } from "@totempaaltj/tsbuilder";
```

[doctest]: https://github.com/ssssota/doc-vitest

Basic usage:

<!-- @import.meta.vitest -->

```typescript
const { TSBuilder, Build } = await import("./src/index");

const builder = new TSBuilder<{
  foo: string;
  bar: number;
}>({
  foo: () => "defaultFoo",
  bar: () => 42,
});

const { result: result1 } = builder[Build]();
expect(result1).toEqual({
  foo: "defaultFoo",
  bar: 42,
});

const { result: result2 } = builder.setFoo("anotherFoo")[Build]();
expect(result2).toEqual({
  foo: "anotherFoo",
  bar: 42,
});
```

You can also use the builder to build a class:

<!-- @import.meta.vitest -->

```typescript
const { TSBuilder, Build } = await import("./src/index");

class Foo {
  constructor(public foo: string, public bar: number) {}
}

const builder = new TSBuilder<
  {
    foo: string;
    bar: number;
  },
  Foo
>(
  {
    foo: () => "defaultFoo",
    bar: () => 42,
  },
  (data) => new Foo(data.foo, data.bar)
);

let { result, finalData } = builder[Build]();
expect(result).toBeInstanceOf(Foo);
expect(result.foo).toBe("defaultFoo");
expect(result.bar).toBe(42);
expect(finalData).toEqual({
  foo: "defaultFoo",
  bar: 42,
});
```

## Contribute

I just [nvm][nvm] and [pnpm][pnpm].

[nvm]: https://github.com/nvm-sh/nvm
[pnpm]: https://pnpm.io/

```bash
# Install dependencies
$ pnpm i

# Run tests
$ pnpm test && pnpm typetest

# Build and publish -- first increment the version
$ pnpm build
$ pnpm publish
```
