import { Build } from "./const";

export type ITSBuilderTemplate<Data, RequiredKeys extends keyof Data> = {
  [Key in keyof Data]: Key extends RequiredKeys ? null : () => Data[Key];
};

export type ISetters<Data, Output> = {
  [Key in keyof Data as `set${Capitalize<string & Key>}`]-?: (
    arg: Data[Key]
  ) => IIntermediateBuilder<Data, Output>;
};

export type IGetters<Data> = {
  [Key in keyof Data]-?: () => Data[Key];
};

export type IIntermediateBuilder<Data, Output> = ISetters<Data, Output> &
  IGetters<Data> & {
    [Build]: () => { result: Output; finalData: Data };
  };

export type ITSBuilder<
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
