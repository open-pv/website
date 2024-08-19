import { Button, Input } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { requestLocation } from "../../simulation/location"

function SearchField({ callback }) {
  const [inputValue, setInputValue] = useState("Arnulfstraße 138, München")
  window.searchFieldInput = inputValue
  const { t } = useTranslation()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const locations = await requestLocation(inputValue)
    console.warn(location);
    callback(locations);
  }

  return (
    <form
      style={{
        display: "flex",
        alignItems: "center",
        padding: "5px",
      }}
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        placeholder={t("searchField.placeholder")}
        value={inputValue}
        onChange={evt => setInputValue(evt.target.value)}
        margin={"5px"}
      />
      <Button
        isLoading={ false }
        type="submit"
        minWidth={"150px"}
        margin={"5px"}
        loadingText="Loading"
      >
        { t('Search') }
      </Button>
    </form>
  )
}

export default SearchField
