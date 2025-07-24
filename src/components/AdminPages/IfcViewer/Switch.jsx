/* eslint-disable react/prop-types */
import './Switch.css';

const Switch = ({ handleTogglePanel, isPanelOpen }) => {
  return (
    <label className="switch" style={{ margin: '0px' }}>
      <input
        type="checkbox"
        checked={isPanelOpen}
        onChange={handleTogglePanel}
      />
      <span className="slider" />
    </label>
  );
};

export default Switch;
