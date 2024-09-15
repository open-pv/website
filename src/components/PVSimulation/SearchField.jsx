import { Button, Input, List, ListItem } from "@chakra-ui/react"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { requestLocation } from "../../simulation/location"

export default function SearchField({ callback }) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)
  // isSelectedAdress is used so that if an adress is already selected,
  // the autocomplete does stop to run
  const [isSelectedAdress, setIsSelectedAdress] = useState(false)
  const suggestionsRef = useRef([])
  const inputRef = useRef()
  const formRef = useRef()
  const [focusedIndex, setFocusedIndex] = useState(-1)
  window.searchFieldInput = inputValue
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setSuggestionsVisible(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  })

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputValue.length < 3) {
        // If the input is deleted or replaced with one
        // charakter, the autocomplete should start again
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
          for (let inputPart of inputValueParts) {
            if (inputPart[inputPart.length - 1] === ",") {
              //drop last character (ie the comma)
              inputPart = inputPart.slice(0, -1)
            }
            if (inputPart.length == 5) {
              // continue if it has the length of a zip code
              continue
            }
            if (/^\d{1,3}[a-zA-Z]?$/.test(inputPart)) {
              // regex chatches numbers with 1-3 digits plus one charater
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
      setSuggestionsVisible(suggestions.length > 0)
    }

    const debounceTimer = setTimeout(fetchSuggestions, 200)
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
    requestLocation(suggestion).then((locations) => {
      console.warn(locations)
      callback(locations)
    })
    setSuggestions([])
    setIsSelectedAdress(true)
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setFocusedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setFocusedIndex((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : -1))
    } else if (event.key === "Enter" && focusedIndex > -1) {
      event.preventDefault()
      handleSuggestionClick(suggestions[focusedIndex])
    }
  }

  useEffect(() => {
    if (focusedIndex > -1 && suggestionsRef.current[focusedIndex]) {
      suggestionsRef.current[focusedIndex].focus()
    } else if (focusedIndex === -1) {
      inputRef.current.focus()
    }
  }, [focusedIndex])

  return (
    <form
      ref={formRef}
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
          ref={inputRef}
          value={inputValue}
          placeholder={t("searchField.placeholder")}
          onChange={(evt) => setInputValue(evt.target.value)}
          onKeyDown={handleKeyDown}
          margin={"5px"}
          autoComplete="street-address"
        />
        <Button margin={"5px"} minWidth={"150px"} type="submit">
          {t("Search")}
        </Button>
      </div>
      {suggestionsVisible && (
        <List
          style={{ paddingLeft: "0", marginTop: "0" }}
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
              ref={(elem) => (suggestionsRef.current[index] = elem)}
              key={index}
              p={2}
              style={{ paddingLeft: "1em" }}
              cursor="pointer"
              _hover={{ backgroundColor: "gray.100" }}
              backgroundColor={focusedIndex === index ? "gray.100" : "white"}
              onClick={() => handleSuggestionClick(suggestion)}
              onKeyDown={handleKeyDown}
            >
              {suggestion}
            </ListItem>
          ))}
        </List>
      )}
    </form>
  )
}
