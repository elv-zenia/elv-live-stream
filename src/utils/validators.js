export const ValidateTextField = ({value, key}) => {
  if(value.length === 0) { return null; }

  if(!/^.{3,}$/.test(value)) {
    return `${key} must be at least 3 characters long`;
  }

  return null;
};
