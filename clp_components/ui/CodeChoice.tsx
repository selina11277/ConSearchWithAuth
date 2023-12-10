import React, { useState } from 'react';

interface CodeChoiceProps {
  bgColorClass: string;
  codeName: string;
  onSelectionChange: (codeName: string, isSelected: boolean) => void;
}

const CodeChoice: React.FC<CodeChoiceProps> = ({ bgColorClass, codeName, onSelectionChange }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleContainerClick = () => {
    const newSelectedState = !isSelected;
    setIsSelected(newSelectedState);
    onSelectionChange(codeName, newSelectedState);
  };

  const containerStyle = {
    borderColor: isSelected ? 'red' : 'black',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxSizing: 'border-box' as 'border-box',
  };

  const checkboxStyle = {
    opacity: 0, // Hide the default checkbox
    position: 'absolute' as 'absolute', // Position it so the custom checkbox can be placed over it
    zIndex: -1,
    cursor: 'pointer',
    transform: 'scale(1.5)',
  };

  const customCheckboxStyle = {
    width: '20px', // Width of the custom checkbox
    height: '20px', // Height of the custom checkbox
    backgroundColor: isSelected ? '#f0c551' : 'white', // Background color when checked
    border: '1px solid #ddd', // Border for the custom checkbox
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div className={`flex items-center justify-between h-12 w-24 p-4 rounded-lg m-2 cursor-pointer ${bgColorClass}`} style={containerStyle} onClick={handleContainerClick}>
      <span className="mr-2 font-sans">{codeName}</span>
      <div style={customCheckboxStyle}>
        <input type="checkbox" checked={isSelected} onChange={handleContainerClick} onClick={(e) => e.stopPropagation()} style={checkboxStyle} />
        {isSelected && <span>✓</span>} {/* Display a checkmark when selected */}
      </div>
    </div>
  );
};

export default CodeChoice;
