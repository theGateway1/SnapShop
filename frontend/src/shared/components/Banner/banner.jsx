import './banner.css';
const Banner = ({ addedClass = '' }) => {
  return <p className={`four-pm-branding banner ${addedClass}`}>`Get it delivered by 4 PM.`</p>;
};

export default Banner;
