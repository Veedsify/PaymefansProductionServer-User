type ErrorComponentProps = {
  text: string;
};
const ErrorComponent = ({ text }: ErrorComponentProps) => {
  return <p className="text-red-500 p-3 text-center text-sm">{text}</p>;
};

export default ErrorComponent;
