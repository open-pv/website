import { Button, Input, List, ListItem } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { requestLocation } from "../../simulation/location"

export default function SearchField({ callback }) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [isSelectedAdress, setIsSelectedAdress] = useState(false)
  window.searchFieldInput = inputValue
  const { t } = useTranslation()

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue) {
        setIsSelectedAdress(false)
      }
      if (isSelectedAdress) {
        return
      }
      if (inputValue.length > 2) {
        try {
          const inputValueParts = inputValue.split(" ")
          let streetAddressNumber = null

          // Find the street address number
          for (const inputPart of inputValueParts) {
            if (/^\d+[a-zA-Z]?$/.test(inputPart)) {
              streetAddressNumber = inputPart
              break
            }
          }

          const response = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(
              inputValue
            )}&bbox=5.98865807458,47.3024876979,15.0169958839,54.983104153&limit=5&lang=de&layer=street`
          )
          const data = await response.json()
          console.log("data", data)

          setSuggestions(
            data.features.map((feature) => {
              let suggestion = feature.properties.name
              if (streetAddressNumber) {
                suggestion += " " + streetAddressNumber
              }
              suggestion +=
                ", " +
                feature.properties.postcode +
                " " +
                feature.properties.city
              return suggestion
            })
          )
        } catch (error) {
          console.error("Error fetching suggestions:", error)
        }
      } else {
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [inputValue, isSelectedAdress])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const locations = await requestLocation(inputValue)
    console.warn(locations)
    callback(locations)
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
    setSuggestions([])
    setIsSelectedAdress(true)
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "5px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Input
          value={inputValue}
          onChange={(evt) => setInputValue(evt.target.value)}
          margin={"5px"}
        />
        <Button margin={"5px"} minWidth={"150px"} type="submit">
          {t("Search")}
        </Button>
      </div>
      {suggestions.length > 0 && (
        <List
          borderWidth={1}
          borderColor="gray.200"
          mt={2}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1}
          bg="white"
          boxShadow="md"
        >
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              p={2}
              cursor="pointer"
              _hover={{ backgroundColor: "gray.100" }}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </ListItem>
          ))}
        </List>
      )}
    </form>
  )
}
