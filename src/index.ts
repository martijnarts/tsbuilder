import { Build } from "./const";
import {
  ITSBuilder,
  IIntermediateBuilder,
  ISetters,
  ITSBuilderTemplate,
} from "./types";
import { capitalizeFirstLetter } from "./util";

const innerBuilder = <
  Data extends object,
  Output,
  RequiredKeys extends keyof Data = never,
  Intermediate extends Record<keyof Data, unknown> = Record<keyof Data, unknown>
>(
  value: Readonly<Intermediate>,
  template: Readonly<ITSBuilderTemplate<Data, RequiredKeys>>,
  buildFunc: (input: Data) => Output
): ITSBuilder<Data, Output, RequiredKeys, Intermediate> => {
  type Builder = IIntermediateBuilder<Data, Output>;
  const builder: Partial<Builder> = {};

  for (const key of Object.keys(template) as (string & keyof Data)[]) {
    builder[key] = (() => value[key]) as Builder[typeof key];

    const setterKey = `set${capitalizeFirstLetter(key)}` as keyof ISetters<
      Data,
      Output
    >;
    builder[setterKey] = ((newValue: Data[typeof key]) =>
      innerBuilder<Data, Output, RequiredKeys, Intermediate>(
        { ...value, [key]: newValue },
        template,
        buildFunc
      )) as Builder[typeof setterKey];
  }

  builder[Build] = (() => {
    const copy = { ...value } as Partial<Data>;

    const missingKeys = Object.keys(template).filter((key) => !(key in value));
    for (const key of missingKeys as (string & keyof Data)[]) {
      copy[key] = template[
        key as keyof typeof template
      ]?.() as Data[typeof key];
    }

    return { result: buildFunc(copy as Data), finalData: copy as Data };
  }) as Builder[typeof Build];

  return builder as ITSBuilder<Data, Output, RequiredKeys, Intermediate>;
};

/**
 * A function that creates a type-safe builder for TypeScript objects.
 *
 * @template Data - The type of the object being built.
 * @template Output - The type of the object returned by the builder.
 * @template RequiredKeys - The keys of the object that do not have a default value set in the template.
 *
 * @param template - The template object that defines the shape of the object being built. Any optional keys must have a function that returns a value of the correct type.
 * @param buildFunc - An optional function that transforms the input object before returning it.
 *
 * @returns A type-safe builder object that can be used to construct objects of type `Data`.
 */
export function TSBuilder<
  const Data extends object,
  const Output = Data,
  const RequiredKeys extends keyof Data = keyof Data
>(
  template: Readonly<ITSBuilderTemplate<Data, RequiredKeys>>,
  buildFunc: (input: Data) => Output = (x) => x as unknown as Output
) {
  const intermediate: Record<string, never> = {};
  return innerBuilder<Data, Output, RequiredKeys>(
    intermediate as Record<keyof Data, never>,
    template,
    buildFunc
  ) as ITSBuilder<Data, Output, RequiredKeys>;
}

export { Build } from "./const";
