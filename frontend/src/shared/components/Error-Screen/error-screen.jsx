import './error-screen.css';

export const ErrorScreen = ({ errorMessage }) => {
  return <div className="mainContainer errorText">{errorMessage ?? 'Error Occured!'}</div>;
};
