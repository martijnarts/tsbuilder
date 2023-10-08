function capitalizeFirstLetter<S extends string>(string: S): Capitalize<S> {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<S>;
}

export const Build = Symbol("Build");

type ISetters<Data, Output> = {
  [Key in keyof Data as `set${Capitalize<string & Key>}`]-?: (
    arg: Data[Key]
  ) => IIntermediateBuilder<Data, Output>;
};

type IGetters<Data> = {
  [Key in keyof Data]-?: () => Data[Key];
};

type IIntermediateBuilder<Data, Output> = ISetters<Data, Output> &
  IGetters<Data> & {
    [Build]: () => { result: Output; finalData: Data };
  };

type ITSBuilder<
  Data,
  Output = Data,
  RequiredKeys extends keyof Data = keyof Data,
  Intermediate = { [Key in Exclude<keyof Data, RequiredKeys>]: Data[Key] }
> = {
  [Key in keyof Data as `set${Capitalize<string & Key>}`]-?: (
    arg: Data[Key]
  ) => ITSBuilder<
    Data,
    Output,
    RequiredKeys,
    Intermediate & Record<Key, Data[Key]>
  >;
} & {
  [Key in keyof Data]-?: () => Data[Key];
} & {
  [Build]: Intermediate extends Data
    ? () => { result: Output; finalData: Data }
    : never;
};

export type ITSBuilderTemplate<Data, RequiredKeys extends keyof Data> = {
  [Key in keyof Data]: Key extends RequiredKeys ? null : () => Data[Key];
};

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
 * Create a StrictBuilder for an interface. Returned objects will be untyped.
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
