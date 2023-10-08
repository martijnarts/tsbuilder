export const capitalizeFirstLetter = <S extends string>(
  string: S
): Capitalize<S> => {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<S>;
};
