import React, {useState } from "react";
import { setLocation } from "../../simulation/download";
import DotLoader from "react-spinners/DotLoader";
import WrongAdress from "../ErrorMessages/WrongAdress";
import TooManyUniforms from "../ErrorMessages/TooManyUniforms";

const override = {
  display: "block",
  margin: "auto",
  borderColor: "red",
};

function SearchField() {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [showTooManyUniformsError, setShowTooManyUniformsError] = useState(false);
    window.setShowErrorMessage = setShowErrorMessage;
    window.setShowTooManyUniformsError = setShowTooManyUniformsError;
    window.setLoading = setLoading
    const handleSubmit = (event) => {
        setLoading(!loading)
        window.setShowViridisLegend(false);
        event.preventDefault();
        window.setShowThreeViewer(true);
        setLocation(inputValue)
        setShowErrorMessage(false);
        setShowTooManyUniformsError(false);


        
    };
    const handleChange = (event) => {
        setInputValue(event.target.value);
    };
  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input type="text" placeholder="Geben Sie Ihre Addresse oder Koordinaten ein" value={inputValue} onChange={handleChange} />
        <button type="submit">Start</button>
      </form>
      {showErrorMessage && <WrongAdress />}
      {showTooManyUniformsError && <TooManyUniforms />}
      <DotLoader
        color="MediumAquaMarine"
        cssOverride={override}
        loading={loading}
        size={60}
      />
    </>
  );
}
  
export default SearchField;