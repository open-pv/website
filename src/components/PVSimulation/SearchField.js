import React, { useState } from "react";
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
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [showTooManyUniformsError, setShowTooManyUniformsError] =
    useState(false);
  window.setShowErrorMessage = setShowErrorMessage;
  window.setShowTooManyUniformsError = setShowTooManyUniformsError;
  window.setLoading = setLoading;
  const handleSubmit = (event) => {
    if (
      inputChanged ||
      window.numRadiusSimulationChanged ||
      window.numSimulationsChanged ||
      window.mapLocationChanged
    ) {
      setLoading(!loading);
      window.setShowViridisLegend(false);
      event.preventDefault();
      window.setShowThreeViewer(true);
      setLocation(
        inputValue,
        inputChanged,
        window.numRadiusSimulationChanged || window.numSimulationsChanged,
        window.mapLocation
      );
      window.numRadiusSimulationChanged = false;
      window.numSimulationsChanged = false;
      setShowErrorMessage(false);
      setShowTooManyUniformsError(false);
      setInputChanged(false);
    } else {
      event.preventDefault();
    }
  };
  const handleChange = (event) => {
    if (inputValue != event.target.value) {
      setInputValue(event.target.value);
      setInputChanged(true);
    }
  };
  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Geben Sie Ihre Addresse oder Koordinaten ein"
          value={inputValue}
          onChange={handleChange}
        />
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
