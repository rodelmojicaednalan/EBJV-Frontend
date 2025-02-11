/* eslint-disable react/prop-types */
import './Switch.css';

const Switch = ({ handleTogglePanel }) => {
  return (
    <label className="switch" style={{ margin: '0px' }}>
      <input type="checkbox" onChange={handleTogglePanel} />
      <span className="slider" />
    </label>
  );
};

export default Switch;
